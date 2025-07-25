import React, { useEffect, useState } from 'react';
import { useOrientationContext } from '../../contexts/OrientationContext';
import useDevice from '../../hooks/useDevice';

interface OrientationDetectorProps {
  children: React.ReactNode;
  onOrientationChange?: (orientation: 'portrait' | 'landscape', isFirstDetection: boolean) => void;
  showDebugInfo?: boolean;
}

/**
 * Componente que detecta mudanças de orientação e aplica ajustes dinâmicos
 * Este componente deve ser usado em componentes de alto nível para detectar
 * mudanças de orientação e aplicar ajustes em toda a aplicação
 */
const OrientationDetector: React.FC<OrientationDetectorProps> = ({
  children,
  onOrientationChange,
  showDebugInfo = false
}) => {
  const { orientation, isPortrait, isLandscape, angle, hasOrientationChanged } = useOrientationContext();
  const { isMobile, isTablet, width, height } = useDevice();
  const [isFirstDetection, setIsFirstDetection] = useState(true);
  const [orientationHistory, setOrientationHistory] = useState<Array<{
    timestamp: number;
    orientation: 'portrait' | 'landscape';
    angle: number;
  }>>([]);

  // Detectar mudanças de orientação
  useEffect(() => {
    // Adicionar ao histórico
    setOrientationHistory(prev => [
      ...prev,
      {
        timestamp: Date.now(),
        orientation,
        angle
      }
    ].slice(-5)); // Manter apenas os últimos 5 registros
    
    // Chamar callback se fornecido
    if (onOrientationChange) {
      onOrientationChange(orientation, isFirstDetection);
    }
    
    // Aplicar classe CSS ao elemento HTML para estilização global
    document.documentElement.classList.remove('orientation-portrait', 'orientation-landscape');
    document.documentElement.classList.add(`orientation-${orientation}`);
    
    // Adicionar atributo de dados para seletores CSS
    document.documentElement.setAttribute('data-orientation', orientation);
    
    // Aplicar meta tag de viewport específica para orientação
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      if (orientation === 'portrait') {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }
    
    // Disparar evento personalizado para outros componentes
    const orientationEvent = new CustomEvent('orientationchange', {
      detail: {
        orientation,
        isPortrait,
        isLandscape,
        angle,
        width,
        height
      }
    });
    window.dispatchEvent(orientationEvent);
    
    // Não é mais a primeira detecção
    if (isFirstDetection) {
      setIsFirstDetection(false);
    }
  }, [orientation, angle, isPortrait, isLandscape, width, height, onOrientationChange, isFirstDetection]);

  // Aplicar ajustes específicos quando a orientação muda
  useEffect(() => {
    if (hasOrientationChanged && !isFirstDetection) {
      // Ajustar scroll para o topo quando a orientação muda
      window.scrollTo(0, 0);
      
      // Forçar recálculo de layout
      document.body.style.display = 'none';
      document.body.offsetHeight; // Forçar reflow
      document.body.style.display = '';
      
      // Adicionar classe temporária para animações de transição
      document.documentElement.classList.add('orientation-changing');
      
      // Remover classe após a transição
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('orientation-changing');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [hasOrientationChanged, isFirstDetection]);

  // Renderizar informações de debug se solicitado
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-xs z-50">
        <div>Orientation: {orientation} ({angle}°)</div>
        <div>Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</div>
        <div>Dimensions: {width}x{height}</div>
        <div>History: {orientationHistory.map((h, i) => (
          <span key={i} className="mr-2">
            {new Date(h.timestamp).toLocaleTimeString()} - {h.orientation} ({h.angle}°)
          </span>
        ))}</div>
      </div>
    );
  };

  return (
    <>
      {children}
      {renderDebugInfo()}
    </>
  );
};

export default OrientationDetector;