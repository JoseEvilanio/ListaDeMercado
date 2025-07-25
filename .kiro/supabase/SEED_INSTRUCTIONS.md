# Instruções para Aplicar Dados Iniciais no Supabase

Este documento fornece instruções detalhadas sobre como aplicar os dados iniciais no Supabase.

## Opção 1: Usando o Editor SQL do Supabase

1. Acesse o dashboard do Supabase: https://app.supabase.io
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Clique em "New query"
5. Abra o arquivo `seed.sql` e copie todo o conteúdo
6. Cole o conteúdo no Editor SQL do Supabase
7. Clique em "Run" para executar o SQL

## Opção 2: Usando a API do Supabase (MCP)

Se você tem o MCP do Supabase configurado, pode usar o script `apply-seed-mcp.js` para aplicar os dados iniciais:

1. Configure as variáveis de ambiente:
   ```
   export SUPABASE_PROJECT_ID=seu-project-id
   ```

2. Execute o script:
   ```
   node .kiro/supabase/apply-seed-mcp.js
   ```

## Opção 3: Usando o CLI do Supabase

Se você tem o CLI do Supabase instalado, pode usar os seguintes comandos:

1. Faça login no Supabase:
   ```
   supabase login
   ```

2. Aplique os dados iniciais:
   ```
   supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < .kiro/supabase/seed.sql
   ```

## Verificando os Dados Iniciais

Após aplicar os dados iniciais, você pode verificar se eles foram inseridos corretamente usando o script `check-seed.sql`:

1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `check-seed.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

Este script retornará informações sobre os dados nas tabelas do banco de dados.

## Resolução de Problemas

### Dados já existem

Se você receber erros indicando que os dados já existem, você pode:

1. Modificar o script para usar `ON CONFLICT DO NOTHING` (já está configurado assim)
2. Ou excluir os dados existentes antes de inserir novos:
   ```sql
   TRUNCATE TABLE notifications, interactions, comments, content_categories, content, categories, profiles, users CASCADE;
   ```

### Erros de chave estrangeira

Se você receber erros de chave estrangeira, verifique se:

1. As tabelas foram criadas na ordem correta
2. Os IDs referenciados existem nas tabelas relacionadas
3. As restrições de chave estrangeira estão configuradas corretamente

### Erros de sintaxe

Se você receber erros de sintaxe, verifique se:

1. O SQL é compatível com a versão do PostgreSQL usada pelo Supabase
2. Não há caracteres especiais ou formatação que possa causar problemas
3. Todas as instruções SQL terminam com ponto e vírgula (;)

## Dados de Exemplo

Os dados de exemplo incluem:

- 3 usuários
- 3 perfis de usuário
- 3 categorias
- 5 conteúdos
- 5 relações entre conteúdo e categorias
- 4 comentários
- 6 interações
- 3 notificações

Estes dados são suficientes para testar as funcionalidades básicas do aplicativo, mas você pode adicionar mais dados conforme necessário.