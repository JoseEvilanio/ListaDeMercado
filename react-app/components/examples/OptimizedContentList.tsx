import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { useOptimizedPaginatedQuery } from '../../hooks';
import { OptimizedDatabaseService } from '../../services';
import { Content, User } from '../../supabase';

interface OptimizedContentListProps {
  userId?: string;
  categoryId?: string;
  title?: string;
  className?: string;
}

/**
 * Componente de exemplo que usa consultas otimizadas para listar conteúdos
 */
const OptimizedContentList: React.FC<OptimizedContentListProps> = ({
  userId,
  categoryId,
  title = 'Conteúdos',
  className = ''
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Usar hook de consulta paginada otimizada
  const {
    data: contents,
    totalCount,
    totalPages,
    loading,
    error,
    refetch,
    invalidateCache
  } = useOptimizedPaginatedQuery<Content & { users: Pick<User, 'name' | 'email'> }>(
    async (page, pageSize) => {
      const result = await OptimizedDatabaseService.content.getAll({
        page,
        pageSize,
        userId,
        categoryId,
        includeUser: true
      });
      
      return {
        data: result.contents,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / pageSize)
      };
    },
    `content:list:${userId || ''}:${categoryId || ''}`,
    page,
    pageSize,
    [userId, categoryId],
    {
      enableCache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutos
      onError: (err) => console.error('Erro ao carregar conteúdos:', err)
    }
  );
  
  // Renderizar esqueleto de carregamento
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
  
  return (
    <Card className={className}>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => invalidateCache()}
            disabled={loading}
          >
            Limpar Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            Atualizar
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
            Erro ao carregar conteúdos. Tente novamente.
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
            Nenhum conteúdo encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {contents.map(content => (
              <div key={content.id} className="border-b border-neutral-200 dark:border-neutral-700 pb-4 last:border-0 last:pb-0">
                <h3 className="font-medium">{content.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {content.description || 'Sem descrição'}
                </p>
                <div className="flex justify-between items-center mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Por {content.users?.name || 'Usuário'}</span>
                  <span>{new Date(content.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
      
      {totalPages > 1 && (
        <Card.Footer className="flex justify-between items-center">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Mostrando {contents.length} de {totalCount} itens
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <span className="px-2 py-1 text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Próxima
            </Button>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default OptimizedContentList;