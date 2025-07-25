import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRetry } from '../../hooks';
import { RetryService } from '../../services/retry.service';

// Mock do RetryService
jest.mock('../../services/retry.service', () => ({
  RetryService: {
    withRetry: jest.fn(),
    addOfflineOperation: jest.fn(),
    getOfflineOperations: jest.fn(),
    removeOfflineOperation: jest.fn(),
    isOnline: jest.fn(),
    addConnectionListeners: jest.fn(),
    initialize: jest.fn(),
    loadOfflineOperations: jest.fn()
  },
  RetryStrategy: {
    FIXED: 'fixed',
    EXPONENTIAL: 'exponential',
    RANDOM: 'random'
  }
}));

// Componente de teste para o hook
const TestComponent = () => {
  const {
    execute,
    loading,
    error,
    data,
    attempts,
    addOfflineOperation,
    offlineOperations
  } = useRetry({
    maxRetries: 3,
    baseDelay: 100,
    onStart: jest.fn(),
    onRetry: jest.fn(),
    onSuccess: jest.fn(),
    onError: jest.fn()
  });
  
  const handleSuccessOperation = async () => {
    try {
      await execute(() => Promise.resolve('success'));
    } catch (err) {
      // Ignorar erro
    }
  };
  
  const handleFailOperation = async () => {
    try {
      await execute(() => Promise.reject(new Error('Falha simulada')));
    } catch (err) {
      // Ignorar erro
    }
  };
  
  const handleAddOfflineOperation = () => {
    addOfflineOperation({
      type: 'create',
      target: 'users',
      data: { name: 'Test User' }
    });
  };
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Carregando...' : 'Pronto'}</div>
      {error && <div data-testid="error">{error.message || String(error)}</div>}
      {data && <div data-testid="data">{JSON.stringify(data)}</div>}
      <div data-testid="attempts">{attempts}</div>
      <div data-testid="operations">{offlineOperations.length}</div>
      
      <button
        onClick={handleSuccessOperation}
        data-testid="success-button"
      >
        Operação com Sucesso
      </button>
      
      <button
        onClick={handleFailOperation}
        data-testid="fail-button"
      >
        Operação com Falha
      </button>
      
      <button
        onClick={handleAddOfflineOperation}
        data-testid="offline-button"
      >
        Adicionar Operação Offline
      </button>
    </div>
  );
};

describe('useRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão para getOfflineOperations
    (RetryService.getOfflineOperations as jest.Mock).mockReturnValue([]);
    
    // Mock padrão para isOnline
    (RetryService.isOnline as jest.Mock).mockReturnValue(true);
    
    // Mock padrão para addConnectionListeners
    (RetryService.addConnectionListeners as jest.Mock).mockImplementation((onOnline, onOffline) => {
      return () => {};
    });
  });
  
  it('should execute operation successfully', async () => {
    // Configurar mock para withRetry
    (RetryService.withRetry as jest.Mock).mockResolvedValue('success result');
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Pronto');
    
    // Clicar no botão de operação com sucesso
    fireEvent.click(screen.getByTestId('success-button'));
    
    // Verificar estado de carregamento
    expect(screen.getByTestId('loading')).toHaveTextContent('Carregando...');
    
    // Aguardar conclusão
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Pronto');
    });
    
    // Verificar resultado
    expect(screen.getByTestId('data')).toHaveTextContent('success result');
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    
    // Verificar chamada do RetryService
    expect(RetryService.withRetry).toHaveBeenCalledTimes(1);
  });
  
  it('should handle operation failure', async () => {
    // Configurar mock para withRetry
    (RetryService.withRetry as jest.Mock).mockRejectedValue(new Error('Falha simulada'));
    
    render(<TestComponent />);
    
    // Clicar no botão de operação com falha
    fireEvent.click(screen.getByTestId('fail-button'));
    
    // Aguardar conclusão
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Pronto');
    });
    
    // Verificar erro
    expect(screen.getByTestId('error')).toHaveTextContent('Falha simulada');
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    
    // Verificar chamada do RetryService
    expect(RetryService.withRetry).toHaveBeenCalledTimes(1);
  });
  
  it('should add offline operation', async () => {
    // Configurar mock para addOfflineOperation
    (RetryService.addOfflineOperation as jest.Mock).mockReturnValue('operation-id');
    
    // Configurar mock para getOfflineOperations
    (RetryService.getOfflineOperations as jest.Mock).mockReturnValue([
      { id: 'operation-id', type: 'create', target: 'users', data: { name: 'Test User' } }
    ]);
    
    render(<TestComponent />);
    
    // Verificar contagem inicial de operações
    expect(screen.getByTestId('operations')).toHaveTextContent('0');
    
    // Clicar no botão de adicionar operação offline
    fireEvent.click(screen.getByTestId('offline-button'));
    
    // Aguardar atualização
    await waitFor(() => {
      expect(screen.getByTestId('operations')).toHaveTextContent('1');
    });
    
    // Verificar chamada do RetryService
    expect(RetryService.addOfflineOperation).toHaveBeenCalledTimes(1);
    expect(RetryService.addOfflineOperation).toHaveBeenCalledWith({
      type: 'create',
      target: 'users',
      data: { name: 'Test User' }
    });
  });
});