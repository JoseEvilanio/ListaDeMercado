# Componentes Reativos

Este documento descreve os componentes reativos implementados para trabalhar com o Supabase em tempo real. Estes componentes são otimizados para renderização eficiente e atualizações em tempo real sem recarregar a página.

## Índice

1. [RealtimeDataGrid](#realtimedatagrid)
2. [RealtimeContentCard](#realtimecontentcard)
3. [RealtimeStatusIndicator](#realtimestatusindicator)
4. [useOptimizedRealtime Hook](#useoptimizedrealtime-hook)
5. [Boas Práticas](#boas-práticas)

## RealtimeDataGrid

Um componente de grid de dados que se atualiza automaticamente em tempo real quando os dados mudam no Supabase.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `table` | string | Nome da tabela no Supabase |
| `columns` | Column[] | Definição das colunas do grid |
| `keyExtractor` | (item: T) => string | Função para extrair a chave única de cada item |
| `filter` | string? | Filtro opcional para a tabela |
| `title` | string? | Título opcional para o grid |
| `fetchFunction` | () => Promise<T[]>? | Função personalizada para buscar dados |
| `onSave` | (item: T) => Promise<void>? | Função chamada ao salvar alterações |
| `className` | string? | Classes CSS adicionais |
| `emptyMessage` | string? | Mensagem quando não há dados |
| `editable` | boolean? | Se o grid permite edição inline |
| `pageSize` | number? | Tamanho da página para paginação |

### Exemplo de Uso

```tsx
import { RealtimeDataGrid } from '../components/realtime';

const MyComponent = () => {
  const columns = [
    {
      header: 'Nome',
      accessor: 'name',
      editable: true
    },
    {
      header: 'Email',
      accessor: 'email',
      editable: true
    }
  ];

  return (
    <RealtimeDataGrid
      table="users"
      columns={columns}
      keyExtractor={(item) => item.id}
      title="Usuários"
      editable={true}
    />
  );
};
```

## RealtimeContentCard

Um componente de card que exibe conteúdo que se atualiza automaticamente em tempo real.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `table` | string | Nome da tabela no Supabase |
| `contentId` | string | ID do conteúdo a ser exibido |
| `renderContent` | (content: T, isUpdating: boolean) => React.ReactNode | Função para renderizar o conteúdo |
| `renderHeader` | (content: T) => React.ReactNode? | Função para renderizar o cabeçalho |
| `renderFooter` | (content: T) => React.ReactNode? | Função para renderizar o rodapé |
| `fetchFunction` | (id: string) => Promise<T>? | Função personalizada para buscar dados |
| `onUpdate` | (content: T) => Promise<void>? | Função chamada quando o conteúdo é atualizado |
| `className` | string? | Classes CSS adicionais |
| `loadingFallback` | React.ReactNode? | Componente exibido durante o carregamento |
| `errorFallback` | (error: string) => React.ReactNode? | Função para renderizar erros |

### Exemplo de Uso

```tsx
import { RealtimeContentCard } from '../components/realtime';

const MyComponent = () => {
  return (
    <RealtimeContentCard
      table="posts"
      contentId="123"
      renderHeader={(post) => <h2>{post.title}</h2>}
      renderContent={(post, isUpdating) => (
        <div className={isUpdating ? 'bg-yellow-50' : ''}>
          {post.content}
        </div>
      )}
    />
  );
};
```

## RealtimeStatusIndicator

Um componente que exibe o status da conexão em tempo real e últimas atualizações.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `table` | string? | Nome da tabela para monitorar (opcional) |
| `showLastUpdate` | boolean? | Se deve mostrar a última atualização |
| `showConnectionStatus` | boolean? | Se deve mostrar o status da conexão |
| `className` | string? | Classes CSS adicionais |
| `variant` | 'minimal' \| 'badge' \| 'detailed'? | Estilo do indicador |
| `onStatusChange` | (isConnected: boolean) => void? | Função chamada quando o status muda |

### Exemplo de Uso

```tsx
import { RealtimeStatusIndicator } from '../components/realtime';

const MyComponent = () => {
  return (
    <div className="flex justify-between items-center">
      <h1>Meu Aplicativo</h1>
      <RealtimeStatusIndicator variant="badge" />
    </div>
  );
};
```

## useOptimizedRealtime Hook

Um hook otimizado para usar assinaturas em tempo real do Supabase com recursos para debounce, batch updates e prevenção de re-renderizações desnecessárias.

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `table` | string | Nome da tabela no Supabase |
| `event` | RealtimeEvent? | Tipo de evento ('INSERT', 'UPDATE', 'DELETE', '*') |
| `filter` | string? | Filtro opcional para a tabela |
| `enabled` | boolean? | Se a assinatura está ativa |
| `initialData` | T[]? | Dados iniciais |
| `keyExtractor` | (item: T) => string | Função para extrair a chave única de cada item |
| `debounceMs` | number? | Tempo de debounce em ms |
| `batchUpdates` | boolean? | Se deve agrupar atualizações |
| `onInsert` | (item: T) => void? | Callback para inserções |
| `onUpdate` | (item: T) => void? | Callback para atualizações |
| `onDelete` | (item: T) => void? | Callback para exclusões |
| `onBatchUpdate` | (items: T[]) => void? | Callback para atualizações em lote |

### Retorno

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `items` | T[] | Itens atuais |
| `setItems` | React.Dispatch<React.SetStateAction<T[]>> | Função para atualizar itens |
| `isSubscribed` | boolean | Se está inscrito nos eventos |
| `lastEvent` | any | Último evento recebido |
| `error` | Error \| null | Erro, se houver |
| `flushUpdates` | () => void | Função para forçar processamento de atualizações pendentes |

### Exemplo de Uso

```tsx
import { useOptimizedRealtime } from '../hooks';

const MyComponent = () => {
  const { items, isSubscribed } = useOptimizedRealtime({
    table: 'users',
    keyExtractor: (user) => user.id,
    batchUpdates: true,
    debounceMs: 500
  });

  return (
    <div>
      <h1>Usuários ({isSubscribed ? 'Conectado' : 'Desconectado'})</h1>
      <ul>
        {items.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

## Boas Práticas

### Otimização de Renderização

1. **Memoização de Componentes**: Use `React.memo` para componentes que não precisam ser re-renderizados frequentemente.

```tsx
const UserItem = React.memo(({ user }) => (
  <div>{user.name}</div>
));
```

2. **Debounce para Atualizações Frequentes**: Use o parâmetro `debounceMs` do hook `useOptimizedRealtime` para limitar a frequência de atualizações.

3. **Batch Updates**: Ative o parâmetro `batchUpdates` para agrupar múltiplas atualizações em uma única re-renderização.

### Prevenção de Vazamento de Memória

1. **Cancelar Assinaturas**: Os componentes e hooks gerenciam automaticamente o ciclo de vida das assinaturas, mas certifique-se de que componentes personalizados também cancelem suas assinaturas.

2. **Limitar Escopo**: Assine apenas as tabelas e eventos necessários para cada componente.

### Feedback Visual

1. **Indicadores de Atualização**: Use o parâmetro `isUpdating` do `RealtimeContentCard` para fornecer feedback visual quando o conteúdo é atualizado.

2. **Status de Conexão**: Use o `RealtimeStatusIndicator` para mostrar o status da conexão em tempo real.

### Tratamento de Erros

1. **Fallbacks**: Forneça componentes de fallback para estados de erro e carregamento.

2. **Retry**: Implemente lógica de retry para operações que podem falhar devido a problemas de conexão.

```tsx
import { useRetry } from '../hooks';

const { execute, isLoading, error } = useRetry(
  async () => await DatabaseService.query('users'),
  { maxRetries: 3 }
);
```

### Desempenho

1. **Paginação**: Use paginação para conjuntos grandes de dados.

2. **Filtros**: Limite o escopo das assinaturas com filtros apropriados.

3. **Lazy Loading**: Carregue componentes e dados apenas quando necessário.

4. **Virtualização**: Para listas longas, considere usar virtualização com bibliotecas como `react-window` ou `react-virtualized`.