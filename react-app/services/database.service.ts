import { supabase } from '../supabase';
import { User, Profile, Content, Interaction } from '../supabase';

/**
 * Serviço de banco de dados para interagir com o Supabase
 */
export class DatabaseService {
  /**
   * Serviço para operações relacionadas a usuários
   */
  static users = {
    /**
     * Obtém um usuário pelo ID
     * @param id ID do usuário
     * @returns Objeto com dados do usuário e possível erro
     */
    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
          
        return { user: data as User, error };
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        return { user: null, error };
      }
    },
    
    /**
     * Obtém todos os usuários
     * @returns Objeto com lista de usuários e possível erro
     */
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('name');
          
        return { users: data as User[], error };
      } catch (error) {
        console.error('Erro ao obter usuários:', error);
        return { users: [], error };
      }
    },
    
    /**
     * Atualiza um usuário
     * @param id ID do usuário
     * @param updates Dados a serem atualizados
     * @returns Objeto com dados atualizados e possível erro
     */
    update: async (id: string, updates: Partial<User>) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        return { user: data as User, error };
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        return { user: null, error };
      }
    }
  };
  
  /**
   * Serviço para operações relacionadas a perfis
   */
  static profiles = {
    /**
     * Obtém um perfil pelo ID do usuário
     * @param userId ID do usuário
     * @returns Objeto com dados do perfil e possível erro
     */
    getByUserId: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        return { profile: data as Profile, error };
      } catch (error) {
        console.error('Erro ao obter perfil:', error);
        return { profile: null, error };
      }
    },
    
    /**
     * Cria um perfil
     * @param profile Dados do perfil
     * @returns Objeto com dados do perfil criado e possível erro
     */
    create: async (profile: Partial<Profile>) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .insert([profile])
          .select()
          .single();
          
        return { profile: data as Profile, error };
      } catch (error) {
        console.error('Erro ao criar perfil:', error);
        return { profile: null, error };
      }
    },
    
    /**
     * Atualiza um perfil
     * @param userId ID do usuário
     * @param updates Dados a serem atualizados
     * @returns Objeto com dados atualizados e possível erro
     */
    update: async (userId: string, updates: Partial<Profile>) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
          
        return { profile: data as Profile, error };
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { profile: null, error };
      }
    }
  };
  
  /**
   * Serviço para operações relacionadas a conteúdo
   */
  static content = {
    /**
     * Obtém um conteúdo pelo ID
     * @param id ID do conteúdo
     * @returns Objeto com dados do conteúdo e possível erro
     */
    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*, users(name, email)')
          .eq('id', id)
          .single();
          
        return { content: data as Content & { users: Pick<User, 'name' | 'email'> }, error };
      } catch (error) {
        console.error('Erro ao obter conteúdo:', error);
        return { content: null, error };
      }
    },
    
    /**
     * Obtém todos os conteúdos
     * @param options Opções de consulta
     * @returns Objeto com lista de conteúdos e possível erro
     */
    getAll: async (options: {
      page?: number;
      pageSize?: number;
      userId?: string;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    } = {}) => {
      try {
        const {
          page = 1,
          pageSize = 10,
          userId,
          orderBy = 'created_at',
          orderDirection = 'desc'
        } = options;
        
        let query = supabase
          .from('content')
          .select('*, users(name, email)', { count: 'exact' });
          
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error, count } = await query
          .order(orderBy, { ascending: orderDirection === 'asc' })
          .range(from, to);
          
        return {
          contents: data as Array<Content & { users: Pick<User, 'name' | 'email'> }>,
          totalCount: count || 0,
          page,
          pageSize,
          error
        };
      } catch (error) {
        console.error('Erro ao obter conteúdos:', error);
        return { contents: [], totalCount: 0, page: 1, pageSize: 10, error };
      }
    },
    
    /**
     * Cria um conteúdo
     * @param content Dados do conteúdo
     * @returns Objeto com dados do conteúdo criado e possível erro
     */
    create: async (content: Partial<Content>) => {
      try {
        const { data, error } = await supabase
          .from('content')
          .insert([content])
          .select()
          .single();
          
        return { content: data as Content, error };
      } catch (error) {
        console.error('Erro ao criar conteúdo:', error);
        return { content: null, error };
      }
    },
    
    /**
     * Atualiza um conteúdo
     * @param id ID do conteúdo
     * @param updates Dados a serem atualizados
     * @returns Objeto com dados atualizados e possível erro
     */
    update: async (id: string, updates: Partial<Content>) => {
      try {
        const { data, error } = await supabase
          .from('content')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        return { content: data as Content, error };
      } catch (error) {
        console.error('Erro ao atualizar conteúdo:', error);
        return { content: null, error };
      }
    },
    
    /**
     * Exclui um conteúdo
     * @param id ID do conteúdo
     * @returns Objeto com possível erro
     */
    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('content')
          .delete()
          .eq('id', id);
          
        return { error };
      } catch (error) {
        console.error('Erro ao excluir conteúdo:', error);
        return { error };
      }
    },
    
    /**
     * Assina atualizações em tempo real para conteúdos
     * @param callback Função a ser chamada quando houver atualizações
     * @param filters Filtros para a assinatura
     * @returns Função para cancelar a assinatura
     */
    subscribe: (
      callback: (payload: any) => void,
      filters?: { userId?: string; contentId?: string }
    ) => {
      let channel = supabase.channel('public:content');
      
      let filter = 'id=eq.';
      if (filters?.contentId) {
        filter += filters.contentId;
      } else if (filters?.userId) {
        filter = 'user_id=eq.' + filters.userId;
      } else {
        filter = '';
      }
      
      if (filter) {
        channel = channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'content',
          filter
        }, callback);
      } else {
        channel = channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'content'
        }, callback);
      }
      
      channel.subscribe();
      
      return () => {
        channel.unsubscribe();
      };
    }
  };
  
  /**
   * Serviço para operações relacionadas a interações
   */
  static interactions = {
    /**
     * Obtém uma interação pelo ID
     * @param id ID da interação
     * @returns Objeto com dados da interação e possível erro
     */
    getById: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('interactions')
          .select('*, users(name, email), content(title)')
          .eq('id', id)
          .single();
          
        return {
          interaction: data as Interaction & {
            users: Pick<User, 'name' | 'email'>;
            content: Pick<Content, 'title'>;
          },
          error
        };
      } catch (error) {
        console.error('Erro ao obter interação:', error);
        return { interaction: null, error };
      }
    },
    
    /**
     * Obtém interações por conteúdo
     * @param contentId ID do conteúdo
     * @param options Opções de consulta
     * @returns Objeto com lista de interações e possível erro
     */
    getByContent: async (
      contentId: string,
      options: {
        page?: number;
        pageSize?: number;
        type?: string;
        orderBy?: string;
        orderDirection?: 'asc' | 'desc';
      } = {}
    ) => {
      try {
        const {
          page = 1,
          pageSize = 10,
          type,
          orderBy = 'created_at',
          orderDirection = 'desc'
        } = options;
        
        let query = supabase
          .from('interactions')
          .select('*, users(name, email)', { count: 'exact' })
          .eq('content_id', contentId);
          
        if (type) {
          query = query.eq('type', type);
        }
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error, count } = await query
          .order(orderBy, { ascending: orderDirection === 'asc' })
          .range(from, to);
          
        return {
          interactions: data as Array<Interaction & { users: Pick<User, 'name' | 'email'> }>,
          totalCount: count || 0,
          page,
          pageSize,
          error
        };
      } catch (error) {
        console.error('Erro ao obter interações:', error);
        return { interactions: [], totalCount: 0, page: 1, pageSize: 10, error };
      }
    },
    
    /**
     * Obtém interações por usuário
     * @param userId ID do usuário
     * @param options Opções de consulta
     * @returns Objeto com lista de interações e possível erro
     */
    getByUser: async (
      userId: string,
      options: {
        page?: number;
        pageSize?: number;
        type?: string;
        orderBy?: string;
        orderDirection?: 'asc' | 'desc';
      } = {}
    ) => {
      try {
        const {
          page = 1,
          pageSize = 10,
          type,
          orderBy = 'created_at',
          orderDirection = 'desc'
        } = options;
        
        let query = supabase
          .from('interactions')
          .select('*, content(title)', { count: 'exact' })
          .eq('user_id', userId);
          
        if (type) {
          query = query.eq('type', type);
        }
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error, count } = await query
          .order(orderBy, { ascending: orderDirection === 'asc' })
          .range(from, to);
          
        return {
          interactions: data as Array<Interaction & { content: Pick<Content, 'title'> }>,
          totalCount: count || 0,
          page,
          pageSize,
          error
        };
      } catch (error) {
        console.error('Erro ao obter interações:', error);
        return { interactions: [], totalCount: 0, page: 1, pageSize: 10, error };
      }
    },
    
    /**
     * Cria uma interação
     * @param interaction Dados da interação
     * @returns Objeto com dados da interação criada e possível erro
     */
    create: async (interaction: Partial<Interaction>) => {
      try {
        const { data, error } = await supabase
          .from('interactions')
          .insert([interaction])
          .select()
          .single();
          
        return { interaction: data as Interaction, error };
      } catch (error) {
        console.error('Erro ao criar interação:', error);
        return { interaction: null, error };
      }
    },
    
    /**
     * Exclui uma interação
     * @param id ID da interação
     * @returns Objeto com possível erro
     */
    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('interactions')
          .delete()
          .eq('id', id);
          
        return { error };
      } catch (error) {
        console.error('Erro ao excluir interação:', error);
        return { error };
      }
    },
    
    /**
     * Verifica se um usuário já interagiu com um conteúdo
     * @param userId ID do usuário
     * @param contentId ID do conteúdo
     * @param type Tipo de interação
     * @returns Objeto com dados da interação e possível erro
     */
    checkUserInteraction: async (userId: string, contentId: string, type: string) => {
      try {
        const { data, error } = await supabase
          .from('interactions')
          .select('*')
          .eq('user_id', userId)
          .eq('content_id', contentId)
          .eq('type', type)
          .single();
          
        return { interaction: data as Interaction, exists: !!data, error };
      } catch (error) {
        console.error('Erro ao verificar interação:', error);
        return { interaction: null, exists: false, error };
      }
    },
    
    /**
     * Assina atualizações em tempo real para interações
     * @param callback Função a ser chamada quando houver atualizações
     * @param filters Filtros para a assinatura
     * @returns Função para cancelar a assinatura
     */
    subscribe: (
      callback: (payload: any) => void,
      filters?: { userId?: string; contentId?: string; type?: string }
    ) => {
      let channel = supabase.channel('public:interactions');
      
      let filter = '';
      if (filters?.contentId) {
        filter = 'content_id=eq.' + filters.contentId;
      } else if (filters?.userId) {
        filter = 'user_id=eq.' + filters.userId;
      } else if (filters?.type) {
        filter = 'type=eq.' + filters.type;
      }
      
      if (filter) {
        channel = channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter
        }, callback);
      } else {
        channel = channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'interactions'
        }, callback);
      }
      
      channel.subscribe();
      
      return () => {
        channel.unsubscribe();
      };
    }
  };
}