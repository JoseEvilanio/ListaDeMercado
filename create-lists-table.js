const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createListsTable() {
  console.log('📋 Criando tabela de listas...');
  
  try {
    // Executar SQL para criar a tabela
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Criar tabela de listas
        CREATE TABLE IF NOT EXISTS shopping_lists (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          total_amount DECIMAL(10,2) DEFAULT 0.00,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
        CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_at ON shopping_lists(created_at);

        -- Criar trigger para updated_at
        CREATE TRIGGER update_shopping_lists_updated_at
        BEFORE UPDATE ON shopping_lists
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();

        -- Criar tabela de itens das listas
        CREATE TABLE IF NOT EXISTS shopping_list_items (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          quantity INTEGER DEFAULT 1,
          price DECIMAL(10,2) DEFAULT 0.00,
          is_completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Criar índices para itens
        CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);

        -- Criar trigger para updated_at dos itens
        CREATE TRIGGER update_shopping_list_items_updated_at
        BEFORE UPDATE ON shopping_list_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
      `
    });
    
    if (error) {
      console.log('❌ Erro ao criar tabela:', error);
      
      // Tentar método alternativo - executar SQL diretamente
      console.log('🔄 Tentando método alternativo...');
      
      // Criar tabela shopping_lists
      const { error: listError } = await supabase
        .from('shopping_lists')
        .select('id')
        .limit(1);
      
      if (listError && listError.code === 'PGRST116') {
        console.log('ℹ️ Tabela shopping_lists não existe, mas isso é esperado.');
        console.log('📝 Você precisa executar o SQL manualmente no Dashboard do Supabase:');
        console.log('\n--- SQL PARA EXECUTAR ---');
        console.log(`
-- Criar tabela de listas
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_at ON shopping_lists(created_at);

-- Criar trigger para updated_at
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON shopping_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Criar tabela de itens das listas
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para itens
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);

-- Criar trigger para updated_at dos itens
CREATE TRIGGER update_shopping_list_items_updated_at
BEFORE UPDATE ON shopping_list_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
        `);
        console.log('--- FIM DO SQL ---\n');
      }
      
      return false;
    }
    
    console.log('✅ Tabela criada com sucesso:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function testListCreation() {
  console.log('\n🧪 Testando criação de lista...');
  
  try {
    // Fazer login primeiro
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (authError) {
      console.log('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado');
    
    // Tentar criar uma lista
    const { data: listData, error: listError } = await supabase
      .from('shopping_lists')
      .insert([{
        name: 'Lista de Teste',
        description: 'Lista criada para teste',
        user_id: authData.user.id
      }])
      .select()
      .single();
    
    if (listError) {
      console.log('❌ Erro ao criar lista:', listError);
    } else {
      console.log('✅ Lista criada com sucesso:', listData);
      
      // Deletar a lista de teste
      await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listData.id);
      
      console.log('🗑️ Lista de teste removida');
    }
    
    // Fazer logout
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

async function run() {
  const created = await createListsTable();
  
  if (created) {
    await testListCreation();
  }
  
  console.log('\n📋 RESUMO:');
  console.log('1. Execute o SQL no Dashboard do Supabase se necessário');
  console.log('2. Atualize o componente Home.tsx para usar a nova tabela');
  console.log('3. Teste a criação de listas na aplicação');
}

run();