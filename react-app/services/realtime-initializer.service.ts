import { RealtimeChannelService } from './realtime-channel.service';
import { ErrorService } from './error.service';

/**
 * Serviço para inicializar funcionalidades em tempo real
 */
export class RealtimeInitializerService {
  private static isInitialized = false;

  /**
   * Inicializa todas as funcionalidades em tempo real
   * @returns Promise resolvida quando a inicialização for concluída
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Funcionalidades em tempo real já inicializadas');
      return;
    }

    try {
      console.log('Inicializando funcionalidades em tempo real...');

      // Registrar canais padrão (já feito no RealtimeChannelService)
      
      // Inicializar canais essenciais
      const essentialChannels = ['shopping_lists'];
      await RealtimeChannelService.initializeChannels(essentialChannels);

      this.isInitialized = true;
      console.log('Funcionalidades em tempo real inicializadas com sucesso');
    } catch (error) {
      ErrorService.logError('Erro ao inicializar funcionalidades em tempo real', { error });
      throw error;
    }
  }

  /**
   * Verifica se as funcionalidades em tempo real estão inicializadas
   * @returns true se inicializado, false caso contrário
   */
  static isInitializedStatus(): boolean {
    return this.isInitialized;
  }
}

// Exportar função de inicialização para uso em componentes
export const initializeRealtime = async (): Promise<void> => {
  return RealtimeInitializerService.initialize();
};