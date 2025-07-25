import { useState, useEffect, useCallback } from 'react';
import { OptimizedQueryService } from '../services/optimized-query.service';
import { ErrorService } from '../services/error.service';

interface UseOptimizedQueryOptions {
  enableCache?: boolean;
  cacheTTL?: number;
  cacheStorage?: 'memory' | 'localStorage';
  cacheKeyPrefix?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  retryBackoffFactor?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: any) => void;
}

interface UseOptimizedQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

/**
 * Hook para executar consultas otimizadas com cache e retry
 * @param queryFn Função que executa a consulta
 * @param cacheKey Chave do cache
 * @param dependencies Dependências para reexecutar a consulta
 * @param options Opções de consulta
 * @returns Resultado da consulta
 */
export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  dependencies: any[] = [],
  options: UseOptimizedQueryOptions = {}
): UseOptimizedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  
  const {
    enableCache = true,
    cacheTTL = 5 * 60 * 1000,
    cacheStorage = 'memory',
    cacheKeyPrefix = 'supabase:',
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    retryBackoffFactor = 2,
    onError,
    onSuccess
  } = options;
  
  // Função para invalidar o cache
  const invalidateCache = useCallback(() => {
    OptimizedQueryService.invalidateCache(cacheKey, cacheStorage);
  }, [cacheKey, cacheStorage]);
  
  // Função para executar a consulta
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await OptimizedQueryService.executeQuery(
        queryFn,
        cacheKey,
        {
          enableCache,
          cacheTTL,
          cacheStorage,
          cacheKeyPrefix,
          enableRetry,
          maxRetries,
          retryDelay,
          retryBackoffFactor
        }
      );
      
      setData(result);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err);
      setLoading(false);
      
      if (onError) {
        onError(err);
      } else {
        ErrorService.logError('Erro na consulta otimizada', err);
      }
    }
  }, [
    queryFn,
    cacheKey,
    enableCache,
    cacheTTL,
    cacheStorage,
    cacheKeyPrefix,
    enableRetry,
    maxRetries,
    retryDelay,
    retryBackoffFactor,
    onSuccess,
    onError
  ]);
  
  // Executar consulta quando as dependências mudarem
  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}

/**
 * Hook para executar consultas otimizadas com paginação
 * @param queryFn Função que executa a consulta paginada
 * @param cacheKeyBase Base da chave de cache
 * @param page Página atual
 * @param pageSize Tamanho da página
 * @param dependencies Dependências adicionais
 * @param options Opções de consulta
 * @returns Resultado da consulta paginada
 */
export function useOptimizedPaginatedQuery<T>(
  queryFn: (page: number, pageSize: number) => Promise<{
    data: T[];
    totalCount: number;
    totalPages: number;
  }>,
  cacheKeyBase: string,
  page: number = 1,
  pageSize: number = 10,
  dependencies: any[] = [],
  options: UseOptimizedQueryOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  
  const {
    enableCache = true,
    cacheTTL = 2 * 60 * 1000,
    cacheStorage = 'memory',
    cacheKeyPrefix = 'supabase:',
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    retryBackoffFactor = 2,
    onError,
    onSuccess
  } = options;
  
  // Gerar chave de cache com base na página e tamanho da página
  const cacheKey = `${cacheKeyPrefix}${cacheKeyBase}:page=${page}:size=${pageSize}`;
  
  // Função para invalidar o cache
  const invalidateCache = useCallback(() => {
    // Invalidar todas as páginas relacionadas a esta consulta
    OptimizedQueryService.invalidateCacheByPrefix(
      `${cacheKeyPrefix}${cacheKeyBase}:`,
      cacheStorage
    );
  }, [cacheKeyBase, cacheKeyPrefix, cacheStorage]);
  
  // Função para executar a consulta
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await OptimizedQueryService.executeQuery(
        async () => queryFn(page, pageSize),
        cacheKey,
        {
          enableCache,
          cacheTTL,
          cacheStorage,
          cacheKeyPrefix,
          enableRetry,
          maxRetries,
          retryDelay,
          retryBackoffFactor
        }
      );
      
      setData(result.data);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err);
      setLoading(false);
      
      if (onError) {
        onError(err);
      } else {
        ErrorService.logError('Erro na consulta paginada', err);
      }
    }
  }, [
    queryFn,
    page,
    pageSize,
    cacheKey,
    enableCache,
    cacheTTL,
    cacheStorage,
    cacheKeyPrefix,
    enableRetry,
    maxRetries,
    retryDelay,
    retryBackoffFactor,
    onSuccess,
    onError
  ]);
  
  // Executar consulta quando as dependências mudarem
  useEffect(() => {
    fetchData();
  }, [page, pageSize, ...dependencies, fetchData]);
  
  return {
    data,
    totalCount,
    totalPages,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  };
}