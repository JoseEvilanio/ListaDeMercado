import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useDevice, useOrientation } from '../../hooks';
import { ResponsiveLayout } from '../../components/layout';

// Mock dos hooks
jest.mock('../../hooks', () => ({
  useDevice: jest.fn(),
  useOrientation: jest.fn()
}));

// Componente de teste para responsividade
const ResponsiveComponent = () => {
  const { isMobile, isTablet, isDesktop } = useDevice();
  const { orientation, isPortrait, isLandscape } = useOrientation();
  
  return (
    <div>
      <div data-testid="device-info">
        {isMobile && <span data-testid="mobile">Mobile</span>}
        {isTablet && <span data-testid="tablet">Tablet</span>}
        {isDesktop && <span data-testid="desktop">Desktop</span>}
      </div>
      
      <div data-testid="orientation-info">
        <span data-testid="orientation">{orientation}</span>
        {isPortrait && <span data-testid="portrait">Portrait</span>}
        {isLandscape && <span data-testid="landscape">Landscape</span>}
      </div>
      
      <div className="hidden sm:block" data-testid="sm-only">
        Visível em SM e acima
      </div>
      
      <div className="hidden md:block" data-testid="md-only">
        Visível em MD e acima
      </div>
      
      <div className="hidden lg:block" data-testid="lg-only">
        Visível em LG e acima
      </div>
      
      <div className="block sm:hidden" data-testid="xs-only">
        Visível apenas em XS
      </div>
    </div>
  );
};

describe('Responsividade (Integração)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Detecção de Dispositivo', () => {
    it('should render mobile view', () => {
      // Configurar mock para useDevice
      (useDevice as jest.Mock).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        width: 375,
        height: 667
      });
      
      // Configurar mock para useOrientation
      (useOrientation as jest.Mock).mockReturnValue({
        orientation: 'portrait',
        isPortrait: true,
        isLandscape: false
      });
      
      render(<ResponsiveComponent />);
      
      // Verificar detecção de dispositivo
      expect(screen.getByTestId('mobile')).toBeInTheDocument();
      expect(screen.queryByTestId('tablet')).not.toBeInTheDocument();
      expect(screen.queryByTestId('desktop')).not.toBeInTheDocument();
      
      // Verificar orientação
      expect(screen.getByTestId('orientation')).toHaveTextContent('portrait');
      expect(screen.getByTestId('portrait')).toBeInTheDocument();
      expect(screen.queryByTestId('landscape')).not.toBeInTheDocument();
    });
    
    it('should render tablet view', () => {
      // Configurar mock para useDevice
      (useDevice as jest.Mock).mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        width: 768,
        height: 1024
      });
      
      // Configurar mock para useOrientation
      (useOrientation as jest.Mock).mockReturnValue({
        orientation: 'portrait',
        isPortrait: true,
        isLandscape: false
      });
      
      render(<ResponsiveComponent />);
      
      // Verificar detecção de dispositivo
      expect(screen.queryByTestId('mobile')).not.toBeInTheDocument();
      expect(screen.getByTestId('tablet')).toBeInTheDocument();
      expect(screen.queryByTestId('desktop')).not.toBeInTheDocument();
    });
    
    it('should render desktop view', () => {
      // Configurar mock para useDevice
      (useDevice as jest.Mock).mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080
      });
      
      // Configurar mock para useOrientation
      (useOrientation as jest.Mock).mockReturnValue({
        orientation: 'landscape',
        isPortrait: false,
        isLandscape: true
      });
      
      render(<ResponsiveComponent />);
      
      // Verificar detecção de dispositivo
      expect(screen.queryByTestId('mobile')).not.toBeInTheDocument();
      expect(screen.queryByTestId('tablet')).not.toBeInTheDocument();
      expect(screen.getByTestId('desktop')).toBeInTheDocument();
      
      // Verificar orientação
      expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');
      expect(screen.queryByTestId('portrait')).not.toBeInTheDocument();
      expect(screen.getByTestId('landscape')).toBeInTheDocument();
    });
  });
  
  describe('Layout Responsivo', () => {
    it('should adapt layout for mobile', () => {
      // Configurar mock para useDevice
      (useDevice as jest.Mock).mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        width: 375,
        height: 667
      });
      
      render(
        <ResponsiveLayout
          header={<div data-testid="header">Header</div>}
          sidebar={<div data-testid="sidebar">Sidebar</div>}
        >
          <div data-testid="content">Content</div>
        </ResponsiveLayout>
      );
      
      // Verificar se o header está presente
      expect(screen.getByTestId('header')).toBeInTheDocument();
      
      // Verificar se o conteúdo está presente
      expect(screen.getByTestId('content')).toBeInTheDocument();
      
      // Verificar se a sidebar está oculta ou em um menu hambúrguer
      // Nota: A implementação exata depende do componente ResponsiveLayout
      // Este teste assume que a sidebar não está diretamente visível em dispositivos móveis
      const sidebar = screen.queryByTestId('sidebar');
      if (sidebar) {
        // Se a sidebar estiver presente, deve estar oculta ou em um menu
        expect(sidebar).not.toBeVisible();
      }
    });
    
    it('should show sidebar for desktop', () => {
      // Configurar mock para useDevice
      (useDevice as jest.Mock).mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080
      });
      
      render(
        <ResponsiveLayout
          header={<div data-testid="header">Header</div>}
          sidebar={<div data-testid="sidebar">Sidebar</div>}
        >
          <div data-testid="content">Content</div>
        </ResponsiveLayout>
      );
      
      // Verificar se o header está presente
      expect(screen.getByTestId('header')).toBeInTheDocument();
      
      // Verificar se o conteúdo está presente
      expect(screen.getByTestId('content')).toBeInTheDocument();
      
      // Verificar se a sidebar está visível
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });
});