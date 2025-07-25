const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUser() {
  console.log('🔧 Corrigindo dados do usuário...');
  
  try {
    // Fazer login para obter o ID do usuário
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (authError || !authData.user) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado');
    console.log('ID do usuário:', authData.user.id);
    
    // Inserir dados do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: 'jose_evilanio@hotmail.com',
        name: 'José Evilânio'
      }])
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Erro ao inserir usuário:', userError);
      
      // Se o usuário já existe, tentar atualizar
      if (userError.code === '23505') {
        console.log('🔄 Usuário já existe, tentando atualizar...');
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ name: 'José Evilânio' })
          .eq('id', authData.user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error('❌ Erro ao atualizar usuário:', updateError);
        } else {
          console.log('✅ Usuário atualizado:', updateData);
        }
      }
    } else {
      console.log('✅ Usuário inserido:', userData);
    }
    
    // Criar perfil do usuário também
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        bio: 'Usuário do sistema'
      }])
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
      
      // Se o perfil já existe, ignorar
      if (profileError.code === '23505') {
        console.log('ℹ️ Perfil já existe');
      }
    } else {
      console.log('✅ Perfil criado:', profileData);
    }
    
    // Fazer logout
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
    
    console.log('\n🎉 Usuário corrigido! Agora você pode fazer login no aplicativo.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar correção
fixUser();