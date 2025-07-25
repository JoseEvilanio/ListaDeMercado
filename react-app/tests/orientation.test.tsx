import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrientationProvider } from '../contexts/OrientationContext';
import { OrientationDetector } from '../components/layout';
import { OrientationDemo } from '../components/examples';
import * as orientationUtils from '../utils/orientationUtils';

// Mock para as funções de utilidade de orientação
jest.mock('../utils/orientationUtils', () => ({
  isPortrait: jest.fn().mockReturnValue(true),
  isLandscape: jest.fn().mockReturnValue(false),
  getOrientation: jest.fn().mockReturnValue('portrait'),
  getOrientationAngle: jest.fn().mockReturnValue(0),
  getAspectRatio: jest.fn().mockReturnValue(0.5625),
  addOrientationChangeListener: jest.fn().mockReturnValue(() => {}),
  supportsOrientationChange: jest.fn().mockReturnValue(true),
  forceLayoutUpdate: jest.fn(),
  applyOrientationClasses: jest.fn()
}));

// Mock para o hook useOrientation
jest.mock('../hooks/useOrientation', () => ({
  __esModule: true,
  default: () => ({
    orientation: 'portrait',
    isPortrait: true,
    isLandscape: false,
    angle: 0,
    aspectRatio: 0.5625,
    orientationChangeCount: 0,
    lastChangeTime: null,
    isTransitioning: false,
    orientationType: 'device'
  })
}));

// Mock para o hook useDevice
jest.mock('../hooks/useDevice', () => ({
  __esModule: true,
  default: () => ({
    type: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 375,
    height: 667,
    isTouchDevice: true
  })
}));

describe('Orientation Detection', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('OrientationDetector renderiza corretamente', () => {
    render(
      <OrientationProvider>
        <OrientationDetector>
          <div data-testid="test-content">Conteúdo de teste</div>
        </OrientationDetector>
      </OrientationProvider>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('OrientationDetector chama callback quando a orientação muda', () => {
    const mockCallback = jest.fn();
    
    render(
      <OrientationProvider>
        <OrientationDetector onOrientationChange={mockCallback}>
          <div>Conteúdo de teste</div>
        </OrientationDetector>
      </OrientationProvider>
    );
    
    // O callback deve ser chamado uma vez durante a montagem
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('portrait', true);
  });

  test('OrientationDemo renderiza conteúdo específico para orientação retrato', () => {
    render(
      <OrientationProvider>
        <OrientationDemo />
      </OrientationProvider>
    );
    
    // Deve mostrar o conteúdo para orientação retrato
    expect(screen.getByText('Modo Retrato')).toBeInTheDocument();
    
    // Não deve mostrar o conteúdo para orientação paisagem
    expect(screen.queryByText('Modo Paisagem')).not.toBeInTheDocument();
  });

  test('OrientationDemo renderiza conteúdo específico para orientação paisagem', () => {
    // Alterar o mock para simular orientação paisagem
    (orientationUtils.isPortrait as jest.Mock).mockReturnValue(false);
    (orientationUtils.isLandscape as jest.Mock).mockReturnValue(true);
    (orientationUtils.getOrientation as jest.Mock).mockReturnValue('landscape');
    (orientationUtils.getOrientationAngle as jest.Mock).mockReturnValue(90);
    
    // Alterar o mock do hook useOrientation
    jest.requireMock('../hooks/useOrientation').default = () => ({
      orientation: 'landscape',
      isPortrait: false,
      isLandscape: true,
      angle: 90,
      aspectRatio: 1.7778,
      orientationChangeCount: 0,
      lastChangeTime: null,
      isTransitioning: false,
      orientationType: 'device'
    });
    
    render(
      <OrientationProvider>
        <OrientationDemo />
      </OrientationProvider>
    );
    
    // Deve mostrar o conteúdo para orientação paisagem
    expect(screen.getByText('Modo Paisagem')).toBeInTheDocument();
    
    // Não deve mostrar o conteúdo para orientação retrato
    expect(screen.queryByText('Modo Retrato')).not.toBeInTheDocument();
  });

  test('OrientationDemo exibe informações de debug quando solicitado', () => {
    render(
      <OrientationProvider>
        <OrientationDemo showDebugInfo={true} />
      </OrientationProvider>
    );
    
    // Deve mostrar as informações de debug
    expect(screen.getByText('Informações de Debug')).toBeInTheDocument();
    expect(screen.getByText(/Orientação:/)).toBeInTheDocument();
    expect(screen.getByText(/Dispositivo:/)).toBeInTheDocument();
  });

  test('OrientationDemo não exibe informações de debug por padrão', () => {
    render(
      <OrientationProvider>
        <OrientationDemo />
      </OrientationProvider>
    );
    
    // Não deve mostrar as informações de debug
    expect(screen.queryByText('Informações de Debug')).not.toBeInTheDocument();
  });
});