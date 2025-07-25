const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fvmkpwouqxnhtmlydjui.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8'
);

async function resendConfirmation() {
  console.log('📧 Reenviando email de confirmação para cometa_jal@hotmail.com...');
  
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: 'cometa_jal@hotmail.com'
    });
    
    if (error) {
      console.log('❌ Erro:', error.message);
    } else {
      console.log('✅ Email reenviado com sucesso!');
      console.log('📬 Verifique sua caixa de entrada em cometa_jal@hotmail.com');
    }
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

resendConfirmation();