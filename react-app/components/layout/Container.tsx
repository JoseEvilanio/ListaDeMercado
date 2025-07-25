import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  padding = true,
  className = ''
}) => {
  // Mapear maxWidth para classes Tailwind
  const maxWidthClasses: Record<string, string> = {
    'xs': 'max-w-xs',
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full',
    'none': ''
  };
  
  const containerClasses = [
    'w-full',
    'mx-auto',
    maxWidthClasses[maxWidth],
    padding ? 'px-4 sm:px-6 md:px-8' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default Container;