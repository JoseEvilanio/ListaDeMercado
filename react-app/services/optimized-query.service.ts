import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { CacheService } from './cache.service';
import { ErrorService } from './error.service';

/**
 * Opções para consultas otimizadas
 */
export interface OptimizedQueryOptions {
  /** Habilitar cache */
  enableCache?: boolean;
  /** Tempo de vida do cache em milissegundos */
  cacheTTL?: number;
  /** Tipo de armazenamento do cache */
  cacheStorage?: 'memory' | 'localStorage';
  /** Prefixo para a chave do cache */
  cacheKeyPrefix?: string;
  /** Habilitar retry automático */
  enableRetry?: boolean;
  /** Número máximo de tentativas */
  maxRetries?: number;
  /** Tempo de espera entre tentativas (ms) */
  retryDelay?: number;
  /** Fator de crescimento para backoff exponencial */
  retryBackoffFactor?: number;
}

/**
 * Serviço para otimizar consultas ao Supabase
 */
export class OptimizedQueryService {
  /**
   * Opções padrão para consultas
   */
  private static defaultOptions: OptimizedQueryOptions = {
    enableCache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutos
    cacheStorage: 'memory',
    cacheKeyPrefix: 'supabase:',
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    retryBackoffFactor: 2
  };
  
  /**
   * Gera uma chave de cache com base nos parâmetros da consulta
   * @param baseKey Chave base
   * @param params Parâmetros adicionais
   * @param prefix Prefixo da chave
   * @returns Chave de cache
   */
  private static generateCacheKey(
    baseKey: string,
    params: Record<string, any> = {},
    prefix: string = 'supabase:'
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    
    return `${prefix}${baseKey}:${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * Executa uma consulta com retry e cache
   * @param queryFn Função que retorna a consulta
   * @param cacheKey Chave do cache
   * @param options Opções de consulta
   * @returns Resultado da consulta
   */
  static async executeQuery<T>(
    queryFn: () => Promise<T>,
    cacheKey: string,
    options: OptimizedQueryOptions = {}
  ): Promise<T> {
    // Mesclar opções com padrões
    const opts = { ...this.defaultOptions, ...options };
    
    // Verificar cache se habilitado
    if (opts.enableCache) {
      const cachedData = CacheService.get<T>(
        cacheKey,
        opts.cacheStorage
      );
      
      if (cachedData !== null) {
        console.log(`[OptimizedQuery] Cache hit: ${cacheKey}`);
        return cachedData;
      }
    }
    
    // Executar consulta com retry se habilitado
    if (opts.enableRetry) {
      let attempt = 0;
      let lastError: any;
      
      while (attempt < (opts.maxRetries || 3)) {
        try {
          const result = await queryFn();
          
          // Armazenar no cache se habilitado
          if (opts.enableCache) {
            CacheService.set(
              cacheKey,
              result,
              opts.cacheTTL,
              opts.cacheStorage
            );
          }
          
          return result;
        } catch (error) {
          lastError = error;
          attempt++;
          
          // Verificar se deve tentar novamente
          if (attempt < (opts.maxRetries || 3)) {
            const delay = (opts.retryDelay || 1000) * Math.pow(opts.retryBackoffFactor || 2, attempt - 1);
            console.log(`[OptimizedQuery] Retry ${attempt}/${opts.maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // Se chegou aqui, todas as tentativas falharam
      ErrorService.logError('Falha na consulta após várias tentativas', lastError);
      throw lastError;
    } else {
      // Executar consulta sem retry
      try {
        const result = await queryFn();
        
        // Armazenar no cache se habilitado
        if (opts.enableCache) {
          CacheService.set(
            cacheKey,
            result,
            opts.cacheTTL,
            opts.cacheStorage
          );
        }
        
        return result;
      } catch (error) {
        ErrorService.logError('Falha na consulta', error);
        throw error;
      }
    }
  }
  
  /**
   * Invalida uma chave de cache específica
   * @param cacheKey Chave do cache
   * @param storage Tipo de armazenamento
   */
  static invalidateCache(
    cacheKey: string,
    storage: 'memory' | 'localStorage' = 'memory'
  ): void {
    CacheService.remove(cacheKey, storage);
  }
  
  /**
   * Invalida todas as chaves de cache que começam com um prefixo
   * @param prefix Prefixo das chaves
   * @param storage Tipo de armazenamento
   */
  static invalidateCacheByPrefix(
    prefix: string,
    storage: 'memory' | 'localStorage' = 'memory'
  ): void {
    if (storage === 'localStorage') {
      // Para localStorage, precisamos iterar sobre todas as chaves
      try {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Erro ao invalidar cache por prefixo:', error);
      }
    } else {
      // Para memoryCache, podemos filtrar as chaves diretamente
      const memoryCache = (CacheService as any).memoryCache;
      
      if (memoryCache) {
        Object.keys(memoryCache).forEach(key => {
          if (key.startsWith(prefix)) {
            delete memoryCache[key];
          }
        });
      }
    }
  }
  
  /**
   * Otimiza uma consulta do Supabase com paginação
   * @param query Consulta do Supabase
   * @param page Número da página
   * @param pageSize Tamanho da página
   * @returns Consulta otimizada
   */
  static optimizePaginatedQuery<T>(
    query: PostgrestFilterBuilder<any, any, any>,
    page: number = 1,
    pageSize: number = 10
  ): PostgrestFilterBuilder<any, any, any> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Adicionar range para paginação
    return query.range(from, to);
  }
  
  /**
   * Otimiza uma consulta do Supabase com ordenação
   * @param query Consulta do Supabase
   * @param orderBy Campo para ordenação
   * @param ascending Ordenação ascendente
   * @returns Consulta otimizada
   */
  static optimizeOrderedQuery<T>(
    query: PostgrestFilterBuilder<any, any, any>,
    orderBy: string = 'created_at',
    ascending: boolean = false
  ): PostgrestFilterBuilder<any, any, any> {
    // Adicionar ordenação
    return query.order(orderBy, { ascending });
  }
  
  /**
   * Otimiza uma consulta do Supabase com seleção de colunas específicas
   * @param query Consulta do Supabase
   * @param columns Colunas a serem selecionadas
   * @returns Consulta otimizada
   */
  static optimizeColumnSelection<T>(
    query: PostgrestFilterBuilder<any, any, any>,
    columns: string
  ): PostgrestFilterBuilder<any, any, any> {
    // Selecionar apenas as colunas necessárias
    return query.select(columns);
  }
}