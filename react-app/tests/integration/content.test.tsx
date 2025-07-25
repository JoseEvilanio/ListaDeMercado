import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatabaseService } from '../../services';
import { useSupabase } from '../../hooks';
import { SupabaseProvider } from '../../components/SupabaseProvider';

// Mock dos serviços e hooks
jest.mock('../../services', () => ({
  DatabaseService: {
    content: {
      getById: jest.fn(),
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}));

jest.mock('../../hooks', () => ({
  useSupabase: jest.fn()
}));

// Componente de teste para listagem de conteúdo
const ContentListComponent = () => {
  const [contents, setContents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchContents = async () => {
      try {
        const result = await DatabaseService.content.getAll();
        setContents(result.contents || []);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar conteúdos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContents();
  }, []);
  
  return (
    <div>
      <h1>Lista de Conteúdos</h1>
      
      {loading && <div data-testid="loading">Carregando...</div>}
      {error && <div data-testid="error">{error}</div>}
      
      <ul data-testid="content-list">
        {contents.map(content => (
          <li key={content.id} data-testid={`content-item-${content.id}`}>
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Componente de teste para criação de conteúdo
const ContentFormComponent = ({ content, onSubmit }: { content?: any, onSubmit: (data: any) => Promise<void> }) => {
  const [title, setTitle] = React.useState(content?.title || '');
  const [description, setDescription] = React.useState(content?.description || '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit({ title, description });
    } catch (err) {
      setError('Erro ao salvar conteúdo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>{content ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h1>
      
      <form onSubmit={handleSubmit} data-testid="content-form">
        <div>
          <label htmlFor="title">Título</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="title-input"
          />
        </div>
        
        <div>
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="description-input"
          />
        </div>
        
        <button type="submit" disabled={loading} data-testid="submit-button">
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        
        {error && <div data-testid="error-message">{error}</div>}
      </form>
    </div>
  );
};

describe('Conteúdo (Integração)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão para useSupabase
    (useSupabase as jest.Mock).mockReturnValue({
      user: { id: 'user-id' },
      session: { access_token: 'token' }
    });
  });
  
  describe('Listagem de Conteúdo', () => {
    it('should fetch and display content list', async () => {
      // Configurar mock para getAll
      const mockContents = [
        { id: '1', title: 'Conteúdo 1', description: 'Descrição 1' },
        { id: '2', title: 'Conteúdo 2', description: 'Descrição 2' }
      ];
      
      (DatabaseService.content.getAll as jest.Mock).mockResolvedValue({
        contents: mockContents,
        totalCount: 2
      });
      
      render(<ContentListComponent />);
      
      // Verificar loading
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      // Verificar se os conteúdos foram exibidos
      expect(screen.getByTestId('content-list').children).toHaveLength(2);
      expect(screen.getByTestId('content-item-1')).toHaveTextContent('Conteúdo 1');
      expect(screen.getByTestId('content-item-2')).toHaveTextContent('Conteúdo 2');
    });
    
    it('should display error message when fetch fails', async () => {
      // Configurar mock para getAll com erro
      (DatabaseService.content.getAll as jest.Mock).mockRejectedValue(new Error('Falha na API'));
      
      render(<ContentListComponent />);
      
      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
      
      // Verificar se a mensagem de erro é exibida
      expect(screen.getByTestId('error')).toHaveTextContent('Erro ao carregar conteúdos');
    });
  });
  
  describe('Criação de Conteúdo', () => {
    it('should create new content', async () => {
      // Configurar mock para create
      const createMock = jest.fn().mockResolvedValue({
        content: { id: 'new-id', title: 'Novo Conteúdo', description: 'Nova Descrição' },
        error: null
      });
      
      const handleSubmit = jest.fn().mockImplementation(async (data) => {
        await DatabaseService.content.create(data);
      });
      
      render(<ContentFormComponent onSubmit={handleSubmit} />);
      
      // Preencher formulário
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Novo Conteúdo' }
      });
      
      fireEvent.change(screen.getByTestId('description-input'), {
        target: { value: 'Nova Descrição' }
      });
      
      // Configurar mock antes de enviar o formulário
      (DatabaseService.content.create as jest.Mock).mockImplementation(createMock);
      
      // Enviar formulário
      fireEvent.submit(screen.getByTestId('content-form'));
      
      // Verificar se handleSubmit foi chamado com os dados corretos
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          title: 'Novo Conteúdo',
          description: 'Nova Descrição'
        });
      });
      
      // Verificar se create foi chamado
      expect(createMock).toHaveBeenCalled();
    });
  });
  
  describe('Edição de Conteúdo', () => {
    it('should update existing content', async () => {
      // Configurar mock para update
      const updateMock = jest.fn().mockResolvedValue({
        content: { id: 'content-id', title: 'Conteúdo Atualizado', description: 'Descrição Atualizada' },
        error: null
      });
      
      const existingContent = {
        id: 'content-id',
        title: 'Conteúdo Original',
        description: 'Descrição Original'
      };
      
      const handleSubmit = jest.fn().mockImplementation(async (data) => {
        await DatabaseService.content.update(existingContent.id, data);
      });
      
      render(<ContentFormComponent content={existingContent} onSubmit={handleSubmit} />);
      
      // Verificar se os campos estão preenchidos com os valores existentes
      expect(screen.getByTestId('title-input')).toHaveValue('Conteúdo Original');
      expect(screen.getByTestId('description-input')).toHaveValue('Descrição Original');
      
      // Atualizar campos
      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Conteúdo Atualizado' }
      });
      
      fireEvent.change(screen.getByTestId('description-input'), {
        target: { value: 'Descrição Atualizada' }
      });
      
      // Configurar mock antes de enviar o formulário
      (DatabaseService.content.update as jest.Mock).mockImplementation(updateMock);
      
      // Enviar formulário
      fireEvent.submit(screen.getByTestId('content-form'));
      
      // Verificar se handleSubmit foi chamado com os dados corretos
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          title: 'Conteúdo Atualizado',
          description: 'Descrição Atualizada'
        });
      });
      
      // Verificar se update foi chamado
      expect(updateMock).toHaveBeenCalledWith('content-id', {
        title: 'Conteúdo Atualizado',
        description: 'Descrição Atualizada'
      });
    });
  });
});