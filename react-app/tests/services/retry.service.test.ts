import { RetryService, RetryStrategy } from '../../services/retry.service';

describe('RetryService', () => {
  beforeEach(() => {
    // Limpar localStorage mock
    localStorage.clear();
    
    // Resetar mocks
    jest.clearAllMocks();
    
    // Configurar navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true
    });
  });
  
  describe('withRetry', () => {
    it('should execute function successfully without retry', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await RetryService.withRetry(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should retry on failure and succeed eventually', async () => {
      // Função que falha nas primeiras duas tentativas e sucede na terceira
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Falha 1'))
        .mockRejectedValueOnce(new Error('Falha 2'))
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      const result = await RetryService.withRetry(mockFn, {
        maxRetries: 3,
        baseDelay: 10, // Delay curto para o teste
        onRetry
      });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
    });
    
    it('should fail after max retries', async () => {
      // Função que sempre falha
      const mockFn = jest.fn().mockRejectedValue(new Error('Falha persistente'));
      
      const onRetry = jest.fn();
      const onFail = jest.fn();
      
      await expect(RetryService.withRetry(mockFn, {
        maxRetries: 2,
        baseDelay: 10,
        onRetry,
        onFail
      })).rejects.toThrow('Falha persistente');
      
      expect(mockFn).toHaveBeenCalledTimes(3); // Tentativa inicial + 2 retries
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onFail).toHaveBeenCalledTimes(1);
    });
    
    it('should not retry if error is not retryable', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Erro não retryable'));
      
      const isRetryable = jest.fn().mockReturnValue(false);
      const onRetry = jest.fn();
      
      await expect(RetryService.withRetry(mockFn, {
        isRetryable,
        onRetry
      })).rejects.toThrow('Erro não retryable');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(isRetryable).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
    });
    
    it('should use different delay strategies', async () => {
      jest.useFakeTimers();
      
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Falha'))
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();
      
      // Estratégia fixa
      const fixedPromise = RetryService.withRetry(mockFn, {
        strategy: RetryStrategy.FIXED,
        baseDelay: 1000,
        onRetry
      });
      
      // Avançar o tempo
      jest.advanceTimersByTime(1000);
      await fixedPromise;
      
      expect(onRetry).toHaveBeenCalledWith(1, 1000, expect.any(Error));
      
      // Resetar mocks
      jest.clearAllMocks();
      
      // Estratégia exponencial
      const exponentialPromise = RetryService.withRetry(mockFn, {
        strategy: RetryStrategy.EXPONENTIAL,
        baseDelay: 1000,
        factor: 2,
        onRetry
      });
      
      // Avançar o tempo
      jest.advanceTimersByTime(2000); // 1000 * 2^1
      await exponentialPromise;
      
      expect(onRetry).toHaveBeenCalledWith(1, 2000, expect.any(Error));
      
      jest.useRealTimers();
    });
  });
  
  describe('offline operations', () => {
    it('should add offline operation', () => {
      const operation = {
        type: 'create',
        target: 'users',
        data: { name: 'Test User' }
      };
      
      const id = RetryService.addOfflineOperation(operation);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      
      const operations = RetryService.getOfflineOperations();
      expect(operations).toHaveLength(1);
      expect(operations[0].id).toBe(id);
      expect(operations[0].type).toBe('create');
      expect(operations[0].target).toBe('users');
      expect(operations[0].data).toEqual({ name: 'Test User' });
      expect(operations[0].status).toBe('pending');
    });
    
    it('should remove offline operation', () => {
      const operation = {
        type: 'create',
        target: 'users',
        data: { name: 'Test User' }
      };
      
      const id = RetryService.addOfflineOperation(operation);
      expect(RetryService.getOfflineOperations()).toHaveLength(1);
      
      RetryService.removeOfflineOperation(id);
      expect(RetryService.getOfflineOperations()).toHaveLength(0);
    });
    
    it('should save and load operations from localStorage', () => {
      const operation = {
        type: 'create',
        target: 'users',
        data: { name: 'Test User' }
      };
      
      RetryService.addOfflineOperation(operation);
      
      // Verificar se foi salvo no localStorage
      expect(localStorage.getItem('offlineOperations')).toBeDefined();
      
      // Limpar operações em memória
      (RetryService as any).offlineOperations = [];
      expect(RetryService.getOfflineOperations()).toHaveLength(0);
      
      // Carregar do localStorage
      RetryService.loadOfflineOperations();
      
      // Verificar se foi carregado
      expect(RetryService.getOfflineOperations()).toHaveLength(1);
      expect(RetryService.getOfflineOperations()[0].type).toBe('create');
    });
  });
  
  describe('connection handling', () => {
    it('should detect online status', () => {
      // Simular online
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      });
      
      expect(RetryService.isOnline()).toBe(true);
      
      // Simular offline
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      expect(RetryService.isOnline()).toBe(false);
    });
    
    it('should register connection listeners', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      const onOnline = jest.fn();
      const onOffline = jest.fn();
      
      const removeListeners = RetryService.addConnectionListeners(onOnline, onOffline);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', onOnline);
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', onOffline);
      
      // Verificar se a função de remoção funciona
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      removeListeners();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', onOnline);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', onOffline);
    });
  });
});