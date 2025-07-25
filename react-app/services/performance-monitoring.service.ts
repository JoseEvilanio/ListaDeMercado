/**
 * Tipos de métricas de desempenho
 */
export enum PerformanceMetricType {
  NAVIGATION = 'navigation',
  RESOURCE = 'resource',
  PAINT = 'paint',
  CUSTOM = 'custom',
  API_CALL = 'api_call',
  DATABASE = 'database',
  RENDER = 'render',
  INTERACTION = 'interaction'
}

/**
 * Interface para métricas de desempenho
 */
export interface PerformanceMetric {
  type: PerformanceMetricType;
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Opções para o monitoramento de desempenho
 */
export interface PerformanceMonitoringOptions {
  /** Habilitar monitoramento de navegação */
  enableNavigationMonitoring?: boolean;
  /** Habilitar monitoramento de recursos */
  enableResourceMonitoring?: boolean;
  /** Habilitar monitoramento de pintura */
  enablePaintMonitoring?: boolean;
  /** Habilitar monitoramento de interações */
  enableInteractionMonitoring?: boolean;
  /** Limite de tempo para considerar uma operação lenta (ms) */
  slowThreshold?: number;
  /** Função para enviar métricas para um serviço externo */
  metricReporter?: (metrics: PerformanceMetric[]) => Promise<void>;
  /** Intervalo para enviar métricas em lote (ms) */
  reportingInterval?: number;
  /** Tamanho máximo do lote de métricas */
  batchSize?: number;
}

/**
 * Serviço para monitoramento de desempenho
 */
export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private options: PerformanceMonitoringOptions;
  private reportingInterval: number | null = null;
  private navigationObserver: PerformanceObserver | null = null;
  private resourceObserver: PerformanceObserver | null = null;
  private paintObserver: PerformanceObserver | null = null;
  private interactionObserver: any | null = null;
  
  /**
   * Opções padrão para o monitoramento de desempenho
   */
  private static defaultOptions: PerformanceMonitoringOptions = {
    enableNavigationMonitoring: true,
    enableResourceMonitoring: true,
    enablePaintMonitoring: true,
    enableInteractionMonitoring: true,
    slowThreshold: 1000,
    reportingInterval: 30000,
    batchSize: 100
  };
  
  /**
   * Construtor privado para implementar Singleton
   * @param options Opções de monitoramento
   */
  private constructor(options: PerformanceMonitoringOptions = {}) {
    this.options = { ...PerformanceMonitoringService.defaultOptions, ...options };
  }
  
  /**
   * Obtém a instância do serviço (Singleton)
   * @param options Opções de monitoramento
   * @returns Instância do serviço
   */
  public static getInstance(options?: PerformanceMonitoringOptions): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService(options);
    }
    
    return PerformanceMonitoringService.instance;
  }
  
  /**
   * Inicia o monitoramento de desempenho
   */
  public start(): void {
    this.setupObservers();
    this.setupReporting();
  }
  
  /**
   * Para o monitoramento de desempenho
   */
  public stop(): void {
    this.teardownObservers();
    this.teardownReporting();
  }
  
  /**
   * Configura os observadores de desempenho
   */
  private setupObservers(): void {
    // Verificar se a API PerformanceObserver está disponível
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver não está disponível neste navegador');
      return;
    }
    
    // Monitorar navegação
    if (this.options.enableNavigationMonitoring) {
      try {
        this.navigationObserver = new PerformanceObserver(entries => {
          entries.getEntries().forEach(entry => {
            const navigationEntry = entry as PerformanceNavigationTiming;
            
            this.addMetric({
              type: PerformanceMetricType.NAVIGATION,
              name: 'page-load',
              value: navigationEntry.loadEventEnd - navigationEntry.startTime,
              timestamp: Date.now(),
              metadata: {
                domComplete: navigationEntry.domComplete - navigationEntry.startTime,
                domInteractive: navigationEntry.domInteractive - navigationEntry.startTime,
                domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
                firstByte: navigationEntry.responseStart - navigationEntry.startTime,
                url: navigationEntry.name
              }
            });
          });
        });
        
        this.navigationObserver.observe({ type: 'navigation', buffered: true });
      } catch (error) {
        console.warn('Erro ao configurar monitoramento de navegação:', error);
      }
    }
    
    // Monitorar recursos
    if (this.options.enableResourceMonitoring) {
      try {
        this.resourceObserver = new PerformanceObserver(entries => {
          entries.getEntries().forEach(entry => {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Filtrar recursos muito pequenos
            if (resourceEntry.duration < 100) return;
            
            this.addMetric({
              type: PerformanceMetricType.RESOURCE,
              name: resourceEntry.name.split('/').pop() || resourceEntry.name,
              value: resourceEntry.duration,
              timestamp: Date.now(),
              metadata: {
                initiatorType: resourceEntry.initiatorType,
                size: resourceEntry.transferSize,
                url: resourceEntry.name
              }
            });
          });
        });
        
        this.resourceObserver.observe({ type: 'resource', buffered: true });
      } catch (error) {
        console.warn('Erro ao configurar monitoramento de recursos:', error);
      }
    }
    
    // Monitorar pintura
    if (this.options.enablePaintMonitoring) {
      try {
        this.paintObserver = new PerformanceObserver(entries => {
          entries.getEntries().forEach(entry => {
            const paintEntry = entry as PerformancePaintTiming;
            
            this.addMetric({
              type: PerformanceMetricType.PAINT,
              name: paintEntry.name,
              value: paintEntry.startTime,
              timestamp: Date.now()
            });
          });
        });
        
        this.paintObserver.observe({ type: 'paint', buffered: true });
      } catch (error) {
        console.warn('Erro ao configurar monitoramento de pintura:', error);
      }
    }
    
    // Monitorar interações
    if (this.options.enableInteractionMonitoring && 'PerformanceEventTiming' in window) {
      try {
        // @ts-ignore - PerformanceEventTiming não está definido no tipo PerformanceObserver
        this.interactionObserver = new PerformanceObserver(entries => {
          entries.getEntries().forEach(entry => {
            // Filtrar interações muito rápidas
            if (entry.duration < 100) return;
            
            this.addMetric({
              type: PerformanceMetricType.INTERACTION,
              name: entry.name,
              value: entry.duration,
              timestamp: Date.now(),
              metadata: {
                target: entry.target ? (entry.target as any).tagName : 'unknown'
              }
            });
          });
        });
        
        this.interactionObserver.observe({ type: 'event', buffered: true });
      } catch (error) {
        console.warn('Erro ao configurar monitoramento de interações:', error);
      }
    }
  }
  
  /**
   * Remove os observadores de desempenho
   */
  private teardownObservers(): void {
    if (this.navigationObserver) {
      this.navigationObserver.disconnect();
      this.navigationObserver = null;
    }
    
    if (this.resourceObserver) {
      this.resourceObserver.disconnect();
      this.resourceObserver = null;
    }
    
    if (this.paintObserver) {
      this.paintObserver.disconnect();
      this.paintObserver = null;
    }
    
    if (this.interactionObserver) {
      this.interactionObserver.disconnect();
      this.interactionObserver = null;
    }
  }
  
  /**
   * Configura o envio periódico de métricas
   */
  private setupReporting(): void {
    if (this.options.metricReporter && this.options.reportingInterval) {
      this.reportingInterval = window.setInterval(() => {
        this.reportMetrics();
      }, this.options.reportingInterval);
    }
  }
  
  /**
   * Remove o envio periódico de métricas
   */
  private teardownReporting(): void {
    if (this.reportingInterval !== null) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
  }
  
  /**
   * Adiciona uma métrica ao lote
   * @param metric Métrica a ser adicionada
   */
  public addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Verificar se a métrica é lenta
    if (metric.value > (this.options.slowThreshold || 1000)) {
      console.warn(`Métrica lenta detectada: ${metric.name} (${metric.value}ms)`);
    }
    
    // Enviar métricas se atingir o tamanho do lote
    if (this.metrics.length >= (this.options.batchSize || 100)) {
      this.reportMetrics();
    }
  }
  
  /**
   * Inicia uma medição de tempo
   * @param name Nome da medição
   * @returns Função para finalizar a medição
   */
  public startMeasure(name: string, type: PerformanceMetricType = PerformanceMetricType.CUSTOM): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.addMetric({
        type,
        name,
        value: duration,
        timestamp: Date.now()
      });
      
      return duration;
    };
  }
  
  /**
   * Mede o tempo de execução de uma função
   * @param name Nome da medição
   * @param fn Função a ser medida
   * @param type Tipo de métrica
   * @returns Resultado da função
   */
  public async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    type: PerformanceMetricType = PerformanceMetricType.CUSTOM
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.addMetric({
        type,
        name,
        value: duration,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.addMetric({
        type,
        name: `${name}-error`,
        value: duration,
        timestamp: Date.now(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      
      throw error;
    }
  }
  
  /**
   * Envia as métricas coletadas para o serviço configurado
   */
  public async reportMetrics(): Promise<void> {
    if (!this.options.metricReporter || this.metrics.length === 0) {
      return;
    }
    
    const metricsToReport = [...this.metrics];
    this.metrics = [];
    
    try {
      await this.options.metricReporter(metricsToReport);
    } catch (error) {
      console.error('Erro ao enviar métricas:', error);
      
      // Restaurar métricas que não foram enviadas
      this.metrics = [...metricsToReport, ...this.metrics];
    }
  }
  
  /**
   * Obtém as métricas coletadas
   * @returns Métricas coletadas
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  /**
   * Limpa as métricas coletadas
   */
  public clearMetrics(): void {
    this.metrics = [];
  }
  
  /**
   * Obtém estatísticas das métricas coletadas
   * @returns Estatísticas das métricas
   */
  public getStatistics(): Record<string, { count: number; min: number; max: number; avg: number; p95: number }> {
    const stats: Record<string, { values: number[]; count: number; min: number; max: number; avg: number; p95: number }> = {};
    
    // Agrupar métricas por nome
    this.metrics.forEach(metric => {
      if (!stats[metric.name]) {
        stats[metric.name] = {
          values: [],
          count: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0,
          p95: 0
        };
      }
      
      stats[metric.name].values.push(metric.value);
      stats[metric.name].count++;
      stats[metric.name].min = Math.min(stats[metric.name].min, metric.value);
      stats[metric.name].max = Math.max(stats[metric.name].max, metric.value);
    });
    
    // Calcular média e percentil 95
    Object.keys(stats).forEach(name => {
      const values = stats[name].values.sort((a, b) => a - b);
      const sum = values.reduce((acc, val) => acc + val, 0);
      
      stats[name].avg = sum / values.length;
      stats[name].p95 = values[Math.floor(values.length * 0.95)];
      
      // Remover array de valores para economizar memória
      delete stats[name].values;
    });
    
    return stats;
  }
}