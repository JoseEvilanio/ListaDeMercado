import { supabase } from '../supabase';
import { User, Profile, Content, Interaction } from '../supabase';
import { OptimizedQueryService } from './optimized-query.service';
import { ErrorService } from './error.service';

/**
 * Opções para consultas de conteúdo
 */
export interface ContentQueryOptions {
  page?: number;
  pageSize?: number;
  userId?: string;
  categoryId?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  search?: string;
  fields?: string;
  includeUser?: boolean;
  enableCache?: boolean;
  cacheTTL?: number;
}

/**
 * Opções para consultas de interação
 */
export interface InteractionQueryOptions {
  page?: number;
  pageSize?: number;
  type?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  enableCache?: boolean;
  cacheTTL?: number;
}

/**
 * Serviço de banco de dados otimizado para interagir com o Supabase
 */
export class OptimizedDatabaseService {
  /**
   * Serviço para operações relacionadas a conteúdo
   */
  static content = {
    /**
     * Obtém um conteúdo pelo ID com cache e retry
     * @param id ID do conteúdo
     * @param options Opções de consulta
     * @returns Objeto com dados do conteúdo e possível erro
     */
    getById: async (id: string, options: {
      includeUser?: boolean;
      enableCache?: boolean;
      cacheTTL?: number;
    } = {}) => {
      try {
        const {
          includeUser = true,
          enableCache = true,
          cacheTTL = 5 * 60 * 1000 // 5 minutos
        } = options;
        
        // Gerar chave de cache
        const cacheKey = OptimizedQueryService.generateCacheKey(
          'content:id',
          { id, includeUser }
        );
        
        // Executar consulta otimizada
        const result = await OptimizedQueryService.executeQuery(
          async () => {
            let query = supabase
              .from('content')
              .select(includeUser ? '*, users(name, email)' : '*')
              .eq('id', id)
              .single();
              
            const { data, error } = await query;
            
            if (error) throw error;
            
            return {
              content: data as Content & { users?: Pick<User, 'name' | 'email'> },
              error: null
            };
          },
          cacheKey,
          { enableCache, cacheTTL }
        );
        
        return result;
      } catch (error) {
        ErrorService.logError('Erro ao obter conteúdo', error);
        return { content: null, error };
      }
    },
    
    /**
     * Obtém todos os conteúdos com paginação, ordenação e cache
     * @param options Opções de consulta
     * @returns Objeto com lista de conteúdos e possível erro
     */
    getAll: async (options: ContentQueryOptions = {}) => {
      try {
        const {
          page = 1,
          pageSize = 10,
          userId,
          categoryId,
          orderBy = 'created_at',
          orderDirection = 'desc',
          search,
          fields,
          includeUser = true,
          enableCache = true,
          cacheTTL = 2 * 60 * 1000 // 2 minutos
        } = options;
        
        // Gerar chave de cache
        const cacheKey = OptimizedQueryService.generateCacheKey(
          'content:all',
          {
            page,
            pageSize,
            userId,
            categoryId,
            orderBy,
            orderDirection,
            search,
            fields,
            includeUser
          }
        );
        
        // Executar consulta otimizada
        const result = await OptimizedQueryService.executeQuery(
          async () => {
            // Construir seleção de campos
            const select = fields || (includeUser ? '*, users(name, email)' : '*');
            
            // Iniciar consulta
            let query = supabase
              .from('content')
              .select(select, { count: 'exact' });
              
            // Aplicar filtros
            if (userId) {
              query = query.eq('user_id', userId);
            }
            
            if (categoryId) {
              query = query.eq('category_id', categoryId);
            }
            
            // Aplicar busca textual se fornecida
            if (search) {
              query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }
            
            // Aplicar paginação
            query = OptimizedQueryService.optimizePaginatedQuery(
              query,
              page,
              pageSize
            );
            
            // Aplicar ordenação
            query = OptimizedQueryService.optimizeOrderedQuery(
              query,
              orderBy,
              orderDirection === 'asc'
            );
            
            // Executar consulta
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            return {
              contents: data as Array<Content & { users?: Pick<User, 'name' | 'email'> }>,
              totalCount: count || 0,
              page,
              pageSize,
              error: null
            };
          },
          cacheKey,
          { enableCache, cacheTTL }
        );
        
        return result;
      } catch (error) {
        ErrorService.logError('Erro ao obter conteúdos', error);
        return { contents: [], totalCount: 0, page: 1, pageSize: 10, error };
      }
    },
    
    /**
     * Cria um conteúdo e invalida caches relacionados
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
          
        // Invalidar caches relacionados
        OptimizedQueryService.invalidateCacheByPrefix('supabase:content:all');
        
        return { content: data as Content, error };
      } catch (error) {
        ErrorService.logError('Erro ao criar conteúdo', error);
        return { content: null, error };
      }
    },
    
    /**
     * Atualiza um conteúdo e invalida caches relacionados
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
          
        // Invalidar caches relacionados
        OptimizedQueryService.invalidateCacheByPrefix(`supabase:content:id:${id}`);
        OptimizedQueryService.invalidateCacheByPrefix('supabase:content:all');
        
        return { content: data as Content, error };
      } catch (error) {
        ErrorService.logError('Erro ao atualizar conteúdo', error);
        return { content: null, error };
      }
    },
    
    /**
     * Exclui um conteúdo e invalida caches relacionados
     * @param id ID do conteúdo
     * @returns Objeto com possível erro
     */
    delete: async (id: string) => {
      try {
        const { error } = await supabase
          .from('content')
          .delete()
          .eq('id', id);
          
        // Invalidar caches relacionados
        OptimizedQueryService.invalidateCacheByPrefix(`supabase:content:id:${id}`);
        OptimizedQueryService.invalidateCacheByPrefix('supabase:content:all');
        
        return { error };
      } catch (error) {
        ErrorService.logError('Erro ao excluir conteúdo', error);
        return { error };
      }
    },
    
    /**
     * Busca conteúdos com otimização para pesquisa
     * @param query Termo de busca
     * @param options Opções de consulta
     * @returns Objeto com resultados da busca e possível erro
     */
    search: async (query: string, options: ContentQueryOptions = {}) => {
      try {
        // Usar a função getAll com o parâmetro de busca
        return await this.getAll({
          ...options,
          search: query,
          // Desabilitar cache para buscas para garantir resultados atualizados
          enableCache: false
        });
      } catch (error) {
        ErrorService.logError('Erro ao buscar conteúdos', error);
        return { contents: [], totalCount: 0, page: 1, pageSize: 10, error };
      }
    },
    
    /**
     * Obtém contagem de conteúdos com cache
     * @param filters Filtros para contagem
     * @returns Objeto com contagem e possível erro
     */
    getCount: async (filters: {
      userId?: string;
      categoryId?: string;
      enableCache?: boolean;
      cacheTTL?: number;
    } = {}) => {
      try {
        const {
          userId,
          categoryId,
          enableCache = true,
          cacheTTL = 5 * 60 * 1000 // 5 minutos
        } = filters;
        
        // Gerar chave de cache
        const cacheKey = OptimizedQueryService.generateCacheKey(
          'content:count',
          { userId, categoryId }
        );
        
        // Executar consulta otimizada
        const result = await OptimizedQueryService.executeQuery(
          async () => {
            let query = supabase
              .from('content')
              .select('*', { count: 'exact', head: true });
              
            if (userId) {
              query = query.eq('user_id', userId);
            }
            
            if (categoryId) {
              query = query.eq('category_id', categoryId);
            }
            
            const { count, error } = await query;
            
            if (error) throw error;
            
            return { count: count || 0, error: null };
          },
          cacheKey,
          { enableCache, cacheTTL }
        );
        
        return result;
      } catch (error) {
        ErrorService.logError('Erro ao obter contagem de conteúdos', error);
        return { count: 0, error };
      }
    }
  };
  
  /**
   * Serviço para operações relacionadas a interações
   */
  static interactions = {
    /**
     * Obtém interações por conteúdo com otimizações
     * @param contentId ID do conteúdo
     * @param options Opções de consulta
     * @returns Objeto com lista de interações e possível erro
     */
    getByContent: async (
      contentId: string,
      options: InteractionQueryOptions = {}
    ) => {
      try {
        const {
          page = 1,
          pageSize = 10,
          type,
          orderBy = 'created_at',
          orderDirection = 'desc',
          enableCache = true,
          cacheTTL = 2 * 60 * 1000 // 2 minutos
        } = options;
        
        // Gerar chave de cache
        const cacheKey = OptimizedQueryService.generateCacheKey(
          'interactions:content',
          { contentId, page, pageSize, type, orderBy, orderDirection }
        );
        
        // Executar consulta otimizada
        const result = await OptimizedQueryService.executeQuery(
          async () => {
            let query = supabase
              .from('interactions')
              .select('*, users(name, email)', { count: 'exact' })
              .eq('content_id', contentId);
              
            if (type) {
              query = query.eq('type', type);
            }
            
            // Aplicar paginação
            query = OptimizedQueryService.optimizePaginatedQuery(
              query,
              page,
              pageSize
            );
            
            // Aplicar ordenação
            query = OptimizedQueryService.optimizeOrderedQuery(
              query,
              orderBy,
              orderDirection === 'asc'
            );
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            return {
              interactions: data as Array<Interaction & { users: Pick<User, 'name' | 'email'> }>,
              totalCount: count || 0,
              page,
              pageSize,
              error: null
            };
          },
          cacheKey,
          { enableCache, cacheTTL }
        );
        
        return result;
      } catch (error) {
        ErrorService.logError('Erro ao obter interações', error);
        return { interactions: [], totalCount: 0, page: 1, pageSize: 10, error };
      }
    },
    
    /**
     * Cria uma interação e invalida caches relacionados
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
          
        // Invalidar caches relacionados
        if (interaction.content_id) {
          OptimizedQueryService.invalidateCacheByPrefix(`supabase:interactions:content:${interaction.content_id}`);
        }
        
        if (interaction.user_id) {
          OptimizedQueryService.invalidateCacheByPrefix(`supabase:interactions:user:${interaction.user_id}`);
        }
        
        return { interaction: data as Interaction, error };
      } catch (error) {
        ErrorService.logError('Erro ao criar interação', error);
        return { interaction: null, error };
      }
    },
    
    /**
     * Exclui uma interação e invalida caches relacionados
     * @param id ID da interação
     * @param contentId ID do conteúdo relacionado
     * @param userId ID do usuário relacionado
     * @returns Objeto com possível erro
     */
    delete: async (id: string, contentId?: string, userId?: string) => {
      try {
        // Obter dados da interação se contentId ou userId não forem fornecidos
        if (!contentId || !userId) {
          const { data } = await supabase
            .from('interactions')
            .select('content_id, user_id')
            .eq('id', id)
            .single();
            
          if (data) {
            contentId = contentId || data.content_id;
            userId = userId || data.user_id;
          }
        }
        
        // Excluir interação
        const { error } = await supabase
          .from('interactions')
          .delete()
          .eq('id', id);
          
        // Invalidar caches relacionados
        if (contentId) {
          OptimizedQueryService.invalidateCacheByPrefix(`supabase:interactions:content:${contentId}`);
        }
        
        if (userId) {
          OptimizedQueryService.invalidateCacheByPrefix(`supabase:interactions:user:${userId}`);
        }
        
        return { error };
      } catch (error) {
        ErrorService.logError('Erro ao excluir interação', error);
        return { error };
      }
    },
    
    /**
     * Obtém contagem de interações por tipo
     * @param contentId ID do conteúdo
     * @param type Tipo de interação
     * @returns Objeto com contagem e possível erro
     */
    getCountByType: async (contentId: string, type: string) => {
      try {
        // Gerar chave de cache
        const cacheKey = OptimizedQueryService.generateCacheKey(
          'interactions:count',
          { contentId, type }
        );
        
        // Executar consulta otimizada
        const result = await OptimizedQueryService.executeQuery(
          async () => {
            const { count, error } = await supabase
              .from('interactions')
              .select('*', { count: 'exact', head: true })
              .eq('content_id', contentId)
              .eq('type', type);
              
            if (error) throw error;
            
            return { count: count || 0, error: null };
          },
          cacheKey,
          { cacheTTL: 2 * 60 * 1000 } // 2 minutos
        );
        
        return result;
      } catch (error) {
        ErrorService.logError('Erro ao obter contagem de interações', error);
        return { count: 0, error };
      }
    }
  };
  
  /**
   * Serviço para operações relacionadas a usuários
   */
  static users = {
    /**
     * Obtém um usuário pelo ID com cache
     * @param id ID do usuário
     * @returns Objeto com dados do usuário e possível erro
     */
    getById: async (id: string) => {
      try {
        // Gerar chave de cache
        const cacheKey = OptimizedQueryService.generateCacheKey(
          'users:id',
          { id }
        );
        
        // Executar consulta otimizada
        const result = await OptimizedQueryService.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', id)
              .single();
              
            if (error) throw error;
            
            return { user: data as User, error: null };
          },
          cacheKey,
          { cacheTTL: 10 * 60 * 1000 } // 10 minutos
        );
        
        return result;
      } catch (error) {
        ErrorService.logError('Erro ao obter usuário', error);
        return { user: null, error };
      }
    },
    
    /**
     * Atualiza um usuário e invalida caches relacionados
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
          
        // Invalidar caches relacionados
        OptimizedQueryService.invalidateCacheByPrefix(`supabase:users:id:${id}`);
        
        return { user: data as User, error };
      } catch (error) {
        ErrorService.logError('Erro ao atualizar usuário', error);
        return { user: null, error };
      }
    }
  };
}