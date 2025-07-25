import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorFeedback } from '../../../components/ui';

describe('ErrorFeedback', () => {
  it('should render error message', () => {
    render(<ErrorFeedback message="Erro de teste" />);
    
    expect(screen.getByText('Erro de teste')).toBeInTheDocument();
  });
  
  it('should render multiple error messages', () => {
    render(
      <ErrorFeedback
        message={['Erro 1', 'Erro 2', 'Erro 3']}
        asList={true}
      />
    );
    
    expect(screen.getByText('Erro 1')).toBeInTheDocument();
    expect(screen.getByText('Erro 2')).toBeInTheDocument();
    expect(screen.getByText('Erro 3')).toBeInTheDocument();
  });
  
  it('should render with different types', () => {
    const { rerender } = render(
      <ErrorFeedback
        message="Mensagem de erro"
        type="error"
      />
    );
    
    // Verificar classe para tipo error
    expect(screen.getByText('Mensagem de erro').closest('div'))
      .toHaveClass('bg-red-50');
    
    // Rerender com tipo warning
    rerender(
      <ErrorFeedback
        message="Mensagem de aviso"
        type="warning"
      />
    );
    
    // Verificar classe para tipo warning
    expect(screen.getByText('Mensagem de aviso').closest('div'))
      .toHaveClass('bg-yellow-50');
    
    // Rerender com tipo info
    rerender(
      <ErrorFeedback
        message="Mensagem informativa"
        type="info"
      />
    );
    
    // Verificar classe para tipo info
    expect(screen.getByText('Mensagem informativa').closest('div'))
      .toHaveClass('bg-blue-50');
  });
  
  it('should not render when message is empty', () => {
    const { container } = render(<ErrorFeedback message="" />);
    expect(container.firstChild).toBeNull();
    
    const { container: container2 } = render(<ErrorFeedback message={[]} />);
    expect(container2.firstChild).toBeNull();
    
    const { container: container3 } = render(<ErrorFeedback message={null} />);
    expect(container3.firstChild).toBeNull();
    
    const { container: container4 } = render(<ErrorFeedback message={undefined} />);
    expect(container4.firstChild).toBeNull();
  });
  
  it('should render with icon by default', () => {
    render(<ErrorFeedback message="Erro com ícone" />);
    
    // Verificar se o SVG está presente
    expect(screen.getByText('Erro com ícone').previousSibling).toBeTruthy();
  });
  
  it('should render without icon when showIcon is false', () => {
    render(
      <ErrorFeedback
        message="Erro sem ícone"
        showIcon={false}
      />
    );
    
    // Verificar se o texto está diretamente no container
    const errorElement = screen.getByText('Erro sem ícone');
    expect(errorElement.parentElement.children.length).toBe(1);
    expect(errorElement.parentElement.children[0]).toBe(errorElement);
  });
  
  it('should apply custom className', () => {
    render(
      <ErrorFeedback
        message="Erro com classe personalizada"
        className="custom-class"
      />
    );
    
    expect(screen.getByText('Erro com classe personalizada').closest('div'))
      .toHaveClass('custom-class');
  });
});