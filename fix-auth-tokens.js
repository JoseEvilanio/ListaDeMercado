const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAuthTokens() {
  console.log('🔧 Corrigindo problemas de autenticação...');
  
  try {
    // Limpar sessão completamente
    console.log('1. Limpando sessão atual...');
    await supabase.auth.signOut();
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar se a sessão foi limpa
    console.log('2. Verificando se a sessão foi limpa...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
      console.log('⚠️ Ainda há uma sessão ativa:', session.user.email);
    } else {
      console.log('✅ Sessão limpa com sucesso');
    }
    
    // Testar novo login
    console.log('3. Testando novo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email logins are disabled')) {
        console.log('\n📋 SOLUÇÃO:');
        console.log('1. Acesse https://app.supabase.io');
        console.log('2. Vá para Authentication → Settings');
        console.log('3. Habilite "Enable email logins"');
        console.log('4. Clique em Save');
      } else if (loginError.message.includes('Email not confirmed')) {
        console.log('\n📧 SOLUÇÃO:');
        console.log('1. Verifique o email jose_evilanio@hotmail.com');
        console.log('2. Clique no link de confirmação');
        console.log('3. Ou desabilite confirmação de email no Dashboard');
      }
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('Usuário:', loginData.user.email);