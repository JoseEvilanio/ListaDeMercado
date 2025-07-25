import { ErrorService } from './error.service';

/**
 * Tipos de estratégias de retry
 */
export enum RetryStrategy {
  /** Tempo fixo entre tentativas */
  FIXED = 'fixed',
  /** Tempo crescente entre tentativas (exponencial) */
  EXPONENTIAL = 'exponential',
  /** Tempo aleatório entre tentativas */
  RANDOM = 'random'
}

/**
 * Opções para retry
 */
export interface RetryOptions {
  /** Número máximo de tentativas */
  maxRetries?: number;
  /** Tempo base entre tentativas (ms) */
  baseDelay?: number;
  /** Tempo máximo entre tentativas (ms) */
  maxDelay?: number;
  /** Estratégia de retry */
  strategy?: RetryStrategy;
  /** Fator para estratégia exponencial */
  factor?: number;
  /** Função para verificar se o erro é retryable */
  isRetryable?: (error: any) => boolean;
  /** Função para executar antes de cada retry */
  onRetry?: (attempt: number, delay: number, error: any) => void;
  /** Função para executar quando todas as tentativas falharem */
  onFail?: (error: any, attempts: number) => void;
}

/**
 * Estado de uma operação offline
 */
export interface OfflineOperation {
  /** ID único da operação */
  id: string;
  /** Tipo de operação */
  type: 'create' | 'update' | 'delete' | 'custom';
  /** Dados da operação */
  data: any;
  /** Tabela ou recurso alvo */
  target: string;
  /** Timestamp de criação */
  timestamp: number;
  /** Número de tentativas */
  attempts: number;
  /** Próxima tentativa (timestamp) */
  nextRetry: number;
  /** Status da operação */
  status: 'pending' | 'processing' | 'failed' | 'success';
}

/**
 * Serviço para gerenciar retries e operações offline
 */
export class RetryService {
  private static offlineOperations: OfflineOperation[] = [];
  private static isProcessing = false;
  private static processingInterval: number | null = null;
  
  /**
   * Opções padrão para retry
   */
  private static defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    strategy: RetryStrategy.EXPONENTIAL,
    factor: 2,
    isRetryable: (error: any) => {
      // Verificar se o erro é relacionado à conexão
      if (typeof error === 'string') {
        return error.includes('network') || 
               error.includes('timeout') || 
               error.includes('connection') ||
               error.includes('offline');
      }
      
      if (error instanceof Error) {
        return error.message.includes('network') || 
               error.message.includes('timeout') || 
               error.message.includes('connection') ||
               error.message.includes('offline');
      }
      
      // Verificar códigos de erro HTTP que são retryable
      if (error.status) {
        return [408, 429, 500, 502, 503, 504].includes(error.status);
      }
      
      return false;
    }
  };
  
  /**
   * Executa uma função com retry automático
   * @param fn Função a ser executada
   * @param options Opções de retry
   * @returns Resultado da função
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let attempt = 0;
    let lastError: any;
    
    while (attempt <= (opts.maxRetries || 3)) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;
        
        // Verificar se o erro é retryable
        if (opts.isRetryable && !opts.isRetryable(error)) {
          ErrorService.logError('Erro não retryable', { error, attempt });
          throw error;
        }
        
        // Verificar se atingiu o número máximo de tentativas
        if (attempt > (opts.maxRetries || 3)) {
          ErrorService.logError('Máximo de tentativas atingido', { error, attempt });
          
          if (opts.onFail) {
            opts.onFail(error, attempt);
          }
          
          throw error;
        }
        
        // Calcular delay com base na estratégia
        const delay = this.calculateDelay(attempt, opts);
        
        // Executar callback onRetry
        if (opts.onRetry) {
          opts.onRetry(attempt, delay, error);
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  /**
   * Calcula o delay entre tentativas com base na estratégia
   * @param attempt Número da tentativa
   * @param options Opções de retry
   * @returns Delay em milissegundos
   */
  private static calculateDelay(attempt: number, options: RetryOptions): number {
    const { baseDelay = 1000, maxDelay = 30000, strategy = RetryStrategy.EXPONENTIAL, factor = 2 } = options;
    
    let delay: number;
    
    switch (strategy) {
      case RetryStrategy.FIXED:
        delay = baseDelay;
        break;
        
      case RetryStrategy.EXPONENTIAL:
        delay = baseDelay * Math.pow(factor, attempt - 1);
        break;
        
      case RetryStrategy.RANDOM:
        const min = baseDelay;
        const max = baseDelay * Math.pow(factor, attempt - 1);
        delay = Math.random() * (max - min) + min;
        break;
        
      default:
        delay = baseDelay;
    }
    
    // Limitar ao delay máximo
    return Math.min(delay, maxDelay);
  }
  
  /**
   * Adiciona uma operação à fila offline
   * @param operation Operação a ser adicionada
   * @returns ID da operação
   */
  static addOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'attempts' | 'nextRetry' | 'status'>): string {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    const newOperation: OfflineOperation = {
      id,
      ...operation,
      timestamp: Date.now(),
      attempts: 0,
      nextRetry: Date.now(),
      status: 'pending'
    };
    
    this.offlineOperations.push(newOperation);
    this.saveOfflineOperations();
    this.startProcessing();
    
    return id;
  }
  
  /**
   * Obtém todas as operações offline
   * @returns Lista de operações offline
   */
  static getOfflineOperations(): OfflineOperation[] {
    return [...this.offlineOperations];
  }
  
  /**
   * Remove uma operação offline
   * @param id ID da operação
   */
  static removeOfflineOperation(id: string): void {
    this.offlineOperations = this.offlineOperations.filter(op => op.id !== id);
    this.saveOfflineOperations();
  }
  
  /**
   * Salva as operações offline no localStorage
   */
  private static saveOfflineOperations(): void {
    try {
      localStorage.setItem('offlineOperations', JSON.stringify(this.offlineOperations));
    } catch (error) {
      ErrorService.logError('Erro ao salvar operações offline', error);
    }
  }
  
  /**
   * Carrega as operações offline do localStorage
   */
  static loadOfflineOperations(): void {
    try {
      const stored = localStorage.getItem('offlineOperations');
      
      if (stored) {
        this.offlineOperations = JSON.parse(stored);
      }
    } catch (error) {
      ErrorService.logError('Erro ao carregar operações offline', error);
      this.offlineOperations = [];
    }
  }
  
  /**
   * Inicia o processamento de operações offline
   */
  static startProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Processar imediatamente
    this.processOfflineOperations();
    
    // Configurar intervalo para processamento periódico
    this.processingInterval = window.setInterval(() => {
      this.processOfflineOperations();
    }, 60000); // Verificar a cada minuto
  }
  
  /**
   * Para o processamento de operações offline
   */
  static stopProcessing(): void {
    this.isProcessing = false;
    
    if (this.processingInterval !== null) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
  
  /**
   * Processa operações offline pendentes
   */
  private static async processOfflineOperations(): Promise<void> {
    // Verificar se está online
    if (!navigator.onLine) {
      return;
    }
    
    // Obter operações pendentes que estão prontas para retry
    const now = Date.now();
    const pendingOperations = this.offlineOperations.filter(
      op => op.status === 'pending' && op.nextRetry <= now
    );
    
    // Processar cada operação
    for (const operation of pendingOperations) {
      // Atualizar status
      operation.status = 'processing';
      operation.attempts++;
      this.saveOfflineOperations();
      
      try {
        // Aqui seria implementada a lógica para executar a operação
        // Por exemplo, chamar uma API, atualizar um banco de dados, etc.
        
        // Simular processamento bem-sucedido
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Atualizar status
        operation.status = 'success';
        this.saveOfflineOperations();
        
        // Remover operação concluída
        this.removeOfflineOperation(operation.id);
      } catch (error) {
        // Calcular próxima tentativa
        const delay = this.calculateDelay(
          operation.attempts,
          { ...this.defaultOptions, maxRetries: 10 }
        );
        
        // Atualizar status
        operation.status = 'failed';
        operation.nextRetry = now + delay;
        this.saveOfflineOperations();
        
        ErrorService.logError('Erro ao processar operação offline', {
          operation,
          error
        });
      }
    }
  }
  
  /**
   * Registra listeners para eventos de conexão
   */
  static registerConnectionListeners(): void {
    window.addEventListener('online', () => {
      console.log('Conexão restabelecida');
      this.processOfflineOperations();
    });
    
    window.addEventListener('offline', () => {
      console.log('Conexão perdida');
    });
  }
  
  /**
   * Inicializa o serviço de retry
   */
  static initialize(): void {
    this.loadOfflineOperations();
    this.registerConnectionListeners();
    this.startProcessing();
  }
}