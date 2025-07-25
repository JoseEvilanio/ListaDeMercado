# Instruções para Aplicar o Esquema do Banco de Dados no Supabase

Este documento fornece instruções detalhadas sobre como aplicar o esquema do banco de dados no Supabase.

## Opção 1: Usando o Editor SQL do Supabase

1. Acesse o dashboard do Supabase: https://app.supabase.io
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Clique em "New query"
5. Abra o arquivo `schema.sql` e copie todo o conteúdo
6. Cole o conteúdo no Editor SQL do Supabase
7. Clique em "Run" para executar o SQL

## Opção 2: Usando a API do Supabase (MCP)

Se você tem o MCP do Supabase configurado, pode usar o script `apply-schema-mcp.js` para aplicar o esquema:

1. Configure as variáveis de ambiente:
   ```
   export SUPABASE_PROJECT_ID=seu-project-id
   ```

2. Execute o script:
   ```
   node .kiro/supabase/apply-schema-mcp.js
   ```

## Opção 3: Usando o CLI do Supabase

Se você tem o CLI do Supabase instalado, pode usar os seguintes comandos:

1. Faça login no Supabase:
   ```
   supabase login
   ```

2. Aplique o esquema:
   ```
   supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < .kiro/supabase/schema.sql
   ```

## Verificando a Estrutura do Banco de Dados

Após aplicar o esquema, você pode verificar a estrutura do banco de dados usando o script `check-schema.sql`:

1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `check-schema.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

Este script retornará informações sobre as tabelas, colunas, índices e triggers do banco de dados.

## Resolução de Problemas

### Tabelas já existem

Se você receber erros indicando que as tabelas já existem, você pode:

1. Modificar o script para usar `CREATE TABLE IF NOT EXISTS` (já está configurado assim)
2. Ou excluir as tabelas existentes antes de criar novas:
   ```sql
   DROP TABLE IF EXISTS interactions, content, profiles, users CASCADE;
   ```

### Erros de permissão

Se você receber erros de permissão, verifique se:

1. Você está usando as credenciais corretas
2. Você tem permissões para criar tabelas no banco de dados
3. Você está usando o usuário `postgres` ou um usuário com permissões de administrador

### Erros de sintaxe

Se você receber erros de sintaxe, verifique se:

1. O SQL é compatível com a versão do PostgreSQL usada pelo Supabase
2. Não há caracteres especiais ou formatação que possa causar problemas
3. Todas as instruções SQL terminam com ponto e vírgula (;)