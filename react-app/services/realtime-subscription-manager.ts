import { supabase } from '../supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ErrorService } from './error.service';

/**
 * Tipos de eventos em tempo real
 */
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Interface para configuração de canal
 */
export interface ChannelConfig {
  name: string;
  tables: TableSubscription[];
}

/**
 * Interface para assinatura de tabela
 */
export interface TableSubscription {
  schema?: string;
  table: string;
  event?: RealtimeEvent;
  filter?: string;
}

/**
 * Interface para callback de evento
 */
export interface EventCallback {
  table: string;
  event: RealtimeEvent;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

/**
 * Gerenciador de assinaturas em tempo real do Supabase
 * Implementa padrão Singleton para garantir uma única instância
 */
export class RealtimeSubscriptionManager {
  private static instance: RealtimeSubscriptionManager;
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, EventCallback[]> = new Map();
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Construtor privado para implementar Singleton
   */
  private constructor() {
    // Inicializar gerenciador
    this.setupConnectionMonitoring();
  }

  /**
   * Obtém a instância única do gerenciador
   * @returns Instância do gerenciador
   */
  public static getInstance(): RealtimeSubscriptionManager {
    if (!RealtimeSubscriptionManager.instance) {
      RealtimeSubscriptionManager.instance = new RealtimeSubscriptionManager();
    }
    return RealtimeSubscriptionManager.instance;
  }

  /**
   * Configura monitoramento de conexão
   */
  private setupConnectionMonitoring(): void {
    // Monitorar estado da conexão
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
  }

  /**
   * Manipula mudanças na conexão
   * @param isOnline Status da conexão
   */
  private handleConnectionChange(isOnline: boolean): void {
    if (isOnline) {
      console.log('Conexão de rede restaurada, reconectando canais...');
      this.reconnectChannels();
    } else {
      console.log('Conexão de rede perdida, canais serão reconectados quando a conexão for restaurada');
      this.connectionStatus = 'disconnected';
    }
  }

  /**
   * Reconecta todos os canais
   */
  private reconnectChannels(): void {
    if (this.connectionStatus === 'connecting') return;
    
    this.connectionStatus = 'connecting';
    this.reconnectAttempts = 0;
    
    // Tentar reconectar com backoff exponencial
    this.attemptReconnect();
  }

  /**
   * Tenta reconectar com backoff exponencial
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Número máximo de tentativas de reconexão atingido');
      this.connectionStatus = 'disconnected';
      return;
    }

    // Limpar timeout anterior se existir
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Calcular tempo de espera com backoff exponencial
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Tentativa de reconexão ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      
      // Recriar todos os canais
      this.recreateAllChannels()
        .then(() => {
          console.log('Canais reconectados com sucesso');
          this.connectionStatus = 'connected';
        })
        .catch(error => {
          console.error('Falha ao reconectar canais:', error);
          this.reconnectAttempts++;
          this.attemptReconnect();
        });
    }, delay);
  }

  /**
   * Recria todos os canais existentes
   */
  private async recreateAllChannels(): Promise<void> {
    // Armazenar configurações de canais atuais
    const channelConfigs: Map<string, ChannelConfig> = new Map();
    
    // Coletar configurações de todos os canais
    this.channels.forEach((channel, channelName) => {
      const config: ChannelConfig = {
        name: channelName,
        tables: []
      };
      
      // Obter callbacks para este canal
      const channelCallbacks = this.callbacks.get(channelName) || [];
      
      // Agrupar callbacks por tabela e evento
      channelCallbacks.forEach(cb => {
        const existingTable = config.tables.find(
          t => t.table === cb.table && t.event === cb.event
        );
        
        if (!existingTable) {
          config.tables.push({
            table: cb.table,
            event: cb.event
          });
        }
      });
      
      channelConfigs.set(channelName, config);
    });
    
    // Limpar canais existentes
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    
    this.channels.clear();
    
    // Recriar canais
    const promises = Array.from(channelConfigs.values()).map(config => {
      return this.createChannel(config.name, config.tables);
    });
    
    await Promise.all(promises);
  }

  /**
   * Cria um novo canal com assinaturas para tabelas
   * @param channelName Nome do canal
   * @param tableSubscriptions Assinaturas de tabelas
   * @returns Promise resolvida quando o canal estiver inscrito
   */
  public async createChannel(
    channelName: string,
    tableSubscriptions: TableSubscription[]
  ): Promise<void> {
    // Verificar se o canal já existe
    if (this.channels.has(channelName)) {
      console.warn(`Canal ${channelName} já existe, será recriado`);
      const existingChannel = this.channels.get(channelName)!;
      existingChannel.unsubscribe();
      this.channels.delete(channelName);
    }
    
    // Criar novo canal
    const channel = supabase.channel(channelName);
    
    // Configurar assinaturas para cada tabela
    tableSubscriptions.forEach(subscription => {
      const { schema = 'public', table, event = '*', filter } = subscription;
      
      channel.on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter
        },
        (payload) => {
          // Disparar callbacks registrados para este canal e tabela
          const channelCallbacks = this.callbacks.get(channelName) || [];
          
          channelCallbacks
            .filter(cb => 
              cb.table === table && 
              (cb.event === event || cb.event === '*' || event === '*')
            )
            .forEach(cb => {
              try {
                cb.callback(payload);
              } catch (error) {
                ErrorService.logError(
                  'Erro ao processar evento em tempo real',
                  { error, channelName, table, event }
                );
              }
            });
        }
      );
    });
    
    // Registrar handlers de status
    channel
      .on('system', { event: 'connected' }, () => {
        console.log(`Canal ${channelName} conectado`);
      })
      .on('system', { event: 'disconnected' }, () => {
        console.log(`Canal ${channelName} desconectado`);
      })
      .on('system', { event: 'error' }, (err) => {
        console.error(`Erro no canal ${channelName}:`, err);
      });
    
    // Inscrever no canal
    return new Promise((resolve, reject) => {
      channel.subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          this.channels.set(channelName, channel);
          resolve();
        } else if (status === 'CHANNEL_ERROR') {
          reject(err);
        }
      });
    });
  }

  /**
   * Registra um callback para eventos em tempo real
   * @param channelName Nome do canal
   * @param table Nome da tabela
   * @param event Tipo de evento
   * @param callback Função a ser chamada quando ocorrer um evento
   * @returns ID único do callback para cancelamento
   */
  public registerCallback(
    channelName: string,
    table: string,
    event: RealtimeEvent,
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): string {
    // Gerar ID único para o callback
    const callbackId = `${channelName}:${table}:${event}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;
    
    // Obter lista de callbacks existentes ou criar nova
    const channelCallbacks = this.callbacks.get(channelName) || [];
    
    // Adicionar novo callback
    channelCallbacks.push({
      table,
      event,
      callback
    });
    
    // Atualizar lista de callbacks
    this.callbacks.set(channelName, channelCallbacks);
    
    return callbackId;
  }

  /**
   * Remove um callback registrado
   * @param callbackId ID do callback a ser removido
   * @returns true se o callback foi removido, false caso contrário
   */
  public unregisterCallback(callbackId: string): boolean {
    const [channelName, table, event] = callbackId.split(':');
    
    if (!channelName || !this.callbacks.has(channelName)) {
      return false;
    }
    
    const channelCallbacks = this.callbacks.get(channelName)!;
    const initialLength = channelCallbacks.length;
    
    // Filtrar callbacks para remover o especificado
    const updatedCallbacks = channelCallbacks.filter(cb => {
      const currentId = `${channelName}:${cb.table}:${cb.event}`;
      return !callbackId.startsWith(currentId);
    });
    
    this.callbacks.set(channelName, updatedCallbacks);
    
    // Verificar se o canal não tem mais callbacks
    if (updatedCallbacks.length === 0) {
      this.removeChannel(channelName);
    }
    
    return updatedCallbacks.length < initialLength;
  }

  /**
   * Remove um canal e cancela todas as assinaturas
   * @param channelName Nome do canal a ser removido
   */
  public removeChannel(channelName: string): void {
    if (!this.channels.has(channelName)) {
      return;
    }
    
    const channel = this.channels.get(channelName)!;
    channel.unsubscribe();
    
    this.channels.delete(channelName);
    this.callbacks.delete(channelName);
  }

  /**
   * Cancela todas as assinaturas e limpa todos os canais
   */
  public removeAllChannels(): void {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    
    this.channels.clear();
    this.callbacks.clear();
  }

  /**
   * Obtém o status atual da conexão
   * @returns Status da conexão
   */
  public getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  /**
   * Obtém o número de canais ativos
   * @returns Número de canais
   */
  public getChannelCount(): number {
    return this.channels.size;
  }

  /**
   * Obtém os nomes de todos os canais ativos
   * @returns Lista de nomes de canais
   */
  public getChannelNames(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Exportar instância única
export const realtimeManager = RealtimeSubscriptionManager.getInstance();