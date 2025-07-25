import React, { useState, useEffect } from 'react';
import { RealtimeService } from '../services/realtime.service';
import { RealtimeChannelService } from '../services/realtime-channel.service';

/**
 * Componente para exibir status das assinaturas em tempo real
 */
const RealtimeStatus: React.FC = () => {
  const [channelCount, setChannelCount] = useState(0);
  const [channelNames, setChannelNames] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>(
    'disconnected'
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Atualizar informações periodicamente
  useEffect(() => {
    const updateStatus = () => {
      setChannelCount(RealtimeService.getChannelCount());
      setChannelNames(RealtimeService.getChannelNames());
      setConnectionStatus(RealtimeService.getConnectionStatus());
    };

    // Atualizar imediatamente
    updateStatus();

    // Configurar intervalo para atualizações
    const interval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Função para inicializar canais padrão
  const initializeDefaultChannels = async () => {
    try {
      await RealtimeChannelService.initializeChannels();
      // Atualizar status após inicialização
      setChannelCount(RealtimeService.getChannelCount());
      setChannelNames(RealtimeService.getChannelNames());
    } catch (error) {
      console.error('Erro ao inicializar canais:', error);
    }
  };

  // Função para cancelar todas as assinaturas
  const unsubscribeAll = () => {
    RealtimeService.unsubscribeAll();
    // Atualizar status após cancelamento
    setChannelCount(0);
    setChannelNames([]);
  };

  // Determinar cor do status
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
          <h3 className="text-lg font-medium">
            Realtime Status: {connectionStatus}
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Ocultar' : 'Detalhes'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <p className="mb-2">
            Canais ativos: <span className="font-medium">{channelCount}</span>
          </p>
          
          {channelNames.length > 0 && (
            <div className="mb-4">
              <p className="mb-1">Nomes dos canais:</p>
              <ul className="list-disc pl-5">
                {channelNames.map((name) => (
                  <li key={name} className="text-sm text-gray-700">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex space-x-2 mt-4">
            <button
              onClick={initializeDefaultChannels}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Inicializar Canais Padrão
            </button>
            <button
              onClick={unsubscribeAll}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Cancelar Todas Assinaturas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeStatus;