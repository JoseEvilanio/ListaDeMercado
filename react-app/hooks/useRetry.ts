import { useState, useCallback } from 'react';
import { RetryService, RetryOptions, RetryStrategy } from '../services/retry.service';

interface UseRetryOptions extends RetryOptions {
  /** Função para executar quando a operação começar */
  onStart?: () => void;
  /** Função para executar quando a operação for concluída com sucesso */
  onSuccess?: (result: any) => void;
  /** Função para executar quando a operação falhar */
  onError?: (error: any) => void;
}

interface UseRetryResult<T> {
  /** Executa a função com retry */
  execute: (fn: () => Promise<T>) => Promise<T>;
  /** Indica se a operação está em andamento */
  loading: boolean;
  /** Resultado da última operação bem-sucedida */
  data: T | null;
  /** Erro da última operação que falhou */
  error: any;
  /** Número de tentativas realizadas */
  attempts: number;
  /** Adiciona uma operação à fila offline */
  addOfflineOperation: (operation: {
    type: 'create' | 'update' | 'delete' | 'custom';
    data: any;
    target: string;
  }) => string;
  /** Lista de operações offline */
  offlineOperations: any[];
}

/**
 * Hook para usar o serviço de retry
 * @param options Opções de retry
 * @returns Funções e estado para retry
 */
const useRetry = <T>(options: UseRetryOptions = {}): UseRetryResult<T> => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const [offlineOperations, setOfflineOperations] = useState<any[]>(
    RetryService.getOfflineOperations()
  );
  
  // Configurar callbacks
  const onRetry = useCallback((attempt: number, delay: number, err: any) => {
    setAttempts(attempt);
    
    if (options.onRetry) {
      options.onRetry(attempt, delay, err);
    }
  }, [options.onRetry]);
  
  const onFail = useCallback((err: any, attemptCount: number) => {
    if (options.onFail) {
      options.onFail(err, attemptCount);
    }
    
    if (options.onError) {
      options.onError(err);
    }
  }, [options.onFail, options.onError]);
  
  // Executar função com retry
  const execute = useCallback(async (fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    setAttempts(0);
    
    if (options.onStart) {
      options.onStart();
    }
    
    try {
      const result = await RetryService.withRetry(fn, {
        ...options,
        onRetry,
        onFail
      });
      
      setData(result);
      setLoading(false);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [options, onRetry, onFail]);
  
  // Adicionar operação offline
  const addOfflineOperation = useCallback((operation: {
    type: 'create' | 'update' | 'delete' | 'custom';
    data: any;
    target: string;
  }): string => {
    const id = RetryService.addOfflineOperation(operation);
    setOfflineOperations(RetryService.getOfflineOperations());
    return id;
  }, []);
  
  return {
    execute,
    loading,
    data,
    error,
    attempts,
    addOfflineOperation,
    offlineOperations
  };
};

export default useRetry;