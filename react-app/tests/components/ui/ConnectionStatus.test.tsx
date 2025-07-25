import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectionStatus } from '../../../components/ui';
import { useServiceWorker } from '../../../hooks';

// Mock do hook useServiceWorker
jest.mock('../../../hooks', () => ({
  useServiceWorker: jest.fn()
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    // Configuração padrão do mock
    (useServiceWorker as jest.Mock).mockReturnValue({
      isOnline: true,
      updateAvailable: false,
      applyUpdate: jest.fn()
    });
  });
  
  it('should not render anything when online and showOfflineOnly is true', () => {
    const { container } = render(
      <ConnectionStatus showOfflineOnly={true} />
    );
    
    expect(container.firstChild).toBeNull();
  });
  
  it('should render offline message when offline', () => {
    (useServiceWorker as jest.Mock).mockReturnValue({
      isOnline: false,
      updateAvailable: false,
      applyUpdate: jest.fn()
    });
    
    render(<ConnectionStatus />);
    
    expect(screen.getByText(/Você está offline/i)).toBeInTheDocument();
  });
  
  it('should render update message when update is available', () => {
    (useServiceWorker as jest.Mock).mockReturnValue({
      isOnline: true,
      updateAvailable: true,
      applyUpdate: jest.fn()
    });
    
    render(<ConnectionStatus />);
    
    expect(screen.getByText(/Nova versão disponível/i)).toBeInTheDocument();
  });
  
  it('should call applyUpdate when update button is clicked', () => {
    const applyUpdateMock = jest.fn();
    
    (useServiceWorker as jest.Mock).mockReturnValue({
      isOnline: true,
      updateAvailable: true,
      applyUpdate: applyUpdateMock
    });
    
    render(<ConnectionStatus />);
    
    fireEvent.click(screen.getByText('Atualizar'));
    
    expect(applyUpdateMock).toHaveBeenCalledTimes(1);
  });
  
  it('should apply custom className', () => {
    (useServiceWorker as jest.Mock).mockReturnValue({
      isOnline: false,
      updateAvailable: false,
      applyUpdate: jest.fn()
    });
    
    render(<ConnectionStatus className="custom-class" />);
    
    expect(screen.getByText(/Você está offline/i).closest('div'))
      .toHaveClass('custom-class');
  });
  
  it('should render both offline and update messages when applicable', () => {
    (useServiceWorker as jest.Mock).mockReturnValue({
      isOnline: false,
      updateAvailable: true,
      applyUpdate: jest.fn()
    });
    
    render(<ConnectionStatus />);
    
    expect(screen.getByText(/Você está offline/i)).toBeInTheDocument();
    expect(screen.getByText(/Nova versão disponível/i)).toBeInTheDocument();
  });
});