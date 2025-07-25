import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
import { supabase } from '../../supabase';

interface CollaborativeEditorProps {
  documentId: string;
  userId: string;
  userName: string;
  initialContent?: string;
  title?: string;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  onSave?: (content: string) => Promise<void>;
}

interface EditorUpdate {
  user_id: string;
  user_name: string;
  content: string;
  timestamp: number;
}

/**
 * Componente de editor colaborativo em tempo real
 * Permite que múltiplos usuários editem o mesmo documento simultaneamente
 */
const RealtimeCollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  userId,
  userName,
  initialContent = '',
  title,
  className = '',
  placeholder = 'Digite aqui...',
  readOnly = false,
  onSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<{ id: string; name: string }[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Configurar canal para edição colaborativa
  useEffect(() => {
    if (!documentId) {
      setError('ID do documento ausente');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Criar canal para o documento
    const channelName = `document:${documentId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        }
      }
    });
    
    // Configurar eventos de presença
    channel
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Usuários entraram no documento:', newPresences);
        
        setActiveUsers(current => {
          // Filtrar usuários existentes
          const filteredUsers = current.filter(user => 
            !newPresences.some(presence => presence.id === user.id)
          );
          
          // Adicionar novos usuários
          return [
            ...filteredUsers,
            ...newPresences.map(presence => ({
              id: presence.id,
              name: presence.name || 'Usuário'
            }))
          ];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Usuários saíram do documento:', leftPresences);
        
        setActiveUsers(current => 
          current.filter(user => 
            !leftPresences.some(presence => presence.id === user.id)
          )
        );
      })
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        console.log('Atualização do documento recebida:', payload);
        
        // Atualizar conteúdo apenas se não for do usuário atual
        const update = payload as EditorUpdate;
        if (update.user_id !== userId) {
          setContent(update.content);
        }
      })
      .subscribe(async (status) => {
        console.log('Status do canal do documento:', status);
        
        if (status === 'SUBSCRIBED') {
          // Registrar presença do usuário atual
          await channel.track({
            id: userId,
            name: userName,
            online_at: new Date().toISOString()
          });
          
          // Simular carregamento do conteúdo inicial
          setTimeout(() => {
            setContent(initialContent);
            setLoading(false);
            setError(null);
          }, 1000);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Erro ao conectar ao documento');
          setLoading(false);
        }
      });
    
    // Função para salvar o documento periodicamente
    let saveInterval: NodeJS.Timeout | null = null;
    
    if (!readOnly && onSave) {
      saveInterval = setInterval(async () => {
        try {
          setIsSaving(true);
          await onSave(content);
          setLastSaved(new Date());
        } catch (err) {
          console.error('Erro ao salvar documento:', err);
        } finally {
          setIsSaving(false);
        }
      }, 30000); // Salvar a cada 30 segundos
    }
    
    // Limpar ao desmontar
    return () => {
      channel.unsubscribe();
      if (saveInterval) clearInterval(saveInterval);
    };
  }, [documentId, userId, userName, initialContent, readOnly, onSave]);
  
  // Enviar atualizações quando o conteúdo mudar
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Enviar atualização para outros usuários
    const channelName = `document:${documentId}`;
    supabase.channel(channelName).send({
      type: 'broadcast',
      event: 'update',
      payload: {
        user_id: userId,
        user_name: userName,
        content: newContent,
        timestamp: Date.now()
      } as EditorUpdate
    });
  };
  
  // Salvar manualmente
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(content);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Erro ao salvar documento:', err);
      setError('Erro ao salvar documento');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className={className}>
      {title && (
        <Card.Header className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="flex items-center space-x-2">
              {activeUsers.length > 0 && (
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map(user => (
                    <div
                      key={user.id}
                      className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 border-2 border-white dark:border-neutral-800"
                      title={user.name}
                    >
                      {user.name.charAt(0)}
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 border-2 border-white dark:border-neutral-800">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              )}
              {lastSaved && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isSaving ? 'Salvando...' : `Salvo às ${lastSaved.toLocaleTimeString()}`}
                </div>
              )}
            </div>
          </div>
        </Card.Header>
      )}
      <Card.Body className="p-0">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full h-64 p-4 bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
          />
        )}
      </Card.Body>
      {!readOnly && onSave && (
        <Card.Footer className="border-t border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-center">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {activeUsers.length === 1
              ? '1 usuário editando'
              : `${activeUsers.length} usuários editando`}
          </div>
          <button
            onClick={handleSave}
            disabled={loading || isSaving}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default RealtimeCollaborativeEditor;