import React, { useState, useEffect } from 'react';
import { Card } from '../ui';

/**
 * Componente "pesado" para demonstrar carregamento lazy
 */
const HeavyComponent: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Simular carregamento de dados pesados
  useEffect(() => {
    const loadData = async () => {
      // Simular atraso de carregamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Gerar dados aleatórios
      const newData = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        name: `Item ${index + 1}`,
        value: Math.floor(Math.random() * 1000),
        description: `Esta é uma descrição longa para o item ${index + 1} que ocupa bastante espaço para simular um componente pesado com muitos dados.`
      }));
      
      setData(newData);
      setLoading(false);
    };
    
    loadData();
    
    // Simular limpeza de recursos pesados
    return () => {
      console.log('Componente pesado desmontado - recursos liberados');
    };
  }, []);
  
  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-semibold">Componente Pesado</h3>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Este componente foi carregado de forma lazy para economizar recursos.
              Ele contém {data.length} itens que só foram carregados quando você solicitou.
            </p>
            
            <div className="max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-md">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {data.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {item.id}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default HeavyComponent;