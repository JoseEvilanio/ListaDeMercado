import { RealtimeService } from './realtime.service';
import { RealtimeEvent } from './realtime-subscription-manager';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ErrorService } from './error.service';

/**
 * Configuração para canal de tempo real
 */
export interface RealtimeChannelConfig {
  name: string;
  tables: Array<{
    table: string;
    event?: RealtimeEvent;
    schema?: string;
    filter?: string;
  }>;
}

/**
 * Serviço para gerenciar canais de tempo real pré-configurados
 */
export class RealtimeChannelService {
  // Armazenar configurações de canais pré-definidos
  private static channelConfigs: Map<string, RealtimeChannelConfig> = new Map();
  
  /**
   * Registra uma configuração de canal pré-definida
   * @param config Configuração do canal
   */
  static registerChannelConfig(config: RealtimeChannelConfig): void {
    this.channelConfigs.set(config.name, config);
  }
  
  /**
   * Obtém uma configuração de canal pré-definida
   * @param name Nome do canal
   * @returns Configuração do canal ou undefined se não existir
   */
  static getChannelConfig(name: string): RealtimeChannelConfig | undefined {
    return this.channelConfigs.get(name);
  }
  
  /**
   * Cria um canal a partir de uma configuração pré-definida
   * @param name Nome da configuração do canal
   * @returns Promise resolvida quando o canal estiver inscrito
   */
  static createChannelFromConfig(name: string): Promise<void> {
    const config = this.channelConfigs.get(name);
    
    if (!config) {
      return Promise.reject(new Error(`Configuração de canal '${name}' não encontrada`));
    }
    
    return RealtimeService.createMultiTableChannel(config.name, config.tables);
  }
  
  /**
   * Registra um callback para um canal pré-configurado
   * @param channelName Nome do canal
   * @param table Nome da tabela
   * @param event Tipo de evento
   * @param callback Função a ser chamada quando ocorrer um evento
   * @returns Função para cancelar a assinatura
   */
  static registerCallback(
    channelName: string,
    table: string,
    event: RealtimeEvent,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): () => void {
    // Verificar se o canal está configurado
    const config = this.channelConfigs.get(channelName);
    
    if (!config) {
      const error = new Error(`Configuração de canal '${channelName}' não encontrada`);
      ErrorService.logError('Erro ao registrar callback', { error, channelName, table, event });
      throw error;
    }
    
    // Verificar se a tabela está incluída na configuração
    const tableConfig = config.tables.find(t => t.table === table);
    
    if (!tableConfig) {
      const error = new Error(`Tabela '${table}' não está configurada no canal '${channelName}'`);
      ErrorService.logError('Erro ao registrar callback', { error, channelName, table, event });
      throw error;
    }
    
    // Registrar callback
    return RealtimeService.subscribe(
      {
        table,
        event,
        filter: tableConfig.filter,
        schema: tableConfig.schema,
        channelName
      },
      callback
    );
  }
  
  /**
   * Inicializa canais pré-configurados
   * @param channelNames Nomes dos canais a serem inicializados (todos se não especificado)
   * @returns Promise resolvida quando todos os canais estiverem inscritos
   */
  static async initializeChannels(channelNames?: string[]): Promise<void> {
    const names = channelNames || Array.from(this.channelConfigs.keys());
    
    const promises = names.map(name => {
      return this.createChannelFromConfig(name).catch(error => {
        ErrorService.logError(`Erro ao inicializar canal '${name}'`, { error });
        return Promise.resolve(); // Continuar mesmo com erro
      });
    });
    
    await Promise.all(promises);
  }
  
  /**
   * Registra configurações de canais padrão para a aplicação
   */
  static registerDefaultChannels(): void {
    // Canal para listas de compras
    this.registerChannelConfig({
      name: 'shopping_lists',
      tables: [
        { table: 'shopping_lists', event: '*' },
        { table: 'shopping_items', event: '*' }
      ]
    });
    
    // Canal para usuários e perfis
    this.registerChannelConfig({
      name: 'users_profiles',
      tables: [
        { table: 'users', event: '*' },
        { table: 'profiles', event: '*' }
      ]
    });
    
    // Canal para conteúdo e interações
    this.registerChannelConfig({
      name: 'content_interactions',
      tables: [
        { table: 'content', event: '*' },
        { table: 'interactions', event: '*' }
      ]
    });
  }
}

// Registrar canais padrão
RealtimeChannelService.registerDefaultChannels();