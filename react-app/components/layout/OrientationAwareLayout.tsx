import React, { useEffect, useState } from 'react';
import useOrientation from '../../hooks/useOrientation';
import useDevice from '../../hooks/useDevice';

interface OrientationAwareLayoutProps {
  children: React.ReactNode;
  className?: string;
  portraitClassName?: string;
  landscapeClassName?: string;
  transitionDuration?: number;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
}

/**
 * Componente que ajusta automaticamente o layout com base na orientação do dispositivo
 */
const OrientationAwareLayout: React.FC<OrientationAwareLayoutProps> = ({
  children,
  className = '',
  portraitClassName = '',
  landscapeClassName = '',
  transitionDuration = 300,
  onOrientationChange
}) => {
  const { orientation, isPortrait, isLandscape, isTransitioning, orientationChangeCount } = useOrientation();
  const { isMobile, isTablet } = useDevice();
  const [animating, setAnimating] = useState(false);
  
  // Aplicar classes com base na orientação
  const orientationClass = isPortrait ? portraitClassName : landscapeClassName;
  
  // Aplicar classe de transição quando a orientação muda
  useEffect(() => {
    if (isTransitioning && (isMobile || isTablet)) {
      setAnimating(true);
      
      // Chamar callback se fornecido
      if (onOrientationChange) {
        onOrientationChange(orientation);
      }
      
      // Remover classe de animação após a transição
      const timer = setTimeout(() => {
        setAnimating(false);
      }, transitionDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, orientation, isMobile, isTablet, transitionDuration, onOrientationChange]);
  
  // Aplicar classes CSS com base no estado atual
  const combinedClassName = `
    ${className}
    ${orientationClass}
    ${animating ? 'orientation-transition' : ''}
    ${isPortrait ? 'orientation-portrait' : 'orientation-landscape'}
  `.trim();
  
  // Estilo inline para a transição
  const transitionStyle = animating ? {
    transition: `all ${transitionDuration}ms ease-in-out`
  } : {};
  
  return (
    <div className={combinedClassName} style={transitionStyle} data-orientation={orientation}>
      {children}
    </div>
  );
};

export default OrientationAwareLayout;