import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { useRetry } from '../../hooks';
import { RetryStrategy } from '../../services/retry.service';

/**
 * Componente de exemplo para demonstrar o uso do serviço de retry
 */
const RetryExample: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    navigator.onLine ? 'online' : 'offline'
  );
  
  // Configurar hook de retry
  const {
    execute,
    loading,
    error,
    attempts,
    addOfflineOperation,
    offlineOperations
  } = useRetry({
    maxRetries: 3,
    baseDelay: 1000,
    strategy: RetryStrategy.EXPONENTIAL,
    onStart: () => {
      addLog('Iniciando operação...');
    },
    onRetry: (attempt, delay) => {
      addLog(`Tentativa ${attempt} falhou. Próxima tentativa em ${delay}ms...`);
    },
    onSuccess: () => {
      addLog('Operação concluída com sucesso!');
    },
    onError: (err) => {
      addLog(`Operação falhou: ${err.message || err}`);
    }
  });
  
  // Adicionar log
  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 20));
  };
  
  // Simular operação bem-sucedida
  const handleSuccessOperation = async () => {
    try {
      await execute(async () => {
        addLog('Executando operação bem-sucedida...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, data: 'Operação concluída' };
      });
    } catch (err) {
      // Erro já tratado pelo hook
    }
  };
  
  // Simular operação com falha
  const handleFailOperation = async () => {
    try {
      await execute(async () => {
        addLog('Executando operação com falha...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Falha simulada na operação');
      });
    } catch (err) {
      // Erro já tratado pelo hook
    }
  };
  
  // Simular operação com falha de rede
  const handleNetworkFailOperation = async () => {
    try {
      await execute(async () => {
        addLog('Executando operação com falha de rede...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Failed to fetch: network error');
      });
    } catch (err) {
      // Erro já tratado pelo hook
    }
  };
  
  // Adicionar operação offline
  const handleAddOfflineOperation = () => {
    const id = addOfflineOperation({
      type: 'create',
      target: 'items',
      data: {
        name: `Item ${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString()
      }
    });
    
    addLog(`Operação offline adicionada: ${id}`);
  };
  
  // Alternar status da rede
  const toggleNetworkStatus = () => {
    setNetworkStatus(prev => {
      const newStatus = prev === 'online' ? 'offline' : 'online';
      addLog(`Status da rede alterado para: ${newStatus}`);
      return newStatus;
    });
  };
  
  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Exemplo de Retry</h2>
      </Card.Header>
      
      <Card.Body>
        <div className="mb-4">
          <p className="mb-2">
            Este exemplo demonstra o uso do serviço de retry para lidar com falhas de conexão.
          </p>
          <p className="mb-4">
            Status da rede simulado: <span className={`font-medium ${networkStatus === 'online' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{networkStatus}</span>
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={handleSuccessOperation}
              disabled={loading}
            >
              Operação Bem-sucedida
            </Button>
            
            <Button
              onClick={handleFailOperation}
              disabled={loading}
              variant="secondary"
            >
              Operação com Falha
            </Button>
            
            <Button
              onClick={handleNetworkFailOperation}
              disabled={loading}
              variant="secondary"
            >
              Falha de Rede
            </Button>
            
            <Button
              onClick={handleAddOfflineOperation}
              variant="outline"
            >
              Adicionar Operação Offline
            </Button>
            
            <Button
              onClick={toggleNetworkStatus}
              variant={networkStatus === 'online' ? 'danger' : 'success'}
            >
              {networkStatus === 'online' ? 'Simular Offline' : 'Simular Online'}
            </Button>
          </div>
          
          {loading && (
            <div className="mb-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-500 mr-2"></div>
                <span>Executando operação... (Tentativa {attempts + 1})</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
              {error.message || String(error)}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Logs</h3>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md p-3 h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Nenhum log disponível.
                </p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">[{new Date().toLocaleTimeString()}]</span> {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Operações Offline ({offlineOperations.length})</h3>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md p-3 h-60 overflow-y-auto">
              {offlineOperations.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Nenhuma operação offline pendente.
                </p>
              ) : (
                <div className="space-y-2">
                  {offlineOperations.map(operation => (
                    <div key={operation.id} className="text-sm border-b border-neutral-200 dark:border-neutral-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <span className="font-medium">{operation.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          operation.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                          operation.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                          operation.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        }`}>
                          {operation.status}
                        </span>
                      </div>
                      <div>Alvo: {operation.target}</div>
                      <div>Tentativas: {operation.attempts}</div>
                      <div>Próxima tentativa: {new Date(operation.nextRetry).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RetryExample;