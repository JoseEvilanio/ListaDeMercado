const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Para confirmar email, precisamos da service role key
// Esta é uma chave de exemplo - você precisa da sua service role key real
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'sua_service_role_key_aqui';

// Criar cliente Supabase com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Criar cliente normal para testes
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserStatus() {
  console.log('🔍 Verificando status do usuário...');
  
  try {
    // Tentar fazer login para ver o erro específico
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (error) {
      console.log('❌ Erro no login:', error.message);
      console.log('Código do erro:', error.status);
      
      if (error.message.includes('Email not confirmed')) {
        console.log('\n📧 O email não foi confirmado. Vamos tentar resolver isso...');
        return 'email_not_confirmed';
      }
      
      return 'other_error';
    }
    
    if (data.user) {
      console.log('✅ Login realizado com sucesso!');
      console.log('Email confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
      return 'success';
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return 'unexpected_error';
  }
}

async function confirmEmailManually() {
  console.log('\n🔧 Tentando confirmar email manualmente...');
  
  try {
    // Método 1: Usar Admin API para confirmar email
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      'd2474a88-ecdf-426e-8599-dda82f58141f', // ID do usuário
      { email_confirm: true }
    );
    
    if (error) {
      console.log('❌ Erro ao confirmar email via Admin API:', error);
      return false;
    }
    
    console.log('✅ Email confirmado via Admin API:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado ao confirmar email:', error);
    return false;
  }
}

async function resendConfirmationEmail() {
  console.log('\n📧 Reenviando email de confirmação...');
  
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: 'jose_evilanio@hotmail.com'
    });
    
    if (error) {
      console.log('❌ Erro ao reenviar email:', error);
      return false;
    }
    
    console.log('✅ Email de confirmação reenviado:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado ao reenviar email:', error);
    return false;
  }
}

async function createNewUserWithConfirmedEmail() {
  console.log('\n👤 Criando novo usuário com email já confirmado...');
  
  try {
    // Primeiro, deletar o usuário existente se possível
    console.log('Tentando deletar usuário existente...');
    
    // Criar novo usuário com email confirmado
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: 'José Evilânio'
      }
    });
    
    if (error) {
      console.log('❌ Erro ao criar usuário:', error);
      return false;
    }
    
    console.log('✅ Usuário criado com email confirmado:', data.user.id);
    
    // Inserir dados na tabela users
    const { error: userError } = await supabase
      .from('users')
      .upsert([{
        id: data.user.id,
        email: 'jose_evilanio@hotmail.com',
        name: 'José Evilânio'
      }]);
    
    if (userError) {
      console.log('⚠️ Erro ao inserir na tabela users:', userError);
    } else {
      console.log('✅ Dados inseridos na tabela users');
    }
    
    // Criar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([{
        id: data.user.id,
        bio: 'Usuário do sistema'
      }]);
    
    if (profileError) {
      console.log('⚠️ Erro ao criar perfil:', profileError);
    } else {
      console.log('✅ Perfil criado');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado ao criar usuário:', error);
    return false;
  }
}

async function disableEmailConfirmation() {
  console.log('\n⚙️ Informações sobre configuração do Supabase...');
  console.log('Para desabilitar a confirmação de email:');
  console.log('1. Acesse o Dashboard do Supabase');
  console.log('2. Vá para Authentication > Settings');
  console.log('3. Desabilite "Enable email confirmations"');
  console.log('4. Salve as configurações');
  console.log('\nOu use a configuração via código no projeto.');
}

async function runEmailConfirmationFix() {
  console.log('🚀 Iniciando correção do problema de confirmação de email...\n');
  
  // Verificar status atual
  const status = await checkUserStatus();
  
  if (status === 'success') {
    console.log('\n🎉 Usuário já está funcionando corretamente!');
    return;
  }
  
  if (status !== 'email_not_confirmed') {
    console.log('\n❌ Problema diferente de confirmação de email. Verifique os logs acima.');
    return;
  }
  
  console.log('\n🔄 Tentando diferentes soluções...');
  
  // Tentar confirmar email manualmente (requer service role key)
  if (supabaseServiceKey !== 'sua_service_role_key_aqui') {
    const confirmed = await confirmEmailManually();
    if (confirmed) {
      console.log('\n✅ Email confirmado! Testando login...');
      const newStatus = await checkUserStatus();
      if (newStatus === 'success') {
        console.log('🎉 Problema resolvido!');
        return;
      }
    }
  } else {
    console.log('⚠️ Service role key não fornecida. Pulando confirmação manual.');
  }
  
  // Tentar reenviar email de confirmação
  await resendConfirmationEmail();
  
  // Mostrar informações sobre configuração
  await disableEmailConfirmation();
  
  console.log('\n📋 RESUMO DAS SOLUÇÕES:');
  console.log('1. ✅ Forneça a service role key para confirmação automática');
  console.log('2. ✅ Desabilite confirmação de email no Dashboard do Supabase');
  console.log('3. ✅ Verifique seu email para link de confirmação');
  console.log('4. ✅ Use o script com service role key para criar usuário confirmado');
}

// Executar correção
runEmailConfirmationFix();