# Serviço de Armazenamento

O serviço de armazenamento (`StorageService`) é responsável por gerenciar o upload, download e manipulação de arquivos no Supabase Storage.

## Métodos

### `upload`

Faz upload de um arquivo para o Supabase Storage.

```typescript
static async upload(
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<{
  path: string | null;
  error: any;
}>
```

**Parâmetros:**
- `bucket`: Nome do bucket
- `path`: Caminho do arquivo no bucket
- `file`: Arquivo a ser enviado
- `options`: Opções de upload (opcional)
  - `cacheControl`: Cabeçalho Cache-Control
  - `upsert`: Se deve substituir o arquivo se já existir

**Retorno:**
- `path`: Caminho do arquivo enviado, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const file = new File(['conteúdo do arquivo'], 'arquivo.txt', { type: 'text/plain' });

const { path, error } = await StorageService.upload(
  'documentos',
  'usuario/arquivo.txt',
  file
);

if (error) {
  console.error('Erro ao fazer upload:', error);
} else {
  console.log('Arquivo enviado:', path);
}
```

### `download`

Faz download de um arquivo do Supabase Storage.

```typescript
static async download(
  bucket: string,
  path: string
): Promise<{
  data: Blob | null;
  error: any;
}>
```

**Parâmetros:**
- `bucket`: Nome do bucket
- `path`: Caminho do arquivo no bucket

**Retorno:**
- `data`: Blob com os dados do arquivo, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { data, error } = await StorageService.download(
  'documentos',
  'usuario/arquivo.txt'
);

if (error) {
  console.error('Erro ao fazer download:', error);
} else {
  // Criar URL para o blob
  const url = URL.createObjectURL(data);
  
  // Criar link para download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'arquivo.txt';
  a.click();
  
  // Liberar URL
  URL.revokeObjectURL(url);
}
```

### `getPublicUrl`

Obtém a URL pública de um arquivo.

```typescript
static getPublicUrl(
  bucket: string,
  path: string
): string | null
```

**Parâmetros:**
- `bucket`: Nome do bucket
- `path`: Caminho do arquivo no bucket

**Retorno:**
- URL pública do arquivo, ou `null` se não for possível obter

**Exemplo:**
```typescript
const url = StorageService.getPublicUrl(
  'documentos',
  'usuario/arquivo.txt'
);

if (url) {
  console.log('URL pública:', url);
} else {
  console.error('Não foi possível obter a URL pública');
}
```

### `list`

Lista arquivos em um bucket.

```typescript
static async list(
  bucket: string,
  path?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: {
      column: string;
      order: 'asc' | 'desc';
    };
  }
): Promise<{
  files: Array<{
    name: string;
    id: string;
    size: number;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    metadata: Record<string, any>;
  }>;
  error: any;
}>
```

**Parâmetros:**
- `bucket`: Nome do bucket
- `path`: Caminho no bucket (opcional)
- `options`: Opções de listagem (opcional)
  - `limit`: Número máximo de arquivos a retornar
  - `offset`: Número de arquivos a pular
  - `sortBy`: Ordenação dos resultados

**Retorno:**
- `files`: Array de objetos com informações dos arquivos
- `error`: Erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { files, error } = await StorageService.list(
  'documentos',
  'usuario',
  { limit: 10 }
);

if (error) {
  console.error('Erro ao listar arquivos:', error);
} else {
  console.log('Arquivos encontrados:', files);
}
```

### `remove`

Remove um arquivo do Supabase Storage.

```typescript
static async remove(
  bucket: string,
  paths: string | string[]
): Promise<{
  error: any;
}>
```

**Parâmetros:**
- `bucket`: Nome do bucket
- `paths`: Caminho do arquivo ou array de caminhos

**Retorno:**
- `error`: Erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { error } = await StorageService.remove(
  'documentos',
  'usuario/arquivo.txt'
);

if (error) {
  console.error('Erro ao remover arquivo:', error);
} else {
  console.log('Arquivo removido com sucesso');
}
```

### `createSignedUrl`

Cria uma URL assinada para acesso temporário a um arquivo.

```typescript
static async createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number
): Promise<{
  signedUrl: string | null;
  error: any;
}>
```

**Parâmetros:**
- `bucket`: Nome do bucket
- `path`: Caminho do arquivo no bucket
- `expiresIn`: Tempo de expiração em segundos

**Retorno:**
- `signedUrl`: URL assinada, ou `null` em caso de erro
- `error`: Erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { signedUrl, error } = await StorageService.createSignedUrl(
  'documentos',
  'usuario/arquivo-privado.txt',
  3600 // 1 hora
);

if (error) {
  console.error('Erro ao criar URL assinada:', error);
} else {
  console.log('URL assinada:', signedUrl);
}
```

## Serviço de Otimização de Imagens

O serviço de otimização de imagens (`ImageOptimizationService`) estende o `StorageService` com funcionalidades adicionais para otimização de imagens.

Para mais detalhes, consulte a [documentação do serviço de otimização de imagens](./image-optimization-service.md).