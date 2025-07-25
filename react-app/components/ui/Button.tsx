import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  icon,
  iconPosition = 'left',
  rounded = false
}) => {
  // Mapear variantes para classes Tailwind
  const variantClasses: Record<string, string> = {
    'primary': 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    'secondary': 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500',
    'outline': 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:ring-primary-500',
    'ghost': 'text-neutral-700 dark:text-neutral-300 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-primary-500',
    'danger': 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  // Mapear tamanhos para classes Tailwind
  const sizeClasses: Record<string, string> = {
    'xs': 'px-2 py-1 text-xs',
    'sm': 'px-3 py-1.5 text-sm',
    'md': 'px-4 py-2 text-sm',
    'lg': 'px-5 py-2.5 text-base',
    'xl': 'px-6 py-3 text-lg'
  };
  
  const buttonClasses = [
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    rounded ? 'rounded-full' : 'rounded-md',
    disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;