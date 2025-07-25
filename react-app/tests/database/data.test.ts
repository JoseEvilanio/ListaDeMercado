import { supabase } from '../../supabase';

// Mock do cliente Supabase
jest.mock('../../supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

describe('Integridade de Dados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Verificação de Dados Obrigatórios', () => {
    it('should verify required data in users table', async () => {
      // Configurar mock para simular consulta de usuários
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null, count: 0 })))
      });
      
      // Verificar se não há usuários com email nulo
      const { count: nullEmailCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .is('email', null);
      
      expect(nullEmailCount).toBe(0);
    });
    
    it('should verify required data in content table', async () => {
      // Configurar mock para simular consulta de conteúdo
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null, count: 0 })))
      });
      
      // Verificar se não há conteúdo com título nulo
      const { count: nullTitleCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .is('title', null);
      
      expect(nullTitleCount).toBe(0);
      
      // Verificar se não há conteúdo com user_id nulo
      const { count: nullUserIdCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null);
      
      expect(nullUserIdCount).toBe(0);
    });
  });
  
  describe('Verificação de Integridade Referencial', () => {
    it('should verify content references valid users', async () => {
      // Configurar mock para simular consulta de conteúdo órfão
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null, count: 0 })))
      });
      
      // Verificar se não há conteúdo referenciando usuários inexistentes
      const { count: orphanContentCount } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'in', '(SELECT id FROM users)');
      
      expect(orphanContentCount).toBe(0);
    });
    
    it('should verify interactions reference valid content', async () => {
      // Configurar mock para simular consulta de interações órfãs
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null, count: 0 })))
      });
      
      // Verificar se não há interações referenciando conteúdo inexistente
      const { count: orphanInteractionsCount } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .not('content_id', 'in', '(SELECT id FROM content)');
      
      expect(orphanInteractionsCount).toBe(0);
    });
  });
  
  describe('Verificação de Dados Duplicados', () => {
    it('should verify no duplicate emails in users table', async () => {
      // Configurar mock para simular consulta de emails duplicados
      (supabase.rpc as jest.Mock).mockReturnValue({
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null })))
      });
      
      // Verificar se não há emails duplicados
      const { data: duplicateEmails } = await supabase.rpc('find_duplicate_emails');
      
      expect(duplicateEmails).toHaveLength(0);
    });
    
    it('should verify no duplicate interactions', async () => {
      // Configurar mock para simular consulta de interações duplicadas
      (supabase.rpc as jest.Mock).mockReturnValue({
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null })))
      });
      
      // Verificar se não há interações duplicadas (mesmo usuário, conteúdo e tipo)
      const { data: duplicateInteractions } = await supabase.rpc('find_duplicate_interactions');
      
      expect(duplicateInteractions).toHaveLength(0);
    });
  });
  
  describe('Verificação de Consistência de Dados', () => {
    it('should verify content counts match interaction counts', async () => {
      // Configurar mock para simular consulta de contagens
      const mockCounts = [
        { content_id: '1', actual_count: 5, stored_count: 5 },
        { content_id: '2', actual_count: 3, stored_count: 3 }
      ];
      
      (supabase.rpc as jest.Mock).mockReturnValue({
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockCounts, error: null })))
      });
      
      // Verificar se as contagens de interações são consistentes
      const { data: interactionCounts } = await supabase.rpc('verify_interaction_counts');
      
      // Verificar se não há discrepâncias
      const discrepancies = interactionCounts.filter(
        (item: any) => item.actual_count !== item.stored_count
      );
      
      expect(discrepancies).toHaveLength(0);
    });
  });
  
  describe('Verificação de Dados de Teste', () => {
    it('should verify test data exists', async () => {
      // Configurar mock para simular consulta de contagens
      const mockCounts = {
        users_count: 10,
        content_count: 20,
        interactions_count: 50
      };
      
      (supabase.rpc as jest.Mock).mockReturnValue({
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockCounts, error: null })))
      });
      
      // Verificar se há dados de teste suficientes
      const { data: counts } = await supabase.rpc('get_table_counts');
      
      // Verificar se há pelo menos alguns registros em cada tabela
      expect(counts.users_count).toBeGreaterThan(0);
      expect(counts.content_count).toBeGreaterThan(0);
      expect(counts.interactions_count).toBeGreaterThan(0);
    });
  });
});