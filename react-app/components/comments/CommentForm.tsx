import React, { useState } from 'react';
import { Button } from '../ui';
import { DatabaseService } from '../../services';

interface CommentFormProps {
  contentId: string;
  parentId?: string;
  onCommentAdded?: () => void;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  contentId,
  parentId,
  onCommentAdded,
  placeholder = 'Escreva um comentário...'
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enviar comentário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('O comentário não pode estar vazio');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulação de envio de comentário
      // Na implementação real, usar DatabaseService.comments.create
      setTimeout(() => {
        console.log('Comentário enviado:', {
          content_id: contentId,
          parent_id: parentId || null,
          body: comment
        });
        
        setComment('');
        setLoading(false);
        
        if (onCommentAdded) {
          onCommentAdded();
        }
      }, 1000);
    } catch (err) {
      setError('Erro ao enviar comentário');
      setLoading(false);
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-3">
        <div className="relative">
          <textarea
            className={`w-full px-4 py-2 border ${
              error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800 dark:text-neutral-200`}
            rows={parentId ? 2 : 3}
            placeholder={placeholder}
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
          ></textarea>
          
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size={parentId ? 'sm' : 'md'}
            loading={loading}
            disabled={loading || !comment.trim()}
          >
            {parentId ? 'Responder' : 'Comentar'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;