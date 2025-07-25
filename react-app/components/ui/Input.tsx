import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  startAdornment,
  endAdornment,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperClassName = '',
  id,
  ...props
}, ref) => {
  // Gerar ID aleatório se não for fornecido
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  const containerClasses = [
    'flex flex-col',
    fullWidth ? 'w-full' : '',
    containerClassName
  ].filter(Boolean).join(' ');
  
  const labelClasses = [
    'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1',
    labelClassName
  ].filter(Boolean).join(' ');
  
  const inputContainerClasses = [
    'relative rounded-md shadow-sm',
    fullWidth ? 'w-full' : '',
    error ? 'ring-2 ring-red-500' : ''
  ].filter(Boolean).join(' ');
  
  const inputClasses = [
    'block w-full rounded-md',
    'border-neutral-300 dark:border-neutral-600',
    'bg-white dark:bg-neutral-800',
    'text-neutral-900 dark:text-neutral-100',
    'placeholder-neutral-400 dark:placeholder-neutral-500',
    'focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-600',
    error ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : '',
    startAdornment ? 'pl-10' : '',
    endAdornment ? 'pr-10' : '',
    inputClassName
  ].filter(Boolean).join(' ');
  
  const errorClasses = [
    'mt-1 text-sm text-red-600 dark:text-red-500',
    errorClassName
  ].filter(Boolean).join(' ');
  
  const helperClasses = [
    'mt-1 text-sm text-neutral-500 dark:text-neutral-400',
    helperClassName
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className={inputContainerClasses}>
        {startAdornment && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startAdornment}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endAdornment}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className={errorClasses}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className={helperClasses}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;