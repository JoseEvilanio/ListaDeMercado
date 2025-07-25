const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateList() {
  console.log('🧪 Testando criação de lista...');
  
  try {
    // Fazer login primeiro
    console.log('1. Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }
    
    console.log('✅ Login realizado, usuário:', loginData.user.id);
    
    // Verificar se a tabela existe
    console.log('2. Verificando tabela shopping_lists...');
    const { data: existingLists, error: listError } = await supabase
      .from('shopping_lists')
      .select('count', { count: 'exact', head: true });
    
    if (listError) {
      console.log('❌ Tabela não existe:', listError.message);
      console.log('Código do erro:', listError.code);
      
      if (listError.code === 'PGRST116' || listError.message.includes('does not exist')) {
        console.log('\n📋 SOLUÇÃO:');
        console.log('1. Acesse https://app.supabase.io');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute este SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
        `);
      }
      return;
    }
    
    console.log('✅ Tabela existe, registros:', existingLists || 0);
    
    // Tentar criar uma lista
    console.log('3. Criando lista de teste...');
    const { data: newList, error: createError } = await supabase
      .from('shopping_lists')
      .insert([{
        name: 'Lista de Teste - ' + new Date().toLocaleTimeString(),
        description: 'Lista criada via script de teste',
        user_id: loginData.user.id
      }])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Erro ao criar lista:', createError.message);
      console.log('Código do erro:', createError.code);
      console.log('Detalhes:', createError.details);
    } else {
      console.log('✅ Lista criada com sucesso!');
      console.log('ID:', newList.id);
      console.log('Nome:', newList.name);
      console.log('Criada em:', newList.created_at);
      
      // Buscar todas as listas do usuário
      console.log('4. Buscando todas as listas do usuário...');
      const { data: userLists, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', loginData.user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.log('❌ Erro ao buscar listas:', fetchError.message);
      } else {
        console.log(`✅ Encontradas ${userLists.length} listas:`);
        userLists.forEach((list, index) => {
          console.log(`  ${index + 1}. ${list.name} (${list.created_at})`);
        });
      }
    }
    
    // Fazer logout
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar teste
testCreateList();