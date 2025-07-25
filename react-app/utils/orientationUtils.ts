/**
 * Utilitários para detecção e ajuste de orientação
 */

/**
 * Verifica se o dispositivo está em modo retrato
 */
export const isPortrait = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  // Verificar usando a API de orientação moderna
  if (window.screen && window.screen.orientation) {
    const angle = window.screen.orientation.angle;
    return angle === 0 || angle === 180;
  }
  
  // Verificar usando a API de orientação legada
  if ('orientation' in window) {
    const orientation = window.orientation as number;
    return orientation === 0 || orientation === 180;
  }
  
  // Fallback para dimensões da janela
  return window.innerHeight > window.innerWidth;
};

/**
 * Verifica se o dispositivo está em modo paisagem
 */
export const isLandscape = (): boolean => {
  return !isPortrait();
};

/**
 * Obtém a orientação atual como string
 */
export const getOrientation = (): 'portrait' | 'landscape' => {
  return isPortrait() ? 'portrait' : 'landscape';
};

/**
 * Obtém o ângulo de orientação atual
 */
export const getOrientationAngle = (): number => {
  if (typeof window === 'undefined') return 0;
  
  // Verificar usando a API de orientação moderna
  if (window.screen && window.screen.orientation) {
    return window.screen.orientation.angle;
  }
  
  // Verificar usando a API de orientação legada
  if ('orientation' in window) {
    return window.orientation as number;
  }
  
  // Fallback para dimensões da janela
  return window.innerHeight > window.innerWidth ? 0 : 90;
};

/**
 * Obtém a proporção de aspecto atual (largura / altura)
 */
export const getAspectRatio = (): number => {
  if (typeof window === 'undefined') return 0.5625; // 9:16 padrão
  
  return window.innerWidth / window.innerHeight;
};

/**
 * Adiciona um listener para mudanças de orientação
 */
export const addOrientationChangeListener = (
  callback: (orientation: 'portrait' | 'landscape', angle: number) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleOrientationChange = () => {
    callback(getOrientation(), getOrientationAngle());
  };
  
  // Adicionar listeners para diferentes APIs
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', handleOrientationChange);
  } else {
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
  }
  
  // Retornar função para remover listeners
  return () => {
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.removeEventListener('change', handleOrientationChange);
    } else {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    }
  };
};

/**
 * Aplica classes CSS com base na orientação atual
 */
export const applyOrientationClasses = (element: HTMLElement): void => {
  const orientation = getOrientation();
  
  // Remover classes existentes
  element.classList.remove('orientation-portrait', 'orientation-landscape');
  
  // Adicionar classe para orientação atual
  element.classList.add(`orientation-${orientation}`);
  
  // Adicionar atributo de dados para seletores CSS
  element.setAttribute('data-orientation', orientation);
};

/**
 * Verifica se o dispositivo suporta mudanças de orientação
 */
export const supportsOrientationChange = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Verificar se é um dispositivo móvel ou tablet
  const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Verificar se tem API de orientação
  const hasOrientationAPI = 'orientation' in window || (window.screen && 'orientation' in window.screen);
  
  return isMobileOrTablet || hasOrientationAPI;
};

/**
 * Força uma atualização de layout após mudança de orientação
 */
export const forceLayoutUpdate = (): void => {
  if (typeof document === 'undefined') return;
  
  // Forçar recálculo de layout
  document.body.style.display = 'none';
  document.body.offsetHeight; // Forçar reflow
  document.body.style.display = '';
};