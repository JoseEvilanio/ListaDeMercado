import React from 'react';
import useDevice from '../../hooks/useDevice';

interface DeviceLayoutProps {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
}

/**
 * Componente que renderiza conteúdo diferente com base no tipo de dispositivo
 */
const DeviceLayout: React.FC<DeviceLayoutProps> = ({
  children,
  mobile,
  tablet,
  desktop
}) => {
  const { isMobile, isTablet, isDesktop } = useDevice();
  
  // Renderizar conteúdo específico para dispositivos móveis
  if (isMobile && mobile) {
    return <>{mobile}</>;
  }
  
  // Renderizar conteúdo específico para tablets
  if (isTablet && tablet) {
    return <>{tablet}</>;
  }
  
  // Renderizar conteúdo específico para desktops
  if (isDesktop && desktop) {
    return <>{desktop}</>;
  }
  
  // Renderizar conteúdo padrão
  return <>{children}</>;
};

export default DeviceLayout;