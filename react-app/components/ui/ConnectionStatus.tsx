import React from 'react';
import { useServiceWorker } from '../../hooks';

interface ConnectionStatusProps {
  className?: string;
  showOfflineOnly?: boolean;
}

/**
 * Componente para exibir o status da conexão
 */
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showOfflineOnly = false
}) => {
  const { isOnline, updateAvailable, applyUpdate } = useServiceWorker();
  
  // Se estiver online e showOfflineOnly for true, não exibir nada
  if (isOnline && showOfflineOnly) {
    return null;
  }
  
  return (
    <div className={`${className}`}>
      {!isOnline && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Você está offline. Algumas funcionalidades podem não estar disponíveis.</span>
          </div>
        </div>
      )}
      
      {isOnline && updateAvailable && (
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            <span>Nova versão disponível.</span>
          </div>
          <button
            onClick={applyUpdate}
            className="ml-4 px-3 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
          >
            Atualizar
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;