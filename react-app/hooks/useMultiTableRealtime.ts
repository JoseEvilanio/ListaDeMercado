import { useState, useEffect, useRef } from 'react';
import { RealtimeService } from '../services/realtime.service';
import { RealtimeEvent } from '../services/realtime-subscription-manager';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ErrorService } from '../services/error.service';

/**
 * Configuração de tabela para assinatura em tempo real
 */
export interface TableConfig {
  table: string;
  event?: RealtimeEvent;
  schema?: string;
  filter?: string;
}

/**
 * Callback para eventos em tempo real
 */
export interface EventCallbacks {
  [tableKey: string]: {
    onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
    onAny?: (payload: RealtimePostgresChangesPayload<any>) => void;
  };
}

/**
 * Opções para o hook useMultiTableRealtime
 */
export interface UseMultiTableRealtimeOptions {
  channelName: string;
  tables: TableConfig[];
  callbacks: EventCallbacks;
  enabled?: boolean;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para usar assinaturas em tempo real do Supabase com múltiplas tabelas
 * @param options Opções para a assinatura
 * @returns Estado da assinatura e métodos para controle
 */
const useMultiTableRealtime = (options: UseMultiTableRealtimeOptions) => {
  const {
    channelName,
    tables,
    callbacks,
    enabled = true,
    onSubscriptionChange,
    onError
  } = options;
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvents, setLastEvents] = useState<Record<string, RealtimePostgresChangesPayload<any> | null>>({});
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>(
    RealtimeService.getConnectionStatus()
  );
  
  // Usar ref para callbacks para evitar re-assinaturas desnecessárias
  const callbacksRef = useRef({ callbacks, onSubscriptionChange, onError });
  
  // Atualizar refs quando callbacks mudam
  useEffect(() => {
    callbacksRef.current = { callbacks, onSubscriptionChange, onError };
  }, [callbacks, onSubscriptionChange, onError]);
  
  // Efeito para gerenciar assinatura
  useEffect(() => {
    if (!enabled || tables.length === 0) {
      setIsSubscribed(false);
      callbacksRef.current.onSubscriptionChange?.(false);
      return;
    }
    
    const unsubscribeFunctions: Array<() => void> = [];
    
    try {
      // Criar canal para todas as tabelas
      RealtimeService.createMultiTableChannel(channelName, tables)
        .then(() => {
          // Registrar callbacks para cada tabela
          tables.forEach(tableConfig => {
            const { table } = tableConfig;
            const tableCallbacks = callbacksRef.current.callbacks[table];
            
            if (!tableCallbacks) return;
            
            // Função para lidar com eventos
            const handleEvent = (payload: RealtimePostgresChangesPayload<any>) => {
              // Atualizar último evento para esta tabela
              setLastEvents(prev => ({
                ...prev,
                [table]: payload
              }));
              
              // Chamar callback específico com base no tipo de evento
              const eventType = payload.eventType;
              
              if (eventType === 'INSERT') {
                tableCallbacks.onInsert?.(payload);
              } else if (eventType === 'UPDATE') {
                tableCallbacks.onUpdate?.(payload);
              } else if (eventType === 'DELETE') {
                tableCallbacks.onDelete?.(payload);
              }
              
              // Chamar callback genérico
              tableCallbacks.onAny?.(payload);
            };
            
            // Registrar callback para todos os eventos desta tabela
            const unsubscribe = RealtimeService.onAll(
              table,
              handleEvent,
              tableConfig.filter,
              channelName
            );
            
            unsubscribeFunctions.push(unsubscribe);
          });
          
          setIsSubscribed(true);
          setError(null);
          callbacksRef.current.onSubscriptionChange?.(true);
        })
        .catch(err => {
          const error = err as Error;
          console.error('Erro ao criar canal para múltiplas tabelas:', error);
          setError(error);
          setIsSubscribed(false);
          callbacksRef.current.onSubscriptionChange?.(false);
          callbacksRef.current.onError?.(error);
          
          ErrorService.logError('Erro ao criar canal para múltiplas tabelas', {
            error,
            channelName,
            tables
          });
        });
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao configurar assinaturas em tempo real:', error);
      setError(error);
      setIsSubscribed(false);
      callbacksRef.current.onSubscriptionChange?.(false);
      callbacksRef.current.onError?.(error);
      
      ErrorService.logError('Erro ao configurar assinaturas em tempo real', {
        error,
        channelName,
        tables
      });
    }
    
    // Verificar status de conexão periodicamente
    const statusInterval = setInterval(() => {
      const currentStatus = RealtimeService.getConnectionStatus();
      setConnectionStatus(currentStatus);
    }, 5000);
    
    // Cancelar assinaturas ao desmontar
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      RealtimeService.unsubscribeChannel(channelName);
      setIsSubscribed(false);
      callbacksRef.current.onSubscriptionChange?.(false);
      
      clearInterval(statusInterval);
    };
  }, [channelName, tables, enabled]);
  
  // Função para forçar reconexão
  const reconnect = () => {
    if (!enabled || !isSubscribed) return;
    
    // Recriar canal
    RealtimeService.unsubscribeChannel(channelName);
    setIsSubscribed(false);
    callbacksRef.current.onSubscriptionChange?.(false);
    
    // Pequeno delay para garantir que o canal anterior seja cancelado
    setTimeout(() => {
      RealtimeService.createMultiTableChannel(channelName, tables)
        .then(() => {
          setIsSubscribed(true);
          callbacksRef.current.onSubscriptionChange?.(true);
        })
        .catch(err => {
          const error = err as Error;
          setError(error);
          callbacksRef.current.onError?.(error);
        });
    }, 100);
  };
  
  return {
    isSubscribed,
    lastEvents,
    error,
    connectionStatus,
    reconnect,
    channelInfo: {
      channelCount: RealtimeService.getChannelCount(),
      channelNames: RealtimeService.getChannelNames()
    }
  };
};

export default useMultiTableRealtime;