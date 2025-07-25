import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../ui';
import { Container } from '../layout';
import { Content, User, Interaction } from '../../supabase';
import { DatabaseService } from '../../services';
import CommentList from '../comments/CommentList';
import CommentForm from '../comments/CommentForm';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content & { users?: Pick<User, 'name' | 'email'> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<{
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    userLiked: boolean;
    userBookmarked: boolean;
  }>({
    likes: 0,
    comments: 0,
    shares: 0,
    bookmarks: 0,
    userLiked: false,
    userBookmarked: false
  });
  
  // Carregar conteúdo
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        const { content, error } = await DatabaseService.content.getById(id);
        
        if (error) {
          setError('Erro ao carregar conteúdo');
          return;
        }
        
        setContent(content);
        
        // Carregar interações
        const { interactions } = await DatabaseService.interactions.getByContent(id);
        
        // Contar interações
        const likes = interactions.filter(i => i.type === 'like').length;
        const comments = interactions.filter(i => i.type === 'comment').length;
        const shares = interactions.filter(i => i.type === 'share').length;
        const bookmarks = interactions.filter(i => i.type === 'bookmark').length;
        
        // Verificar interações do usuário atual (simulação)
        const currentUserId = 'current-user-id'; // Substituir pelo ID do usuário atual
        const userLiked = interactions.some(i => i.type === 'like' && i.user_id === currentUserId);
        const userBookmarked = interactions.some(i => i.type === 'bookmark' && i.user_id === currentUserId);
        
        setInteractions({
          likes,
          comments,
          shares,
          bookmarks,
          userLiked,
          userBookmarked
        });
      } catch (err) {
        setError('Erro ao carregar conteúdo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [id]);
  
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
  
  // Alternar curtida
  const handleLike = async () => {
    if (!content) return;
    
    const currentUserId = 'current-user-id'; // Substituir pelo ID do usuário atual
    
    try {
      if (interactions.userLiked) {
        // Remover curtida (simulação)
        setInteractions(prev => ({
          ...prev,
          likes: prev.likes - 1,
          userLiked: false
        }));
        
        // Implementar lógica para remover curtida
      } else {
        // Adicionar curtida
        setInteractions(prev => ({
          ...prev,
          likes: prev.likes + 1,
          userLiked: true
        }));
        
        await DatabaseService.interactions.create({
          user_id: currentUserId,
          content_id: content.id,
          type: 'like'
        });
      }
    } catch (err) {
      console.error('Erro ao processar curtida:', err);
    }
  };
  
  // Alternar favorito
  const handleBookmark = async () => {
    if (!content) return;
    
    const currentUserId = 'current-user-id'; // Substituir pelo ID do usuário atual
    
    try {
      if (interactions.userBookmarked) {
        // Remover favorito (simulação)
        setInteractions(prev => ({
          ...prev,
          bookmarks: prev.bookmarks - 1,
          userBookmarked: false
        }));
        
        // Implementar lógica para remover favorito
      } else {
        // Adicionar favorito
        setInteractions(prev => ({
          ...prev,
          bookmarks: prev.bookmarks + 1,
          userBookmarked: true
        }));
        
        await DatabaseService.interactions.create({
          user_id: currentUserId,
          content_id: content.id,
          type: 'bookmark'
        });
      }
    } catch (err) {
      console.error('Erro ao processar favorito:', err);
    }
  };
  
  // Compartilhar
  const handleShare = async () => {
    if (!content) return;
    
    const currentUserId = 'current-user-id'; // Substituir pelo ID do usuário atual
    
    try {
      // Incrementar contador de compartilhamentos
      setInteractions(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));
      
      // Registrar compartilhamento
      await DatabaseService.interactions.create({
        user_id: currentUserId,
        content_id: content.id,
        type: 'share'
      });
      
      // Simular compartilhamento
      if (navigator.share) {
        await navigator.share({
          title: content.title,
          text: content.body.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // Fallback para navegadores que não suportam a API Web Share
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };
  
  // Renderizar esqueleto de carregamento
  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-md w-3/4 mb-4"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md w-1/4 mb-8"></div>
      <div className="space-y-3">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md w-5/6"></div>
      </div>
    </div>
  );
  
  // Renderizar mensagem de erro
  if (error) {
    return (
      <Container>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">
            {error}
          </h2>
          <p className="mb-6">Não foi possível carregar o conteúdo solicitado.</p>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        >
          Voltar
        </Button>
      </div>
      
      <Card className="p-4 md:p-8">
        {loading ? (
          renderSkeleton()
        ) : content ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{content.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-2">
                    {content.users?.name?.charAt(0) || 'U'}
                  </div>
                  <span>{content.users?.name || 'Usuário'}</span>
                </div>
                <span className="sm:ml-4">
                  {content.created_at && formatDate(content.created_at)}
                </span>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                {content.body.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={interactions.userLiked ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  }
                >
                  {interactions.likes} {interactions.likes === 1 ? 'Curtida' : 'Curtidas'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {}}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  }
                >
                  {interactions.comments} {interactions.comments === 1 ? 'Comentário' : 'Comentários'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  }
                >
                  {interactions.shares} {interactions.shares === 1 ? 'Compartilhamento' : 'Compartilhamentos'}
                </Button>
                
                <Button
                  variant={interactions.userBookmarked ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleBookmark}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  }
                >
                  {interactions.userBookmarked ? 'Salvo' : 'Salvar'}
                </Button>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Comentários</h2>
              <CommentForm contentId={content.id} />
              <div className="mt-6">
                <CommentList contentId={content.id} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p>Conteúdo não encontrado</p>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default ContentDetail;