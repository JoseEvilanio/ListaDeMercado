import React, { useState, useEffect } from 'react';
import { useRealtime } from '../../hooks';
import { useSupabase } from '../../hooks';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  data: any;
  read: boolean;
  created_at: string;
}

interface RealtimeNotificationsProps {
  limit?: number;
  onNotification?: (notification: Notification) => void;
  children: (props: {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    loading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

/**
 * Componente que gerencia notificações em tempo real
 */
const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  limit = 10,
  onNotification,
  children
}) => {
  const { user } = useSupabase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar notificações iniciais
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Simulação de chamada à API
        // Na implementação real, usar DatabaseService
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockNotifications: Notification[] = [
          {
            id: '1',
            user_id: user.id,
            type: 'like',
            data: { content_id: '123', user_id: 'user456' },
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            user_id: user.id,
            type: 'comment',
            data: { content_id: '456', user_id: 'user789', comment_id: 'comment123' },
            read: true,
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        
        setNotifications(mockNotifications);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
        setError('Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user]);
  
  // Configurar assinatura em tempo real
  useRealtime({
    table: 'notifications',
    filter: user ? `user_id=eq.${user.id}` : undefined,
    enabled: !!user,
    onInsert: (payload) => {
      console.log('Nova notificação:', payload);
      
      // Adicionar nova notificação à lista
      const newNotification = payload.new as Notification;
      
      setNotifications(prev => {
        // Verificar se a notificação já existe
        if (prev.some(n => n.id === newNotification.id)) {
          return prev;
        }
        
        // Adicionar no início da lista e limitar ao número máximo
        const updated = [newNotification, ...prev].slice(0, limit);
        
        // Chamar callback se fornecido
        if (onNotification) {
          onNotification(newNotification);
        }
        
        return updated;
      });
    },
    onUpdate: (payload) => {
      console.log('Notificação atualizada:', payload);
      
      // Atualizar notificação na lista
      const updatedNotification = payload.new as Notification;
      setNotifications(prev => 
        prev.map(n => 
          n.id === updatedNotification.id ? updatedNotification : n
        )
      );
    },
    onDelete: (payload) => {
      console.log('Notificação excluída:', payload);
      
      // Remover notificação da lista
      const deletedNotification = payload.old as Notification;
      setNotifications(prev => 
        prev.filter(n => n.id !== deletedNotification.id)
      );
    }
  });
  
  // Calcular contagem de não lidas
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      // Simulação de chamada à API
      // Na implementação real, usar DatabaseService
      console.log('Marcando notificação como lida:', id);
      
      // Atualizar localmente
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      );
      
      // Atualizar no servidor (simulação)
      // await DatabaseService.notifications.update(id, { read: true });
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };
  
  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    try {
      // Simulação de chamada à API
      // Na implementação real, usar DatabaseService
      console.log('Marcando todas as notificações como lidas');
      
      // Atualizar localmente
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Atualizar no servidor (simulação)
      // await Promise.all(
      //   notifications.filter(n => !n.read).map(n => 
      //     DatabaseService.notifications.update(n.id, { read: true })
      //   )
      // );
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
    }
  };
  
  // Renderizar componente filho com as props necessárias
  return children({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    error
  });
};

export default RealtimeNotifications;