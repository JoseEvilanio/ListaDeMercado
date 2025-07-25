/**
 * Script para testar as políticas de segurança RLS do Supabase
 * 
 * Este script testa diferentes cenários para verificar se as políticas
 * de segurança estão funcionando corretamente.
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

// Usuários de teste
const testUsers = {
  user1: {
    email: 'user1@example.com',
    password: 'password123',
    name: 'Usuário 1'
  },
  user2: {
    email: 'user2@example.com',
    password: 'password123',
    name: 'Usuário 2'
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Administrador'
  }
};

// Função para registrar resultados de teste
function logTestResult(testName, success, data, error) {
  console.log(`\n=== Teste: ${testName} ===`);
  console.log(`Resultado: ${success ? 'SUCESSO' : 'FALHA'}`);
  if (data) console.log('Dados:', JSON.stringify(data, null, 2));
  if (error) console.log('Erro:', JSON.stringify(error, null, 2));
  console.log('='.repeat(50));
}

// Função para criar usuários de teste
async function createTestUsers() {
  console.log('Criando usuários de teste...');
  
  // Criar usuário 1
  const { user: user1, error: error1 } = await supabase.auth.signUp(testUsers.user1);
  if (error1) {
    console.error('Erro ao criar usuário 1:', error1);
  } else {
    console.log('Usuário 1 criado com sucesso:', user1.id);
    
    // Inserir dados do usuário 1
    const { data: userData1, error: userError1 } = await supabase
      .from('users')
      .insert([{ id: user1.id, email: testUsers.user1.email, name: testUsers.user1.name }]);
      
    if (userError1) console.error('Erro ao inserir dados do usuário 1:', userError1);
  }
  
  // Criar usuário 2
  const { user: user2, error: error2 } = await supabase.auth.signUp(testUsers.user2);
  if (error2) {
    console.error('Erro ao criar usuário 2:', error2);
  } else {
    console.log('Usuário 2 criado com sucesso:', user2.id);
    
    // Inserir dados do usuário 2
    const { data: userData2, error: userError2 } = await supabase
      .from('users')
      .insert([{ id: user2.id, email: testUsers.user2.email, name: testUsers.user2.name }]);
      
    if (userError2) console.error('Erro ao inserir dados do usuário 2:', userError2);
  }
  
  // Criar usuário admin
  const { user: admin, error: errorAdmin } = await supabase.auth.signUp(testUsers.admin);
  if (errorAdmin) {
    console.error('Erro ao criar usuário admin:', errorAdmin);
  } else {
    console.log('Usuário admin criado com sucesso:', admin.id);
    
    // Inserir dados do usuário admin
    const { data: userDataAdmin, error: userErrorAdmin } = await supabase
      .from('users')
      .insert([{ id: admin.id, email: testUsers.admin.email, name: testUsers.admin.name }]);
      
    if (userErrorAdmin) console.error('Erro ao inserir dados do usuário admin:', userErrorAdmin);
    
    // Atualizar role para admin (isso normalmente seria feito por um processo administrativo)
    // Nota: Esta operação requer permissões especiais e pode não funcionar diretamente
    console.log('Nota: A atualização do role para admin requer configuração adicional no Supabase');
  }
  
  return { user1, user2, admin };
}

// Função para testar políticas de segurança
async function testSecurityPolicies() {
  try {
    // Criar usuários de teste
    const { user1, user2 } = await createTestUsers();
    
    if (!user1 || !user2) {
      console.error('Falha ao criar usuários de teste. Abortando testes.');
      return;
    }
    
    // Login como usuário 1
    const { user: loggedUser1, error: loginError1 } = await supabase.auth.signIn({
      email: testUsers.user1.email,
      password: testUsers.user1.password
    });
    
    if (loginError1) {
      console.error('Erro ao fazer login como usuário 1:', loginError1);
      return;
    }
    
    console.log('Login como usuário 1 realizado com sucesso');
    
    // Teste 1: Usuário 1 cria conteúdo próprio
    const { data: contentData1, error: contentError1 } = await supabase
      .from('content')
      .insert([{
        title: 'Conteúdo do Usuário 1',
        body: 'Este é um conteúdo criado pelo usuário 1',
        user_id: loggedUser1.id
      }]);
      
    logTestResult(
      'Usuário 1 cria conteúdo próprio',
      !contentError1,
      contentData1,
      contentError1
    );
    
    // Teste 2: Usuário 1 tenta criar conteúdo como usuário 2
    const { data: contentData2, error: contentError2 } = await supabase
      .from('content')
      .insert([{
        title: 'Conteúdo Falso',
        body: 'Este conteúdo não deveria ser criado',
        user_id: user2.id
      }]);
      
    logTestResult(
      'Usuário 1 tenta criar conteúdo como usuário 2 (deve falhar)',
      contentError2 !== null,
      contentData2,
      contentError2
    );
    
    // Teste 3: Usuário 1 lê seu próprio conteúdo
    const { data: readData1, error: readError1 } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', loggedUser1.id);
      
    logTestResult(
      'Usuário 1 lê seu próprio conteúdo',
      !readError1 && readData1.length > 0,
      readData1,
      readError1
    );
    
    // Logout do usuário 1
    await supabase.auth.signOut();
    
    // Login como usuário 2
    const { user: loggedUser2, error: loginError2 } = await supabase.auth.signIn({
      email: testUsers.user2.email,
      password: testUsers.user2.password
    });
    
    if (loginError2) {
      console.error('Erro ao fazer login como usuário 2:', loginError2);
      return;
    }
    
    console.log('Login como usuário 2 realizado com sucesso');
    
    // Teste 4: Usuário 2 lê conteúdo do usuário 1
    const { data: readData2, error: readError2 } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', loggedUser1.id);
      
    logTestResult(
      'Usuário 2 lê conteúdo do usuário 1',
      !readError2 && readData2.length > 0,
      readData2,
      readError2
    );
    
    // Teste 5: Usuário 2 tenta atualizar conteúdo do usuário 1
    const { data: updateData, error: updateError } = await supabase
      .from('content')
      .update({ title: 'Título Alterado' })
      .eq('user_id', loggedUser1.id);
      
    logTestResult(
      'Usuário 2 tenta atualizar conteúdo do usuário 1 (deve falhar)',
      updateError !== null,
      updateData,
      updateError
    );
    
    // Teste 6: Usuário 2 tenta excluir conteúdo do usuário 1
    const { data: deleteData, error: deleteError } = await supabase
      .from('content')
      .delete()
      .eq('user_id', loggedUser1.id);
      
    logTestResult(
      'Usuário 2 tenta excluir conteúdo do usuário 1 (deve falhar)',
      deleteError !== null,
      deleteData,
      deleteError
    );
    
    console.log('\nTodos os testes foram concluídos!');
    
  } catch (error) {
    console.error('Erro durante os testes:', error);
  }
}

// Executar testes
testSecurityPolicies();