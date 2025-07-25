import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RealtimeService } from '../services/realtime.service';
import { initializeRealtime } from '../services/realtime-initializer.service';
import { ErrorService } from '../services/error.service';

interface RealtimeContextType {
  isInitialized: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  channelCount: number;
  channelNames: string[];
  error: Error | null;
  initialize: () => Promise<void>;
  reconnect: () => Promise<void>;
  unsubscribeAll: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
  autoInitialize?: boolean;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ 
  children, 
  autoInitialize = true 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>(
    'disconnected'
  );
  const [channelCount, setChannelCount] = useState(0);
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Função para inicializar
  const initialize = async (): Promise<void> => {
    try {
      setConnectionStatus('connecting');
      await initializeRealtime();
      setIsInitialized(true);
      setConnectionStatus('connected');
      setError(null);
      
      // Atualizar informações de canais
      updateChannelInfo();
    } catch (err) {
      const error = err as Error;
      setError(error);
      setConnectionStatus('disconnected');
      ErrorService.logError('Erro ao inicializar contexto de tempo real', { error });
    }
  };

  // Função para reconectar
  const reconnect = async (): Promise<void> => {
    try {
      setConnectionStatus('connecting');
      
      // Cancelar todas as assinaturas existentes
      RealtimeService.unsubscribeAll();
      
      // Reinicializar
      await initializeRealtime();
      
      setIsInitialized(true);
      setConnectionStatus('connected');
      setError(null);
      
      // Atualizar informações de canais
      updateChannelInfo();
    } catch (err) {
      const error = err as Error;
      setError(error);
      setConnectionStatus('disconnected');
      ErrorService.logError('Erro ao reconectar contexto de tempo real', { error });
    }
  };

  // Função para cancelar todas as assinaturas
  const unsubscribeAll = (): void => {
    RealtimeService.unsubscribeAll();
    setIsInitialized(false);
    setConnectionStatus('disconnected');
    setChannelCount(0);
    setChannelNames([]);
  };

  // Função para atualizar informações de canais
  const updateChannelInfo = (): void => {
    setChannelCount(RealtimeService.getChannelCount());
    setChannelNames(RealtimeService.getChannelNames());
    setConnectionStatus(RealtimeService.getConnectionStatus());
  };

  // Inicializar automaticamente se configurado
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
    
    // Configurar intervalo para atualizar informações de canais
    const interval = setInterval(updateChannelInfo, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [autoInitialize]);

  // Monitorar estado da conexão
  useEffect(() => {
    const handleOnline = () => {
      if (isInitialized) {
        reconnect();
      }
    };
    
    const handleOffline = () => {
      setConnectionStatus('disconnected');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInitialized]);

  const value: RealtimeContextType = {
    isInitialized,
    connectionStatus,
    channelCount,
    channelNames,
    error,
    initialize,
    reconnect,
    unsubscribeAll
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// Hook para usar o contexto
export const useRealtimeContext = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  
  if (context === undefined) {
    throw new Error('useRealtimeContext deve ser usado dentro de um RealtimeProvider');
  }
  
  return context;
};