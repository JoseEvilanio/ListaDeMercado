import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ServiceWorkerService, RetryService } from "./services";

// Registrar o Service Worker
if (import.meta.env.PROD) {
  ServiceWorkerService.register()
    .then(registration => {
      console.log('Service Worker registrado com sucesso');
      
      // Verificar atualizações periodicamente
      setInterval(() => {
        registration?.update();
      }, 60 * 60 * 1000); // Verificar a cada hora
    })
    .catch(error => {
      console.error('Erro ao registrar Service Worker:', error);
    });
}

// Inicializar o serviço de retry
RetryService.initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
