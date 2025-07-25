/**
 * Serviço para gerenciar erros de forma consistente
 */
export class ErrorService {
  /**
   * Formata um erro para exibição
   * @param error Erro a ser formatado
   * @returns Mensagem de erro formatada
   */
  static formatError(error: any): string {
    if (!error) {
      return 'Ocorreu um erro desconhecido';
    }
    
    // Erro do Supabase
    if (error.message) {
      return this.formatSupabaseError(error.message);
    }
    
    // Erro genérico
    if (typeof error === 'string') {
      return error;
    }
    
    // Objeto de erro
    if (error.toString) {
      return error.toString();
    }
    
    return 'Ocorreu um erro desconhecido';
  }
  
  /**
   * Formata um erro do Supabase para exibição
   * @param message Mensagem de erro do Supabase
   * @returns Mensagem de erro formatada
   */
  private static formatSupabaseError(message: string): string {
    // Erros de autenticação
    if (message.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    }
    
    if (message.includes('Invalid login credentials')) {
      return 'Credenciais inválidas. Verifique seu email e senha.';
    }
    
    if (message.includes('User already registered')) {
      return 'Este email já está registrado.';
    }
    
    if (message.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    
    // Erros de permissão
    if (message.includes('new row violates row-level security')) {
      return 'Você não tem permissão para realizar esta operação.';
    }
    
    // Erros de conexão
    if (message.includes('Failed to fetch')) {
      return 'Falha na conexão com o servidor. Verifique sua conexão com a internet.';
    }
    
    // Erros de tempo real
    if (message.includes('subscription error')) {
      return 'Erro na assinatura em tempo real. Tente reconectar.';
    }
    
    if (message.includes('channel error')) {
      return 'Erro no canal de comunicação em tempo real.';
    }
    
    // Retornar a mensagem original se não houver formatação específica
    return message;
  }
  
  /**
   * Registra um erro no console e em um serviço de monitoramento (se configurado)
   * @param message Mensagem descritiva sobre o erro
   * @param context Contexto adicional sobre o erro
   */
  static logError(message: string, context?: Record<string, any>): void {
    console.error(`[ERRO] ${message}:`, context);
    
    // Aqui poderia ser implementada a integração com um serviço de monitoramento
    // como Sentry, LogRocket, etc.
  }
  
  /**
   * Cria um objeto de erro padronizado
   * @param message Mensagem de erro
   * @param code Código de erro
   * @param details Detalhes adicionais
   * @returns Objeto de erro padronizado
   */
  static createError(
    message: string,
    code?: string,
    details?: Record<string, any>
  ): Error & { code?: string; details?: Record<string, any> } {
    const error = new Error(message) as Error & {
      code?: string;
      details?: Record<string, any>;
    };
    
    if (code) {
      error.code = code;
    }
    
    if (details) {
      error.details = details;
    }
    
    return error;
  }
  
  /**
   * Verifica se um erro é relacionado à conexão
   * @param error Erro a ser verificado
   * @returns true se for um erro de conexão, false caso contrário
   */
  static isConnectionError(error: any): boolean {
    if (!error) return false;
    
    const message = typeof error === 'string' ? error : error.message;
    
    if (!message) return false;
    
    return (
      message.includes('Failed to fetch') ||
      message.includes('NetworkError') ||
      message.includes('network connection') ||
      message.includes('timeout') ||
      message.includes('socket') ||
      message.includes('connection')
    );
  }
  
  /**
   * Verifica se um erro é relacionado à autenticação
   * @param error Erro a ser verificado
   * @returns true se for um erro de autenticação, false caso contrário
   */
  static isAuthError(error: any): boolean {
    if (!error) return false;
    
    const message = typeof error === 'string' ? error : error.message;
    
    if (!message) return false;
    
    return (
      message.includes('authentication') ||
      message.includes('auth') ||
      message.includes('login') ||
      message.includes('token') ||
      message.includes('credentials') ||
      message.includes('permission') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    );
  }
  
  /**
   * Verifica se um erro é relacionado ao tempo real
   * @param error Erro a ser verificado
   * @returns true se for um erro de tempo real, false caso contrário
   */
  static isRealtimeError(error: any): boolean {
    if (!error) return false;
    
    const message = typeof error === 'string' ? error : error.message;
    
    if (!message) return false;
    
    return (
      message.includes('realtime') ||
      message.includes('subscription') ||
      message.includes('channel') ||
      message.includes('socket') ||
      message.includes('websocket')
    );
  }
}