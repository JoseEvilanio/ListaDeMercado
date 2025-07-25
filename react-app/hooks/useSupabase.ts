import { useState, useEffect } from 'react';
import { supabase, User, Profile, Content, Interaction } from '../supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Hook para autenticação
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
      } else if (session) {
        setSession(session);
        // Obter dados do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError) {
          console.error('Erro ao obter dados do usuário:', userError);
        } else {
          setUser(userData as User);
        }
      }
      
      setLoading(false);
    };

    getSession();

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          // Obter dados do usuário
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (userError) {
            console.error('Erro ao obter dados do usuário:', userError);
          } else {
            setUser(userData as User);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Limpar listener ao desmontar
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Registrar usuário na autenticação
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error || !data.user) {
      return { data, error };
    }
    
    // Inserir dados do usuário na tabela users
    const { error: userError } = await supabase
      .from('users')
      .insert([{ id: data.user.id, email, name }]);
      
    if (userError) {
      console.error('Erro ao inserir dados do usuário:', userError);
      return { data, error: userError };
    }
    
    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  };
}

// Hook para gerenciar perfis de usuário
export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Erro ao obter perfil:', error);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return { error: new Error('ID de usuário não fornecido') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } as Profile : null);
    }
    
    return { data, error };
  };

  return {
    profile,
    loading,
    updateProfile
  };
}

// Hook para gerenciar conteúdo
export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = async (userId?: string) => {
    setLoading(true);
    
    let query = supabase.from('content').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao obter conteúdos:', error);
      setContents([]);
    } else {
      setContents(data as Content[]);
    }
    
    setLoading(false);
  };

  const createContent = async (title: string, body: string, userId: string) => {
    const { data, error } = await supabase
      .from('content')
      .insert([{ title, body, user_id: userId }]);
      
    if (!error) {
      fetchContents();
    }
    
    return { data, error };
  };

  const updateContent = async (id: string, updates: Partial<Content>) => {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id);
      
    if (!error) {
      setContents(prev => 
        prev.map(content => 
          content.id === id ? { ...content, ...updates } as Content : content
        )
      );
    }
    
    return { data, error };
  };

  const deleteContent = async (id: string) => {
    const { data, error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setContents(prev => prev.filter(content => content.id !== id));
    }
    
    return { data, error };
  };

  return {
    contents,
    loading,
    fetchContents,
    createContent,
    updateContent,
    deleteContent
  };
}

// Hook para gerenciar interações
export function useInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = async (contentId?: string, userId?: string) => {
    setLoading(true);
    
    let query = supabase.from('interactions').select('*');
    
    if (contentId) {
      query = query.eq('content_id', contentId);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao obter interações:', error);
      setInteractions([]);
    } else {
      setInteractions(data as Interaction[]);
    }
    
    setLoading(false);
  };

  const createInteraction = async (contentId: string, userId: string, type: string) => {
    const { data, error } = await supabase
      .from('interactions')
      .insert([{ content_id: contentId, user_id: userId, type }]);
      
    if (!error) {
      fetchInteractions(contentId);
    }
    
    return { data, error };
  };

  const deleteInteraction = async (id: string) => {
    const { data, error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setInteractions(prev => prev.filter(interaction => interaction.id !== id));
    }
    
    return { data, error };
  };

  return {
    interactions,
    loading,
    fetchInteractions,
    createInteraction,
    deleteInteraction
  };
}