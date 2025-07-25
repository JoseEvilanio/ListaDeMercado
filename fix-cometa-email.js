const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixCometaEmail() {
  console.log('🔧 Corrigindo email cometa_jal@hotmail.com...');
  
  try {
    // Primeiro, vamos tentar registrar o usuário
    console.log('1. Tentando registrar o usuário...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'cometa_jal@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (signUpError) {
      console.log('❌ Erro no registro:', signUpError.message);
      
      // Se o usuário já existe, vamos tentar reenviar confirmação
      if (signUpError.message.includes('already registered')) {
        console.log('2. Usuário já existe, reenviando confirmação...');
        const { data: resendData, error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: 'cometa_jal@hotmail.com'
        });
        
        if (resendError) {
          console.log('❌ Erro ao reenviar:', resendError);
        } else {
          console.log('✅ Email de confirmação reenviado:', resendData);
          console.log('📧 Verifique sua caixa de entrada em cometa_jal@hotmail.com');
        }
      }
    } else {
      console.log('✅ Usuário registrado:', signUpData.user?.id);
      console.log('📧 Verifique sua caixa de entrada em cometa_jal@hotmail.com para confirmar o email');
      
      // Se o usuário foi criado, inserir na tabela users
      if (signUpData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: signUpData.user.id,
            email: 'cometa_jal@hotmail.com',
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
          .insert([{
            id: signUpData.user.id,
            bio: 'Usuário do sistema'
          }]);
        
        if (profileError) {
          console.log('⚠️ Erro ao criar perfil:', profileError);
        } else {
          console.log('✅ Perfil criado');
        }
      }
    }
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verifique o email cometa_jal@hotmail.com');
    console.log('2. Clique no link de confirmação');
    console.log('3. Tente fazer login novamente na aplicação');
    console.log('\nOu use o email jose_evilanio@hotmail.com que já está confirmado.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar correção
fixCometaEmail();