import React from 'react';
import { ResponsiveLayout, Container } from '../components/layout';
import { Card, ConnectionStatus } from '../components/ui';
import { RetryExample, ValidationExample } from '../components/examples';

/**
 * Página de demonstração para o sistema de tratamento de erros
 */
const ErrorHandlingDemo: React.FC = () => {
  return (
    <ResponsiveLayout
      header={
        <div className="flex items-center justify-between w-full">
          <div className="font-bold text-xl">Tratamento de Erros</div>
        </div>
      }
    >
      <Container maxWidth="xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Sistema de Tratamento de Erros</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Esta página demonstra o sistema de tratamento de erros implementado para o aplicativo.
          </p>
        </div>
        
        <ConnectionStatus className="mb-6" />
        
        <div className="space-y-8">
          <RetryExample />
          
          <ValidationExample />
          
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold">Recursos do Sistema de Tratamento de Erros</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Retry Automático</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Retry automático para falhas de conexão</li>
                    <li>Backoff exponencial para evitar sobrecarga do servidor</li>
                    <li>Configuração flexível de estratégias de retry</li>
                    <li>Detecção inteligente de erros retryable</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Operações Offline</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fila de operações para executar quando a conexão for restabelecida</li>
                    <li>Persistência de operações no localStorage</li>
                    <li>Processamento automático quando a conexão for restabelecida</li>
                    <li>Monitoramento do estado da conexão</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Validação e Feedback de Erros</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sistema de validação flexível e extensível</li>
                    <li>Validação em tempo real durante digitação</li>
                    <li>Feedback visual imediato para o usuário</li>
                    <li>Suporte a validação cruzada entre campos</li>
                    <li>Regras de validação personalizáveis</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Formatação de Erros</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Mensagens de erro amigáveis para o usuário</li>
                    <li>Formatação específica para erros do Supabase</li>
                    <li>Registro de erros para depuração</li>
                    <li>Integração com serviços de monitoramento</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </ResponsiveLayout>
  );
};

export default ErrorHandlingDemo;