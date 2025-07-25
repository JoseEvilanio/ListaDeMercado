import { createClient } from '@supabase/supabase-js';
import config from './config';

// Obter configurações do ambiente atual
const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  avatar_url?: string;
  bio?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Content = {
  id: string;
  title: string;
  body: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Interaction = {
  id: string;
  user_id: string;
  content_id: string;
  type: string;
  created_at: string;
};

// Função para verificar se o cliente está conectado
export async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error);
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão com Supabase:', error);
    return false;
  }
}