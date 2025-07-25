/**
 * Script para aplicar o esquema do banco de dados no Supabase usando MCP
 * 
 * Este script lê o arquivo schema.sql e o executa no Supabase usando a API MCP.
 * Para usar este script, você precisa ter configurado o MCP do Supabase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Caminho para o arquivo de esquema
const schemaPath = path.join(__dirname, 'schema.sql');

// Ler o arquivo de esquema
try {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('Aplicando esquema do banco de dados no Supabase...');
  
  // Executar a migração usando MCP
  const command = `node -e "
    const { mcp_supabase_mcp_apply_migration } = require('@supabase/mcp');
    
    async function applyMigration() {
      try {
        const result = await mcp_supabase_mcp_apply_migration({
          project_id: process.env.SUPABASE_PROJECT_ID,
          name: 'initial_schema',
          query: \`${schema.replace(/`/g, '\\`')}\`
        });
        
        console.log('Migração aplicada com sucesso:', result);
      } catch (error) {
        console.error('Erro ao aplicar migração:', error);
      }
    }
    
    applyMigration();
  "`;
  
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao aplicar esquema:', error);
}