import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input } from '../ui';
import { supabase } from '../../supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  timestamp: number;
  [key: string]: any;
}

interface RealtimeChatProps {
  channelName: string;
  userId: string;
  userName: string;
  title?: string;
  className?: string;
  maxMessages?: number;
  placeholder?: string;
}

/**
 * Componente de chat em tempo real
 */
const RealtimeChat: React.FC<RealtimeChatProps> = ({
  channelName,
  userId,
  userName,
  title = 'Chat',
  className = '',
  maxMessages = 100,
  placeholder = 'Digite sua mensagem...'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Rolar para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Configurar canal de chat
  useEffect(() => {
    if (!channelName) {
      setError('Nome do canal ausente');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Criar canal
    const channel = supabase.channel(channelName);
    
    // Configurar evento de mensagem
    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        console.log('Nova mensagem recebida:', payload);
        
        // Adicionar mensagem à lista
        setMessages(current => {
          // Verificar se a mensagem já existe
          if (current.some(msg => msg.id === payload.id)) {
            return current;
          }
          
          // Adicionar nova mensagem e limitar ao número máximo
          const updated = [...current, payload as Message];
          return updated.slice(-maxMessages);
        });
      })
      .subscribe(status => {
        console.log('Status do canal de chat:', status);
        
        if (status === 'SUBSCRIBED') {
          setLoading(false);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Erro ao conectar ao canal de chat');
          setLoading(false);
        }
      });
    
    // Simular algumas mensagens iniciais
    setTimeout(() => {
      const initialMessages: Message[] = [
        {
          id: '1',
          sender_id: 'system',
          sender_name: 'Sistema',
          content: 'Bem-vindo ao chat!',
          timestamp: Date.now() - 60000
        },
        {
          id: '2',
          sender_id: 'user123',
          sender_name: 'João Silva',
          content: 'Olá, como estão todos?',
          timestamp: Date.now() - 30000
        }
      ];
      
      setMessages(initialMessages);
      setLoading(false);
    }, 1000);
    
    // Limpar ao desmontar
    return () => {
      channel.unsubscribe();
    };
  }, [channelName, maxMessages]);
  
  // Gerar ID único
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Enviar mensagem
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: generateId(),
      sender_id: userId,
      sender_name: userName,
      content: message.trim(),
      timestamp: Date.now()
    };
    
    try {
      // Enviar mensagem pelo canal
      await supabase.channel(channelName).send({
        type: 'broadcast',
        event: 'message',
        payload: newMessage
      });
      
      // Adicionar mensagem localmente (otimista)
      setMessages(current => [...current, newMessage]);
      
      // Limpar campo de mensagem
      setMessage('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Erro ao enviar mensagem');
    }
  };
  
  // Formatar timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className={`flex flex-col h-[500px] ${className}`}>
      {title && (
        <Card.Header className="border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">{title}</h2>
        </Card.Header>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(index => (
              <div key={index} className="animate-pulse flex flex-col">
                <div className="flex items-center mb-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20 mr-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-12"></div>
                </div>
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
            Nenhuma mensagem ainda. Seja o primeiro a enviar!
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.sender_id === userId
                    ? 'bg-primary-500 text-white'
                    : msg.sender_id === 'system'
                      ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {msg.sender_id !== userId && (
                  <div className="text-xs font-medium mb-1">
                    {msg.sender_name || 'Usuário'}
                  </div>
                )}
                <div>{msg.content}</div>
                <div className="text-xs text-right mt-1 opacity-70">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <Card.Footer className="border-t border-neutral-200 dark:border-neutral-700 p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            disabled={loading || !!error}
          />
          <Button type="submit" disabled={!message.trim() || loading || !!error}>
            Enviar
          </Button>
        </form>
      </Card.Footer>
    </Card>
  );
};

export default RealtimeChat;