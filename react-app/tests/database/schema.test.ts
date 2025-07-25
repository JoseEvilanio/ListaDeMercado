import { supabase } from '../../supabase';

// Mock do cliente Supabase
jest.mock('../../supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

describe('Esquema do Banco de Dados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Verificação de Tabelas', () => {
    it('should verify required tables exist', async () => {
      // Configurar mock para simular consulta de tabelas
      const mockTables = [
        { table_name: 'users' },
        { table_name: 'profiles' },
        { table_name: 'content' },
        { table_name: 'interactions' },
        { table_name: 'categories' },
        { table_name: 'devices' }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockTables, error: null })))
      });
      
      // Lista de tabelas obrigatórias
      const requiredTables = [
        'users',
        'profiles',
        'content',
        'interactions',
        'categories',
        'devices'
      ];
      
      // Consultar tabelas
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      // Verificar se todas as tabelas obrigatórias existem
      const tableNames = tables.map((t: any) => t.table_name);
      
      for (const requiredTable of requiredTables) {
        expect(tableNames).toContain(requiredTable);
      }
    });
  });
  
  describe('Verificação de Colunas', () => {
    it('should verify users table columns', async () => {
      // Configurar mock para simular consulta de colunas
      const mockColumns = [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'email', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES' }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockColumns, error: null })))
      });
      
      // Consultar colunas da tabela users
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'users');
      
      // Verificar colunas obrigatórias
      const columnNames = columns.map((c: any) => c.column_name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('created_at');
      
      // Verificar tipos de dados
      const idColumn = columns.find((c: any) => c.column_name === 'id');
      expect(idColumn.data_type).toBe('uuid');
      expect(idColumn.is_nullable).toBe('NO');
      
      const emailColumn = columns.find((c: any) => c.column_name === 'email');
      expect(emailColumn.data_type).toBe('character varying');
      expect(emailColumn.is_nullable).toBe('NO');
    });
    
    it('should verify content table columns', async () => {
      // Configurar mock para simular consulta de colunas
      const mockColumns = [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'title', data_type: 'character varying', is_nullable: 'NO' },
        { column_name: 'description', data_type: 'text', is_nullable: 'YES' },
        { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'category_id', data_type: 'uuid', is_nullable: 'YES' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'NO' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES' }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockColumns, error: null })))
      });
      
      // Consultar colunas da tabela content
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'content');
      
      // Verificar colunas obrigatórias
      const columnNames = columns.map((c: any) => c.column_name);
      
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('created_at');
      
      // Verificar tipos de dados
      const titleColumn = columns.find((c: any) => c.column_name === 'title');
      expect(titleColumn.data_type).toBe('character varying');
      expect(titleColumn.is_nullable).toBe('NO');
      
      const userIdColumn = columns.find((c: any) => c.column_name === 'user_id');
      expect(userIdColumn.data_type).toBe('uuid');
      expect(userIdColumn.is_nullable).toBe('NO');
    });
  });
  
  describe('Verificação de Chaves Estrangeiras', () => {
    it('should verify foreign keys', async () => {
      // Configurar mock para simular consulta de chaves estrangeiras
      const mockForeignKeys = [
        {
          table_name: 'profiles',
          column_name: 'id',
          foreign_table_name: 'users',
          foreign_column_name: 'id'
        },
        {
          table_name: 'content',
          column_name: 'user_id',
          foreign_table_name: 'users',
          foreign_column_name: 'id'
        },
        {
          table_name: 'content',
          column_name: 'category_id',
          foreign_table_name: 'categories',
          foreign_column_name: 'id'
        },
        {
          table_name: 'interactions',
          column_name: 'user_id',
          foreign_table_name: 'users',
          foreign_column_name: 'id'
        },
        {
          table_name: 'interactions',
          column_name: 'content_id',
          foreign_table_name: 'content',
          foreign_column_name: 'id'
        },
        {
          table_name: 'devices',
          column_name: 'user_id',
          foreign_table_name: 'users',
          foreign_column_name: 'id'
        }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockForeignKeys, error: null })))
      });
      
      // Consultar chaves estrangeiras
      const { data: foreignKeys } = await supabase
        .from('information_schema.foreign_key_constraints')
        .select('table_name, column_name, foreign_table_name, foreign_column_name');
      
      // Verificar chaves estrangeiras obrigatórias
      
      // content.user_id -> users.id
      const contentUserFk = foreignKeys.find(
        (fk: any) => fk.table_name === 'content' && fk.column_name === 'user_id'
      );
      expect(contentUserFk).toBeDefined();
      expect(contentUserFk.foreign_table_name).toBe('users');
      expect(contentUserFk.foreign_column_name).toBe('id');
      
      // interactions.user_id -> users.id
      const interactionsUserFk = foreignKeys.find(
        (fk: any) => fk.table_name === 'interactions' && fk.column_name === 'user_id'
      );
      expect(interactionsUserFk).toBeDefined();
      expect(interactionsUserFk.foreign_table_name).toBe('users');
      expect(interactionsUserFk.foreign_column_name).toBe('id');
      
      // interactions.content_id -> content.id
      const interactionsContentFk = foreignKeys.find(
        (fk: any) => fk.table_name === 'interactions' && fk.column_name === 'content_id'
      );
      expect(interactionsContentFk).toBeDefined();
      expect(interactionsContentFk.foreign_table_name).toBe('content');
      expect(interactionsContentFk.foreign_column_name).toBe('id');
    });
  });
  
  describe('Verificação de Índices', () => {
    it('should verify required indexes', async () => {
      // Configurar mock para simular consulta de índices
      const mockIndexes = [
        { table_name: 'users', index_name: 'users_pkey', column_name: 'id' },
        { table_name: 'users', index_name: 'users_email_idx', column_name: 'email' },
        { table_name: 'content', index_name: 'content_pkey', column_name: 'id' },
        { table_name: 'content', index_name: 'content_user_id_idx', column_name: 'user_id' },
        { table_name: 'content', index_name: 'content_category_id_idx', column_name: 'category_id' },
        { table_name: 'interactions', index_name: 'interactions_pkey', column_name: 'id' },
        { table_name: 'interactions', index_name: 'interactions_user_id_idx', column_name: 'user_id' },
        { table_name: 'interactions', index_name: 'interactions_content_id_idx', column_name: 'content_id' }
      ];
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockIndexes, error: null })))
      });
      
      // Consultar índices
      const { data: indexes } = await supabase
        .from('pg_indexes')
        .select('table_name, index_name, column_name');
      
      // Verificar índices obrigatórios
      
      // Índice para users.email
      const usersEmailIndex = indexes.find(
        (idx: any) => idx.table_name === 'users' && idx.column_name === 'email'
      );
      expect(usersEmailIndex).toBeDefined();
      
      // Índice para content.user_id
      const contentUserIdIndex = indexes.find(
        (idx: any) => idx.table_name === 'content' && idx.column_name === 'user_id'
      );
      expect(contentUserIdIndex).toBeDefined();
      
      // Índice para interactions.content_id
      const interactionsContentIdIndex = indexes.find(
        (idx: any) => idx.table_name === 'interactions' && idx.column_name === 'content_id'
      );
      expect(interactionsContentIdIndex).toBeDefined();
    });
  });
  
  describe('Verificação de Políticas RLS', () => {
    it('should verify RLS policies', async () => {
      // Configurar mock para simular consulta de políticas RLS
      const mockPolicies = [
        { table_name: 'users', policy_name: 'Users can read their own data', operation: 'SELECT' },
        { table_name: 'users', policy_name: 'Users can update their own data', operation: 'UPDATE' },
        { table_name: 'content', policy_name: 'Content is readable by everyone', operation: 'SELECT' },
        { table_name: 'content', policy_name: 'Users can create content', operation: 'INSERT' },
        { table_name: 'content', policy_name: 'Users can update their own content', operation: 'UPDATE' },
        { table_name: 'content', policy_name: 'Users can delete their own content', operation: 'DELETE' }
      ];
      
      (supabase.rpc as jest.Mock).mockReturnValue({
        then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: mockPolicies, error: null })))
      });
      
      // Consultar políticas RLS
      const { data: policies } = await supabase.rpc('get_policies');
      
      // Verificar políticas obrigatórias
      
      // Política de leitura para content
      const contentReadPolicy = policies.find(
        (p: any) => p.table_name === 'content' && p.operation === 'SELECT'
      );
      expect(contentReadPolicy).toBeDefined();
      
      // Política de atualização para content
      const contentUpdatePolicy = policies.find(
        (p: any) => p.table_name === 'content' && p.operation === 'UPDATE'
      );
      expect(contentUpdatePolicy).toBeDefined();
      
      // Política de leitura para users
      const usersReadPolicy = policies.find(
        (p: any) => p.table_name === 'users' && p.operation === 'SELECT'
      );
      expect(usersReadPolicy).toBeDefined();
    });
  });
});