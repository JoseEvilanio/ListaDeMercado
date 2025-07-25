# Guia de Backup e Restauração

Este documento descreve os procedimentos de backup e restauração para o código e banco de dados do aplicativo, conforme implementado na migração para o Supabase.

## Índice

1. [Backup e Restauração do Código](#backup-e-restauração-do-código)
   - [Backup Automático do Código](#backup-automático-do-código)
   - [Restauração do Código](#restauração-do-código)
   - [Verificação de Integridade](#verificação-de-integridade-do-código)

2. [Backup e Restauração do Banco de Dados](#backup-e-restauração-do-banco-de-dados)
   - [Backups Automáticos do Supabase](#backups-automáticos-do-supabase)
   - [Backups Manuais do Banco de Dados](#backups-manuais-do-banco-de-dados)
   - [Restauração do Banco de Dados](#restauração-do-banco-de-dados)
   - [Point-in-Time Recovery](#point-in-time-recovery)

3. [Guia de Solução de Problemas](#guia-de-solução-de-problemas)
   - [Problemas Comuns de Backup](#problemas-comuns-de-backup)
   - [Problemas Comuns de Restauração](#problemas-comuns-de-restauração)
   - [Verificação de Logs](#verificação-de-logs)

## Backup e Restauração do Código

### Backup Automático do Código

O sistema implementa um mecanismo de backup automático do código antes da implementação das alterações para o Supabase. Este backup é realizado através de branches Git específicas.

#### Como funciona o backup automático:

1. O script `.kiro/backup/backup.bat` cria uma branch Git específica chamada `backup-supabase`
2. Todas as alterações não commitadas são salvas com uma mensagem de commit automática
3. As informações sobre o backup são registradas em `.kiro/backup/backup_info.txt`

#### Executando um backup manual:

```
.kiro\backup\backup.bat
```

Este comando irá:
1. Verificar se há alterações não commitadas e salvá-las
2. Criar uma branch de backup com o nome `backup-supabase`
3. Salvar informações sobre o backup em `backup_info.txt`

### Restauração do Código

Se ocorrerem problemas durante a implementação e for necessário reverter para a versão original, o sistema oferece um script de restauração automatizado.

#### Restauração Automática:

```
.kiro\backup\restore.bat
```

Este script irá:
1. Verificar se o arquivo de informações de backup existe
2. Extrair o nome da branch de backup
3. Verificar se há alterações não commitadas e perguntar se deseja salvá-las
4. Restaurar o código para a branch de backup

#### Restauração Manual:

Você também pode restaurar manualmente o backup usando os comandos Git:

1. Verifique o nome da branch de backup em `backup_info.txt`
2. Execute o comando: `git checkout backup-supabase`

### Verificação de Integridade do Código

Após a restauração, é importante verificar a integridade do código restaurado:

1. Verifique se todos os arquivos necessários estão presentes
2. Execute os testes automatizados para garantir que o código está funcionando corretamente:
   ```
   npm test
   ```
3. Verifique se as dependências estão instaladas corretamente:
   ```
   npm install
   ```

## Backup e Restauração do Banco de Dados

### Backups Automáticos do Supabase

O Supabase realiza backups automáticos diários do banco de dados. Estes backups são mantidos por um período específico, dependendo do plano de assinatura.

#### Características dos backups automáticos:

- Frequência: Diária
- Retenção: Depende do plano (geralmente 7 dias para planos pagos)
- Escopo: Banco de dados completo
- Acesso: Através do painel de controle do Supabase

### Backups Manuais do Banco de Dados

Além dos backups automáticos, é possível realizar backups manuais do banco de dados através do painel do Supabase ou via API.

#### Backup Manual via Painel do Supabase:

1. Acesse o [Dashboard do Supabase](https://app.supabase.io)
2. Selecione o projeto
3. Navegue até "Database" > "Backups"
4. Clique em "Create Backup"
5. Dê um nome descritivo ao backup
6. Clique em "Create"

#### Backup Manual via API:

```javascript
// Exemplo de código para backup via API
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://your-project-url.supabase.co',
  'your-service-role-key'
);

async function createDatabaseBackup() {
  try {
    // Obter dados de todas as tabelas principais
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*');
    
    const { data: interactions, error: interactionsError } = await supabase
      .from('interactions')
      .select('*');
    
    // Verificar erros
    if (usersError || profilesError || contentError || interactionsError) {
      throw new Error('Erro ao obter dados para backup');
    }
    
    // Criar objeto de backup
    const backup = {
      timestamp: new Date().toISOString(),
      tables: {
        users,
        profiles,
        content,
        interactions
      }
    };
    
    // Salvar backup (exemplo: como arquivo JSON)
    const fs = require('fs');
    const backupPath = `./backups/supabase-backup-${backup.timestamp}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    
    console.log(`Backup criado com sucesso: ${backupPath}`);
    return { success: true, path: backupPath };
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    return { success: false, error: error.message };
  }
}
```

### Restauração do Banco de Dados

#### Restauração via Painel do Supabase:

1. Acesse o [Dashboard do Supabase](https://app.supabase.io)
2. Selecione o projeto
3. Navegue até "Database" > "Backups"
4. Localize o backup que deseja restaurar
5. Clique em "Restore"
6. Confirme a operação

**Importante**: A restauração de um backup irá substituir completamente o banco de dados atual. Certifique-se de que esta é a ação desejada antes de prosseguir.

#### Restauração via API:

```javascript
// Exemplo de código para restauração via API
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://your-project-url.supabase.co',
  'your-service-role-key'
);

async function restoreDatabaseBackup(backupPath) {
  try {
    // Ler arquivo de backup
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Para cada tabela, limpar dados existentes e inserir dados do backup
    // Nota: É necessário desativar temporariamente as RLS policies ou usar service role
    
    // Exemplo para a tabela users
    const { error: deleteUsersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Evita deletar usuários do sistema
    
    if (deleteUsersError) {
      throw new Error(`Erro ao limpar tabela users: ${deleteUsersError.message}`);
    }
    
    const { error: insertUsersError } = await supabase
      .from('users')
      .insert(backupData.tables.users);
    
    if (insertUsersError) {
      throw new Error(`Erro ao restaurar dados de users: ${insertUsersError.message}`);
    }
    
    // Repetir para outras tabelas...
    
    console.log('Restauração concluída com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return { success: false, error: error.message };
  }
}
```

### Point-in-Time Recovery

O Supabase oferece a funcionalidade de Point-in-Time Recovery (PITR) em planos pagos, permitindo restaurar o banco de dados para um momento específico no passado.

#### Como usar o PITR:

1. Acesse o [Dashboard do Supabase](https://app.supabase.io)
2. Selecione o projeto
3. Navegue até "Database" > "Point in Time Recovery"
4. Selecione a data e hora desejadas
5. Clique em "Start Recovery"
6. Confirme a operação

**Nota**: O PITR só está disponível em planos pagos e tem um período de retenção específico (geralmente 7 dias).

## Guia de Solução de Problemas

### Problemas Comuns de Backup

#### O script de backup falha ao criar a branch Git

**Sintoma**: O script `.kiro/backup/backup.bat` retorna um erro ao tentar criar a branch de backup.

**Possíveis causas e soluções**:

1. **Git não está instalado ou não está no PATH**
   - Verifique se o Git está instalado: `git --version`
   - Adicione o Git ao PATH do sistema se necessário

2. **Conflitos no repositório Git**
   - Verifique o status do repositório: `git status`
   - Resolva conflitos pendentes antes de executar o backup

3. **Permissões insuficientes**
   - Verifique se você tem permissões para criar branches
   - Execute o script como administrador se necessário

#### Falha ao criar backup do banco de dados

**Sintoma**: O processo de backup do banco de dados falha ou não completa.

**Possíveis causas e soluções**:

1. **Problemas de conexão com o Supabase**
   - Verifique sua conexão com a internet
   - Verifique se o projeto Supabase está ativo
   - Confirme se as credenciais de API estão corretas

2. **Tamanho do banco de dados excede limites**
   - Verifique o tamanho do seu banco de dados
   - Considere fazer backups parciais de tabelas específicas
   - Atualize seu plano do Supabase se necessário

3. **Erros de permissão**
   - Verifique se você está usando a chave de serviço (service role key) para operações de backup
   - Confirme se tem permissões adequadas no projeto Supabase

### Problemas Comuns de Restauração

#### O script de restauração não encontra a branch de backup

**Sintoma**: O script `.kiro/backup/restore.bat` não consegue encontrar a branch de backup.

**Possíveis causas e soluções**:

1. **O arquivo de informações de backup está ausente ou corrompido**
   - Verifique se o arquivo `.kiro/backup/backup_info.txt` existe
   - Verifique se o conteúdo do arquivo está correto

2. **A branch foi deletada ou renomeada**
   - Liste todas as branches: `git branch -a`
   - Se a branch não existir, você precisará restaurar de outra forma

3. **Problemas com o repositório Git**
   - Verifique a integridade do repositório: `git fsck`
   - Tente reparar o repositório se necessário

#### Falha na restauração do banco de dados

**Sintoma**: O processo de restauração do banco de dados falha ou não completa.

**Possíveis causas e soluções**:

1. **Backup corrompido ou incompleto**
   - Verifique a integridade do arquivo de backup
   - Tente usar um backup diferente

2. **Conflitos de dados**
   - Limpe o banco de dados antes de restaurar
   - Verifique se há restrições de chave estrangeira que possam estar causando conflitos

3. **Problemas de permissão**
   - Verifique se você está usando a chave de serviço (service role key)
   - Confirme se tem permissões adequadas no projeto Supabase

4. **Tamanho do backup excede limites**
   - Verifique se o tamanho do backup está dentro dos limites do seu plano
   - Considere restaurar tabelas específicas em vez do banco de dados completo

### Verificação de Logs

Para diagnosticar problemas, verifique os logs disponíveis:

#### Logs do Git

```
git log --oneline
```

Este comando mostra o histórico de commits, útil para verificar se os backups foram criados corretamente.

#### Logs do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.io)
2. Selecione o projeto
3. Navegue até "Database" > "Logs"
4. Filtre os logs por tipo e período

#### Logs da Aplicação

Verifique os logs da aplicação para identificar problemas relacionados ao banco de dados:

```
npm run logs
```

ou verifique os arquivos de log em:

```
./logs/app.log
```

## Procedimentos de Manutenção Recomendados

### Backups Regulares

Recomenda-se realizar backups manuais adicionais antes de:

1. Atualizações importantes do aplicativo
2. Migrações de esquema do banco de dados
3. Importação de grandes volumes de dados

### Testes de Restauração

É importante testar regularmente o processo de restauração para garantir que os backups estão funcionando corretamente:

1. Crie um ambiente de teste separado
2. Restaure um backup recente neste ambiente
3. Verifique se todos os dados e funcionalidades estão corretos
4. Documente quaisquer problemas encontrados

### Monitoramento de Espaço

Monitore regularmente o espaço utilizado pelos backups:

1. Verifique o tamanho do banco de dados no painel do Supabase
2. Limpe backups antigos que não são mais necessários
3. Configure alertas para quando o espaço estiver próximo do limite

---

Este documento deve ser revisado e atualizado regularmente para refletir quaisquer mudanças nos procedimentos de backup e restauração.

Última atualização: Julho 2025