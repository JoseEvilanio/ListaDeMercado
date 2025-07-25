const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createShoppingListsTable() {
  console.log('🔧 Criando tabela shopping_lists...');
  
  try {
    // Primeiro, vamos testar se conseguimos executar SQL
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('❌ Tabela shopping_lists não existe');
        console.log('\n📋 VOCÊ PRECISA EXECUTAR ESTE SQL NO DASHBOARD DO SUPABASE:');
        console.log('='.repeat(60));
        console.log(`
-- Criar tabela de listas de compras
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON shopping_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias listas
CREATE POLICY "Usuários podem ver suas próprias listas"
  ON shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários criarem listas
CREATE POLICY "Usuários podem criar listas"
  ON shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias listas
CREATE POLICY "Usuários podem atualizar suas próprias listas"
  ON shopping_lists FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias listas
CREATE POLICY "Usuários podem deletar suas próprias listas"
  ON shopping_lists FOR DELETE
  USING (auth.uid() = user_id);
        `);
        console.log('='.repeat(60));
        console.log('\n📝 COMO EXECUTAR:');
        console.log('1. Acesse https://app.supabase.io');
        console.log('2. Selecione seu projeto: fvmkpwouqxnhtmlydjui');
        console.log('3. Vá para SQL Editor');
        console.log('4. Cole o SQL acima');
        console.log('5. Execute o SQL');
        console.log('6. Tente criar uma lista novamente na aplicação');
        
        return false;
      } else {
        console.log('❌ Outro erro:', error);
        return false;
      }
    } else {
      console.log('✅ Tabela shopping_lists já existe!');
      console.log('Total de listas:', data || 0);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function testCreateList() {
  console.log('\n🧪 Testando criação de lista...');
  
  try {
    // Primeiro fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'jose_evilanio@hotmail.com',
      password: 'Mae@2106'
    });
    
    if (authError) {
      console.log('❌ Erro no login:', authError.message);
      return;
    }
    
    console.log('✅ Login realizado');
    
    // Tentar criar uma lista
    const { data: listData, error: listError } = await supabase
      .from('shopping_lists')
      .insert([{
        name: 'Lista de Teste',
        description: 'Lista criada via script de teste',
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

async function runTests() {
  const tableExists = await createShoppingListsTable();
  
  if (tableExists) {
    await testCreateList();
    console.log('\n🎉 Tudo funcionando! Você pode criar listas na aplicação.');
  } else {
    console.log('\n⚠️ Execute o SQL no Dashboard do Supabase primeiro.');
  }
}

runTests();