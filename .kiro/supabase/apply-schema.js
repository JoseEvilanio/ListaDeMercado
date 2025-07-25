/**
 * Script para aplicar o esquema do banco de dados no Supabase
 * 
 * Este script lê o arquivo schema.sql e o executa no Editor SQL do Supabase.
 * Como não podemos executar diretamente o SQL através da API, este script
 * fornece instruções para copiar e colar o SQL no Editor SQL do Supabase.
 */

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de esquema
const schemaPath = path.join(__dirname, 'schema.sql');

// Ler o arquivo de esquema
try {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('='.repeat(80));
  console.log('INSTRUÇÕES PARA APLICAR O ESQUEMA DO BANCO DE DADOS NO SUPABASE');
  console.log('='.repeat(80));
  console.log('\n1. Acesse o dashboard do Supabase: https://app.supabase.io');
  console.log('2. Selecione seu projeto');
  console.log('3. Clique em "SQL Editor" no menu lateral');
  console.log('4. Clique em "New query"');
  console.log('5. Cole o SQL abaixo no editor:');
  console.log('\n' + '-'.repeat(80) + '\n');
  console.log(schema);
  console.log('\n' + '-'.repeat(80) + '\n');
  console.log('6. Clique em "Run" para executar o SQL');
  console.log('\nObs: Se houver erros, verifique se as tabelas já existem ou se há conflitos com o esquema atual.');
  console.log('='.repeat(80));
} catch (error) {
  console.error('Erro ao ler o arquivo de esquema:', error);
}