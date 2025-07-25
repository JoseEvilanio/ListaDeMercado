const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncUsers() {
  console.log('🔄 Sincronizando usuários do auth para public.users...');
  
  try {
    // 1. Fazer login para obter o usuário atual
    console.log('1. Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }
    
    console.log('✅ Login realizado');
    console.log('User ID:', loginData.user.id);
    console.log('Email:', loginData.user.email);
    
    // 2. Verificar se o usuário existe na tabela public.users
    console.log('2. Verificando se usuário existe na tabela users...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Erro ao verificar usuário:', checkError.message);
      return;
    }
    
    if (existingUser) {
      console.log('✅ Usuário já existe na tabela users:', existingUser.name);
    } else {
      console.log('⚠️ Usuário não existe na tabela users, criando...');
      
      // 3. Criar usuário na tabela public.users
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: loginData.user.id,
          email: loginData.user.email,
          name: loginData.user.user_metadata?.name || 'José Evilânio',
        }])
        .select()
        .single();
      
      if (createError) {
        console.log('❌ Erro ao criar usuário:', createError.message);
      } else {
        console.log('✅ Usuário criado na tabela users:', newUser);
        
        // 4. Criar perfil também
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: loginData.user.id,
            bio: 'Usuário do sistema'
          }]);
        
        if (profileError) {
          console.log('⚠️ Erro ao criar perfil:', profileError.message);
        } else {
          console.log('✅ Perfil criado');
        }
      }
    }
    
    // 5. Fazer logout
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
    
    console.log('\n🎉 SINCRONIZAÇÃO CONCLUÍDA!');
    console.log('Agora tente fazer login na aplicação - deve funcionar!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar sincronização
syncUsers();