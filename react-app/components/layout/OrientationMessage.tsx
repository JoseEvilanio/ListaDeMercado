import React from 'react';
import useOrientation from '../../hooks/useOrientation';
import useDevice from '../../hooks/useDevice';

interface OrientationMessageProps {
  preferredOrientation: 'portrait' | 'landscape';
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Componente que exibe uma mensagem quando o dispositivo está na orientação errada
 */
const OrientationMessage: React.FC<OrientationMessageProps> = ({
  preferredOrientation,
  message,
  icon,
  className = ''
}) => {
  const { orientation } = useOrientation();
  const { isMobile, isTablet } = useDevice();
  
  // Se não for um dispositivo móvel ou tablet, não exibir nada
  if (!isMobile && !isTablet) {
    return null;
  }
  
  // Se a orientação atual for a preferida, não exibir nada
  if (orientation === preferredOrientation) {
    return null;
  }
  
  // Mensagem padrão com base na orientação preferida
  const defaultMessage = preferredOrientation === 'portrait'
    ? 'Para uma melhor experiência, gire seu dispositivo para o modo retrato.'
    : 'Para uma melhor experiência, gire seu dispositivo para o modo paisagem.';
  
  // Ícone padrão com base na orientação preferida
  const defaultIcon = preferredOrientation === 'portrait' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-6m0 0V6m0 6h6m-6 0H6" />
      <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth={2} />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h6m-6 0H6m6 0v-6m0 6V6" />
      <rect x="4" y="6" width="16" height="12" rx="2" strokeWidth={2} />
    </svg>
  );
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-neutral-900 ${className}`}>
      <div className="text-center p-6">
        {icon || defaultIcon}
        <p className="text-lg font-medium">{message || defaultMessage}</p>
      </div>
    </div>
  );
};

export default OrientationMessage;