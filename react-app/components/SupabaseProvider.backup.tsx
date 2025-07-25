import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User } from '../supabase';
import { Session } from '@supabase/supabase-js';

// Definir tipo para o contexto
type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<any>;
};

// Criar contexto
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Hook para usar o contexto
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase deve ser usado dentro de um SupabaseProvider');
  }
  return context;
};

// Componente Provider
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança ativado - parando loading');
      setLoading(false);
    }, 5000); // 5 segundos (reduzido)

    // Obter sessão atual
    const getSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setLoading(false);
        } else if (session) {
          setSession(session);
          
          // Tentar obter dados do usuário com timeout
          try {
            const userPromise = supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout na busca do usuário')), 3000)
            );
            
            const { data: userData, error: userError } = await Promise.race([
              userPromise,
              timeoutPromise
            ]) as any;
            
            if (userError) {
              throw userError;
            }
            
            setUser(userData as User);
            console.log('✅ Dados do usuário carregados:', userData.name);
          } catch (err) {
            console.warn('⚠️ Usando dados do usuário da sessão:', err);
            // Criar usuário com dados da sessão
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as User);
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro inesperado ao obter sessão:', err);
        setLoading(false);
      } finally {
        clearTimeout(safetyTimeout);
      }
    };

    getSession();

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setLoading(true);
          
          // Tentar obter dados do usuário com timeout
          try {
            const { data: userData, error: userError } = await Promise.race([
              supabase.from('users').select('*').eq('id', currentSession.user.id).single(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]) as any;
            
            if (userError) throw userError;
            
            setUser(userData as User);
            console.log('✅ Dados do usuário carregados no listener:', userData.name);
          } catch (err) {
            console.warn('⚠️ Usando dados da sessão no listener:', err);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'Usuário',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as User);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Limpar listener ao desmontar
    return () => {
      authListener?.subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    console.log('🔐 SupabaseProvider: Iniciando signIn para:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('❌ SupabaseProvider: Erro no signIn:', error);
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        console.error('Code:', error.code);
      } else {
        console.log('✅ SupabaseProvider: SignIn bem-sucedido');
        console.log('User ID:', data.user?.id);
      }
      
      return { data, error };
    } catch (unexpectedError) {
      console.error('❌ SupabaseProvider: Erro inesperado no signIn:', unexpectedError);
      return { data: null, error: unexpectedError };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('📝 SupabaseProvider: Iniciando signUp para:', email);
    
    try {
      // Registrar usuário na autenticação
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name // Salvar nome nos metadados
          }
        }
      });
      
      if (error) {
        console.error('❌ Erro no signUp auth:', error);
        return { data, error };
      }
      
      if (!data.user) {
        console.error('❌ Usuário não foi criado');
        return { data, error: new Error('Usuário não foi criado') };
      }
      
      console.log('✅ Usuário criado na autenticação:', data.user.id);
      
      // Tentar inserir dados do usuário na tabela users
      console.log('📊 Tentando inserir na tabela users...');
      const { error: userError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id, 
          email, 
          name 
        }]);
        
      if (userError) {
        console.error('⚠️ Erro ao inserir dados do usuário na tabela:', userError);
        // Não retornar erro aqui, pois o usuário foi criado na autenticação
        // O sistema pode funcionar sem a tabela users usando fallback
      } else {
        console.log('✅ Dados inseridos na tabela users');
      }
      
      // Tentar criar perfil também
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id,
          bio: 'Novo usuário'
        }]);
        
      if (profileError) {
        console.error('⚠️ Erro ao criar perfil:', profileError);
        // Não é crítico se falhar
      } else {
        console.log('✅ Perfil criado');
      }
      
      return { data, error: null };
      
    } catch (unexpectedError) {
      console.error('❌ Erro inesperado no signUp:', unexpectedError);
      return { data: null, error: unexpectedError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};