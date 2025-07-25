import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
import { supabase } from '../../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  name?: string;
  avatar_url?: string;
  status?: string;
  [key: string]: any;
}

interface RealtimePresenceProps {
  channelName: string;
  userId: string;
  userInfo: Record<string, any>;
  title?: string;
  className?: string;
  renderUser?: (user: PresenceUser) => React.ReactNode;
  emptyMessage?: string;
}

/**
 * Componente que exibe usuários online em um canal em tempo real
 */
const RealtimePresence: React.FC<RealtimePresenceProps> = ({
  channelName,
  userId,
  userInfo,
  title = 'Usuários Online',
  className = '',
  renderUser,
  emptyMessage = 'Nenhum usuário online no momento'
}) => {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!channelName || !userId) {
      setError('Informações de canal ou usuário ausentes');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Criar canal de presença
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
        console.log('Usuários entraram:', newPresences);
        
        setPresentUsers(current => {
          // Filtrar usuários existentes
          const filteredUsers = current.filter(user => 
            !newPresences.some(presence => presence.id === user.id)
          );
          
          // Adicionar novos usuários
          return [
            ...filteredUsers,
            ...newPresences.map(presence => ({
              id: presence.id,
              ...presence
            }))
          ];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Usuários saíram:', leftPresences);
        
        setPresentUsers(current => 
          current.filter(user => 
            !leftPresences.some(presence => presence.id === user.id)
          )
        );
      })
      .on('presence', { event: 'sync' }, () => {
        // Sincronizar estado de presença
        const state = channel.presenceState();
        console.log('Estado de presença sincronizado:', state);
        
        // Converter estado para array de usuários
        const users = Object.values(state).flat().map(presence => ({
          id: presence.id,
          ...presence
        }));
        
        setPresentUsers(users as PresenceUser[]);
      })
      .subscribe(async (status) => {
        console.log('Status do canal de presença:', status);
        
        if (status === 'SUBSCRIBED') {
          // Registrar presença do usuário atual
          await channel.track({
            id: userId,
            ...userInfo,
            online_at: new Date().toISOString()
          });
          
          setLoading(false);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Erro ao conectar ao canal de presença');
          setLoading(false);
        }
      });
    
    // Limpar ao desmontar
    return () => {
      channel.unsubscribe();
    };
  }, [channelName, userId, userInfo]);
  
  // Renderizar usuário padrão
  const defaultRenderUser = (user: PresenceUser) => (
    <div className="flex items-center p-3">
      <div className="relative">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || 'Usuário'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
            {user.name?.charAt(0) || user.id.charAt(0)}
          </div>
        )}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800"></div>
      </div>
      <div className="ml-3">
        <p className="font-medium">{user.name || 'Usuário'}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {user.status || 'Online'}
        </p>
      </div>
    </div>
  );
  
  return (
    <Card className={className}>
      {title && (
        <Card.Header className="border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {presentUsers.length} online
            </div>
          </div>
        </Card.Header>
      )}
      <Card.Body className="p-0">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(index => (
              <div key={index} className="animate-pulse flex items-center">
                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : presentUsers.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
            {emptyMessage}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {presentUsers.map(user => (
              <div key={user.id}>
                {renderUser ? renderUser(user) : defaultRenderUser(user)}
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RealtimePresence;