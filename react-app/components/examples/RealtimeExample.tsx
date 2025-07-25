import React, { useState, useEffect } from 'react';
import { Card, Button, Table } from '../ui';
import { Container } from '../layout';
import { useRealtime } from '../../hooks';
import { DatabaseService } from '../../services';

interface RealtimeExampleProps {
  table?: string;
}

const RealtimeExample: React.FC<RealtimeExampleProps> = ({
  table = 'content'
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(true);
  const [eventLog, setEventLog] = useState<any[]>([]);
  
  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Simulação de chamada à API
        // Na implementação real, usar DatabaseService
        setTimeout(() => {
          const mockData = [
            { id: '1', title: 'Item 1', created_at: new Date().toISOString() },
            { id: '2', title: 'Item 2', created_at: new Date().toISOString() },
            { id: '3', title: 'Item 3', created_at: new Date().toISOString() }
          ];
          
          setItems(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Configurar assinatura em tempo real
  const { isSubscribed, lastEvent } = useRealtime({
    table,
    enabled: subscribed,
    onInsert: (payload) => {
      console.log('Novo item inserido:', payload);
      
      // Adicionar novo item à lista
      const newItem = payload.new;
      setItems(prev => [...prev, newItem]);
      
      // Adicionar ao log de eventos
      setEventLog(prev => [
        {
          type: 'INSERT',
          timestamp: new Date().toISOString(),
          data: newItem
        },
        ...prev
      ]);
    },
    onUpdate: (payload) => {
      console.log('Item atualizado:', payload);
      
      // Atualizar item na lista
      const updatedItem = payload.new;
      setItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      // Adicionar ao log de eventos
      setEventLog(prev => [
        {
          type: 'UPDATE',
          timestamp: new Date().toISOString(),
          data: updatedItem
        },
        ...prev
      ]);
    },
    onDelete: (payload) => {
      console.log('Item excluído:', payload);
      
      // Remover item da lista
      const deletedItem = payload.old;
      setItems(prev => 
        prev.filter(item => item.id !== deletedItem.id)
      );
      
      // Adicionar ao log de eventos
      setEventLog(prev => [
        {
          type: 'DELETE',
          timestamp: new Date().toISOString(),
          data: deletedItem
        },
        ...prev
      ]);
    }
  });
  
  // Alternar assinatura
  const toggleSubscription = () => {
    setSubscribed(prev => !prev);
  };
  
  // Simular inserção de item
  const simulateInsert = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      title: `Novo Item ${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString()
    };
    
    // Simulação de inserção
    // Na implementação real, usar DatabaseService
    console.log('Simulando inserção:', newItem);
    
    // Adicionar ao log de eventos
    setEventLog(prev => [
      {
        type: 'INSERT (Simulado)',
        timestamp: new Date().toISOString(),
        data: newItem
      },
      ...prev
    ]);
    
    // Adicionar à lista
    setItems(prev => [...prev, newItem]);
  };
  
  // Simular atualização de item
  const simulateUpdate = () => {
    if (items.length === 0) return;
    
    // Selecionar um item aleatório
    const randomIndex = Math.floor(Math.random() * items.length);
    const itemToUpdate = items[randomIndex];
    
    const updatedItem = {
      ...itemToUpdate,
      title: `${itemToUpdate.title} (Atualizado)`,
      updated_at: new Date().toISOString()
    };
    
    // Simulação de atualização
    // Na implementação real, usar DatabaseService
    console.log('Simulando atualização:', updatedItem);
    
    // Adicionar ao log de eventos
    setEventLog(prev => [
      {
        type: 'UPDATE (Simulado)',
        timestamp: new Date().toISOString(),
        data: updatedItem
      },
      ...prev
    ]);
    
    // Atualizar na lista
    setItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };
  
  // Simular exclusão de item
  const simulateDelete = () => {
    if (items.length === 0) return;
    
    // Selecionar um item aleatório
    const randomIndex = Math.floor(Math.random() * items.length);
    const itemToDelete = items[randomIndex];
    
    // Simulação de exclusão
    // Na implementação real, usar DatabaseService
    console.log('Simulando exclusão:', itemToDelete);
    
    // Adicionar ao log de eventos
    setEventLog(prev => [
      {
        type: 'DELETE (Simulado)',
        timestamp: new Date().toISOString(),
        data: itemToDelete
      },
      ...prev
    ]);
    
    // Remover da lista
    setItems(prev => 
      prev.filter(item => item.id !== itemToDelete.id)
    );
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  return (
    <Container maxWidth="lg">
      <h1 className="text-2xl font-bold mb-6">Exemplo de Tempo Real</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Itens</h2>
              <Button
                variant={subscribed ? 'primary' : 'outline'}
                size="sm"
                onClick={toggleSubscription}
              >
                {subscribed ? 'Assinado' : 'Não Assinado'}
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Table
              data={items}
              columns={[
                {
                  header: 'ID',
                  accessor: 'id',
                  hideOnMobile: true
                },
                {
                  header: 'Título',
                  accessor: 'title'
                },
                {
                  header: 'Data',
                  accessor: (item) => formatDate(item.created_at),
                  hideOnMobile: true
                }
              ]}
              keyExtractor={(item) => item.id}
              loading={loading}
              emptyMessage="Nenhum item encontrado"
              striped
              hoverable
            />
          </Card.Body>
          <Card.Footer>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={simulateInsert}
              >
                Simular Inserção
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={simulateUpdate}
                disabled={items.length === 0}
              >
                Simular Atualização
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={simulateDelete}
                disabled={items.length === 0}
              >
                Simular Exclusão
              </Button>
            </div>
          </Card.Footer>
        </Card>
        
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Log de Eventos</h2>
          </Card.Header>
          <Card.Body>
            <div className="h-80 overflow-y-auto">
              {eventLog.length === 0 ? (
                <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                  Nenhum evento registrado
                </div>
              ) : (
                <div className="space-y-3">
                  {eventLog.map((event, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md ${
                        event.type.includes('INSERT')
                          ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                          : event.type.includes('UPDATE')
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-medium ${
                          event.type.includes('INSERT')
                            ? 'text-green-700 dark:text-green-400'
                            : event.type.includes('UPDATE')
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <pre className="text-xs bg-neutral-100 dark:bg-neutral-800 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Status: {isSubscribed ? 'Assinado' : 'Não Assinado'}
            </div>
          </Card.Footer>
        </Card>
      </div>
      
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Como Funciona</h2>
        </Card.Header>
        <Card.Body>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Este exemplo demonstra como usar as assinaturas em tempo real do Supabase para manter os dados sincronizados entre clientes.
            </p>
            
            <h3>Principais Componentes</h3>
            <ul>
              <li><strong>RealtimeService</strong>: Serviço para gerenciar assinaturas em tempo real</li>
              <li><strong>useRealtime</strong>: Hook para usar assinaturas em tempo real em componentes React</li>
            </ul>
            
            <h3>Como Usar</h3>
            <pre className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md overflow-x-auto">
{`// Exemplo de uso do hook useRealtime
const { isSubscribed, lastEvent } = useRealtime({
  table: 'content',
  enabled: true,
  onInsert: (payload) => {
    console.log('Novo item inserido:', payload);
  },
  onUpdate: (payload) => {
    console.log('Item atualizado:', payload);
  },
  onDelete: (payload) => {
    console.log('Item excluído:', payload);
  }
});`}
            </pre>
            
            <p>
              Você pode usar os botões acima para simular eventos em tempo real e ver como os dados são atualizados automaticamente.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RealtimeExample;