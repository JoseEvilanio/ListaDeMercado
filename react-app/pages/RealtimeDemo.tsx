import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { ResponsiveLayout, Container } from '../components/layout';
import {
  RealtimeCounter,
  RealtimeList,
  RealtimeItem,
  RealtimeNotifications,
  RealtimeChat,
  RealtimePresence,
  RealtimeForm,
  RealtimeCollaborativeEditor
} from '../components/realtime';
import { useSupabase } from '../hooks';

interface DemoItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const RealtimeDemo: React.FC = () => {
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState<string>('chat');
  
  // Simular ID e nome de usuário atual
  const currentUserId = user?.id || 'demo-user';
  const currentUserName = user?.email?.split('@')[0] || 'Usuário Demo';
  
  // Renderizar conteúdo com base na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RealtimeChat
                channelName="demo-chat"
                userId={currentUserId}
                userName={currentUserName}
                title="Chat em Tempo Real"
              />
            </div>
            <div>
              <RealtimePresence
                channelName="demo-chat"
                userId={currentUserId}
                userInfo={{
                  name: currentUserName,
                  status: 'Disponível'
                }}
                title="Usuários Online"
              />
            </div>
          </div>
        );
        
      case 'list':
        return (
          <RealtimeList<DemoItem>
            table="demo_items"
            title="Lista em Tempo Real"
            keyExtractor={(item) => item.id}
            columns={[
              {
                header: 'Nome',
                accessor: 'name'
              },
              {
                header: 'Descrição',
                accessor: 'description',
                hideOnMobile: true
              },
              {
                header: 'Data',
                accessor: (item) => new Date(item.created_at).toLocaleDateString(),
                hideOnMobile: true
              }
            ]}
            fetchFunction={async () => {
              // Simular dados
              await new Promise(resolve => setTimeout(resolve, 1000));
              return [
                {
                  id: '1',
                  name: 'Item 1',
                  description: 'Descrição do item 1',
                  created_at: new Date().toISOString()
                },
                {
                  id: '2',
                  name: 'Item 2',
                  description: 'Descrição do item 2',
                  created_at: new Date(Date.now() - 86400000).toISOString()
                }
              ];
            }}
          />
        );
        
      case 'counter':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RealtimeCounter
              table="demo_items"
              title="Total de Itens"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            
            <RealtimeCounter
              table="demo_users"
              title="Usuários Ativos"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            
            <RealtimeCounter
              table="demo_events"
              title="Eventos"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        );
        
      case 'form':
        return (
          <RealtimeForm<{id?: string; title: string; content: string; status: string}>
            table="demo_posts"
            initialData={{
              title: '',
              content: '',
              status: 'draft'
            }}
            title="Formulário em Tempo Real"
            onSubmit={async (data) => {
              console.log('Enviando dados:', data);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return;
            }}
          >
            {({ data, setData, isSubmitting, error }) => (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <Input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    placeholder="Digite o título"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Conteúdo</label>
                  <textarea
                    value={data.content}
                    onChange={(e) => setData({ ...data, content: e.target.value })}
                    placeholder="Digite o conteúdo"
                    className="w-full h-32 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={data.status}
                    onChange={(e) => setData({ ...data, status: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
              </div>
            )}
          </RealtimeForm>
        );
        
      case 'editor':
        return (
          <RealtimeCollaborativeEditor
            documentId="demo-doc-1"
            userId={currentUserId}
            userName={currentUserName}
            initialContent="Este é um editor colaborativo em tempo real.\n\nVárias pessoas podem editar este documento simultaneamente."
            title="Editor Colaborativo"
            onSave={async (content) => {
              console.log('Salvando documento:', content);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return;
            }}
          />
        );
        
      case 'notifications':
        return (
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Notificações em Tempo Real</h2>
            </Card.Header>
            <Card.Body>
              <RealtimeNotifications
                onNotification={(notification) => {
                  console.log('Nova notificação:', notification);
                }}
              >
                {({ notifications, unreadCount, markAsRead, markAllAsRead, loading }) => (
                  <div>
                    {unreadCount > 0 && (
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          {unreadCount} {unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                        >
                          Marcar todas como lidas
                        </Button>
                      </div>
                    )}
                    
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(index => (
                          <div key={index} className="animate-pulse flex items-start space-x-3">
                            <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer ${
                              notification.read
                                ? 'bg-white dark:bg-neutral-800'
                                : 'bg-primary-50 dark:bg-primary-900/20'
                            } hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              notification.type === 'like'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            }`}>
                              {notification.type === 'like' ? '❤️' : '💬'}
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">Usuário</span>
                                {' '}
                                {notification.type === 'like' ? 'curtiu seu post' : 'comentou em seu post'}
                              </p>
                              
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                {new Date(notification.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </RealtimeNotifications>
            </Card.Body>
          </Card>
        );
        
      default:
        return (
          <div className="text-center py-10 text-neutral-500 dark:text-neutral-400">
            Selecione uma demonstração para visualizar.
          </div>
        );
    }
  };
  
  return (
    <ResponsiveLayout
      header={
        <div className="flex items-center justify-between w-full">
          <div className="font-bold text-xl">Demonstração em Tempo Real</div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
              {currentUserName.charAt(0)}
            </div>
          </div>
        </div>
      }
    >
      <Container maxWidth="xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Demonstração de Funcionalidades em Tempo Real</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Esta página demonstra os componentes reativos implementados com o Supabase Realtime.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <Button
                variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('chat')}
                className="py-4 px-1"
              >
                Chat e Presença
              </Button>
              <Button
                variant={activeTab === 'list' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('list')}
                className="py-4 px-1"
              >
                Lista em Tempo Real
              </Button>
              <Button
                variant={activeTab === 'counter' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('counter')}
                className="py-4 px-1"
              >
                Contadores
              </Button>
              <Button
                variant={activeTab === 'form' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('form')}
                className="py-4 px-1"
              >
                Formulário
              </Button>
              <Button
                variant={activeTab === 'editor' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('editor')}
                className="py-4 px-1"
              >
                Editor Colaborativo
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('notifications')}
                className="py-4 px-1"
              >
                Notificações
              </Button>
            </nav>
          </div>
        </div>
        
        {renderContent()}
      </Container>
    </ResponsiveLayout>
  );
};

export default RealtimeDemo;