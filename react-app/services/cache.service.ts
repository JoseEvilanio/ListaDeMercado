/**
 * Serviço de cache para armazenar dados em memória ou localStorage
 */
export class CacheService {
  private static memoryCache: Record<string, { data: any; expiry: number }> = {};
  
  /**
   * Armazena um valor no cache
   * @param key Chave do cache
   * @param data Dados a serem armazenados
   * @param ttl Tempo de vida em milissegundos (padrão: 5 minutos)
   * @param storage Tipo de armazenamento (memory ou localStorage)
   */
  static set(
    key: string,
    data: any,
    ttl: number = 5 * 60 * 1000,
    storage: 'memory' | 'localStorage' = 'memory'
  ): void {
    const expiry = Date.now() + ttl;
    
    if (storage === 'localStorage') {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            data,
            expiry
          })
        );
      } catch (error) {
        console.error('Erro ao armazenar no localStorage:', error);
      }
    } else {
      this.memoryCache[key] = { data, expiry };
    }
  }
  
  /**
   * Obtém um valor do cache
   * @param key Chave do cache
   * @param storage Tipo de armazenamento (memory ou localStorage)
   * @returns Dados armazenados ou null se não encontrado ou expirado
   */
  static get<T>(
    key: string,
    storage: 'memory' | 'localStorage' = 'memory'
  ): T | null {
    const now = Date.now();
    
    if (storage === 'localStorage') {
      try {
        const item = localStorage.getItem(key);
        
        if (!item) return null;
        
        const { data, expiry } = JSON.parse(item);
        
        if (expiry < now) {
          localStorage.removeItem(key);
          return null;
        }
        
        return data as T;
      } catch (error) {
        console.error('Erro ao ler do localStorage:', error);
        return null;
      }
    } else {
      const item = this.memoryCache[key];
      
      if (!item) return null;
      
      if (item.expiry < now) {
        delete this.memoryCache[key];
        return null;
      }
      
      return item.data as T;
    }
  }
  
  /**
   * Remove um valor do cache
   * @param key Chave do cache
   * @param storage Tipo de armazenamento (memory ou localStorage)
   */
  static remove(
    key: string,
    storage: 'memory' | 'localStorage' = 'memory'
  ): void {
    if (storage === 'localStorage') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
      }
    } else {
      delete this.memoryCache[key];
    }
  }
  
  /**
   * Limpa todo o cache
   * @param storage Tipo de armazenamento (memory ou localStorage)
   */
  static clear(storage: 'memory' | 'localStorage' = 'memory'): void {
    if (storage === 'localStorage') {
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
      }
    } else {
      this.memoryCache = {};
    }
  }
  
  /**
   * Obtém um valor do cache ou executa uma função para obtê-lo
   * @param key Chave do cache
   * @param fetchFn Função para obter os dados caso não estejam no cache
   * @param ttl Tempo de vida em milissegundos (padrão: 5 minutos)
   * @param storage Tipo de armazenamento (memory ou localStorage)
   * @returns Dados armazenados ou obtidos pela função
   */
  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000,
    storage: 'memory' | 'localStorage' = 'memory'
  ): Promise<T> {
    const cachedData = this.get<T>(key, storage);
    
    if (cachedData !== null) {
      return cachedData;
    }
    
    const data = await fetchFn();
    this.set(key, data, ttl, storage);
    return data;
  }
}