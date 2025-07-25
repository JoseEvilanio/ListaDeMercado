import React, { useEffect } from 'react';
import { OrientationAwareLayout } from '../layout';
import { useOrientation } from '../../hooks';
import { useOrientationContext } from '../../contexts/OrientationContext';

/**
 * Componente de exemplo para demonstrar ajustes dinâmicos de layout com base na orientação
 */
const OrientationAdjustmentExample: React.FC = () => {
  const { orientation, isTransitioning, aspectRatio } = useOrientation();
  
  // Log de mudanças de orientação para debug
  useEffect(() => {
    console.log(`Orientação atual: ${orientation}, Aspect Ratio: ${aspectRatio.toFixed(2)}`);
  }, [orientation, aspectRatio]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Exemplo de Ajuste Dinâmico de Layout</h2>
      
      {/* Indicador de orientação atual */}
      <div className="mb-6 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="font-medium">
          Orientação atual: <span className="font-bold">{orientation}</span>
          {isTransitioning && <span className="ml-2 text-blue-600 dark:text-blue-400">(Transicionando...)</span>}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Aspect Ratio: {aspectRatio.toFixed(2)}
        </p>
      </div>
      
      {/* Layout que se ajusta automaticamente */}
      <OrientationAwareLayout
        className="border rounded-lg overflow-hidden"
        portraitClassName="bg-purple-50 dark:bg-purple-900/20"
        landscapeClassName="bg-green-50 dark:bg-green-900/20"
        onOrientationChange={(newOrientation) => {
          console.log(`Orientação mudou para: ${newOrientation}`);
        }}
      >
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">
            Conteúdo Adaptativo
          </h3>
          
          {/* Conteúdo específico para cada orientação */}
          <div className="portrait:block landscape:hidden">
            <div className="bg-purple-200 dark:bg-purple-800/30 p-4 rounded-lg mb-4">
              <p className="font-medium">Este conteúdo é otimizado para modo retrato</p>
              <div className="portrait-stack space-y-4 mt-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">Item 1</div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">Item 2</div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm">Item 3</div>
              </div>
            </div>
          </div>
          
          <div className="portrait:hidden landscape:block">
            <div className="bg-green-200 dark:bg-green-800/30 p-4 rounded-lg mb-4">
              <p className="font-medium">Este conteúdo é otimizado para modo paisagem</p>
              <div className="landscape-flex space-x-4 mt-4">
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm flex-1">Item 1</div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm flex-1">Item 2</div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm flex-1">Item 3</div>
              </div>
            </div>
          </div>
          
          {/* Grid que se adapta à orientação */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Grid Adaptativo</h4>
            <div className="portrait:grid-cols-1 landscape:grid-cols-3 grid gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                <h5 className="font-medium">Card 1</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conteúdo que se adapta à orientação</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                <h5 className="font-medium">Card 2</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conteúdo que se adapta à orientação</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm">
                <h5 className="font-medium">Card 3</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conteúdo que se adapta à orientação</p>
              </div>
            </div>
          </div>
          
          {/* Instruções para teste */}
          <div className="mt-6 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-sm">
            <p>
              <strong>Como testar:</strong> Gire seu dispositivo para ver as mudanças de layout automáticas.
              Em desktop, você pode usar as ferramentas de desenvolvedor do navegador para simular diferentes orientações.
            </p>
          </div>
        </div>
      </OrientationAwareLayout>
    </div>
  );
};

export default OrientationAdjustmentExample;