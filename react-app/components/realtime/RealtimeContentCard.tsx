import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner } from '../ui';
import { useRealtime } from '../../hooks';
import { DatabaseService } from '../../services';

interface RealtimeContentCardProps<T> {
  table: string;
  contentId: string;
  renderContent: (content: T, isUpdating: boolean) => React.ReactNode;
  renderHeader?: (content: T) => React.ReactNode;
  renderFooter?: (content: T) => React.ReactNode;
  fetchFunction?: (id: string) => Promise<T>;
  onUpdate?: (content: T) => Promise<void>;
  className?: string;
  loadingFallback?: React.ReactNode;
  errorFallback?: (error: string) => React.ReactNode;
}

/**
 * Componente de card de conteúdo que se atualiza automaticamente em tempo real
 * Otimizado para renderização eficiente e atualizações em tempo real
 */
function RealtimeContentCard<T extends { id: string }>({
  table,
  contentId,
  renderContent,
  renderHeader,
  renderFooter,
  fetchFunction,
  onUpdate,
  className = '',
  loadingFallback = <div className="flex justify-center p-8"><Spinner size="lg" /></div>,
  errorFallback = (error) => <div className="text-center text-red-500 p-4">{error}</div>
}: RealtimeContentCardProps<T>) {
  const [content, setContent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Carregar conteúdo inicial
  const fetchContent = useCallback(async () => {
    if (!contentId) return;
    
    setLoading(true);
    
    try {
      let data: T;
      
      if (fetchFunction) {
        // Usar função personalizada para buscar dados
        data = await fetchFunction(contentId);
      } else {
        // Usar DatabaseService para buscar dados
        const { data: fetchedData, error } = await DatabaseService.getById<T>(table, contentId);
        
        if (error) throw error;
        if (!fetchedData) throw new Error('Conteúdo não encontrado');
        
        data = fetchedData;
      }
      
      setContent(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar conteúdo:', err);
      setError('Erro ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  }, [contentId, fetchFunction, table]);
  
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
  
  // Configurar assinatura em tempo real com otimização para evitar re-renderizações desnecessárias
  const { isSubscribed } = useRealtime({
    table,
    filter: `id=eq.${contentId}`,
    onUpdate: useCallback((payload) => {
      const updatedContent = payload.new as T;
      
      // Verificar se o conteúdo realmente mudou para evitar re-renderizações
      setContent(prev => {
        if (!prev) return updatedContent;
        
        const hasChanged = JSON.stringify(prev) !== JSON.stringify(updatedContent);
        if (!hasChanged) return prev;
        
        // Indicar visualmente que houve atualização
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 1000);
        
        return updatedContent;
      });
    }, []),
    
    onDelete: useCallback(() => {
      // O conteúdo foi excluído
      setContent(null);
      setError('Este conteúdo não está mais disponível');
    }, [])
  });
  
  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Card className={`realtime-content-card ${className}`}>
        <Card.Body>
          {loadingFallback}
        </Card.Body>
      </Card>
    );
  }
  
  // Renderizar estado de erro
  if (error || !content) {
    return (
      <Card className={`realtime-content-card ${className}`}>
        <Card.Body>
          {errorFallback(error || 'Conteúdo não disponível')}
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className={`realtime-content-card ${className} ${isUpdating ? 'animate-pulse' : ''}`}>
      {renderHeader && (
        <Card.Header className="flex justify-between items-center">
          {renderHeader(content)}
          {isSubscribed && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Tempo real ativo
            </span>
          )}
        </Card.Header>
      )}
      
      <Card.Body>
        {renderContent(content, isUpdating)}
      </Card.Body>
      
      {renderFooter && (
        <Card.Footer>
          {renderFooter(content)}
        </Card.Footer>
      )}
    </Card>
  );
}

export default RealtimeContentCard;