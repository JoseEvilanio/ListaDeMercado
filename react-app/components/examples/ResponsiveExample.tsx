import React from 'react';
import { Card } from '../ui';
import { Container, OrientationLayout, DeviceLayout } from '../layout';
import { useOrientation, useDevice } from '../../hooks';

const ResponsiveExample: React.FC = () => {
  const { orientation, angle, isPortrait, isLandscape } = useOrientation();
  const { type, width, height, isTouchDevice } = useDevice();
  
  return (
    <Container maxWidth="lg">
      <h1 className="text-2xl font-bold mb-6">Exemplo Responsivo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Informações do Dispositivo</h2>
          </Card.Header>
          <Card.Body>
            <ul className="space-y-2">
              <li><strong>Tipo:</strong> {type}</li>
              <li><strong>Largura:</strong> {width}px</li>
              <li><strong>Altura:</strong> {height}px</li>
              <li><strong>Touch:</strong> {isTouchDevice ? 'Sim' : 'Não'}</li>
            </ul>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Informações de Orientação</h2>
          </Card.Header>
          <Card.Body>
            <ul className="space-y-2">
              <li><strong>Orientação:</strong> {orientation}</li>
              <li><strong>Ângulo:</strong> {angle}°</li>
              <li><strong>Retrato:</strong> {isPortrait ? 'Sim' : 'Não'}</li>
              <li><strong>Paisagem:</strong> {isLandscape ? 'Sim' : 'Não'}</li>
            </ul>
          </Card.Body>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Layout Baseado na Orientação</h2>
        
        <OrientationLayout
          portrait={
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <Card.Body>
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0V6m0 6h6m-6 0H6" />
                    <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth={2} />
                  </svg>
                  <h3 className="text-lg font-medium">Modo Retrato</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido apenas no modo retrato.</p>
                </div>
              </Card.Body>
            </Card>
          }
          landscape={
            <Card className="bg-green-50 dark:bg-green-900/20">
              <Card.Body>
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h6m-6 0H6m6 0v-6m0 6V6" />
                    <rect x="4" y="6" width="16" height="12" rx="2" strokeWidth={2} />
                  </svg>
                  <h3 className="text-lg font-medium">Modo Paisagem</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido apenas no modo paisagem.</p>
                </div>
              </Card.Body>
            </Card>
          }
        >
          <Card className="bg-purple-50 dark:bg-purple-900/20">
            <Card.Body>
              <div className="text-center py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium">Conteúdo Padrão</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido quando não há conteúdo específico para a orientação atual ou em dispositivos desktop.</p>
              </div>
            </Card.Body>
          </Card>
        </OrientationLayout>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Layout Baseado no Dispositivo</h2>
        
        <DeviceLayout
          mobile={
            <Card className="bg-red-50 dark:bg-red-900/20">
              <Card.Body>
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium">Dispositivo Móvel</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido apenas em dispositivos móveis.</p>
                </div>
              </Card.Body>
            </Card>
          }
          tablet={
            <Card className="bg-yellow-50 dark:bg-yellow-900/20">
              <Card.Body>
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium">Tablet</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido apenas em tablets.</p>
                </div>
              </Card.Body>
            </Card>
          }
          desktop={
            <Card className="bg-indigo-50 dark:bg-indigo-900/20">
              <Card.Body>
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium">Desktop</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido apenas em desktops.</p>
                </div>
              </Card.Body>
            </Card>
          }
        >
          <Card className="bg-purple-50 dark:bg-purple-900/20">
            <Card.Body>
              <div className="text-center py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium">Conteúdo Padrão</h3>
                <p className="text-neutral-600 dark:text-neutral-400">Este conteúdo é exibido quando não há conteúdo específico para o dispositivo atual.</p>
              </div>
            </Card.Body>
          </Card>
        </DeviceLayout>
      </div>
    </Container>
  );
};

export default ResponsiveExample;