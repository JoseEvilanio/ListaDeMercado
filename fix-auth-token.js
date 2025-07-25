const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAuthToken() {
  console.log('🔧 Corrigindo problemas de token de autenticação...');
  
  try {
    // 1. Limpar sessão atual
    console.log('1. Limpando sessão atual...');
    await supabase.auth.signOut();
    console.log('✅ Sessão limpa');
    
    // 2. Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Tentar fazer login novamente
    console.log('2. Fazendo login novamente...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (error) {
      console.log('❌ Erro no login:', error.message);
      
      if (error.message.includes('Email logins are disabled')) {
        console.log('\n⚠️ PROBLEMA: Email logins estão desabilitados');
        console.log('SOLUÇÃO:');
        console.log('1. Acesse https://app.supabase.io');
        console.log('2. Vá para Authentication → Settings');
        console.log('3. Habilite "Enable email logins"');
        console.log('4. Clique em Save');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\n⚠️ PROBLEMA: Email não confirmado');
        console.log('SOLUÇÃO:');
        console.log('1. Verifique o email jose_evilanio@hotmail.com');
        console.log('2. Clique no link de confirmação');
        console.log('3. Ou desabilite confirmação de email no Dashboard');
      }
      
      return false;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Token válido até:', new Date(data.session.expires_at * 1000).toLocaleString());
    
    // 4. Testar operação no banco
    console.log('3. Testando operação no banco...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.log('❌ Erro ao buscar usuário:', userError.message);
    } else {
      console.log('✅ Usuário encontrado:', userData.name);
    }
    
    // 5. Fazer logout
    console.log('4. Fazendo logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function checkSupabaseConfig() {
  console.log('\n🔍 Verificando configuração do Supabase...');
  
  try {
    // Testar conectividade básica
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Conectividade com Supabase OK');
    } else {
      console.log('❌ Problema de conectividade:', response.status);
    }
    
    // Verificar se a chave está válida
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Erro na configuração:', error.message);
    } else {
      console.log('✅ Configuração de autenticação OK');
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

async function run() {
  await checkSupabaseConfig();
  const fixed = await fixAuthToken();
  
  console.log('\n📋 RESUMO:');
  if (fixed) {
    console.log('✅ Problemas de token corrigidos!');
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('1. Limpe o cache do navegador (Ctrl+Shift+Delete)');
    console.log('2. Recarregue a aplicação');
    console.log('3. Faça login novamente');
  } else {
    console.log('❌ Problemas persistem');
    console.log('💡 SOLUÇÕES:');
    console.log('1. Habilite email logins no Dashboard do Supabase');
    console.log('2. Confirme o email se necessário');
    console.log('3. Limpe o cache do navegador');
    console.log('4. Use modo incógnito para testar');
  }
}

run();