# Serviço de Banco de Dados

O serviço de banco de dados (`DatabaseService`) é responsável por gerenciar as operações de banco de dados no aplicativo.

## Estrutura

O serviço é dividido em subserviços para cada entidade principal:

- `DatabaseService.users`: Operações relacionadas a usuários
- `DatabaseService.profiles`: Operações relacionadas a perfis
- `DatabaseService.content`: Operações relacionadas a conteúdo
- `DatabaseService.interactions`: Operações relacionadas a interações

## Serviço de Usuários

### `getById`

Obtém um usuário pelo ID.

```typescript
static async getById(id: string): Promise<{
  user: User | null;
  error: any;
}>
```

**Parâmetros:**
- `id`: ID do usuário

**Retorno:**
- `user`: Objeto com os dados do usuário, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

### `getAll`

Obtém todos os usuários.

```typescript
static async getAll(): Promise<{
  users: User[];
  error: any;
}>
```

**Retorno:**
- `users`: Array de objetos de usuário
- `error`: Erro, ou `null` em caso de sucesso

### `update`

Atualiza um usuário.

```typescript
static async update(id: string, updates: Partial<User>): Promise<{
  user: User | null;
  error: any;
}>
```

**Parâmetros:**
- `id`: ID do usuário
- `updates`: Objeto com os campos a serem atualizados

**Retorno:**
- `user`: Objeto com os dados do usuário atualizado, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

## Serviço de Conteúdo

### `getById`

Obtém um conteúdo pelo ID.

```typescript
static async getById(id: string): Promise<{
  content: Content | null;
  error: any;
}>
```

**Parâmetros:**
- `id`: ID do conteúdo

**Retorno:**
- `content`: Objeto com os dados do conteúdo, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

### `getAll`

Obtém todos os conteúdos com paginação.

```typescript
static async getAll(options: {
  page?: number;
  pageSize?: number;
  userId?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
} = {}): Promise<{
  contents: Content[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: any;
}>
```

**Parâmetros:**
- `options`: Opções de consulta
  - `page`: Número da página (padrão: 1)
  - `pageSize`: Tamanho da página (padrão: 10)
  - `userId`: Filtrar por ID do usuário (opcional)
  - `orderBy`: Campo para ordenação (padrão: 'created_at')
  - `orderDirection`: Direção da ordenação (padrão: 'desc')

**Retorno:**
- `contents`: Array de objetos de conteúdo
- `totalCount`: Número total de registros
- `page`: Número da página atual
- `pageSize`: Tamanho da página
- `error`: Erro, ou `null` em caso de sucesso

### `create`

Cria um novo conteúdo.

```typescript
static async create(content: Partial<Content>): Promise<{
  content: Content | null;
  error: any;
}>
```

**Parâmetros:**
- `content`: Objeto com os dados do conteúdo

**Retorno:**
- `content`: Objeto com os dados do conteúdo criado, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

### `update`

Atualiza um conteúdo.

```typescript
static async update(id: string, updates: Partial<Content>): Promise<{
  content: Content | null;
  error: any;
}>
```

**Parâmetros:**
- `id`: ID do conteúdo
- `updates`: Objeto com os campos a serem atualizados

**Retorno:**
- `content`: Objeto com os dados do conteúdo atualizado, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

### `delete`

Exclui um conteúdo.

```typescript
static async delete(id: string): Promise<{
  error: any;
}>
```

**Parâmetros:**
- `id`: ID do conteúdo

**Retorno:**
- `error`: Erro, ou `null` em caso de sucesso

## Serviço de Interações

### `getByContent`

Obtém interações por conteúdo.

```typescript
static async getByContent(
  contentId: string,
  options: {
    page?: number;
    pageSize?: number;
    type?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<{
  interactions: Interaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  error: any;
}>
```

**Parâmetros:**
- `contentId`: ID do conteúdo
- `options`: Opções de consulta
  - `page`: Número da página (padrão: 1)
  - `pageSize`: Tamanho da página (padrão: 10)
  - `type`: Filtrar por tipo de interação (opcional)
  - `orderBy`: Campo para ordenação (padrão: 'created_at')
  - `orderDirection`: Direção da ordenação (padrão: 'desc')

**Retorno:**
- `interactions`: Array de objetos de interação
- `totalCount`: Número total de registros
- `page`: Número da página atual
- `pageSize`: Tamanho da página
- `error`: Erro, ou `null` em caso de sucesso

### `create`

Cria uma nova interação.

```typescript
static async create(interaction: Partial<Interaction>): Promise<{
  interaction: Interaction | null;
  error: any;
}>
```

**Parâmetros:**
- `interaction`: Objeto com os dados da interação

**Retorno:**
- `interaction`: Objeto com os dados da interação criada, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

### `delete`

Exclui uma interação.

```typescript
static async delete(id: string): Promise<{
  error: any;
}>
```

**Parâmetros:**
- `id`: ID da interação

**Retorno:**
- `error`: Erro, ou `null` em caso de sucesso

## Serviço Otimizado de Banco de Dados

O serviço otimizado de banco de dados (`OptimizedDatabaseService`) estende o `DatabaseService` com funcionalidades adicionais de cache, retry e otimização de consultas.

Para mais detalhes, consulte a [documentação do serviço otimizado](./optimized-database-service.md).