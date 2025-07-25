/**
 * Serviço para gerenciar o Service Worker
 */
export class ServiceWorkerService {
  /**
   * Registra o Service Worker
   * @returns Promise que resolve com o registro do Service Worker
   */
  static async register(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registrado com sucesso:', registration);
        return registration;
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
        return null;
      }
    }
    
    console.warn('Service Worker não é suportado neste navegador');
    return null;
  }
  
  /**
   * Verifica se o Service Worker está ativo
   * @returns Verdadeiro se o Service Worker estiver ativo
   */
  static async isActive(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration?.active;
    }
    
    return false;
  }
  
  /**
   * Verifica se o aplicativo está instalado (PWA)
   * @returns Verdadeiro se o aplicativo estiver instalado
   */
  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
  }
  
  /**
   * Verifica se o aplicativo está online
   * @returns Verdadeiro se o aplicativo estiver online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  /**
   * Adiciona um listener para mudanças no estado da conexão
   * @param onlineCallback Função a ser chamada quando ficar online
   * @param offlineCallback Função a ser chamada quando ficar offline
   * @returns Função para remover os listeners
   */
  static addConnectionListeners(
    onlineCallback: () => void,
    offlineCallback: () => void
  ): () => void {
    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);
    
    return () => {
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }
  
  /**
   * Envia uma mensagem para o Service Worker
   * @param message Mensagem a ser enviada
   * @returns Promise que resolve quando a mensagem for enviada
   */
  static async sendMessage(message: any): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }
  
  /**
   * Adiciona um listener para mensagens do Service Worker
   * @param callback Função a ser chamada quando uma mensagem for recebida
   * @returns Função para remover o listener
   */
  static addMessageListener(
    callback: (event: MessageEvent) => void
  ): () => void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', callback);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', callback);
      };
    }
    
    return () => {};
  }
  
  /**
   * Força a atualização do Service Worker
   * @returns Promise que resolve quando o Service Worker for atualizado
   */
  static async update(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        await registration.update();
      }
    }
  }
  
  /**
   * Desregistra o Service Worker
   * @returns Promise que resolve quando o Service Worker for desregistrado
   */
  static async unregister(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        return registration.unregister();
      }
    }
    
    return false;
  }
}