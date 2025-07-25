import React from 'react';

interface ErrorFeedbackProps {
  /** Mensagem de erro */
  message?: string | string[];
  /** Tipo de erro */
  type?: 'error' | 'warning' | 'info';
  /** Classe CSS adicional */
  className?: string;
  /** Exibir ícone */
  showIcon?: boolean;
  /** Exibir como lista */
  asList?: boolean;
}

/**
 * Componente para exibir feedback de erro
 */
const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  message,
  type = 'error',
  className = '',
  showIcon = true,
  asList = false
}) => {
  // Se não houver mensagem, não renderizar nada
  if (!message || (Array.isArray(message) && message.length === 0)) {
    return null;
  }
  
  // Converter mensagem para array
  const messages = Array.isArray(message) ? message : [message];
  
  // Definir classes com base no tipo
  const baseClasses = 'text-sm rounded-md';
  
  let typeClasses = '';
  let iconComponent = null;
  
  switch (type) {
    case 'warning':
      typeClasses = 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      iconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
      break;
      
    case 'info':
      typeClasses = 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      iconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
      break;
      
    case 'error':
    default:
      typeClasses = 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      iconComponent = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
      break;
  }
  
  // Renderizar como lista ou texto simples
  if (asList && messages.length > 1) {
    return (
      <div className={`${baseClasses} ${typeClasses} p-3 ${className}`}>
        {showIcon && (
          <div className="flex items-center mb-2">
            {iconComponent}
            <span className="ml-2 font-medium">Atenção</span>
          </div>
        )}
        <ul className="list-disc pl-5 space-y-1">
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    );
  }
  
  return (
    <div className={`${baseClasses} ${typeClasses} p-3 ${className}`}>
      {showIcon && messages.length === 1 ? (
        <div className="flex items-center">
          {iconComponent}
          <span className="ml-2">{messages[0]}</span>
        </div>
      ) : (
        <>
          {showIcon && (
            <div className="flex items-center mb-2">
              {iconComponent}
              <span className="ml-2 font-medium">Atenção</span>
            </div>
          )}
          <div className="space-y-1">
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ErrorFeedback;