# Serviço de Tempo Real (Realtime)

Este documento descreve como utilizar as funcionalidades em tempo real do Supabase implementadas no aplicativo.

## Visão Geral

O sistema de tempo real permite que a aplicação receba atualizações instantâneas quando dados são modificados no banco de dados Supabase, sem a necessidade de recarregar a página ou fazer polling. Isso é implementado usando o sistema de Realtime do Supabase, que utiliza WebSockets para transmitir alterações do banco de dados PostgreSQL para os clientes conectados.

## Arquitetura

A implementação de tempo real é composta por vários componentes:

1. **RealtimeSubscriptionManager**: Gerenciador de baixo nível para canais e assinaturas
2. **RealtimeService**: Serviço principal para interagir com as funcionalidades em tempo real
3. **RealtimeChannelService**: Serviço para gerenciar canais pré-configurados
4. **Hooks React**: `useRealtime` e `useMultiTableRealtime` para uso em componentes
5. **RealtimeContext**: Contexto React para gerenciar o estado global das assinaturas

## Como Usar

### Hooks Básicos

#### useRealtime

O hook `useRealtime` permite assinar eventos em tempo real para uma tabela específica:

```tsx
import useRealtime from '../hooks/useRealtime';

function MyComponent() {
  const { isSubscribed, lastEvent } = useRealtime({
    table: 'shopping_lists',
    onInsert: (payload) => {
      console.log('Nova lista adicionada:', payload.new);
    },
    onUpdate: (payload) => {
      console.log('Lista atualizada:', payload.new);
    },
    onDelete: (payload) => {
      console.log('Lista removida:', payload.old);
    }
  });

  return (
    <div>
      Status da assinatura: {isSubscribed ? 'Ativo' : 'Inativo'}
    </div>
  );
}
```

#### useMultiTableRealtime

O hook `useMultiTableRealtime` permite assinar eventos em tempo real para múltiplas tabelas:

```tsx
import useMultiTableRealtime from '../hooks/useMultiTableRealtime';

function MyComponent() {
  const { isSubscribed, lastEvents } = useMultiTableRealtime({
    channelName: 'my_channel',
    tables: [
      { table: 'shopping_lists' },
      { table: 'shopping_items', filter: 'shopping_list_id=eq.123' }
    ],
    callbacks: {
      shopping_lists: {
        onInsert: (payload) => {
          console.log('Nova lista adicionada:', payload.new);
        }
      },
      shopping_items: {
        onUpdate: (payload) => {
          console.log('Item atualizado:', payload.new);
        }
      }
    }
  });

  return (
    <div>
      Status da assinatura: {isSubscribed ? 'Ativo' : 'Inativo'}
    </div>
  );
}
```

### Contexto de Tempo Real

Para gerenciar o estado global das assinaturas em tempo real, use o `RealtimeContext`:

```tsx
// No arquivo principal da aplicação
import { RealtimeProvider } from '../contexts/RealtimeContext';

function App() {
  return (
    <RealtimeProvider autoInitialize={true}>
      {/* Componentes da aplicação */}
    </RealtimeProvider>
  );
}

// Em qualquer componente
import { useRealtimeContext } from '../contexts/RealtimeContext';

function MyComponent() {
  const { 
    isInitialized, 
    connectionStatus, 
    channelCount,
    reconnect,
    unsubscribeAll
  } = useRealtimeContext();

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <p>Canais ativos: {channelCount}</p>
      <button onClick={reconnect}>Reconectar</button>
      <button onClick={unsubscribeAll}>Desconectar</button>
    </div>
  );
}
```

### Serviços Diretos

Para casos mais avançados, você pode usar os serviços diretamente:

```typescript
import { RealtimeService } from '../services/realtime.service';
import { RealtimeChannelService } from '../services/realtime-channel.service';

// Assinar eventos de uma tabela
const unsubscribe = RealtimeService.onInsert(
  'shopping_lists',
  (payload) => {
    console.log('Nova lista adicionada:', payload.new);
  }
);

// Criar um canal para múltiplas tabelas
await RealtimeService.createMultiTableChannel(
  'my_channel',
  [
    { table: 'shopping_lists' },
    { table: 'shopping_items' }
  ]
);

// Usar canais pré-configurados
await RealtimeChannelService.initializeChannels(['shopping_lists']);

// Cancelar todas as assinaturas
RealtimeService.unsubscribeAll();
```

## Canais Pré-configurados

O sistema vem com alguns canais pré-configurados:

- `shopping_lists`: Para listas de compras e seus itens
- `users_profiles`: Para usuários e perfis
- `content_interactions`: Para conteúdo e interações

Para adicionar novos canais pré-configurados, modifique o método `registerDefaultChannels` no arquivo `RealtimeChannelService`.

## Tratamento de Erros

O sistema inclui tratamento de erros robusto:

```tsx
import useRealtime from '../hooks/useRealtime';

function MyComponent() {
  const { error } = useRealtime({
    table: 'shopping_lists',
    onError: (err) => {
      console.error('Erro na assinatura:', err);
    }
  });

  if (error) {
    return <div>Erro: {error.message}</div>;
  }

  return <div>Componente funcionando normalmente</div>;
}
```

## Reconexão Automática

O sistema tenta reconectar automaticamente quando:

1. A conexão de rede é perdida e restaurada
2. Ocorrem erros temporários de conexão
3. O dispositivo entra em modo de suspensão e é reativado

A reconexão usa backoff exponencial para evitar sobrecarregar o servidor.

## Componentes de Demonstração

O sistema inclui dois componentes de demonstração:

1. `RealtimeStatus`: Exibe o status das assinaturas em tempo real
2. `RealtimeShoppingListDemo`: Demonstra o uso de tempo real com listas de compras

## Considerações de Desempenho

- Limite o número de assinaturas ativas simultaneamente
- Use filtros para reduzir o volume de dados recebidos
- Agrupe tabelas relacionadas em um único canal quando possível
- Cancele assinaturas quando não forem mais necessárias

## Depuração

Para depurar problemas com as assinaturas em tempo real:

1. Verifique o status da conexão com `RealtimeService.getConnectionStatus()`
2. Inspecione os canais ativos com `RealtimeService.getChannelNames()`
3. Verifique os logs no console para mensagens de erro
4. Use o componente `RealtimeStatus` para visualizar o estado das assinaturas