# Scripts de Manutenção do Banco de Dados

Este diretório contém scripts para manutenção do banco de dados Supabase.

## Scripts Disponíveis

### 1. Backup (`backup.sql`)

Este script cria uma cópia de segurança das tabelas principais do banco de dados.

**Uso:**
1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `backup.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

### 2. Restauração (`restore.sql`)

Este script restaura os dados das tabelas de backup.

**Uso:**
1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `restore.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

### 3. Limpeza (`cleanup.sql`)

Este script remove dados antigos e otimiza o banco de dados.

**Uso:**
1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `cleanup.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

### 4. Reset do Ambiente de Desenvolvimento (`reset_dev.sql`)

Este script remove todos os dados e reinicia o banco de dados com dados de exemplo.

**Uso:**
1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `reset_dev.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

### 5. Verificação de Integridade (`check_integrity.sql`)

Este script verifica se há problemas de integridade nos dados.

**Uso:**
1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `check_integrity.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

### 6. Otimização (`optimize.sql`)

Este script otimiza o desempenho do banco de dados.

**Uso:**
1. Acesse o Editor SQL do Supabase
2. Abra o arquivo `optimize.sql` e copie todo o conteúdo
3. Cole o conteúdo no Editor SQL do Supabase
4. Clique em "Run" para executar o SQL

## Agendamento de Manutenção

Para manter o banco de dados em bom estado, recomenda-se agendar as seguintes tarefas:

1. **Backup diário**:
   - Execute o script `backup.sql` diariamente

2. **Limpeza semanal**:
   - Execute o script `cleanup.sql` semanalmente

3. **Otimização mensal**:
   - Execute o script `optimize.sql` mensalmente

4. **Verificação de integridade mensal**:
   - Execute o script `check_integrity.sql` mensalmente

## Automação com Funções Agendadas

Você pode automatizar a execução desses scripts usando funções agendadas do Supabase:

1. Crie uma função Edge Function que execute o SQL desejado
2. Agende a execução da função usando um serviço como Supabase Cron Jobs

Exemplo de função Edge Function para backup:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // Criar cliente Supabase com chave de serviço
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Ler o script SQL de backup
  const backupSql = `
    -- Script de backup aqui
  `
  
  // Executar o script SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql: backupSql })
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
  
  return new Response(JSON.stringify({ success: true, data }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

## Resolução de Problemas

### Erros de permissão

Se você receber erros de permissão, verifique se:

1. Você está usando as credenciais corretas
2. Você tem permissões para executar os comandos no banco de dados
3. Você está usando o usuário `postgres` ou um usuário com permissões de administrador

### Erros de espaço em disco

Se você receber erros de espaço em disco, considere:

1. Limpar dados antigos com o script `cleanup.sql`
2. Aumentar o espaço em disco do seu projeto Supabase
3. Otimizar o banco de dados com o script `optimize.sql`

### Erros de timeout

Se os scripts demorarem muito para executar e causarem timeout:

1. Divida os scripts em partes menores
2. Execute os scripts em horários de menor tráfego
3. Aumente o timeout do Editor SQL do Supabase