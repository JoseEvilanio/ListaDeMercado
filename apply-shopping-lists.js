const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createShoppingListsTable() {
  console.log('🔧 Criando tabela shopping_lists...');
  
  try {
    // Ler o arquivo SQL
    const sql = fs.readFileSync('create-shopping-lists-table.sql', 'utf8');
    
    // Dividir em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      console.log(`\n${i + 1}. Executando: ${command.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`❌ Erro no comando ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.log(`❌ Erro inesperado no comando ${i + 1}:`, err.message);
      }
    }
    
    // Testar se a tabela foi criada
    console.log('\n🧪 Testando se a tabela foi criada...');
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Tabela não foi criada:', error.message);
      console.log('\n📋 SOLUÇÃO MANUAL:');
      console.log('1. Acesse https://app.supabase.io');
      console.log('2. Vá para SQL Editor');
      console.log('3. Cole o conteúdo do arquivo create-shopping-lists-table.sql');
      console.log('4. Execute o SQL');
    } else {
      console.log('✅ Tabela criada com sucesso!');
      console.log(`Total de registros: ${data || 0}`);
      
      // Testar inserção
      console.log('\n🧪 Testando inserção de lista...');
      const { data: insertData, error: insertError } = await supabase
        .from('shopping_lists')
        .insert([{
          name: 'Lista de Teste',
          description: 'Teste de criação via script',
          user_id: 'd2474a88-ecdf-426e-8599-dda82f58141f'
        }])
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Erro ao inserir:', insertError.message);
      } else {
        console.log('✅ Lista de teste criada:', insertData.name);
        
        // Deletar a lista de teste
        await supabase
          .from('shopping_lists')
          .delete()
          .eq('id', insertData.id);
        console.log('🗑️ Lista de teste removida');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar
createShoppingListsTable();