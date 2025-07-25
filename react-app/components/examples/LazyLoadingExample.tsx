import React, { useState } from 'react';
import { Card, Button, OptimizedImage, ConnectionStatus } from '../ui';
import { LazyComponent } from '..';

/**
 * Componente de exemplo para demonstrar carregamento lazy
 */
const LazyLoadingExample: React.FC = () => {
  const [showHeavyComponent, setShowHeavyComponent] = useState(false);
  
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Otimizações para Dispositivos Móveis</h2>
        </Card.Header>
        <Card.Body>
          <p className="mb-4">
            Este exemplo demonstra várias técnicas de otimização para dispositivos móveis:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Carregamento lazy de componentes</li>
            <li>Otimização de imagens</li>
            <li>Detecção de conexão offline</li>
            <li>Service Worker para funcionamento offline</li>
          </ul>
          
          <ConnectionStatus className="mb-4" />
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Imagem Otimizada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Imagem com carregamento lazy e otimização para dispositivos móveis:
                </p>
                <OptimizedImage
                  src="https://via.placeholder.com/800x400"
                  alt="Imagem de exemplo"
                  width={400}
                  height={200}
                  className="rounded-md overflow-hidden"
                  optimizationOptions={{
                    lazy: true,
                    placeholder: 'blur',
                    maxWidth: 400,
                    quality: 80
                  }}
                />
              </div>
              <div>
                <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Imagem com placeholder de cor:
                </p>
                <OptimizedImage
                  src="https://via.placeholder.com/800x400/0000FF/FFFFFF"
                  alt="Imagem de exemplo"
                  width={400}
                  height={200}
                  className="rounded-md overflow-hidden"
                  optimizationOptions={{
                    lazy: true,
                    placeholder: 'color',
                    maxWidth: 400,
                    quality: 80
                  }}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Componente com Carregamento Lazy</h3>
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
              Este componente só será carregado quando você clicar no botão:
            </p>
            <Button
              onClick={() => setShowHeavyComponent(!showHeavyComponent)}
              className="mb-4"
            >
              {showHeavyComponent ? 'Ocultar' : 'Carregar'} Componente Pesado
            </Button>
            
            {showHeavyComponent && (
              <LazyComponent
                component={() => import('./HeavyComponent')}
                fallback={
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LazyLoadingExample;