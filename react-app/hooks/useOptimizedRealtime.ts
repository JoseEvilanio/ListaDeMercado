import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeService, RealtimeEvent } from '../services/realtime.service';

/**
 * Opções para o hook useOptimizedRealtime
 */
interface UseOptimizedRealtimeOptions<T> {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  enabled?: boolean;
  initialData?: T[];
  keyExtractor: (item: T) => string;
  debounceMs?: number;
  batchUpdates?: boolean;
  onInsert?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onDelete?: (item: T) => void;
  onBatchUpdate?: (items: T[]) => void;
}

/**
 * Hook otimizado para usar assinaturas em tempo real do Supabase
 * Inclui recursos para debounce, batch updates e prevenção de re-renderizações desnecessárias
 * 
 * @param options Opções para a assinatura
 * @returns Estado da assinatura e dados
 */
function useOptimizedRealtime<T extends { id: string }>({
  table,
  event = '*',
  filter,
  enabled = true,
  initialData = [],
  keyExtractor,
  debounceMs = 300,
  batchUpdates = true,
  onInsert,
  onUpdate,
  onDelete,
  onBatchUpdate
}: UseOptimizedRealtimeOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Referências para batch updates
  const pendingUpdatesRef = useRef<T[]>([]);
  const pendingDeletesRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Processar atualizações em lote
  const processBatchUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length > 0 || pendingDeletesRef.current.length > 0) {
      setItems(prev => {
        // Criar mapa para verificação rápida
        const itemMap = new Map<string, T>();
        prev.forEach(item => itemMap.set(keyExtractor(item), item));
        
        // Aplicar exclusões
        pendingDeletesRef.current.forEach(id => {
          itemMap.delete(id);
        });
        
        // Aplicar atualizações/inserções
        pendingUpdatesRef.current.forEach(item => {
          itemMap.set(keyExtractor(item), item);
        });
        
        // Converter mapa de volta para array
        const newItems = Array.from(itemMap.values());
        
        // Chamar callback de batch update se fornecido
        if (onBatchUpdate && (pendingUpdatesRef.current.length > 0 || pendingDeletesRef.current.length > 0)) {
          onBatchUpdate(newItems);
        }
        
        // Limpar pendências
        pendingUpdatesRef.current = [];
        pendingDeletesRef.current = [];
        
        return newItems;
      });
    }
  }, [keyExtractor, onBatchUpdate]);
  
  // Agendar processamento em lote
  const scheduleBatchUpdate = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    
    timerRef.current = window.setTimeout(() => {
      processBatchUpdates();
      timerRef.current = null;
    }, debounceMs);
  }, [debounceMs, processBatchUpdates]);
  
  // Manipuladores de eventos otimizados
  const handleInsert = useCallback((payload: any) => {
    const newItem = payload.new as T;
    setLastEvent({ type: 'INSERT', payload });
    
    if (onInsert) {
      onInsert(newItem);
    }
    
    if (batchUpdates) {
      // Adicionar à fila de atualizações pendentes
      pendingUpdatesRef.current.push(newItem);
      scheduleBatchUpdate();
    } else {
      // Atualização imediata
      setItems(prev => {
        // Verificar se o item já existe
        if (prev.some(item => keyExtractor(item) === keyExtractor(newItem))) {
          return prev;
        }
        return [...prev, newItem];
      });
    }
  }, [keyExtractor, onInsert, batchUpdates, scheduleBatchUpdate]);
  
  const handleUpdate = useCallback((payload: any) => {
    const updatedItem = payload.new as T;
    setLastEvent({ type: 'UPDATE', payload });
    
    if (onUpdate) {
      onUpdate(updatedItem);
    }
    
    if (batchUpdates) {
      // Adicionar à fila de atualizações pendentes
      pendingUpdatesRef.current.push(updatedItem);
      scheduleBatchUpdate();
    } else {
      // Atualização imediata
      setItems(prev => {
        // Verificar se o item existe e se realmente mudou
        const existingItemIndex = prev.findIndex(
          item => keyExtractor(item) === keyExtractor(updatedItem)
        );
        
        if (existingItemIndex === -1) return prev;
        
        const existingItem = prev[existingItemIndex];
        const hasChanged = JSON.stringify(existingItem) !== JSON.stringify(updatedItem);
        
        if (!hasChanged) return prev;
        
        // Criar novo array com o item atualizado
        const newItems = [...prev];
        newItems[existingItemIndex] = updatedItem;
        return newItems;
      });
    }
  }, [keyExtractor, onUpdate, batchUpdates, scheduleBatchUpdate]);
  
  const handleDelete = useCallback((payload: any) => {
    const deletedItem = payload.old as T;
    const deletedId = keyExtractor(deletedItem);
    setLastEvent({ type: 'DELETE', payload });
    
    if (onDelete) {
      onDelete(deletedItem);
    }
    
    if (batchUpdates) {
      // Adicionar à fila de exclusões pendentes
      pendingDeletesRef.current.push(deletedId);
      scheduleBatchUpdate();
    } else {
      // Exclusão imediata
      setItems(prev => 
        prev.filter(item => keyExtractor(item) !== deletedId)
      );
    }
  }, [keyExtractor, onDelete, batchUpdates, scheduleBatchUpdate]);
  
  // Configurar assinatura em tempo real
  useEffect(() => {
    if (!enabled) {
      setIsSubscribed(false);
      return;
    }
    
    let unsubscribe: (() => void) | null = null;
    
    try {
      // Assinar com base no evento especificado
      if (event === '*') {
        unsubscribe = RealtimeService.onAll(table, (payload) => {
          if (payload.eventType === 'INSERT') {
            handleInsert(payload);
          } else if (payload.eventType === 'UPDATE') {
            handleUpdate(payload);
          } else if (payload.eventType === 'DELETE') {
            handleDelete(payload);
          }
        }, filter);
      } else if (event === 'INSERT') {
        unsubscribe = RealtimeService.onInsert(table, handleInsert, filter);
      } else if (event === 'UPDATE') {
        unsubscribe = RealtimeService.onUpdate(table, handleUpdate, filter);
      } else if (event === 'DELETE') {
        unsubscribe = RealtimeService.onDelete(table, handleDelete, filter);
      }
      
      setIsSubscribed(true);
      setError(null);
    } catch (err) {
      console.error('Erro ao assinar eventos em tempo real:', err);
      setError(err as Error);
      setIsSubscribed(false);
    }
    
    // Cancelar assinatura ao desmontar ou quando as dependências mudarem
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsSubscribed(false);
      }
      
      // Limpar timer pendente
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Processar quaisquer atualizações pendentes
      if (pendingUpdatesRef.current.length > 0 || pendingDeletesRef.current.length > 0) {
        processBatchUpdates();
      }
    };
  }, [
    table, 
    event, 
    filter, 
    enabled, 
    handleInsert, 
    handleUpdate, 
    handleDelete, 
    processBatchUpdates
  ]);
  
  // Forçar processamento de atualizações pendentes
  const flushUpdates = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    processBatchUpdates();
  }, [processBatchUpdates]);
  
  return {
    items,
    setItems,
    isSubscribed,
    lastEvent,
    error,
    flushUpdates
  };
}

export default useOptimizedRealtime;