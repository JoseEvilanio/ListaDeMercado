import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

// Componente Provider CORRIGIDO
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Refs para evitar loops infinitos
  const initializingRef = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userDataCacheRef = useRef<{ [userId: string]: User }>({});

  // Função para criar usuário fallback
  const createFallbackUser = (sessionUser: any): User => {
    return {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Usuário',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as User;
  };

  // Função para buscar dados do usuário com cache e timeout otimizado
  const fetchUserData = async (userId: string, sessionUser: any): Promise<User> => {
    // Verificar cache primeiro
    if (userDataCacheRef.current[userId]) {
      console.log('📋 Usando dados do usuário do cache:', userDataCacheRef.current[userId].name);
      return userDataCacheRef.current[userId];
    }

    try {
      console.log('📊 Buscando dados do usuário:', userId.substring(0, 8) + '...');
      
      const userPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na busca do usuário')), 1500) // 1.5s timeout
      );
      
      const { data: userData, error: userError } = await Promise.race([
        userPromise,
        timeoutPromise
      ]) as any;
      
      if (userError) {
        throw userError;
      }
      
      console.log('✅ Dados do usuário encontrados:', userData.name);
      // Salvar no cache
      userDataCacheRef.current[userId] = userData as User;
      return userData as User;
      
    } catch (err: any) {
      console.warn('⚠️ Erro na busca do usuário, usando fallback:', err.message);
      // Criar fallback e salvar no cache
      const fallbackUser = createFallbackUser(sessionUser);
      userDataCacheRef.current[userId] = fallbackUser;
      return fallbackUser;
    }
  };

  // Função de inicialização
  const initializeAuth = async () => {
    if (initializingRef.current || initialized) {
      console.log('🔄 Inicialização já em andamento ou concluída');
      return;
    }
    
    initializingRef.current = true;
    console.log('🚀 Inicializando autenticação...');
    
    try {
      // Timeout de segurança
      safetyTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Timeout de segurança ativado - forçando fim do loading');
        setLoading(false);
        setInitialized(true);
      }, 4000); // 4 segundos
      
      // Obter sessão atual
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        throw sessionError;
      }
      
      if (currentSession) {
        console.log('✅ Sessão encontrada:', currentSession.user.email);
        setSession(currentSession);
        
        // Buscar dados do usuário (sempre retorna um usuário)
        const userData = await fetchUserData(currentSession.user.id, currentSession.user);
        setUser(userData);
      } else {
        console.log('ℹ️ Nenhuma sessão ativa');
        setSession(null);
        setUser(null);
      }
      
    } catch (error: any) {
      console.error('❌ Erro na inicialização:', error);
      setSession(null);
      setUser(null);
    } finally {
      // Limpar timeout de segurança
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      
      setLoading(false);
      setInitialized(true);
      initializingRef.current = false;
      console.log('✅ Inicialização concluída');
    }
  };

  useEffect(() => {
    // Inicializar apenas uma vez
    initializeAuth();

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔔 Evento de autenticação:', event);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          
          // Buscar dados do usuário (sempre retorna um usuário)
          const userData = await fetchUserData(currentSession.user.id, currentSession.user);
          setUser(userData);
          
        } else if (event === 'SIGNED_OUT') {
          // Limpar cache ao fazer logout
          userDataCacheRef.current = {};
          setSession(null);
          setUser(null);
        }
        
        // Garantir que loading seja false após eventos de auth
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []); // Array vazio para executar apenas uma vez

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    console.log('🔐 Iniciando signIn para:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('❌ Erro no signIn:', error.message);
      } else {
        console.log('✅ SignIn bem-sucedido');
      }
      
      return { data, error };
    } catch (unexpectedError: any) {
      console.error('❌ Erro inesperado no signIn:', unexpectedError);
      return { data: null, error: unexpectedError };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('📝 Iniciando signUp para:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        console.error('❌ Erro no signUp:', error);
        return { data, error };
      }
      
      if (!data.user) {
        console.error('❌ Usuário não foi criado');
        return { data, error: new Error('Usuário não foi criado') };
      }
      
      console.log('✅ Usuário criado na autenticação');
      
      // Tentar inserir na tabela users (não crítico)
      try {
        const { error: userError } = await supabase
          .from('users')
          .insert([{ 
            id: data.user.id, 
            email, 
            name 
          }]);
          
        if (userError) {
          console.warn('⚠️ Erro ao inserir na tabela users:', userError.message);
        } else {
          console.log('✅ Dados inseridos na tabela users');
        }
      } catch (insertError) {
        console.warn('⚠️ Erro na inserção do usuário:', insertError);
      }
      
      return { data, error: null };
      
    } catch (unexpectedError: any) {
      console.error('❌ Erro inesperado no signUp:', unexpectedError);
      return { data: null, error: unexpectedError };
    }
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Erro no logout:', error);
    } else {
      console.log('✅ Logout realizado');
    }
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