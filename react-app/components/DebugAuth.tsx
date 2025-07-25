import React, { useState } from 'react';
import { supabase } from '../supabase';

const DebugAuth: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setDebugInfo(null);
    
    try {
      console.log('🧪 Iniciando teste de login...');
      
      // Limpar sessão existente
      console.log('1. Limpando sessão...');
      await supabase.auth.signOut();
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Tentar fazer login
      console.log('2. Fazendo login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'jose_evilanio@hotmail.com',
        password: 'Mae@2106'
      });
      
      const result = {
        timestamp: new Date().toISOString(),
        success: !error,
        error: error ? {
          message: error.message,
          status: error.status,
          code: error.code,
          name: error.name
        } : null,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        } : null,
        session: data.session ? {
          access_token: data.session.access_token ? 'presente' : 'ausente',
          expires_at: data.session.expires_at
        } : null
      };
      
      console.log('Resultado do teste:', result);
      setDebugInfo(result);
      
      if (!error && data.user) {
        // Testar busca na tabela users
        console.log('3. Testando busca na tabela users...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        setDebugInfo(prev => ({
          ...prev,
          userTableQuery: {
            success: !userError,
            error: userError,
            data: userData
          }
        }));
        
        // Fazer logout
        await supabase.auth.signOut();
      }
      
    } catch (error) {
      console.error('Erro no teste:', error);
      setDebugInfo({
        timestamp: new Date().toISOString(),
        success: false,
        error: {
          message: error.message,
          type: 'unexpected_error'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      // Limpar localStorage
      localStorage.clear();
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Limpar sessão do Supabase
      await supabase.auth.signOut();
      
      alert('Cache limpo! Recarregue a página.');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 max-w-md z-50">
      <h3 className="text-white font-semibold mb-3">Debug Auth</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-3 py-2 rounded text-sm"
        >
          {loading ? 'Testando...' : 'Testar Login'}
        </button>
        
        <button
          onClick={clearCache}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
        >
          Limpar Cache
        </button>
      </div>
      
      {debugInfo && (
        <div className="bg-black/20 rounded p-3 text-xs text-white overflow-auto max-h-60">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugAuth;