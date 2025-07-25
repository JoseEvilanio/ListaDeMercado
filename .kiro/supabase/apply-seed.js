/**
 * Script para aplicar os dados iniciais no Supabase
 * 
 * Este script lê o arquivo seed.sql e o executa no Editor SQL do Supabase.
 * Como não podemos executar diretamente o SQL através da API, este script
 * fornece instruções para copiar e colar o SQL no Editor SQL do Supabase.
 */

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de seed data
const seedPath = path.join(__dirname, 'seed.sql');

// Ler o arquivo de seed data
try {
  const seed = fs.readFileSync(seedPath, 'utf8');
  
  console.log('='.repeat(80));
  console.log('INSTRUÇÕES PARA APLICAR OS DADOS INICIAIS NO SUPABASE');
  console.log('='.repeat(80));
  console.log('\n1. Acesse o dashboard do Supabase: https://app.supabase.io');
  console.log('2. Selecione seu projeto');
  console.log('3. Clique em "SQL Editor" no menu lateral');
  console.log('4. Clique em "New query"');
  console.log('5. Cole o SQL abaixo no editor:');
  console.log('\n' + '-'.repeat(80) + '\n');
  console.log(seed);
  console.log('\n' + '-'.repeat(80) + '\n');
  console.log('6. Clique em "Run" para executar o SQL');
  console.log('\nObs: Se houver erros, verifique se os dados já existem ou se há conflitos com os dados atuais.');
  console.log('='.repeat(80));
} catch (error) {
  console.error('Erro ao ler o arquivo de seed data:', error);
}