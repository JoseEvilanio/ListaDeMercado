import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
import { useRealtime } from '../../hooks';

interface RealtimeItemProps<T> {
  table: string;
  id: string;
  renderItem: (item: T | null, loading: boolean, error: string | null) => React.ReactNode;
  fetchFunction?: (id: string) => Promise<T>;
  className?: string;
}

/**
 * Componente que exibe um item que se atualiza automaticamente em tempo real
 */
function RealtimeItem<T extends { id: string }>({
  table,
  id,
  renderItem,
  fetchFunction,
  className = ''
}: RealtimeItemProps<T>) {
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar item inicial
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        let data: T;
        
        if (fetchFunction) {
          // Usar função personalizada para buscar item
          data = await fetchFunction(id);
        } else {
          // Simulação de chamada à API
          // Na implementação real, usar DatabaseService
          await new Promise(resolve => setTimeout(resolve, 1000));
          data = { id } as T;
        }
        
        setItem(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar item:', err);
        setError('Erro ao carregar item');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id, fetchFunction]);
  
  // Configurar assinatura em tempo real
  useRealtime({
    table,
    filter: `id=eq.${id}`,
    onUpdate: (payload) => {
      console.log(`Item atualizado em ${table}:`, payload);
      
      // Atualizar item
      const updatedItem = payload.new as T;
      setItem(updatedItem);
    },
    onDelete: () => {
      console.log(`Item excluído em ${table}`);
      
      // Remover item
      setItem(null);
      setError('Item excluído');
    }
  });
  
  return (
    <div className={className}>
      {renderItem(item, loading, error)}
    </div>
  );
}

export default RealtimeItem;