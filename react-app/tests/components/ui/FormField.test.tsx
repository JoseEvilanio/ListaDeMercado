import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../../../components/ui';

describe('FormField', () => {
  it('should render input field with label', () => {
    render(
      <FormField
        name="test"
        label="Campo de teste"
        value=""
        onChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText('Campo de teste')).toBeInTheDocument();
    expect(screen.getByLabelText('Campo de teste')).toHaveAttribute('name', 'test');
  });
  
  it('should render required indicator when required is true', () => {
    render(
      <FormField
        name="test"
        label="Campo obrigatório"
        value=""
        onChange={() => {}}
        required
      />
    );
    
    // Verificar se o asterisco está presente
    const label = screen.getByText('Campo obrigatório');
    expect(label.nextSibling).toHaveTextContent('*');
    expect(label.nextSibling).toHaveClass('text-red-500');
  });
  
  it('should render error message when field has error and is touched', () => {
    render(
      <FormField
        name="test"
        label="Campo com erro"
        value=""
        onChange={() => {}}
        errors={['Este campo é obrigatório']}
        touched={true}
      />
    );
    
    expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
  });
  
  it('should not render error message when field is not touched', () => {
    render(
      <FormField
        name="test"
        label="Campo com erro"
        value=""
        onChange={() => {}}
        errors={['Este campo é obrigatório']}
        touched={false}
      />
    );
    
    expect(screen.queryByText('Este campo é obrigatório')).not.toBeInTheDocument();
  });
  
  it('should render help text when provided and no error', () => {
    render(
      <FormField
        name="test"
        label="Campo com ajuda"
        value=""
        onChange={() => {}}
        helpText="Texto de ajuda para o campo"
      />
    );
    
    expect(screen.getByText('Texto de ajuda para o campo')).toBeInTheDocument();
  });
  
  it('should not render help text when field has error', () => {
    render(
      <FormField
        name="test"
        label="Campo com erro e ajuda"
        value=""
        onChange={() => {}}
        errors={['Este campo é obrigatório']}
        touched={true}
        helpText="Texto de ajuda para o campo"
      />
    );
    
    expect(screen.queryByText('Texto de ajuda para o campo')).not.toBeInTheDocument();
    expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
  });
  
  it('should render textarea when type is textarea', () => {
    render(
      <FormField
        name="test"
        label="Campo textarea"
        type="textarea"
        value=""
        onChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText('Campo textarea').tagName).toBe('TEXTAREA');
  });
  
  it('should render select when type is select', () => {
    render(
      <FormField
        name="test"
        label="Campo select"
        type="select"
        value=""
        onChange={() => {}}
      >
        <option value="1">Opção 1</option>
        <option value="2">Opção 2</option>
      </FormField>
    );
    
    expect(screen.getByLabelText('Campo select').tagName).toBe('SELECT');
    expect(screen.getByText('Opção 1')).toBeInTheDocument();
    expect(screen.getByText('Opção 2')).toBeInTheDocument();
  });
  
  it('should render checkbox with label after input', () => {
    render(
      <FormField
        name="test"
        label="Aceito os termos"
        type="checkbox"
        value={false}
        onChange={() => {}}
      />
    );
    
    const checkbox = screen.getByLabelText('Aceito os termos');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    
    // Verificar se o label está após o input
    const label = screen.getByText('Aceito os termos');
    expect(checkbox.nextSibling).toBe(label);
  });
  
  it('should call onChange when input value changes', () => {
    const handleChange = jest.fn();
    
    render(
      <FormField
        name="test"
        label="Campo de teste"
        value=""
        onChange={handleChange}
      />
    );
    
    fireEvent.change(screen.getByLabelText('Campo de teste'), {
      target: { value: 'novo valor' }
    });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
  
  it('should call onBlur when input loses focus', () => {
    const handleBlur = jest.fn();
    
    render(
      <FormField
        name="test"
        label="Campo de teste"
        value=""
        onChange={() => {}}
        onBlur={handleBlur}
      />
    );
    
    fireEvent.blur(screen.getByLabelText('Campo de teste'));
    
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(
      <FormField
        name="test"
        label="Campo desabilitado"
        value=""
        onChange={() => {}}
        disabled
      />
    );
    
    expect(screen.getByLabelText('Campo desabilitado')).toBeDisabled();
  });
});