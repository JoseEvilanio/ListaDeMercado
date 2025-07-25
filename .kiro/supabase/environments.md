# Configuração de Ambientes Supabase

Este documento descreve como configurar diferentes ambientes (desenvolvimento, teste e produção) para o projeto Supabase.

## Visão Geral

É recomendado ter projetos Supabase separados para cada ambiente:

1. **Desenvolvimento**: Para desenvolvimento local e testes individuais
2. **Teste**: Para testes de integração e QA
3. **Produção**: Para o ambiente de produção

## Configuração dos Ambientes

### 1. Desenvolvimento

1. Crie um projeto Supabase chamado "mobile-device-db-dev"
2. Configure o esquema do banco de dados usando o arquivo `schema.sql`
3. Configure as políticas de segurança usando o arquivo `policies.sql`
4. Insira dados de exemplo usando o arquivo `seed.sql`
5. Atualize o arquivo `config.js` com as credenciais do ambiente de desenvolvimento:

```javascript
development: {
  supabaseUrl: 'https://seu-projeto-dev.supabase.co',
  supabaseAnonKey: 'sua-chave-anonima-dev',
},
```

### 2. Teste

1. Crie um projeto Supabase chamado "mobile-device-db-test"
2. Configure o esquema do banco de dados usando o arquivo `schema.sql`
3. Configure as políticas de segurança usando o arquivo `policies.sql`
4. Insira dados de teste usando o arquivo `seed.sql` (ou um arquivo específico para testes)
5. Atualize o arquivo `config.js` com as credenciais do ambiente de teste:

```javascript
test: {
  supabaseUrl: 'https://seu-projeto-test.supabase.co',
  supabaseAnonKey: 'sua-chave-anonima-test',
},
```

### 3. Produção

1. Crie um projeto Supabase chamado "mobile-device-db-prod"
2. Configure o esquema do banco de dados usando o arquivo `schema.sql`
3. Configure as políticas de segurança usando o arquivo `policies.sql`
4. **Não insira dados de exemplo no ambiente de produção**
5. Atualize o arquivo `config.js` com as credenciais do ambiente de produção:

```javascript
production: {
  supabaseUrl: 'https://seu-projeto-prod.supabase.co',
  supabaseAnonKey: 'sua-chave-anonima-prod',
},
```

## Variáveis de Ambiente

Para maior segurança, é recomendado usar variáveis de ambiente para armazenar as credenciais do Supabase:

1. Crie um arquivo `.env` na raiz do projeto (não comite este arquivo no Git)
2. Adicione as variáveis de ambiente:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
NODE_ENV=development
```

3. Atualize o arquivo `config.js` para usar as variáveis de ambiente:

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
```

## Alternando Entre Ambientes

Para alternar entre os ambientes, defina a variável de ambiente `NODE_ENV`:

- Desenvolvimento: `NODE_ENV=development`
- Teste: `NODE_ENV=test`
- Produção: `NODE_ENV=production`

O arquivo `config.js` usará automaticamente as credenciais corretas com base no valor de `NODE_ENV`.