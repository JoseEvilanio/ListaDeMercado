import React from 'react';
import { Input } from './index';

interface FormFieldProps {
  /** Nome do campo */
  name: string;
  /** Tipo do campo */
  type?: string;
  /** Label do campo */
  label?: string;
  /** Placeholder do campo */
  placeholder?: string;
  /** Valor do campo */
  value: any;
  /** Função chamada quando o valor muda */
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  /** Função chamada quando o campo perde o foco */
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  /** Erros de validação */
  errors?: string[];
  /** Indica se o campo foi tocado */
  touched?: boolean;
  /** Indica se o campo é obrigatório */
  required?: boolean;
  /** Indica se o campo está desabilitado */
  disabled?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Classe CSS para o container */
  containerClassName?: string;
  /** Classe CSS para o label */
  labelClassName?: string;
  /** Classe CSS para o campo */
  inputClassName?: string;
  /** Classe CSS para a mensagem de erro */
  errorClassName?: string;
  /** Texto de ajuda */
  helpText?: string;
  /** Filhos (para select) */
  children?: React.ReactNode;
}

/**
 * Componente de campo de formulário com validação
 */
const FormField: React.FC<FormFieldProps> = ({
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  errors = [],
  touched = false,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helpText,
  children
}) => {
  // Verificar se há erros e se o campo foi tocado
  const hasError = touched && errors.length > 0;
  
  // Classes base
  const baseContainerClass = 'mb-4';
  const baseLabelClass = 'block text-sm font-medium mb-1';
  const baseInputClass = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2';
  const baseErrorClass = 'mt-1 text-sm text-red-600 dark:text-red-400';
  const baseHelpTextClass = 'mt-1 text-sm text-neutral-500 dark:text-neutral-400';
  
  // Classes condicionais
  const labelClass = `${baseLabelClass} ${
    hasError ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-neutral-200'
  } ${labelClassName}`;
  
  const inputClass = `${baseInputClass} ${
    hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-neutral-300 dark:border-neutral-700 focus:border-primary-500 focus:ring-primary-500/20'
  } ${inputClassName}`;
  
  // Renderizar campo com base no tipo
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputClass} min-h-[100px]`}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        );
        
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={inputClass}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          >
            {children}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={!!value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-600 focus:ring-primary-500"
              aria-invalid={hasError}
              aria-describedby={hasError ? `${name}-error` : undefined}
            />
            {label && (
              <label htmlFor={name} className="ml-2 block text-sm text-neutral-700 dark:text-neutral-200">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        );
        
      case 'radio':
        return (
          <div className="space-y-2">
            {React.Children.map(children, child => {
              if (!React.isValidElement(child)) return null;
              
              return React.cloneElement(child, {
                name,
                onChange,
                onBlur,
                checked: value === child.props.value,
                disabled
              });
            })}
          </div>
        );
        
      default:
        return (
          <Input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClass}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${name}-error` : undefined}
          />
        );
    }
  };
  
  return (
    <div className={`${baseContainerClass} ${containerClassName} ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={name} className={labelClass}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderField()}
      
      {hasError && (
        <div id={`${name}-error`} className={`${baseErrorClass} ${errorClassName}`}>
          {errors[0]}
        </div>
      )}
      
      {helpText && !hasError && (
        <div className={baseHelpTextClass}>
          {helpText}
        </div>
      )}
    </div>
  );
};

export default FormField;