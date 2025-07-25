import React from 'react';
import useOrientation from '../../hooks/useOrientation';
import useDevice from '../../hooks/useDevice';

interface OrientationLayoutProps {
  children: React.ReactNode;
  portrait?: React.ReactNode;
  landscape?: React.ReactNode;
}

/**
 * Componente que renderiza conteúdo diferente com base na orientação do dispositivo
 */
const OrientationLayout: React.FC<OrientationLayoutProps> = ({
  children,
  portrait,
  landscape
}) => {
  const { isPortrait, isLandscape } = useOrientation();
  const { isMobile, isTablet } = useDevice();
  
  // Se não for um dispositivo móvel ou tablet, sempre renderizar o conteúdo padrão
  if (!isMobile && !isTablet) {
    return <>{children}</>;
  }
  
  // Renderizar conteúdo específico para orientação portrait
  if (isPortrait && portrait) {
    return <>{portrait}</>;
  }
  
  // Renderizar conteúdo específico para orientação landscape
  if (isLandscape && landscape) {
    return <>{landscape}</>;
  }
  
  // Renderizar conteúdo padrão
  return <>{children}</>;
};

export default OrientationLayout;