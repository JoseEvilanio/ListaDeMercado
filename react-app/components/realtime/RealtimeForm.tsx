import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { useRealtime } from '../../hooks';

interface RealtimeFormProps<T> {
  table: string;
  id?: string;
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  title?: string;
  className?: string;
  submitLabel?: string;
  deleteLabel?: string;
  children: (props: {
    data: T;
    setData: React.Dispatch<React.SetStateAction<T>>;
    isSubmitting: boolean;
    isDeleting: boolean;
    error: string | null;
  }) => React.ReactNode;
}

/**
 * Componente de formulário que se atualiza automaticamente em tempo real
 */
function RealtimeForm<T extends { id?: string }>({
  table,
  id,
  initialData,
  onSubmit,
  onDelete,
  title,
  className = '',
  submitLabel = 'Salvar',
  deleteLabel = 'Excluir',
  children
}: RealtimeFormProps<T>) {
  const [data, setData] = useState<T>(initialData || {} as T);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  
  // Carregar dados iniciais se um ID for fornecido
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Simulação de chamada à API
        // Na implementação real, usar DatabaseService
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockData = {
          id,
          // Adicionar outros campos simulados aqui
          ...initialData
        } as T;
        
        setData(mockData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, initialData]);
  
  // Configurar assinatura em tempo real se um ID for fornecido
  useRealtime({
    table,
    filter: id ? `id=eq.${id}` : undefined,
    enabled: !!id,
    onUpdate: (payload) => {
      console.log(`Item atualizado em ${table}:`, payload);
      
      // Atualizar dados do formulário
      setData(prev => ({
        ...prev,
        ...payload.new
      }));
    },
    onDelete: () => {
      console.log(`Item excluído em ${table}`);
      
      // Definir erro para informar o usuário
      setError('Este item foi excluído');
    }
  });
  
  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data);
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      setError('Erro ao salvar dados');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Excluir item
  const handleDelete = async () => {
    if (!id || !onDelete) return;
    
    if (!window.confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await onDelete(id);
    } catch (err) {
      console.error('Erro ao excluir item:', err);
      setError('Erro ao excluir item');
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <Card.Header>
            <h2 className="text-xl font-semibold">{title}</h2>
          </Card.Header>
        )}
        <Card.Body>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            <div className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      {title && (
        <Card.Header>
          <h2 className="text-xl font-semibold">{title}</h2>
        </Card.Header>
      )}
      <form onSubmit={handleSubmit}>
        <Card.Body>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}
          
          {children({
            data,
            setData,
            isSubmitting,
            isDeleting,
            error
          })}
        </Card.Body>
        <Card.Footer className="flex justify-between">
          <div>
            {id && onDelete && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Excluindo...' : deleteLabel}
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || isDeleting || !!error}
          >
            {isSubmitting ? 'Salvando...' : submitLabel}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}

export default RealtimeForm;