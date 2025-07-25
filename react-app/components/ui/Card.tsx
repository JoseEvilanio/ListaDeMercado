import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false
}) => {
  const cardClasses = [
    'bg-white dark:bg-neutral-800',
    'rounded-lg',
    'shadow-md',
    'overflow-hidden',
    'border border-neutral-200 dark:border-neutral-700',
    hoverable ? 'transition-shadow hover:shadow-lg' : '',
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = ''
}) => {
  const headerClasses = [
    'px-6 py-4',
    'border-b border-neutral-200 dark:border-neutral-700',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={headerClasses}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = ''
}) => {
  const bodyClasses = [
    'px-6 py-4',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={bodyClasses}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = ''
}) => {
  const footerClasses = [
    'px-6 py-4',
    'border-t border-neutral-200 dark:border-neutral-700',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={footerClasses}>
      {children}
    </div>
  );
};

// Exportar componentes compostos
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;