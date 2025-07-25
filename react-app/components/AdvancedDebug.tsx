import React, { useEffect, useState } from 'react';
import { useSupabase } from './SupabaseProvider';
import { supabase } from '../supabase';

export const AdvancedDebug: React.FC = () => {
  const { user, session, loading } = useSupabase();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [connectionTest, setConnectionTest] = useState<string>('Testando...');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      const startTime = Date.now();
      
      try {
        // Teste 1: Conexão básica
        const { data, error } = await supabase.from('users').select('count').limit(1);
        const connectionTime = Date.now() - startTime;
        
        if (error) {
          setConnectionTest(`❌ Erro de conexão (${connectionTime}ms): ${error.message}`);
        } else {
          setConnectionTest(`✅ Conexão OK (${connectionTime}ms)`);
        }
        
        // Teste 2: Sessão atual
        const sessionStart = Date.now();
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const sessionTime = Date.now() - sessionStart;
        
        // Teste 3: Se há sessão, testar busca do usuário
        let userTestResult = 'N/A';
        if (sessionData.session) {
          const userStart = Date.now();
          try {
            const { data: userData, error: userError } = await Promise.race([
              supabase.from('users').select('*').eq('id', sessionData.session.user.id).single(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]) as any;
            
            const userTime = Date.now() - userStart;
            
            if (userError) {
              userTestResult = `❌ Erro busca usuário (${userTime}ms): ${userError.message}`;
            } else {
              userTestResult = `✅ Usuário encontrado (${userTime}ms): ${userData.name}`;
            }
          } catch (err: any) {
            const userTime = Date.now() - userStart;
            userTestResult = `⚠️ Timeout/Erro (${userTime}ms): ${err.message}`;
          }
        }
        
        setDebugInfo({
          connectionTime,
          sessionTime,
          sessionExists: !!sessionData.session,
          sessionUserId: sessionData.session?.user?.id,
          sessionUserEmail: sessionData.session?.user?.email,
          userTestResult,
          totalTime: Date.now() - startTime
        });
        
      } catch (err: any) {
        const totalTime = Date.now() - startTime;
        setConnectionTest(`❌ Erro geral (${totalTime}ms): ${err.message}`);
      }
    };

    testConnection();
    
    // Repetir teste a cada 10 segundos
    const interval = setInterval(testConnection, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: isMinimized ? '8px' : '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: isMinimized ? '200px' : '400px',
      zIndex: 9999,
      border: '2px solid #333',
      transition: 'all 0.3s ease',
      cursor: isMinimized ? 'pointer' : 'default'
    }}
    onClick={isMinimized ? () => setIsMinimized(false) : undefined}
    >
      {/* Header com botão de minimizar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isMinimized ? '0' : '10px'
      }}>
        <h3 style={{ margin: '0', color: '#4CAF50', fontSize: isMinimized ? '11px' : '14px' }}>
          🔍 Debug {isMinimized ? '(clique para expandir)' : 'Avançado'}
        </h3>
        {!isMinimized && (
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            title="Minimizar debug"
          >
            ➖
          </button>
        )}
      </div>
      
      {/* Conteúdo - só mostra se não estiver minimizado */}
      {!isMinimized && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <strong>Estado do Provider:</strong><br/>
            Loading: {loading ? '🔄 Sim' : '❌ Não'}<br/>
            Session: {session ? '✅ Existe' : '❌ Null'}<br/>
            User: {user ? '✅ Existe' : '❌ Null'}<br/>
            {user && <span>Nome: {user.name}<br/></span>}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Teste de Conexão:</strong><br/>
            {connectionTest}
          </div>
          
          {Object.keys(debugInfo).length > 0 && (
            <div>
              <strong>Detalhes dos Testes:</strong><br/>
              Conexão: {debugInfo.connectionTime}ms<br/>
              Sessão: {debugInfo.sessionTime}ms<br/>
              Sessão existe: {debugInfo.sessionExists ? 'Sim' : 'Não'}<br/>
              {debugInfo.sessionUserId && <span>User ID: {debugInfo.sessionUserId.substring(0, 8)}...<br/></span>}
              {debugInfo.sessionUserEmail && <span>Email: {debugInfo.sessionUserEmail}<br/></span>}
              Busca usuário: {debugInfo.userTestResult}<br/>
              <strong>Tempo total: {debugInfo.totalTime}ms</strong>
            </div>
          )}
          
          <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
            Atualiza a cada 10s
          </div>
        </>
      )}
      
      {/* Versão minimizada - mostra apenas status essencial */}
      {isMinimized && (
        <div style={{ fontSize: '10px', lineHeight: '1.2' }}>
          <div>
            {loading ? '🔄' : '✅'} {session ? '🔐' : '❌'} {user ? '👤' : '❌'}
          </div>
          <div style={{ color: '#888', marginTop: '2px' }}>
            {connectionTest.includes('✅') ? '🟢' : connectionTest.includes('❌') ? '🔴' : '🟡'} 
            {debugInfo.totalTime ? ` ${debugInfo.totalTime}ms` : ''}
          </div>
        </div>
      )}
    </div>
  );
};