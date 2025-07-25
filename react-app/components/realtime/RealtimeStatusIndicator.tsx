import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';

interface RealtimeStatusIndicatorProps {
  table?: string;
  showLastUpdate?: boolean;
  showConnectionStatus?: boolean;
  className?: string;
  variant?: 'minimal' | 'badge' | 'detailed';
  onStatusChange?: (isConnected: boolean) => void;
}

/**
 * Componente que exibe o status da conexão em tempo real e últimas atualizações
 * Otimizado para renderização eficiente e baixo impacto no desempenho
 */
function RealtimeStatusIndicator({
  table,
  showLastUpdate = true,
  showConnectionStatus = true,
  className = '',
  variant = 'badge',
  onStatusChange
}: RealtimeStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastTable, setLastTable] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  
  // Monitorar status da conexão
  useEffect(() => {
    const handleConnectionChange = (status: string) => {
      const connected = status === 'CONNECTED';
      setIsConnected(connected);
      onStatusChange?.(connected);
    };
    
    // Inicializar status
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        const connected = !error;
        setIsConnected(connected);
        onStatusChange?.(connected);
      } catch (err) {
        setIsConnected(false);
        onStatusChange?.(false);
      }
    };
    
    checkConnection();
    
    // Assinar eventos de conexão
    const channel = supabase.channel('system');
    channel.on('system', { event: 'connection_status' }, (payload) => {
      handleConnectionChange(payload.status);
    });
    
    channel.subscribe((status) => {
      handleConnectionChange(status);
    });
    
    return () => {
      channel.unsubscribe();
    };
  }, [onStatusChange]);
  
  // Monitorar atualizações em tempo real
  useEffect(() => {
    if (!showLastUpdate) return;
    
    const handleRealtimeEvent = (payload: any) => {
      setLastUpdate(new Date());
      setLastTable(payload.table);
      setLastEvent(payload.eventType);
    };
    
    // Assinar eventos da tabela específica ou de todas as tabelas
    const channel = supabase.channel('realtime-status');
    
    if (table) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, handleRealtimeEvent);
    } else {
      channel.on('postgres_changes', { event: '*', schema: 'public' }, handleRealtimeEvent);
    }
    
    channel.subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [table, showLastUpdate]);
  
  // Formatar tempo relativo
  const formatRelativeTime = useCallback((date: Date | null): string => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 5) return 'Agora mesmo';
    if (diffInSeconds < 60) return `${diffInSeconds} segundos atrás`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias atrás`;
  }, []);
  
  // Renderizar variante mínima
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <span 
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          title={isConnected ? 'Conectado' : 'Desconectado'}
        />
      </div>
    );
  }
  
  // Renderizar variante badge
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      } ${className}`}>
        <span 
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
        />
        <span>{isConnected ? 'Tempo real ativo' : 'Desconectado'}</span>
        
        {showLastUpdate && lastUpdate && (
          <span className="text-gray-500 ml-1">
            • {formatRelativeTime(lastUpdate)}
          </span>
        )}
      </div>
    );
  }
  
  // Renderizar variante detalhada
  return (
    <div className={`flex flex-col ${className}`}>
      {showConnectionStatus && (
        <div className="flex items-center space-x-2 mb-1">
          <span 
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm">
            {isConnected ? 'Conectado ao Supabase' : 'Desconectado do Supabase'}
          </span>
        </div>
      )}
      
      {showLastUpdate && (
        <div className="text-sm text-gray-600">
          {lastUpdate ? (
            <>
              <span>Última atualização: {formatRelativeTime(lastUpdate)}</span>
              {lastTable && lastEvent && (
                <span className="block text-xs">
                  {lastEvent} em {lastTable}
                </span>
              )}
            </>
          ) : (
            <span>Nenhuma atualização recebida</span>
          )}
        </div>
      )}
    </div>
  );
}

export default RealtimeStatusIndicator;