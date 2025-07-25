import React, { useState, useEffect } from 'react';
import {
  RealtimeDataGrid,
  RealtimeContentCard,
  RealtimeStatusIndicator
} from '../realtime';
import { Card, Button, Tabs } from '../ui';
import { Content, User } from '../../supabase';
import { DatabaseService } from '../../services';

/**
 * Componente de exemplo que demonstra o uso dos componentes reativos
 * Mostra como implementar atualizações de UI em tempo real sem recarregar a página
 * e como otimizar a renderização para evitar problemas de desempenho
 */
const RealtimeComponentsExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  
  // Colunas para o grid de dados
  const contentColumns = [
    {
      header: 'Título',
      accessor: 'title',
      editable: true,
      width: '30%'
    },
    {
      header: 'Conteúdo',
      accessor: 'body',
      editable: true,
      cell: (item: Content, onChange?: (value: any) => void) => {
        if (onChange) {
          return (
            <textarea
              className="w-full p-1 border rounded"
              value={item.body}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
            />
          );
        }
        
        return (
          <div className="max-h-20 overflow-y-auto">
            {item.body.length > 100 ? `${item.body.substring(0, 100)}...` : item.body}
          </div>
        );
      },
      width: '40%'
    },
    {
      header: 'Autor',
      accessor: async (item: Content) => {
        // Exemplo de carregamento assíncrono de dados relacionados
        try {
          const { data } = await DatabaseService.getById<User>('users', item.user_id);
          return data?.name || 'Desconhecido';
        } catch (error) {
          return 'Erro ao carregar';
        }
      },
      cell: (item: Content) => {
        return (
          <div className="flex items-center">
            <span>{item.user_id}</span>
          </div>
        );
      },
      width: '15%',
      hideOnMobile: true
    },
    {
      header: 'Atualizado',
      accessor: (item: Content) => {
        const date = new Date(item.updated_at);
        return date.toLocaleDateString();
      },
      width: '15%',
      hideOnMobile: true
    }
  ];
  
  // Função para buscar conteúdo
  const fetchContent = async () => {
    try {
      const { data, error } = await DatabaseService.query<Content>('content', {
        limit: 10,
        orderBy: 'updated_at',
        orderDirection: 'desc'
      });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      return [];
    }
  };
  
  // Função para buscar um conteúdo específico
  const fetchSingleContent = async (id: string) => {
    try {
      const { data, error } = await DatabaseService.getById<Content>('content', id);
      
      if (error) throw error;
      if (!data) throw new Error('Conteúdo não encontrado');
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar conteúdo:', error);
      throw error;
    }
  };
  
  // Selecionar o primeiro conteúdo disponível ao carregar
  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        const content = await fetchContent();
        if (content.length > 0) {
          setSelectedContentId(content[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar conteúdo inicial:', error);
      }
    };
    
    loadInitialContent();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Componentes Reativos</h1>
        <RealtimeStatusIndicator variant="badge" />
      </div>
      
      <Tabs
        tabs={[
          { id: 'grid', label: 'DataGrid' },
          { id: 'card', label: 'ContentCard' },
          { id: 'status', label: 'StatusIndicator' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      {activeTab === 'grid' && (
        <RealtimeDataGrid
          table="content"
          columns={contentColumns}
          keyExtractor={(item) => item.id}
          title="Conteúdo em Tempo Real"
          fetchFunction={fetchContent}
          editable
          onSave={async (item) => {
            await DatabaseService.update('content', item.id, item);
          }}
          className="shadow-lg"
        />
      )}
      
      {activeTab === 'card' && selectedContentId && (
        <RealtimeContentCard
          table="content"
          contentId={selectedContentId}
          fetchFunction={fetchSingleContent}
          renderHeader={(content) => (
            <h2 className="text-xl font-semibold">{content.title}</h2>
          )}
          renderContent={(content, isUpdating) => (
            <div className={`prose max-w-none ${isUpdating ? 'bg-yellow-50' : ''}`}>
              <p className="whitespace-pre-wrap">{content.body}</p>
              
              <div className="mt-4 text-sm text-gray-500">
                Última atualização: {new Date(content.updated_at).toLocaleString()}
              </div>
            </div>
          )}
          renderFooter={(content) => (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                ID: {content.id}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Exemplo de atualização manual
                  DatabaseService.update('content', content.id, {
                    updated_at: new Date().toISOString()
                  });
                }}
              >
                Atualizar timestamp
              </Button>
            </div>
          )}
          className="shadow-lg"
        />
      )}
      
      {activeTab === 'status' && (
        <Card className="shadow-lg">
          <Card.Header>
            <h2 className="text-xl font-semibold">Indicadores de Status</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Variante Mínima</h3>
                <RealtimeStatusIndicator variant="minimal" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Variante Badge</h3>
                <RealtimeStatusIndicator variant="badge" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Variante Detalhada</h3>
                <RealtimeStatusIndicator variant="detailed" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Monitorando Tabela Específica</h3>
                <RealtimeStatusIndicator
                  table="content"
                  variant="detailed"
                />
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RealtimeComponentsExample;