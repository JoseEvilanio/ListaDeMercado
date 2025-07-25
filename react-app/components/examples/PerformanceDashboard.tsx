import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { usePerformanceMonitoring } from '../../hooks';
import { PerformanceMetricType } from '../../services/performance-monitoring.service';

/**
 * Componente de dashboard de desempenho
 */
const PerformanceDashboard: React.FC = () => {
  const {
    metrics,
    statistics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearMetrics,
    measureAsync,
    startMeasure
  } = usePerformanceMonitoring({
    autoStart: true,
    slowThreshold: 500
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'statistics'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // Simular uma operação lenta
  const simulateSlowOperation = async () => {
    setIsLoading(true);
    
    try {
      await measureAsync('slow-operation', async () => {
        // Simular operação lenta
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simular várias operações rápidas
  const simulateFastOperations = () => {
    setIsLoading(true);
    
    try {
      for (let i = 0; i < 10; i++) {
        const endMeasure = startMeasure(`fast-operation-${i}`);
        
        // Simular operação rápida
        const start = performance.now();
        while (performance.now() - start < 50) {
          // Operação intensiva
          Math.random() * Math.random();
        }
        
        endMeasure();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Agrupar métricas por tipo
  const metricsByType = metrics.reduce((acc, metric) => {
    if (!acc[metric.type]) {
      acc[metric.type] = [];
    }
    
    acc[metric.type].push(metric);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Renderizar conteúdo com base na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-lg font-medium mb-2">Total de Métricas</h3>
                  <p className="text-3xl font-bold">{metrics.length}</p>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-lg font-medium mb-2">Métricas Lentas</h3>
                  <p className="text-3xl font-bold">
                    {metrics.filter(m => m.value > 500).length}
                  </p>
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Body className="text-center">
                  <h3 className="text-lg font-medium mb-2">Tipos de Métricas</h3>
                  <p className="text-3xl font-bold">
                    {Object.keys(metricsByType).length}
                  </p>
                </Card.Body>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Métricas por Tipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(metricsByType).map(([type, typeMetrics]) => (
                  <Card key={type}>
                    <Card.Header>
                      <h4 className="font-medium">{type}</h4>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-2">Total: {typeMetrics.length} métricas</p>
                      <p className="mb-2">
                        Média: {(typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length).toFixed(2)} ms
                      </p>
                      <p>
                        Máximo: {Math.max(...typeMetrics.map(m => m.value)).toFixed(2)} ms
                      </p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'metrics':
        return (
          <div>
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Valor (ms)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {metrics.slice(-20).reverse().map((metric, index) => (
                    <tr key={index} className={metric.value > 500 ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {metric.type}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {metric.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {metric.value.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {metrics.length > 20 && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Mostrando as 20 métricas mais recentes de {metrics.length} no total.
              </p>
            )}
          </div>
        );
        
      case 'statistics':
        return (
          <div>
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Contagem
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Mín (ms)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Máx (ms)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Média (ms)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      P95 (ms)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {Object.entries(statistics).map(([name, stats]) => (
                    <tr key={name}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {stats.count}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {stats.min.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {stats.max.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {stats.avg.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {stats.p95.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };
  
  return (
    <Card>
      <Card.Header>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-xl font-semibold mb-2 sm:mb-0">Dashboard de Desempenho</h2>
          <div className="flex space-x-2">
            <Button
              variant={isMonitoring ? 'danger' : 'primary'}
              size="sm"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? 'Parar' : 'Iniciar'} Monitoramento
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearMetrics}
            >
              Limpar Métricas
            </Button>
          </div>
        </div>
      </Card.Header>
      
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex space-x-4 px-4">
          <button
            className={`py-3 px-1 border-b-2 ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`py-3 px-1 border-b-2 ${
              activeTab === 'metrics'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400'
            }`}
            onClick={() => setActiveTab('metrics')}
          >
            Métricas
          </button>
          <button
            className={`py-3 px-1 border-b-2 ${
              activeTab === 'statistics'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 dark:text-neutral-400'
            }`}
            onClick={() => setActiveTab('statistics')}
          >
            Estatísticas
          </button>
        </nav>
      </div>
      
      <Card.Body>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Testar Desempenho</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={simulateSlowOperation}
              disabled={isLoading}
            >
              Simular Operação Lenta
            </Button>
            <Button
              onClick={simulateFastOperations}
              disabled={isLoading}
            >
              Simular Operações Rápidas
            </Button>
          </div>
        </div>
        
        {renderContent()}
      </Card.Body>
    </Card>
  );
};

export default PerformanceDashboard;