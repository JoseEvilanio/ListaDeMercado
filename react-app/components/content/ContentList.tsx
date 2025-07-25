import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from './ContentCard';
import { ResponsiveGrid } from '../layout';
import { Content, User } from '../../supabase';
import { DatabaseService } from '../../services';

interface ContentListProps {
  userId?: string;
  categoryId?: string;
  limit?: number;
  showPagination?: boolean;
}

const ContentList: React.FC<ContentListProps> = ({
  userId,
  categoryId,
  limit = 10,
  showPagination = true
}) => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Array<Content & { users: Pick<User, 'name' | 'email'> }>>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Carregar conteúdos
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      
      try {
        const options = {
          page,
          pageSize: limit,
          orderBy: 'created_at',
          orderDirection: 'desc' as 'asc' | 'desc'
        };
        
        let result;
        
        if (userId) {
          result = await DatabaseService.content.getAll({ ...options, userId });
        } else if (categoryId) {
          // Implementar lógica para filtrar por categoria
          result = await DatabaseService.content.getAll(options);
          // Filtrar por categoria (simulação)
          result.contents = result.contents.filter((_, index) => index % 2 === 0);
        } else {
          result = await DatabaseService.content.getAll(options);
        }
        
        setContents(result.contents);
        setTotalPages(Math.ceil(result.totalCount / limit));
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContents();
  }, [userId, categoryId, page, limit]);
  
  // Navegar para a página de detalhes do conteúdo
  const handleContentClick = (contentId: string) => {
    navigate(`/content/${contentId}`);
  };
  
  // Renderizar esqueleto de carregamento
  const renderSkeletons = () => {
    return Array.from({ length: limit }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="bg-neutral-200 dark:bg-neutral-700 h-40 rounded-lg mb-3"></div>
        <div className="bg-neutral-200 dark:bg-neutral-700 h-4 rounded mb-2 w-3/4"></div>
        <div className="bg-neutral-200 dark:bg-neutral-700 h-3 rounded mb-2"></div>
        <div className="bg-neutral-200 dark:bg-neutral-700 h-3 rounded mb-2 w-5/6"></div>
        <div className="flex justify-between mt-4">
          <div className="bg-neutral-200 dark:bg-neutral-700 h-3 rounded w-1/4"></div>
          <div className="bg-neutral-200 dark:bg-neutral-700 h-3 rounded w-1/4"></div>
        </div>
      </div>
    ));
  };
  
  // Renderizar paginação
  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-8">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 disabled:opacity-50"
          >
            Anterior
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
            // Lógica para mostrar páginas próximas à atual
            let pageNum;
            if (totalPages <= 5) {
              pageNum = index + 1;
            } else if (page <= 3) {
              pageNum = index + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = page - 2 + index;
            }
            
            return (
              <button
                key={index}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded ${
                  page === pageNum
                    ? 'bg-primary-600 text-white'
                    : 'border border-neutral-300 dark:border-neutral-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 disabled:opacity-50"
          >
            Próxima
          </button>
        </nav>
      </div>
    );
  };
  
  return (
    <div>
      <ResponsiveGrid
        cols={{
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 4
        }}
        gap={{ x: 4, y: 6 }}
      >
        {loading
          ? renderSkeletons()
          : contents.map(content => (
              <ContentCard
                key={content.id}
                content={content}
                compact={isMobile}
                onClick={() => handleContentClick(content.id)}
              />
            ))}
      </ResponsiveGrid>
      
      {renderPagination()}
    </div>
  );
};

export default ContentList;