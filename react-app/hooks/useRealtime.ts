import { useState, useEffect, useRef } from 'react';
import { RealtimeService, RealtimeEvent } from '../services/realtime.service';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ErrorService } from '../services/error.service';

/**
 * Opções para o hook useRealtime
 */
export interface UseRealtimeOptions {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  enabled?: boolean;
  channelName?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onAny?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para usar assinaturas em tempo real do Supabase
 * @param options Opções para a assinatura
 * @returns Estado da assinatura e métodos para controle
 */
const useRealtime = (options: UseRealtimeOptions) => {
  const {
    table,
    event = '*',
    filter,
    enabled = true,
    channelName,
    onInsert,
    onUpdate,
    onDelete,
    onAny,
    onSubscriptionChange,
    onError
  } = options;
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimePostgresChangesPayload<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>(
    RealtimeService.getConnectionStatus()
  );
  
  // Usar ref para callbacks para evitar re-assinaturas desnecessárias
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onAny, onSubscriptionChange, onError });
  
  // Atualizar refs quando callbacks mudam
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete, onAny, onSubscriptionChange, onError };
  }, [onInsert, onUpdate, onDelete, onAny, onSubscriptionChange, onError]);
  
  // Efeito para gerenciar assinatura
  useEffect(() => {
    if (!enabled) {
      setIsSubscribed(false);
      callbacksRef.current.onSubscriptionChange?.(false);
      return;
    }
    
    let unsubscribe: (() => void) | null = null;
    
    try {
      // Função para lidar com eventos
      const handleEvent = (payload: RealtimePostgresChangesPayload<any>) => {
        setLastEvent(payload);
        
        // Chamar callback específico com base no tipo de evento
        const eventType = payload.eventType;
        
        if (eventType === 'INSERT') {
          callbacksRef.current.onInsert?.(payload);
        } else if (eventType === 'UPDATE') {
          callbacksRef.current.onUpdate?.(payload);
        } else if (eventType === 'DELETE') {
          callbacksRef.current.onDelete?.(payload);
        }
        
        // Chamar callback genérico
        callbacksRef.current.onAny?.(payload);
      };
      
      // Assinar com base no evento especificado
      if (event === '*') {
        unsubscribe = RealtimeService.onAll(table, handleEvent, filter, channelName);
      } else if (event === 'INSERT') {
        unsubscribe = RealtimeService.onInsert(table, handleEvent, filter, channelName);
      } else if (event === 'UPDATE') {
        unsubscribe = RealtimeService.onUpdate(table, handleEvent, filter, channelName);
      } else if (event === 'DELETE') {
        unsubscribe = RealtimeService.onDelete(table, handleEvent, filter, channelName);
      }
      
      setIsSubscribed(true);
      setError(null);
      callbacksRef.current.onSubscriptionChange?.(true);
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao assinar eventos em tempo real:', error);
      setError(error);
      setIsSubscribed(false);
      callbacksRef.current.onSubscriptionChange?.(false);
      callbacksRef.current.onError?.(error);
      
      ErrorService.logError('Erro ao assinar eventos em tempo real', {
        error,
        table,
        event,
        filter,
        channelName
      });
    }
    
    // Verificar status de conexão periodicamente
    const statusInterval = setInterval(() => {
      const currentStatus = RealtimeService.getConnectionStatus();
      setConnectionStatus(currentStatus);
    }, 5000);
    
    // Cancelar assinatura ao desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsSubscribed(false);
        callbacksRef.current.onSubscriptionChange?.(false);
      }
      
      clearInterval(statusInterval);
    };
  }, [table, event, filter, enabled, channelName]);
  
  // Função para forçar reconexão
  const reconnect = () => {
    if (!enabled || !isSubscribed) return;
    
    // Recriar assinatura
    setIsSubscribed(false);
    callbacksRef.current.onSubscriptionChange?.(false);
    
    // Pequeno delay para garantir que a assinatura anterior seja cancelada
    setTimeout(() => {
      setIsSubscribed(true);
      callbacksRef.current.onSubscriptionChange?.(true);
    }, 100);
  };
  
  return {
    isSubscribed,
    lastEvent,
    error,
    connectionStatus,
    reconnect,
    channelInfo: {
      channelCount: RealtimeService.getChannelCount(),
      channelNames: RealtimeService.getChannelNames()
    }
  };
};

export default useRealtime;