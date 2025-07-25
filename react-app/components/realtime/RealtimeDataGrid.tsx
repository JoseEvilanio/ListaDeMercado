import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Button, Spinner } from '../ui';
import { useRealtime } from '../../hooks';
import { DatabaseService } from '../../services';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T, onChange?: (value: any) => void) => React.ReactNode;
  editable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  width?: string;
}

interface RealtimeDataGridProps<T> {
  table: string;
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  filter?: string;
  title?: string;
  fetchFunction?: () => Promise<T[]>;
  onSave?: (item: T) => Promise<void>;
  className?: string;
  emptyMessage?: string;
  editable?: boolean;
  pageSize?: number;
}

/**
 * Componente de grid de dados que se atualiza automaticamente em tempo real
 * Otimizado para renderização eficiente e suporte a edição inline
 */
function RealtimeDataGrid<T extends { id: string }>({
  table,
  columns,
  keyExtractor,
  filter,
  title,
  fetchFunction,
  onSave,
  className = '',
  emptyMessage = 'Nenhum dado encontrado',
  editable = false,
  pageSize = 10
}: RealtimeDataGridProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Carregar dados iniciais
  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      let data: T[];
      
      if (fetchFunction) {
        // Usar função personalizada para buscar dados
        data = await fetchFunction();
      } else {
        // Usar DatabaseService para buscar dados
        const { data: fetchedData, error } = await DatabaseService.query<T>(table, {
          filter,
          page,
          pageSize
        });
        
        if (error) throw error;
        data = fetchedData || [];
      }
      
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, table, filter, page, pageSize]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Configurar assinatura em tempo real com otimização para evitar re-renderizações desnecessárias
  const { isSubscribed } = useRealtime({
    table,
    filter,
    onInsert: useCallback((payload) => {
      const newItem = payload.new as T;
      
      setItems(prev => {
        // Verificar se o item já existe para evitar duplicatas
        if (prev.some(item => keyExtractor(item) === keyExtractor(newItem))) {
          return prev;
        }
        
        // Adicionar novo item mantendo a ordem
        const newItems = [...prev, newItem];
        return newItems;
      });
    }, []),
    
    onUpdate: useCallback((payload) => {
      const updatedItem = payload.new as T;
      
      setItems(prev => {
        // Só atualizar se o item realmente mudou para evitar re-renderizações
        const existingItemIndex = prev.findIndex(
          item => keyExtractor(item) === keyExtractor(updatedItem)
        );
        
        if (existingItemIndex === -1) return prev;
        
        // Verificar se o conteúdo realmente mudou
        const existingItem = prev[existingItemIndex];
        const hasChanged = JSON.stringify(existingItem) !== JSON.stringify(updatedItem);
        
        if (!hasChanged) return prev;
        
        // Criar novo array com o item atualizado
        const newItems = [...prev];
        newItems[existingItemIndex] = updatedItem;
        return newItems;
      });
    }, []),
    
    onDelete: useCallback((payload) => {
      const deletedItem = payload.old as T;
      
      setItems(prev => 
        prev.filter(item => keyExtractor(item) !== keyExtractor(deletedItem))
      );
    }, [])
  });
  
  // Iniciar edição de um item
  const handleEdit = (item: T) => {
    if (!editable) return;
    
    setEditingItem(keyExtractor(item));
    setEditedValues({});
  };
  
  // Atualizar valor durante edição
  const handleChange = (key: keyof T, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Salvar alterações
  const handleSave = async () => {
    if (!editingItem) return;
    
    const itemToUpdate = items.find(item => keyExtractor(item) === editingItem);
    if (!itemToUpdate) return;
    
    const updatedItem = {
      ...itemToUpdate,
      ...editedValues
    } as T;
    
    setSaving(true);
    
    try {
      if (onSave) {
        await onSave(updatedItem);
      } else {
        await DatabaseService.update(table, updatedItem.id, editedValues);
      }
      
      // Atualizar item localmente para feedback imediato
      setItems(prev => 
        prev.map(item => 
          keyExtractor(item) === editingItem ? updatedItem : item
        )
      );
      
      setEditingItem(null);
      setEditedValues({});
    } catch (err) {
      console.error('Erro ao salvar alterações:', err);
      setError('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };
  
  // Cancelar edição
  const handleCancel = () => {
    setEditingItem(null);
    setEditedValues({});
  };
  
  // Memoizar colunas visíveis com base no tamanho da tela
  const visibleColumns = useMemo(() => {
    // Detectar tamanho da tela
    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
    
    return columns.filter(column => {
      if (isMobile && column.hideOnMobile) return false;
      if (isTablet && column.hideOnTablet) return false;
      return true;
    });
  }, [columns]);
  
  // Renderizar células com suporte a edição
  const renderCell = (item: T, column: Column<T>) => {
    const isEditing = editingItem === keyExtractor(item);
    const accessor = column.accessor;
    
    // Obter valor da propriedade
    let value;
    if (typeof accessor === 'function') {
      value = accessor(item);
    } else {
      value = item[accessor];
    }
    
    // Se estiver editando e a coluna for editável
    if (isEditing && column.editable) {
      // Usar renderizador personalizado para edição, se disponível
      if (column.cell) {
        return column.cell(
          item,
          (newValue) => handleChange(accessor as keyof T, newValue)
        );
      }
      
      // Renderizador padrão para edição
      return (
        <input
          type="text"
          className="w-full p-1 border rounded"
          value={editedValues[accessor as keyof T] ?? value}
          onChange={(e) => handleChange(accessor as keyof T, e.target.value)}
        />
      );
    }
    
    // Renderização normal (não editando)
    if (column.cell) {
      return column.cell(item);
    }
    
    return value;
  };
  
  // Renderizar controles de paginação
  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          variant="outline"
          size="sm"
        >
          Anterior
        </Button>
        
        <span>
          Página {page}
        </span>
        
        <Button
          onClick={() => setPage(p => p + 1)}
          disabled={items.length < pageSize || loading}
          variant="outline"
          size="sm"
        >
          Próxima
        </Button>
      </div>
    );
  };
  
  return (
    <Card className={`realtime-data-grid ${className}`}>
      {title && (
        <Card.Header className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          {isSubscribed && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Tempo real ativo
            </span>
          )}
        </Card.Header>
      )}
      
      <Card.Body>
        {loading && (
          <div className="flex justify-center items-center p-8">
            <Spinner size="lg" />
          </div>
        )}
        
        {!loading && error && (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        )}
        
        {!loading && !error && items.length === 0 && (
          <div className="text-center text-gray-500 p-4">
            {emptyMessage}
          </div>
        )}
        
        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {visibleColumns.map((column, index) => (
                    <th
                      key={index}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                      style={{ width: column.width }}
                    >
                      {column.header}
                    </th>
                  ))}
                  {editable && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => {
                  const isEditing = editingItem === keyExtractor(item);
                  
                  return (
                    <tr
                      key={keyExtractor(item)}
                      className={`${isEditing ? 'bg-blue-50' : ''} hover:bg-gray-50`}
                    >
                      {visibleColumns.map((column, index) => (
                        <td
                          key={index}
                          className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                        >
                          {renderCell(item, column)}
                        </td>
                      ))}
                      
                      {editable && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={handleSave}
                                disabled={saving}
                                size="sm"
                                variant="primary"
                              >
                                {saving ? <Spinner size="sm" /> : 'Salvar'}
                              </Button>
                              <Button
                                onClick={handleCancel}
                                disabled={saving}
                                size="sm"
                                variant="outline"
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleEdit(item)}
                              size="sm"
                              variant="outline"
                            >
                              Editar
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && items.length > 0 && renderPagination()}
      </Card.Body>
    </Card>
  );
}

export default RealtimeDataGrid;