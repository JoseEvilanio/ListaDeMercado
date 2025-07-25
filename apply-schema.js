const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg1Mzg1MCwiZXhwIjoyMDY4NDI5ODUwfQ.Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7Ej7E'; // Substitua pela sua service key

// Criar cliente Supabase com service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  try {
    console.log('Aplicando esquema do banco de dados...');
    
    // Ler o arquivo de esquema
    const schemaPath = path.join(__dirname, '.kiro', 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir o esquema em comandos individuais
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i] + ';';
      console.log(`Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`Erro no comando ${i + 1}:`, error);
          // Continuar com os próximos comandos mesmo se houver erro
        } else {
          console.log(`Comando ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.error(`Erro ao executar comando ${i + 1}:`, err.message);
      }
    }
    
    console.log('Esquema aplicado com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError);
    } else {
      console.log('Tabelas criadas:', tables.map(t => t.table_name));
    }
    
  } catch (error) {
    console.error('Erro ao aplicar esquema:', error);
  }
}

// Executar o script
applySchema();