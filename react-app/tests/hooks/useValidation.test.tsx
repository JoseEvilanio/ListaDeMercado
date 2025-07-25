import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useValidation } from '../../hooks';
import { ValidationService } from '../../services/validation.service';

// Componente de teste para o hook
const TestComponent = () => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    setTouched
  } = useValidation(
    {
      name: '',
      email: ''
    },
    [
      {
        name: 'name',
        rules: [ValidationService.required('Nome é obrigatório')]
      },
      {
        name: 'email',
        rules: [
          ValidationService.required('Email é obrigatório'),
          ValidationService.email('Email inválido')
        ]
      }
    ]
  );
  
  const onSubmit = jest.fn();
  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
        <div>
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            data-testid="name-input"
          />
          {touched.name && errors.name && (
            <div data-testid="name-error">{errors.name[0]}</div>
          )}
        </div>
        
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            data-testid="email-input"
          />
          {touched.email && errors.email && (
            <div data-testid="email-error">{errors.email[0]}</div>
          )}
        </div>
        
        <button type="submit" data-testid="submit-button">Enviar</button>
        <button
          type="button"
          onClick={() => {
            validateForm();
            setTouched('name', true);
            setTouched('email', true);
          }}
          data-testid="validate-button"
        >
          Validar
        </button>
      </form>
    </div>
  );
};

describe('useValidation', () => {
  it('should initialize with default values', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('name-input')).toHaveValue('');
    expect(screen.getByTestId('email-input')).toHaveValue('');
    expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
  });
  
  it('should update values on change', () => {
    render(<TestComponent />);
    
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John Doe' }
    });
    
    expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
  });
  
  it('should validate on blur', async () => {
    render(<TestComponent />);
    
    // Focar e desfocar o campo sem preencher
    fireEvent.focus(screen.getByTestId('name-input'));
    fireEvent.blur(screen.getByTestId('name-input'));
    
    // Aguardar validação assíncrona
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('name-error')).toHaveTextContent('Nome é obrigatório');
    });
  });
  
  it('should validate email format', async () => {
    render(<TestComponent />);
    
    // Preencher email com formato inválido
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'invalid-email' }
    });
    
    fireEvent.blur(screen.getByTestId('email-input'));
    
    // Aguardar validação assíncrona
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email inválido');
    });
    
    // Corrigir o email
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'valid@example.com' }
    });
    
    fireEvent.blur(screen.getByTestId('email-input'));
    
    // Aguardar validação assíncrona
    await waitFor(() => {
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });
  
  it('should validate all fields on form submission', async () => {
    render(<TestComponent />);
    
    // Tentar enviar formulário vazio
    fireEvent.submit(screen.getByTestId('form'));
    
    // Aguardar validação assíncrona
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
    
    // Preencher campos
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john@example.com' }
    });
    
    // Enviar formulário novamente
    fireEvent.submit(screen.getByTestId('form'));
    
    // Aguardar validação assíncrona
    await waitFor(() => {
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });
  
  it('should validate all fields on demand', async () => {
    render(<TestComponent />);
    
    // Clicar no botão de validação sem preencher os campos
    fireEvent.click(screen.getByTestId('validate-button'));
    
    // Aguardar validação assíncrona
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
    });
  });
});