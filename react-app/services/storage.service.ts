import { supabase } from '../supabase';

/**
 * Serviço de armazenamento para gerenciar arquivos no Supabase Storage
 */
export class StorageService {
  /**
   * Faz upload de um arquivo
   * @param bucket Nome do bucket
   * @param path Caminho do arquivo no bucket
   * @param file Arquivo a ser enviado
   * @param options Opções de upload
   * @returns Objeto com dados do arquivo enviado e possível erro
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean }
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);
        
      if (error) {
        throw error;
      }
      
      // Obter URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
        
      return {
        data: {
          ...data,
          publicUrl: publicUrlData.publicUrl
        },
        error: null
      };
    } catch (error) {
      console.error('Erro ao fazer upload de arquivo:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Faz download de um arquivo
   * @param bucket Nome do bucket
   * @param path Caminho do arquivo no bucket
   * @returns Objeto com dados do arquivo e possível erro
   */
  static async downloadFile(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
        
      return { data, error };
    } catch (error) {
      console.error('Erro ao fazer download de arquivo:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Obtém a URL pública de um arquivo
   * @param bucket Nome do bucket
   * @param path Caminho do arquivo no bucket
   * @returns URL pública do arquivo
   */
  static getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  }
  
  /**
   * Lista arquivos em um bucket
   * @param bucket Nome do bucket
   * @param path Caminho dentro do bucket
   * @param options Opções de listagem
   * @returns Objeto com lista de arquivos e possível erro
   */
  static async listFiles(
    bucket: string,
    path?: string,
    options?: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' } }
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, options);
        
      return { data, error };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Remove um arquivo
   * @param bucket Nome do bucket
   * @param paths Caminhos dos arquivos a serem removidos
   * @returns Objeto com dados da remoção e possível erro
   */
  static async removeFiles(bucket: string, paths: string[]) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);
        
      return { data, error };
    } catch (error) {
      console.error('Erro ao remover arquivos:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Cria um bucket
   * @param id ID do bucket
   * @param options Opções do bucket
   * @returns Objeto com dados do bucket criado e possível erro
   */
  static async createBucket(
    id: string,
    options?: { public?: boolean }
  ) {
    try {
      const { data, error } = await supabase.storage
        .createBucket(id, options);
        
      return { data, error };
    } catch (error) {
      console.error('Erro ao criar bucket:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Remove um bucket
   * @param id ID do bucket
   * @returns Objeto com dados da remoção e possível erro
   */
  static async deleteBucket(id: string) {
    try {
      const { data, error } = await supabase.storage
        .deleteBucket(id);
        
      return { data, error };
    } catch (error) {
      console.error('Erro ao remover bucket:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Gera uma URL assinada para um arquivo
   * @param bucket Nome do bucket
   * @param path Caminho do arquivo no bucket
   * @param expiresIn Tempo de expiração em segundos
   * @returns Objeto com URL assinada e possível erro
   */
  static async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
        
      return { data, error };
    } catch (error) {
      console.error('Erro ao criar URL assinada:', error);
      return { data: null, error };
    }
  }
}