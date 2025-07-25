import React, { useState, useEffect } from 'react';
import { useOrientationContext } from '../../contexts/OrientationContext';
import { OrientationAwareLayout, OrientationLayout, OrientationMessage } from '../layout';
import useDevice from '../../hooks/useDevice';

interface OrientationDemoProps {
  showDebugInfo?: boolean;
  showOrientationMessage?: boolean;
  preferredOrientation?: 'portrait' | 'landscape' | 'any';
}

/**
 * Componente de demonstração para exibir recursos de detecção de orientação
 */
const OrientationDemo: React.FC<OrientationDemoProps> = ({
  showDebugInfo = false,
  showOrientationMessage = false,
  preferredOrientation = 'any'
}) => {
  const { orientation, isPortrait, isLandscape, angle, hasOrientationChanged } = useOrientationContext();
  const { isMobile, isTablet, type, width, height } = useDevice();
  const [orientationChanges, setOrientationChanges] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<Date | null>(null);
  
  // Incrementar contador quando a orientação mudar
  useEffect(() => {
    if (hasOrientationChanged) {
      setOrientationChanges(prev => prev + 1);
      setLastChangeTime(new Date());
    }
  }, [hasOrientationChanged]);
  
  // Conteúdo específico para orientação retrato
  const portraitContent = (
    <div className="p-4 bg-primary-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Modo Retrato</h3>
      <p className="mb-4">Este conteúdo é otimizado para visualização em modo retrato.</p>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium">Card 1</h4>
          <p>Conteúdo empilhado verticalmente para melhor visualização em retrato.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium">Card 2</h4>
          <p>Conteúdo empilhado verticalmente para melhor visualização em retrato.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium">Card 3</h4>
          <p>Conteúdo empilhado verticalmente para melhor visualização em retrato.</p>
        </div>
      </div>
    </div>
  );
  
  // Conteúdo específico para orientação paisagem
  const landscapeContent = (
    <div className="p-4 bg-secondary-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Modo Paisagem</h3>
      <p className="mb-4">Este conteúdo é otimizado para visualização em modo paisagem.</p>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium">Card 1</h4>
          <p>Conteúdo lado a lado para aproveitar o espaço horizontal.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium">Card 2</h4>
          <p>Conteúdo lado a lado para aproveitar o espaço horizontal.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium">Card 3</h4>
          <p>Conteúdo lado a lado para aproveitar o espaço horizontal.</p>
        </div>
      </div>
    </div>
  );
  
  // Formulário adaptativo
  const adaptiveForm = (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Formulário Adaptativo</h3>
      <form>
        <div className={`form-row ${isPortrait ? 'flex flex-col' : 'flex flex-row'} mb-4`}>
          <div className={`form-field ${isLandscape ? 'mr-2' : 'mb-2'}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" className="form-input" placeholder="Digite seu nome" />
          </div>
          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="form-input" placeholder="Digite seu email" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
          <textarea className="form-input" rows={isPortrait ? 4 : 2} placeholder="Digite sua mensagem"></textarea>
        </div>
        <button type="button" className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
  
  // Tabela adaptativa
  const adaptiveTable = (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Tabela Adaptativa</h3>
      <table className="responsive-table w-full">
        <thead>
          <tr>
            <th className="text-left p-2">Nome</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Telefone</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Nome" className="p-2">João Silva</td>
            <td data-label="Email" className="p-2">joao@exemplo.com</td>
            <td data-label="Telefone" className="p-2">(11) 98765-4321</td>
            <td data-label="Ações" className="p-2">
              <button className="btn btn-sm btn-primary mr-1">Editar</button>
              <button className="btn btn-sm btn-outline">Excluir</button>
            </td>
          </tr>
          <tr>
            <td data-label="Nome" className="p-2">Maria Santos</td>
            <td data-label="Email" className="p-2">maria@exemplo.com</td>
            <td data-label="Telefone" className="p-2">(11) 91234-5678</td>
            <td data-label="Ações" className="p-2">
              <button className="btn btn-sm btn-primary mr-1">Editar</button>
              <button className="btn btn-sm btn-outline">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  
  // Informações de debug
  const debugInfo = showDebugInfo ? (
    <div className="mt-6 p-4 bg-neutral-100 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Informações de Debug</h3>
      <ul>
        <li><strong>Orientação:</strong> {orientation} ({angle}°)</li>
        <li><strong>Dispositivo:</strong> {type}</li>
        <li><strong>Dimensões:</strong> {width}x{height}</li>
        <li><strong>É móvel:</strong> {isMobile ? 'Sim' : 'Não'}</li>
        <li><strong>É tablet:</strong> {isTablet ? 'Sim' : 'Não'}</li>
        <li><strong>Mudanças de orientação:</strong> {orientationChanges}</li>
        <li><strong>Última mudança:</strong> {lastChangeTime ? lastChangeTime.toLocaleTimeString() : 'N/A'}</li>
      </ul>
    </div>
  ) : null;
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Demo de Detecção de Orientação</h2>
      
      {/* Mensagem de orientação preferida */}
      {showOrientationMessage && preferredOrientation !== 'any' && (
        <OrientationMessage preferredOrientation={preferredOrientation as 'portrait' | 'landscape'} />
      )}
      
      {/* Layout específico para cada orientação */}
      <OrientationLayout
        portrait={portraitContent}
        landscape={landscapeContent}
      >
        <div className="p-4 bg-neutral-200 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Conteúdo Padrão</h3>
          <p>Este conteúdo é exibido quando nenhum layout específico está disponível para a orientação atual.</p>
        </div>
      </OrientationLayout>
      
      {/* Layout adaptativo */}
      <OrientationAwareLayout
        className="mt-6 p-4 rounded-lg"
        portraitClassName="bg-primary-50"
        landscapeClassName="bg-secondary-50"
      >
        <h3 className="text-xl font-bold mb-2">Layout Adaptativo</h3>
        <p className="mb-4">Este layout se adapta com base na orientação do dispositivo.</p>
        
        <div className={`grid ${isPortrait ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-medium">Conteúdo Adaptativo</h4>
            <p>Este card se ajusta automaticamente com base na orientação.</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-medium">Conteúdo Adaptativo</h4>
            <p>Este card se ajusta automaticamente com base na orientação.</p>
          </div>
        </div>
      </OrientationAwareLayout>
      
      {/* Formulário adaptativo */}
      {adaptiveForm}
      
      {/* Tabela adaptativa */}
      {adaptiveTable}
      
      {/* Informações de debug */}
      {debugInfo}
    </div>
  );
};

export default OrientationDemo;