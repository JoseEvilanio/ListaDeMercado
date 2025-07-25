import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { realtimeManager, RealtimeEvent } from './realtime-subscription-manager';

/**
 * Opções para assinaturas em tempo real
 */
export interface RealtimeSubscriptionOptions {
  event?: RealtimeEvent;
  schema?: string;
  table: string;
  filter?: string;
  channelName?: string;
}

/**
 * Serviço para gerenciar assinaturas em tempo real do Supabase
 */
export class RealtimeService {
  /**
   * Gera um nome de canal com base nas opções
   * @param options Opções da assinatura
   * @returns Nome do canal
   */
  private static getChannelName(options: RealtimeSubscriptionOptions): string {
    const { channelName, table, event = '*' } = options;
    
    if (channelName) {
      return channelName;
    }
    
    return `realtime:${table}:${event}`;
  }
  
  /**
   * Assina eventos em tempo real
   * @param options Opções da assinatura
   * @param callback Função a ser chamada quando ocorrer um evento
   * @returns Função para cancelar a assinatura
   */
  static subscribe(
    options: RealtimeSubscriptionOptions,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): () => void {
    const { event = '*', schema = 'public', table, filter } = options;
    const channelName = this.getChannelName(options);
    
    // Verificar se o canal já existe ou criar um novo
    const channelExists = realtimeManager.getChannelNames().includes(channelName);
    
    if (!channelExists) {
      // Criar novo canal com a assinatura
      realtimeManager.createChannel(channelName, [
        { schema, table, event, filter }
      ]).catch(error => {
        console.error(`Erro ao criar canal ${channelName}:`, error);
      });
    }
    
    // Registrar callback
    const callbackId = realtimeManager.registerCallback(
      channelName,
      table,
      event,
      callback
    );
    
    // Retornar função para cancelar a assinatura
    return () => {
      realtimeManager.unregisterCallback(callbackId);
    };
  }
  
  /**
   * Assina eventos de inserção em tempo real
   * @param table Nome da tabela
   * @param callback Função a ser chamada quando ocorrer um evento
   * @param filter Filtro opcional
   * @param channelName Nome do canal opcional
   * @returns Função para cancelar a assinatura
   */
  static onInsert(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    filter?: string,
    channelName?: string
  ): () => void {
    return this.subscribe(
      { event: 'INSERT', table, filter, channelName },
      callback
    );
  }
  
  /**
   * Assina eventos de atualização em tempo real
   * @param table Nome da tabela
   * @param callback Função a ser chamada quando ocorrer um evento
   * @param filter Filtro opcional
   * @param channelName Nome do canal opcional
   * @returns Função para cancelar a assinatura
   */
  static onUpdate(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    filter?: string,
    channelName?: string
  ): () => void {
    return this.subscribe(
      { event: 'UPDATE', table, filter, channelName },
      callback
    );
  }
  
  /**
   * Assina eventos de exclusão em tempo real
   * @param table Nome da tabela
   * @param callback Função a ser chamada quando ocorrer um evento
   * @param filter Filtro opcional
   * @param channelName Nome do canal opcional
   * @returns Função para cancelar a assinatura
   */
  static onDelete(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    filter?: string,
    channelName?: string
  ): () => void {
    return this.subscribe(
      { event: 'DELETE', table, filter, channelName },
      callback
    );
  }
  
  /**
   * Assina todos os eventos em tempo real
   * @param table Nome da tabela
   * @param callback Função a ser chamada quando ocorrer um evento
   * @param filter Filtro opcional
   * @param channelName Nome do canal opcional
   * @returns Função para cancelar a assinatura
   */
  static onAll(
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void,
    filter?: string,
    channelName?: string
  ): () => void {
    return this.subscribe(
      { event: '*', table, filter, channelName },
      callback
    );
  }
  
  /**
   * Cria um canal para múltiplas tabelas
   * @param channelName Nome do canal
   * @param tables Array de configurações de tabelas
   * @returns Promise resolvida quando o canal estiver inscrito
   */
  static createMultiTableChannel(
    channelName: string,
    tables: Array<{
      table: string;
      event?: RealtimeEvent;
      schema?: string;
      filter?: string;
    }>
  ): Promise<void> {
    return realtimeManager.createChannel(channelName, tables);
  }
  
  /**
   * Cancela todas as assinaturas
   */
  static unsubscribeAll(): void {
    realtimeManager.removeAllChannels();
  }
  
  /**
   * Cancela assinaturas de um canal específico
   * @param channelName Nome do canal
   */
  static unsubscribeChannel(channelName: string): void {
    realtimeManager.removeChannel(channelName);
  }
  
  /**
   * Obtém o status atual da conexão
   * @returns Status da conexão
   */
  static getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return realtimeManager.getConnectionStatus();
  }
  
  /**
   * Obtém o número de canais ativos
   * @returns Número de canais
   */
  static getChannelCount(): number {
    return realtimeManager.getChannelCount();
  }
  
  /**
   * Obtém os nomes de todos os canais ativos
   * @returns Lista de nomes de canais
   */
  static getChannelNames(): string[] {
    return realtimeManager.getChannelNames();
  }
}