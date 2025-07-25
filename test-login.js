const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testando conexão com o Supabase...');
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    return false;
  }
}

async function testLogin(email, password) {
  console.log(`\n🔐 Testando login com: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Erro no login:', error);
      console.error('Código do erro:', error.status);
      console.error('Mensagem:', error.message);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Login realizado com sucesso!');
      console.log('ID do usuário:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Confirmado:', data.user.email_confirmed_at ? 'Sim' : 'Não');
      
      // Tentar obter dados da tabela users
      console.log('\n📊 Verificando dados na tabela users...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (userError) {
        console.error('❌ Erro ao obter dados do usuário:', userError);
        console.error('Código:', userError.code);
        console.error('Detalhes:', userError.details);
        console.error('Dica:', userError.hint);
      } else {
        console.log('✅ Dados do usuário encontrados:', userData);
      }
      
      return true;
    }
    
    console.log('⚠️ Login sem erro, mas sem usuário retornado');
    return false;
    
  } catch (error) {
    console.error('❌ Erro inesperado no login:', error);
    return false;
  }
}

async function testSignUp(email, password, name) {
  console.log(`\n📝 Testando registro com: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Erro no registro:', error);
      console.error('Código do erro:', error.status);
      console.error('Mensagem:', error.message);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Registro realizado com sucesso!');
      console.log('ID do usuário:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Confirmação necessária:', data.user.email_confirmed_at ? 'Não' : 'Sim');
      
      // Se o usuário foi criado, tentar inserir na tabela users
      if (data.user.email_confirmed_at || !data.user.email_confirmed_at) {
        console.log('\n📊 Inserindo dados na tabela users...');
        const { error: userError } = await supabase
          .from('users')
          .insert([{ 
            id: data.user.id, 
            email: email, 
            name: name 
          }]);
          
        if (userError) {
          console.error('❌ Erro ao inserir dados do usuário:', userError);
          console.error('Código:', userError.code);
          console.error('Detalhes:', userError.details);
        } else {
          console.log('✅ Dados do usuário inseridos com sucesso');
        }
      }
      
      return true;
    }
    
    console.log('⚠️ Registro sem erro, mas sem usuário retornado');
    return false;
    
  } catch (error) {
    console.error('❌ Erro inesperado no registro:', error);
    return false;
  }
}

async function checkTables() {
  console.log('\n🗄️ Verificando se as tabelas existem...');
  
  try {
    // Tentar fazer uma consulta simples na tabela users
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Tabela users não existe ou não é acessível:', error);
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
      return false;
    }
    
    console.log('✅ Tabela users existe e é acessível');
    console.log('Total de usuários:', data || 0);
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de autenticação...\n');
  
  // Teste 1: Conexão
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Falha na conexão. Parando testes.');
    return;
  }
  
  // Teste 2: Verificar tabelas
  const tablesOk = await checkTables();
  if (!tablesOk) {
    console.log('\n⚠️ Tabelas não existem. Isso pode causar problemas no login.');
  }
  
  // Teste 3: Tentar login
  const email = 'jose_evilanio@hotmail.com';
  const password = 'Mae@2106';
  const name = 'José Evilânio';
  
  const loginOk = await testLogin(email, password);
  
  if (!loginOk) {
    console.log('\n🔄 Login falhou. Tentando registrar usuário...');
    const signUpOk = await testSignUp(email, password, name);
    
    if (signUpOk) {
      console.log('\n🔄 Tentando login novamente após registro...');
      await testLogin(email, password);
    }
  }
  
  console.log('\n✅ Testes concluídos!');
}

// Executar testes
runTests().catch(console.error);