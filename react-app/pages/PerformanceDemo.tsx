import React from 'react';
import { ResponsiveLayout, Container } from '../components/layout';
import { Card, ConnectionStatus } from '../components/ui';
import {
  OptimizedContentList,
  LazyLoadingExample,
  PerformanceDashboard
} from '../components/examples';

/**
 * Página de demonstração para otimizações de desempenho
 */
const PerformanceDemo: React.FC = () => {
  return (
    <ResponsiveLayout
      header={
        <div className="flex items-center justify-between w-full">
          <div className="font-bold text-xl">Otimizações de Desempenho</div>
        </div>
      }
    >
      <Container maxWidth="xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Demonstração de Otimizações de Desempenho</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Esta página demonstra as otimizações de desempenho implementadas para o aplicativo.
          </p>
        </div>
        
        <ConnectionStatus className="mb-6" />
        
        <div className="space-y-8">
          <PerformanceDashboard />
          
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Consultas Otimizadas</h2>
            </Card.Header>
            <Card.Body>
              <p className="mb-4">
                Este exemplo demonstra consultas otimizadas ao Supabase com cache, retry e paginação.
              </p>
              
              <OptimizedContentList
                title="Conteúdos (Consulta Otimizada)"
              />
            </Card.Body>
          </Card>
          
          <LazyLoadingExample />
        </div>
      </Container>
    </ResponsiveLayout>
  );
};

export default PerformanceDemo;