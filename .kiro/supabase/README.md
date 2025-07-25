# Configuração do Supabase

Este diretório contém arquivos relacionados à configuração e uso do Supabase como banco de dados para o aplicativo.

## Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse o site do Supabase (https://supabase.com) e faça login na sua conta
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: "mobile-device-db")
4. Selecione a organização (ou crie uma nova)
5. Escolha uma região (preferencialmente a mais próxima dos seus usuários)
6. Defina uma senha segura para o banco de dados
7. Clique em "Create new project"

### 2. Configurar Credenciais

Após a criação do projeto, você precisará das seguintes informações:

- **URL do Projeto**: Encontrada no dashboard do projeto
- **Chave Anônima (Anon Key)**: Encontrada em Project Settings > API

Atualize o arquivo `config.js` com essas informações:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anonima';
```

### 3. Configurar Ambientes

O arquivo `config.js` contém configurações para diferentes ambientes (development, test, production). 
Você pode configurar diferentes projetos Supabase para cada ambiente, se necessário.

## Estrutura do Banco de Dados

A estrutura do banco de dados será definida no arquivo `schema.sql`. Este arquivo contém os comandos SQL para criar as tabelas, índices e relacionamentos necessários.

Para aplicar o esquema ao seu projeto Supabase:

1. Acesse o Editor SQL no dashboard do Supabase
2. Cole o conteúdo do arquivo `schema.sql`
3. Execute o script

## Políticas de Segurança

As políticas de segurança (Row Level Security) serão definidas no arquivo `policies.sql`. Este arquivo contém os comandos SQL para configurar as políticas de acesso às tabelas.

Para aplicar as políticas ao seu projeto Supabase:

1. Acesse o Editor SQL no dashboard do Supabase
2. Cole o conteúdo do arquivo `policies.sql`
3. Execute o script

## Dados Iniciais

Os dados iniciais (seed data) serão definidos no arquivo `seed.sql`. Este arquivo contém os comandos SQL para inserir dados iniciais nas tabelas.

Para aplicar os dados iniciais ao seu projeto Supabase:

1. Acesse o Editor SQL no dashboard do Supabase
2. Cole o conteúdo do arquivo `seed.sql`
3. Execute o script