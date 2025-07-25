import { useState, useEffect } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceState {
  type: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  isTouchDevice: boolean;
}

/**
 * Hook para detectar o tipo de dispositivo
 * @returns Objeto com informações sobre o dispositivo atual
 */
const useDevice = (): DeviceState => {
  // Função para obter o tipo de dispositivo
  const getDevice = (): DeviceState => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
        isTouchDevice: false
      };
    }
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Detectar se é um dispositivo touch
    const isTouchDevice = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;
    
    // Determinar o tipo de dispositivo com base na largura
    let type: DeviceType;
    if (width < 640) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    } else {
      type = 'desktop';
    }
    
    return {
      type,
      isMobile: type === 'mobile',
      isTablet: type === 'tablet',
      isDesktop: type === 'desktop',
      width,
      height,
      isTouchDevice
    };
  };
  
  // Estado inicial
  const [deviceState, setDeviceState] = useState<DeviceState>(getDevice());
  
  useEffect(() => {
    // Função para atualizar o estado quando o tamanho da janela mudar
    const updateDevice = () => {
      setDeviceState(getDevice());
    };
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', updateDevice);
    
    // Limpar listener
    return () => {
      window.removeEventListener('resize', updateDevice);
    };
  }, []);
  
  return deviceState;
};

export default useDevice;