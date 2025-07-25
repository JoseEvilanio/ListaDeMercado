import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { DatabaseService } from '../../services';

interface Comment {
  id: string;
  content_id: string;
  user_id: string;
  body: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
  };
}

interface CommentListProps {
  contentId: string;
}

const CommentList: React.FC<CommentListProps> = ({ contentId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleReplies, setVisibleReplies] = useState<Record<string, boolean>>({});
  
  // Carregar comentários
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      
      try {
        // Simulação de chamada à API
        // Na implementação real, usar DatabaseService.comments.getByContent(contentId)
        setTimeout(() => {
          const mockComments: Comment[] = [
            {
              id: '1',
              content_id: contentId,
              user_id: 'user1',
              body: 'Este é um comentário de exemplo. Muito interessante o conteúdo!',
              parent_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              users: {
                name: 'João Silva',
                email: 'joao@exemplo.com'
              }
            },
            {
              id: '2',
              content_id: contentId,
              user_id: 'user2',
              body: 'Concordo com o autor. Excelente artigo!',
              parent_id: null,
              created_at: new Date(Date.now() - 3600000).toISOString(),
              updated_at: new Date(Date.now() - 3600000).toISOString(),
              users: {
                name: 'Maria Souza',
                email: 'maria@exemplo.com'
              }
            },
            {
              id: '3',
              content_id: contentId,
              user_id: 'user3',
              body: 'Obrigado pelo comentário!',
              parent_id: '1',
              created_at: new Date(Date.now() - 1800000).toISOString(),
              updated_at: new Date(Date.now() - 1800000).toISOString(),
              users: {
                name: 'Autor',
                email: 'autor@exemplo.com'
              }
            }
          ];
          
          setComments(mockComments);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Erro ao carregar comentários');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchComments();
  }, [contentId]);
  
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
  
  // Alternar visibilidade das respostas
  const toggleReplies = (commentId: string) => {
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };
  
  // Filtrar comentários principais (sem parent_id)
  const mainComments = comments.filter(comment => !comment.parent_id);
  
  // Obter respostas para um comentário
  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parent_id === commentId);
  };
  
  // Renderizar esqueleto de carregamento
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(index => (
        <div key={index} className="animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded mb-1"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  // Renderizar comentário
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${
        isReply ? 'ml-8 mt-3 border-l-2 border-neutral-200 dark:border-neutral-700 pl-3' : 'mb-4'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
          {comment.users?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center mb-1">
            <span className="font-medium">{comment.users?.name || 'Usuário'}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 sm:ml-2">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{comment.body}</p>
          
          <div className="mt-2 flex space-x-4">
            <button
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              onClick={() => {}}
            >
              Responder
            </button>
            
            {!isReply && getReplies(comment.id).length > 0 && (
              <button
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center"
                onClick={() => toggleReplies(comment.id)}
              >
                {visibleReplies[comment.id] ? 'Ocultar' : 'Mostrar'} respostas
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 ml-1 transform ${visibleReplies[comment.id] ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Respostas */}
      {!isReply && visibleReplies[comment.id] && (
        <div className="mt-3">
          {getReplies(comment.id).map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );
  
  if (loading) {
    return renderSkeleton();
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
        {error}
      </div>
    );
  }
  
  if (mainComments.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
        Nenhum comentário ainda. Seja o primeiro a comentar!
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {mainComments.map(comment => renderComment(comment))}
    </div>
  );
};

export default CommentList;