import { supabase } from '../supabase';
import { User } from '../supabase';

/**
 * Serviço de autenticação para gerenciar operações relacionadas a autenticação com o Supabase
 */
export class AuthService {
  /**
   * Registra um novo usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @param name Nome do usuário
   * @returns Objeto com dados do usuário e possível erro
   */
  static async signUp(email: string, password: string, name: string) {
    try {
      // Registrar usuário na autenticação do Supabase
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error || !data.user) {
        return { user: null, error };
      }
      
      // Inserir dados do usuário na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email, name }]);
        
      if (userError) {
        console.error('Erro ao inserir dados do usuário:', userError);
        return { user: null, error: userError };
      }
      
      // Criar perfil do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id }]);
        
      if (profileError) {
        console.error('Erro ao criar perfil do usuário:', profileError);
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return { user: null, error };
    }
  }

  /**
   * Faz login com email e senha
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Objeto com dados da sessão e possível erro
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { session: data.session, user: data.user, error };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return { session: null, user: null, error };
    }
  }

  /**
   * Faz login com provedor OAuth
   * @param provider Provedor OAuth (google, facebook, github, etc.)
   * @returns Objeto com dados da sessão e possível erro
   */
  static async signInWithOAuth(provider: 'google' | 'facebook' | 'github') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      return { data, error };
    } catch (error) {
      console.error(`Erro ao fazer login com ${provider}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Faz logout do usuário atual
   * @returns Objeto com possível erro
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { error };
    }
  }

  /**
   * Envia email para redefinição de senha
   * @param email Email do usuário
   * @returns Objeto com possível erro
   */
  static async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { data, error };
    } catch (error) {
      console.error('Erro ao enviar email de redefinição de senha:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualiza a senha do usuário
   * @param newPassword Nova senha
   * @returns Objeto com possível erro
   */
  static async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { data, error };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém a sessão atual
   * @returns Objeto com dados da sessão e possível erro
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return { session: null, error };
    }
  }

  /**
   * Obtém o usuário atual
   * @returns Objeto com dados do usuário e possível erro
   */
  static async getCurrentUser() {
    try {
      // Obter usuário da autenticação
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { user: null, error };
      }
      
      // Obter dados completos do usuário da tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (userError) {
        console.error('Erro ao obter dados do usuário:', userError);
        return { user: null, error: userError };
      }
      
      return { user: userData as User, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return { user: null, error };
    }
  }

  /**
   * Atualiza os dados do usuário
   * @param userId ID do usuário
   * @param updates Dados a serem atualizados
   * @returns Objeto com dados atualizados e possível erro
   */
  static async updateUser(userId: string, updates: Partial<User>) {
    try {
      // Atualizar dados na tabela users
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
      return { user: data as User, error };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { user: null, error };
    }
  }

  /**
   * Configura um listener para mudanças no estado de autenticação
   * @param callback Função a ser chamada quando o estado de autenticação mudar
   * @returns Função para remover o listener
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return () => {
      data?.subscription.unsubscribe();
    };
  }
}