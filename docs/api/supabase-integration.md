# Documentação da API e Serviços Supabase

## Visão Geral

Esta documentação descreve a integração do aplicativo com o Supabase, incluindo os serviços implementados, a estrutura do banco de dados e as políticas de segurança. O Supabase é utilizado como banco de dados principal do aplicativo, fornecendo recursos de autenticação, armazenamento de dados e funcionalidades em tempo real.

## Configuração do Supabase

### Ambientes

O aplicativo está configurado para trabalhar com três ambientes diferentes:

- **Desenvolvimento**: Ambiente local para desenvolvimento
- **Teste**: Ambiente para testes automatizados e manuais
- **Produção**: Ambiente de produção para usuários finais

### Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias para configurar a conexão com o Supabase:

```
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
VITE_API_URL=http://localhost:3000 (ou URL da API em produção)
VITE_DEBUG=true (apenas em desenvolvimento)
```

### Inicialização do Cliente

O cliente Supabase é inicializado no arquivo `react-app/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import config from './config';

// Obter configurações do ambiente atual
const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. users

Armazena informações básicas dos usuários.

| Campo      | Tipo      | Descrição                           |
|------------|-----------|-------------------------------------|
| id         | UUID      | Identificador único (chave primária) |
| email      | string    | Email do usuário (único)            |
| name       | string    | Nome do usuário                     |
| created_at | timestamp | Data de criação do registro         |
| updated_at | timestamp | Data da última atualização          |

#### 2. profiles

Armazena informações adicionais do perfil do usuário.

| Campo       | Tipo      | Descrição                                  |
|-------------|-----------|-------------------------------------------|
| id          | UUID      | Identificador único (FK para users.id)     |
| avatar_url  | string    | URL da imagem de avatar (opcional)         |
| bio         | text      | Biografia do usuário (opcional)            |
| preferences | jsonb     | Preferências do usuário em formato JSON    |
| created_at  | timestamp | Data de criação do registro                |
| updated_at  | timestamp | Data da última atualização                 |

#### 3. content

Armazena o conteúdo criado pelos usuários.

| Campo      | Tipo      | Descrição                               |
|------------|-----------|----------------------------------------|
| id         | UUID      | Identificador único (chave primária)    |
| title      | string    | Título do conteúdo                      |
| body       | text      | Corpo do conteúdo                       |
| user_id    | UUID      | ID do usuário que criou o conteúdo (FK) |
| created_at | timestamp | Data de criação do registro             |
| updated_at | timestamp | Data da última atualização              |

#### 4. interactions

Armazena interações dos usuários com o conteúdo.

| Campo      | Tipo      | Descrição                                  |
|------------|-----------|-------------------------------------------|
| id         | UUID      | Identificador único (chave primária)       |
| user_id    | UUID      | ID do usuário que interagiu (FK)           |
| content_id | UUID      | ID do conteúdo relacionado (FK)            |
| type       | string    | Tipo de interação (like, comment, etc.)    |
| created_at | timestamp | Data de criação do registro                |

### Relacionamentos

- **users** ⟷ **profiles**: Relação 1:1 através do campo `id`
- **users** ⟷ **content**: Relação 1:N através do campo `user_id` em `content`
- **users** ⟷ **interactions**: Relação 1:N através do campo `user_id` em `interactions`
- **content** ⟷ **interactions**: Relação 1:N através do campo `content_id` em `interactions`

## Serviços Implementados

### 1. AuthService

Serviço responsável por gerenciar a autenticação de usuários.

#### Métodos Principais:

- **signUp(email, password, name)**: Registra um novo usuário
- **signIn(email, password)**: Faz login com email e senha
- **signInWithOAuth(provider)**: Faz login com provedor OAuth (Google, Facebook, GitHub)
- **signOut()**: Faz logout do usuário atual
- **resetPassword(email)**: Envia email para redefinição de senha
- **updatePassword(newPassword)**: Atualiza a senha do usuário
- **getSession()**: Obtém a sessão atual
- **getCurrentUser()**: Obtém o usuário atual
- **updateUser(userId, updates)**: Atualiza os dados do usuário
- **onAuthStateChange(callback)**: Configura um listener para mudanças no estado de autenticação

#### Exemplo de Uso:

```typescript
import { AuthService } from './services/auth.service';

// Registrar um novo usuário
const { user, error } = await AuthService.signUp('usuario@exemplo.com', 'senha123', 'Nome do Usuário');

// Fazer login
const { session, user, error } = await AuthService.signIn('usuario@exemplo.com', 'senha123');

// Obter usuário atual
const { user, error } = await AuthService.getCurrentUser();
```

### 2. DatabaseService

Serviço responsável por operações de banco de dados.

#### Submódulos:

- **users**: Operações relacionadas a usuários
- **profiles**: Operações relacionadas a perfis
- **content**: Operações relacionadas a conteúdo
- **interactions**: Operações relacionadas a interações

#### Métodos Principais:

##### users:
- **getById(id)**: Obtém um usuário pelo ID
- **getAll()**: Obtém todos os usuários
- **update(id, updates)**: Atualiza um usuário

##### profiles:
- **getByUserId(userId)**: Obtém um perfil pelo ID do usuário
- **create(profile)**: Cria um perfil
- **update(userId, updates)**: Atualiza um perfil

##### content:
- **getById(id)**: Obtém um conteúdo pelo ID
- **getAll(options)**: Obtém todos os conteúdos com opções de paginação e filtros
- **create(content)**: Cria um conteúdo
- **update(id, updates)**: Atualiza um conteúdo
- **delete(id)**: Exclui um conteúdo
- **subscribe(callback, filters)**: Assina atualizações em tempo real para conteúdos

##### interactions:
- **getById(id)**: Obtém uma interação pelo ID
- **getByContent(contentId, options)**: Obtém interações por conteúdo
- **getByUser(userId, options)**: Obtém interações por usuário
- **create(interaction)**: Cria uma interação
- **delete(id)**: Exclui uma interação
- **checkUserInteraction(userId, contentId, type)**: Verifica se um usuário já interagiu com um conteúdo
- **subscribe(callback, filters)**: Assina atualizações em tempo real para interações

#### Exemplo de Uso:

```typescript
import { DatabaseService } from './services/database.service';

// Obter um usuário
const { user, error } = await DatabaseService.users.getById('user-id');

// Criar um conteúdo
const { content, error } = await DatabaseService.content.create({
  title: 'Título do Conteúdo',
  body: 'Corpo do conteúdo',
  user_id: 'user-id'
});

// Obter interações de um conteúdo
const { interactions, totalCount, page, pageSize, error } = await DatabaseService.interactions.getByContent(
  'content-id',
  { page: 1, pageSize: 10, type: 'like' }
);
```

### 3. RealtimeService

Serviço responsável por gerenciar assinaturas em tempo real.

#### Métodos Principais:

- **subscribe(options, callback)**: Assina eventos em tempo real
- **onInsert(table, callback, filter)**: Assina eventos de inserção em tempo real
- **onUpdate(table, callback, filter)**: Assina eventos de atualização em tempo real
- **onDelete(table, callback, filter)**: Assina eventos de exclusão em tempo real
- **onAll(table, callback, filter)**: Assina todos os eventos em tempo real
- **unsubscribeAll()**: Cancela todas as assinaturas

#### Exemplo de Uso:

```typescript
import { RealtimeService } from './services/realtime.service';

// Assinar eventos de inserção na tabela content
const unsubscribe = RealtimeService.onInsert(
  'content',
  (payload) => {
    console.log('Novo conteúdo criado:', payload.new);
    // Atualizar a UI com o novo conteúdo
  }
);

// Assinar todos os eventos para um conteúdo específico
const unsubscribeContent = RealtimeService.onAll(
  'content',
  (payload) => {
    console.log('Evento no conteúdo:', payload);
    // Atualizar a UI com base no evento
  },
  `id=eq.${contentId}`
);

// Cancelar assinatura quando o componente for desmontado
useEffect(() => {
  return () => {
    unsubscribe();
    unsubscribeContent();
  };
}, []);
```

### 4. Serviços Adicionais

#### CacheService

Serviço para gerenciar cache de dados.

#### ErrorService

Serviço para tratamento centralizado de erros.

#### RetryService

Serviço para implementar mecanismo de retry com backoff exponencial.

#### ValidationService

Serviço para validação de dados no cliente.

#### PerformanceMonitoringService

Serviço para monitoramento de desempenho.

#### ServiceWorkerService

Serviço para gerenciar service workers para funcionalidades offline.

## Políticas de Segurança (RLS)

O Supabase utiliza Row Level Security (RLS) para controlar o acesso aos dados. As seguintes políticas foram implementadas:

### Tabela: users

#### 1. Leitura de Usuários

```sql
CREATE POLICY "Usuários podem ler qualquer usuário"
  ON users FOR SELECT
  USING (true);
```

Esta política permite que qualquer usuário autenticado leia informações de qualquer usuário no sistema.

#### 2. Atualização de Usuários

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio registro"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

Esta política permite que um usuário atualize apenas seu próprio registro.

#### 3. Exclusão de Usuários

```sql
CREATE POLICY "Usuários não podem excluir registros"
  ON users FOR DELETE
  USING (false);
```

Esta política impede que usuários excluam registros de usuário.

### Tabela: profiles

#### 1. Leitura de Perfis

```sql
CREATE POLICY "Usuários podem ler qualquer perfil"
  ON profiles FOR SELECT
  USING (true);
```

Esta política permite que qualquer usuário autenticado leia informações de qualquer perfil.

#### 2. Atualização de Perfis

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

Esta política permite que um usuário atualize apenas seu próprio perfil.

#### 3. Inserção de Perfis

```sql
CREATE POLICY "Usuários só podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

Esta política permite que um usuário insira apenas seu próprio perfil.

#### 4. Exclusão de Perfis

```sql
CREATE POLICY "Usuários não podem excluir perfis"
  ON profiles FOR DELETE
  USING (false);
```

Esta política impede que usuários excluam perfis.

### Tabela: content

#### 1. Leitura de Conteúdo

```sql
CREATE POLICY "Usuários podem ler qualquer conteúdo"
  ON content FOR SELECT
  USING (true);
```

Esta política permite que qualquer usuário autenticado leia qualquer conteúdo.

#### 2. Inserção de Conteúdo

```sql
CREATE POLICY "Usuários podem inserir conteúdo"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

Esta política permite que um usuário insira conteúdo apenas se o `user_id` do conteúdo corresponder ao ID do usuário autenticado.

#### 3. Atualização de Conteúdo

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio conteúdo"
  ON content FOR UPDATE
  USING (auth.uid() = user_id);
```

Esta política permite que um usuário atualize apenas o conteúdo que ele mesmo criou.

#### 4. Exclusão de Conteúdo

```sql
CREATE POLICY "Usuários só podem deletar seu próprio conteúdo"
  ON content FOR DELETE
  USING (auth.uid() = user_id);
```

Esta política permite que um usuário exclua apenas o conteúdo que ele mesmo criou.

### Tabela: interactions

#### 1. Leitura de Interações

```sql
CREATE POLICY "Usuários podem ler qualquer interação"
  ON interactions FOR SELECT
  USING (true);
```

Esta política permite que qualquer usuário autenticado leia qualquer interação.

#### 2. Inserção de Interações

```sql
CREATE POLICY "Usuários podem inserir interações"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

Esta política permite que um usuário insira interações apenas se o `user_id` da interação corresponder ao ID do usuário autenticado.

#### 3. Atualização de Interações

```sql
CREATE POLICY "Usuários só podem atualizar suas próprias interações"
  ON interactions FOR UPDATE
  USING (auth.uid() = user_id);
```

Esta política permite que um usuário atualize apenas as interações que ele mesmo criou.

#### 4. Exclusão de Interações

```sql
CREATE POLICY "Usuários só podem deletar suas próprias interações"
  ON interactions FOR DELETE
  USING (auth.uid() = user_id);
```

Esta política permite que um usuário exclua apenas as interações que ele mesmo criou.

### Políticas para Administradores

Para permitir que administradores tenham acesso completo a todas as tabelas, foram criadas políticas específicas:

```sql
-- Administradores podem gerenciar todos os usuários
CREATE POLICY "Administradores podem gerenciar todos os usuários"
  ON users
  USING (is_admin());

-- Administradores podem gerenciar todos os perfis
CREATE POLICY "Administradores podem gerenciar todos os perfis"
  ON profiles
  USING (is_admin());

-- Administradores podem gerenciar todo o conteúdo
CREATE POLICY "Administradores podem gerenciar todo o conteúdo"
  ON content
  USING (is_admin());

-- Administradores podem gerenciar todas as interações
CREATE POLICY "Administradores podem gerenciar todas as interações"
  ON interactions
  USING (is_admin());
```

A função `is_admin()` verifica se o usuário atual tem a função de administrador.

## Considerações de Segurança Adicionais

### 1. Validação no Cliente

Além das políticas RLS, é implementada validação no cliente para fornecer feedback imediato aos usuários:

```javascript
function canEditContent(userId, contentUserId) {
  return userId === contentUserId;
}

// Exemplo de uso
if (canEditContent(currentUser.id, content.user_id)) {
  // Mostrar botão de edição
} else {
  // Esconder botão de edição
}
```

### 2. Auditoria de Acesso

Para operações sensíveis, foi implementado um sistema de auditoria:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Proteção contra Injeção SQL

O Supabase fornece proteção contra injeção SQL através de consultas parametrizadas:

```javascript
// Bom: Usar métodos do Supabase com parâmetros
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

## Tratamento de Erros

O aplicativo implementa um sistema robusto de tratamento de erros:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  
  if (error) {
    console.error('Erro ao buscar dados:', error);
    // Mostrar mensagem de erro para o usuário
    return;
  }
  
  // Processar dados
} catch (e) {
  console.error('Erro inesperado:', e);
  // Mostrar mensagem de erro para o usuário
}
```

## Funcionalidades em Tempo Real

O Supabase oferece recursos de tempo real para manter os dados sincronizados entre clientes:

```typescript
// Configurar assinatura em tempo real
const subscription = supabase
  .channel('public:content')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'content',
    filter: `id=eq.${contentId}`
  }, (payload) => {
    // Atualizar dados com payload.new
  })
  .subscribe();
  
// Limpar assinatura ao desmontar
return () => {
  subscription.unsubscribe();
};
```

## Depuração

Para depurar problemas com o Supabase, você pode habilitar logs detalhados:

```typescript
// Em desenvolvimento
if (config.debug) {
  supabase.realtime.setLogger(console);
}
```