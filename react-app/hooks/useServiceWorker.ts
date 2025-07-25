import { useState, useEffect } from 'react';
import { ServiceWorkerService } from '../services/service-worker.service';

interface UseServiceWorkerResult {
  isServiceWorkerActive: boolean;
  isOnline: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  installPromptEvent: any;
  applyUpdate: () => Promise<void>;
  installApp: () => Promise<void>;
}

/**
 * Hook para gerenciar o Service Worker
 * @returns Estado e funções do Service Worker
 */
const useServiceWorker = (): UseServiceWorkerResult => {
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(ServiceWorkerService.isOnline());
  const [isInstalled, setIsInstalled] = useState<boolean>(ServiceWorkerService.isInstalled());
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  
  // Verificar se o Service Worker está ativo
  useEffect(() => {
    const checkServiceWorker = async () => {
      const isActive = await ServiceWorkerService.isActive();
      setIsServiceWorkerActive(isActive);
    };
    
    checkServiceWorker();
  }, []);
  
  // Adicionar listeners para mudanças no estado da conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const removeListeners = ServiceWorkerService.addConnectionListeners(
      handleOnline,
      handleOffline
    );
    
    return removeListeners;
  }, []);
  
  // Adicionar listener para mensagens do Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    };
    
    const removeListener = ServiceWorkerService.addMessageListener(handleMessage);
    
    return removeListener;
  }, []);
  
  // Adicionar listener para o evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      // Prevenir o prompt padrão
      event.preventDefault();
      
      // Armazenar o evento para uso posterior
      setInstallPromptEvent(event);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Aplicar atualização do Service Worker
  const applyUpdate = async (): Promise<void> => {
    if (updateAvailable) {
      // Enviar mensagem para o Service Worker
      await ServiceWorkerService.sendMessage({ type: 'SKIP_WAITING' });
      
      // Recarregar a página
      window.location.reload();
    }
  };
  
  // Instalar o aplicativo como PWA
  const installApp = async (): Promise<void> => {
    if (installPromptEvent) {
      // Mostrar o prompt de instalação
      installPromptEvent.prompt();
      
      // Aguardar a escolha do usuário
      const choiceResult = await installPromptEvent.userChoice;
      
      // Limpar o evento
      setInstallPromptEvent(null);
      
      // Verificar se o aplicativo foi instalado
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
    }
  };
  
  return {
    isServiceWorkerActive,
    isOnline,
    isInstalled,
    updateAvailable,
    installPromptEvent,
    applyUpdate,
    installApp
  };
};

export default useServiceWorker;