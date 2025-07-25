import React from 'react';

interface ErrorMessageProps {
  error?: string | string[] | null;
  className?: string;
}

/**
 * Componente para exibir mensagens de erro
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  className = ''
}) => {
  if (!error) {
    return null;
  }
  
  const errors = Array.isArray(error) ? error : [error];
  
  if (errors.length === 0) {
    return null;
  }
  
  return (
    <div className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}>
      {errors.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );
};

export default ErrorMessage;