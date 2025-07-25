import React, { useState, useEffect } from 'react';
import { Card, Table } from '../ui';
import { useRealtime } from '../../hooks';
import { DatabaseService } from '../../services';

interface RealtimeListProps<T> {
  table: string;
  columns: Array<{
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    cell?: (item: T) => React.ReactNode;
    className?: string;
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
  }>;
  keyExtractor: (item: T) => string;
  filter?: string;
  title?: string;
  fetchFunction?: () => Promise<T[]>;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * Componente que exibe uma lista de itens que se atualiza automaticamente em tempo real
 */
function RealtimeList<T extends { id: string }>({
  table,
  columns,
  keyExtractor,
  filter,
  title,
  fetchFunction,
  onRowClick,
  className = '',
  emptyMessage = 'Nenhum item encontrado'
}: RealtimeListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        let data: T[];
        
        if (fetchFunction) {
          // Usar função personalizada para buscar dados
          data = await fetchFunction();
        } else {
          // Simulação de chamada à API
          // Na implementação real, usar DatabaseService
          await new Promise(resolve => setTimeout(resolve, 1000));
          data = [] as unknown as T[];
        }
        
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchFunction]);
  
  // Configurar assinatura em tempo real
  useRealtime({
    table,
    filter,
    onInsert: (payload) => {
      console.log(`Novo item inserido em ${table}:`, payload);
      
      // Adicionar novo item à lista
      const newItem = payload.new as T;
      setItems(prev => {
        // Verificar se o item já existe
        if (prev.some(item => keyExtractor(item) === keyExtractor(newItem))) {
          return prev;
        }
        return [...prev, newItem];
      });
    },
    onUpdate: (payload) => {
      console.log(`Item atualizado em ${table}:`, payload);
      
      // Atualizar item na lista
      const updatedItem = payload.new as T;
      setItems(prev => 
        prev.map(item => 
          keyExtractor(item) === keyExtractor(updatedItem) ? updatedItem : item
        )
      );
    },
    onDelete: (payload) => {
      console.log(`Item excluído em ${table}:`, payload);
      
      // Remover item da lista
      const deletedItem = payload.old as T;
      setItems(prev => 
        prev.filter(item => keyExtractor(item) !== keyExtractor(deletedItem))
      );
    }
  });
  
  return (
    <Card className={className}>
      {title && (
        <Card.Header>
          <h2 className="text-xl font-semibold">{title}</h2>
        </Card.Header>
      )}
      <Card.Body>
        <Table
          data={items}
          columns={columns}
          keyExtractor={keyExtractor}
          loading={loading}
          emptyMessage={error || emptyMessage}
          onRowClick={onRowClick}
          striped
          hoverable
        />
      </Card.Body>
    </Card>
  );
}

export default RealtimeList;