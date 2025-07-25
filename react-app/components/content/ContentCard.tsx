import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui';
import { Content, User } from '../../supabase';

interface ContentCardProps {
  content: Content & { users?: Pick<User, 'name' | 'email'> };
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  compact = false,
  className = '',
  onClick
}) => {
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Classes específicas para dispositivos
  const mobileClasses = 'p-3';
  const desktopClasses = 'p-5';
  
  // Renderização compacta (para dispositivos móveis)
  if (compact) {
    return (
      <Card
        className={`${mobileClasses} ${className}`}
        hoverable
        onClick={onClick}
      >
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{content.title}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
            {truncateText(content.body, 100)}
          </p>
          <div className="flex justify-between items-center mt-auto text-xs text-neutral-500 dark:text-neutral-500">
            <span>{content.users?.name || 'Usuário'}</span>
            <span>{formatDate(content.created_at)}</span>
          </div>
        </div>
      </Card>
    );
  }
  
  // Renderização completa (para desktop)
  return (
    <Card
      className={`${desktopClasses} ${className}`}
      hoverable
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-semibold mb-3">{content.title}</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4 flex-grow">
          {truncateText(content.body, 200)}
        </p>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-2">
              {content.users?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium">{content.users?.name || 'Usuário'}</span>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-500">
            {formatDate(content.created_at)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ContentCard;