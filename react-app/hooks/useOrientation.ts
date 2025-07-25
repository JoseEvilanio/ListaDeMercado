import { useState, useEffect, useCallback } from 'react';

type Orientation = 'portrait' | 'landscape';

interface OrientationState {
  orientation: Orientation;
  angle: number;
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
  orientationChangeCount: number;
  lastChangeTime: number | null;
  isTransitioning: boolean;
  orientationType: 'device' | 'window';
}

/**
 * Hook aprimorado para detectar a orientação do dispositivo
 * @returns Objeto com informações detalhadas sobre a orientação atual
 */
const useOrientation = (): OrientationState => {
  // Função para obter a orientação atual
  const getOrientation = useCallback((): OrientationState => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      return {
        orientation: 'portrait',
        angle: 0,
        isPortrait: true,
        isLandscape: false,
        aspectRatio: 0.5625, // 9:16 aspect ratio
        orientationChangeCount: 0,
        lastChangeTime: null,
        isTransitioning: false,
        orientationType: 'window'
      };
    }
    
    let angle = 0;
    let orientationType: 'device' | 'window' = 'window';
    
    // Obter o ângulo de orientação
    if (window.screen && window.screen.orientation) {
      // API moderna de orientação
      angle = window.screen.orientation.angle;
      orientationType = 'device';
    } else if ('orientation' in window) {
      // API legada de orientação
      angle = window.orientation as number;
      orientationType = 'device';
    } else {
      // Fallback para dimensões da janela
      angle = window.innerHeight > window.innerWidth ? 0 : 90;
      orientationType = 'window';
    }
    
    // Calcular aspect ratio
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    // Determinar a orientação com base no ângulo
    const orientation: Orientation = (angle === 0 || angle === 180) ? 'portrait' : 'landscape';
    
    return {
      orientation,
      angle,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      aspectRatio,
      orientationChangeCount: 0, // Será incrementado no estado
      lastChangeTime: null, // Será atualizado no estado
      isTransitioning: false,
      orientationType
    };
  }, []);
  
  // Estado inicial
  const [orientationState, setOrientationState] = useState<OrientationState>(getOrientation());
  
  useEffect(() => {
    // Função para atualizar o estado quando a orientação mudar
    const updateOrientation = () => {
      const newOrientation = getOrientation();
      
      setOrientationState(prevState => {
        // Verificar se a orientação realmente mudou
        if (prevState.orientation !== newOrientation.orientation) {
          return {
            ...newOrientation,
            orientationChangeCount: prevState.orientationChangeCount + 1,
            lastChangeTime: Date.now(),
            isTransitioning: true
          };
        }
        
        // Se estiver em transição, verificar se já passou o tempo de transição
        if (prevState.isTransitioning) {
          const transitionTime = Date.now() - (prevState.lastChangeTime || 0);
          if (transitionTime > 300) { // 300ms é um tempo razoável para a transição
            return {
              ...prevState,
              isTransitioning: false
            };
          }
        }
        
        return {
          ...newOrientation,
          orientationChangeCount: prevState.orientationChangeCount,
          lastChangeTime: prevState.lastChangeTime,
          isTransitioning: prevState.isTransitioning
        };
      });
    };
    
    // Adicionar listeners para mudanças de orientação
    if (window.screen && window.screen.orientation) {
      // API moderna de orientação
      window.screen.orientation.addEventListener('change', updateOrientation);
    } else {
      // Fallback para evento de redimensionamento
      window.addEventListener('resize', updateOrientation);
      // API legada de orientação
      window.addEventListener('orientationchange', updateOrientation);
    }
    
    // Atualizar quando a transição terminar
    const transitionTimer = setInterval(() => {
      setOrientationState(prevState => {
        if (prevState.isTransitioning) {
          const transitionTime = Date.now() - (prevState.lastChangeTime || 0);
          if (transitionTime > 300) { // 300ms para a transição
            return {
              ...prevState,
              isTransitioning: false
            };
          }
        }
        return prevState;
      });
    }, 100);
    
    // Limpar listeners
    return () => {
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation);
      } else {
        window.removeEventListener('resize', updateOrientation);
        window.removeEventListener('orientationchange', updateOrientation);
      }
      clearInterval(transitionTimer);
    };
  }, [getOrientation]);
  
  return orientationState;
};

export default useOrientation;