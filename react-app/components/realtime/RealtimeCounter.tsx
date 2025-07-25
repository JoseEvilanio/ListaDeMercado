import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
import { useRealtime } from '../../hooks';

interface RealtimeCounterProps {
  table: string;
  filter?: string;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  fetchFunction?: () => Promise<number>;
}

/**
 * Componente que exibe um contador que se atualiza automaticamente em tempo real
 */
const RealtimeCounter: React.FC<RealtimeCounterProps> = ({
  table,
  filter,
  title,
  icon,
  className = '',
  fetchFunction
}) => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar contagem inicial
  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      
      try {
        let initialCount: number;
        
        if (fetchFunction) {
          // Usar função personalizada para buscar contagem
          initialCount = await fetchFunction();
        } else {
          // Simulação de chamada à API
          // Na implementação real, usar DatabaseService
          await new Promise(resolve => setTimeout(resolve, 1000));
          initialCount = Math.floor(Math.random() * 100);
        }
        
        setCount(initialCount);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar contagem:', err);
        setError('Erro ao carregar contagem');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCount();
  }, [fetchFunction]);
  
  // Configurar assinatura em tempo real
  useRealtime({
    table,
    filter,
    onInsert: () => {
      // Incrementar contagem
      setCount(prev => prev + 1);
    },
    onDelete: () => {
      // Decrementar contagem
      setCount(prev => Math.max(0, prev - 1));
    }
  });
  
  return (
    <Card className={className}>
      <Card.Body>
        <div className="flex items-center">
          {icon && (
            <div className="mr-4 text-primary-500 dark:text-primary-400">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {title}
              </h3>
            )}
            <div className="text-3xl font-bold">
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              ) : error ? (
                <span className="text-red-500 dark:text-red-400">Erro</span>
              ) : (
                <span>{count}</span>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RealtimeCounter;