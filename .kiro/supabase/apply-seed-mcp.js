/**
 * Script para aplicar os dados iniciais no Supabase usando MCP
 * 
 * Este script lê o arquivo seed.sql e o executa no Supabase usando a API MCP.
 * Para usar este script, você precisa ter configurado o MCP do Supabase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Caminho para o arquivo de seed data
const seedPath = path.join(__dirname, 'seed.sql');

// Ler o arquivo de seed data
try {
  const seed = fs.readFileSync(seedPath, 'utf8');
  
  console.log('Aplicando dados iniciais no Supabase...');
  
  // Executar a migração usando MCP
  const command = `node -e "
    const { mcp_supabase_mcp_apply_migration } = require('@supabase/mcp');
    
    async function applyMigration() {
      try {
        const result = await mcp_supabase_mcp_apply_migration({
          project_id: process.env.SUPABASE_PROJECT_ID,
          name: 'seed_data',
          query: \`${seed.replace(/`/g, '\\`')}\`
        });
        
        console.log('Dados iniciais aplicados com sucesso:', result);
      } catch (error) {
        console.error('Erro ao aplicar dados iniciais:', error);
      }
    }
    
    applyMigration();
  "`;
  
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Erro ao aplicar dados iniciais:', error);
}