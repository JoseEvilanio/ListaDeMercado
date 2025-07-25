import { useState, useEffect, useCallback } from 'react';
import {
  PerformanceMonitoringService,
  PerformanceMetricType,
  PerformanceMetric
} from '../services/performance-monitoring.service';

interface UsePerformanceMonitoringOptions {
  enableNavigationMonitoring?: boolean;
  enableResourceMonitoring?: boolean;
  enablePaintMonitoring?: boolean;
  enableInteractionMonitoring?: boolean;
  slowThreshold?: number;
  reportingInterval?: number;
  autoStart?: boolean;
}

interface UsePerformanceMonitoringResult {
  metrics: PerformanceMetric[];
  statistics: Record<string, { count: number; min: number; max: number; avg: number; p95: number }>;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  clearMetrics: () => void;
  measureAsync: <T>(name: string, fn: () => Promise<T>, type?: PerformanceMetricType) => Promise<T>;
  measureSync: <T>(name: string, fn: () => T, type?: PerformanceMetricType) => T;
  startMeasure: (name: string, type?: PerformanceMetricType) => () => number;
}

/**
 * Hook para usar o serviço de monitoramento de desempenho
 * @param options Opções de monitoramento
 * @returns Funções e dados de monitoramento
 */
const usePerformanceMonitoring = (
  options: UsePerformanceMonitoringOptions = {}
): UsePerformanceMonitoringResult => {
  const {
    enableNavigationMonitoring = true,
    enableResourceMonitoring = true,
    enablePaintMonitoring = true,
    enableInteractionMonitoring = true,
    slowThreshold = 1000,
    reportingInterval = 30000,
    autoStart = true
  } = options;
  
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [statistics, setStatistics] = useState<Record<string, { count: number; min: number; max: number; avg: number; p95: number }>>({});
  
  // Obter instância do serviço
  const performanceService = PerformanceMonitoringService.getInstance({
    enableNavigationMonitoring,
    enableResourceMonitoring,
    enablePaintMonitoring,
    enableInteractionMonitoring,
    slowThreshold,
    reportingInterval,
    metricReporter: async (metrics) => {
      // Neste exemplo, apenas atualizamos o estado local
      // Em um ambiente real, você enviaria para um serviço de análise
      setMetrics(prevMetrics => [...prevMetrics, ...metrics]);
    }
  });
  
  // Iniciar monitoramento
  const startMonitoring = useCallback(() => {
    performanceService.start();
    setIsMonitoring(true);
  }, [performanceService]);
  
  // Parar monitoramento
  const stopMonitoring = useCallback(() => {
    performanceService.stop();
    setIsMonitoring(false);
  }, [performanceService]);
  
  // Limpar métricas
  const clearMetrics = useCallback(() => {
    performanceService.clearMetrics();
    setMetrics([]);
    setStatistics({});
  }, [performanceService]);
  
  // Medir função assíncrona
  const measureAsync = useCallback(
    async <T>(name: string, fn: () => Promise<T>, type: PerformanceMetricType = PerformanceMetricType.CUSTOM): Promise<T> => {
      return performanceService.measure(name, fn, type);
    },
    [performanceService]
  );
  
  // Medir função síncrona
  const measureSync = useCallback(
    <T>(name: string, fn: () => T, type: PerformanceMetricType = PerformanceMetricType.CUSTOM): T => {
      return performanceService.measure(name, fn, type);
    },
    [performanceService]
  );
  
  // Iniciar medição
  const startMeasure = useCallback(
    (name: string, type: PerformanceMetricType = PerformanceMetricType.CUSTOM): (() => number) => {
      return performanceService.startMeasure(name, type);
    },
    [performanceService]
  );
  
  // Atualizar estatísticas periodicamente
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStatistics(performanceService.getStatistics());
    }, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [performanceService]);
  
  // Iniciar monitoramento automaticamente
  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
    
    return () => {
      stopMonitoring();
    };
  }, [autoStart, startMonitoring, stopMonitoring]);
  
  return {
    metrics,
    statistics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    measureAsync,
    measureSync,
    startMeasure
  };
};

export default usePerformanceMonitoring;