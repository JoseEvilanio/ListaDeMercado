# Documentação da API e Serviços

## Visão Geral

Esta documentação fornece informações detalhadas sobre a API, serviços, estrutura do banco de dados e políticas de segurança implementadas no aplicativo utilizando o Supabase como banco de dados.

## Conteúdo

1. [Integração com Supabase](./supabase-integration.md)
   - Configuração do Supabase
   - Serviços implementados
   - Autenticação
   - Operações de banco de dados
   - Funcionalidades em tempo real

2. [Estrutura do Banco de Dados](./database-structure.md)
   - Esquema do banco de dados
   - Tabelas e relacionamentos
   - Índices e otimizações
   - Triggers e funções
   - Estratégias de backup e recuperação

3. [Políticas de Segurança](./security-policies.md)
   - Row Level Security (RLS)
   - Políticas por tabela
   - Políticas para administradores
   - Medidas de segurança adicionais
   - Testes de segurança

## Como Usar Esta Documentação

- Para entender a integração com o Supabase e os serviços disponíveis, consulte [Integração com Supabase](./supabase-integration.md).
- Para entender a estrutura do banco de dados, consulte [Estrutura do Banco de Dados](./database-structure.md).
- Para entender as políticas de segurança implementadas, consulte [Políticas de Segurança](./security-policies.md).

## Exemplos de Uso

### Autenticação

```typescript
import { AuthService } from '../services/auth.service';

// Registrar um novo usuário
const { user, error } = await AuthService.signUp('usuario@exemplo.com', 'senha123', 'Nome do Usuário');

// Fazer login
const { session, user, error } = await AuthService.signIn('usuario@exemplo.com', 'senha123');
```

### Operações de Banco de Dados

```typescript
import { DatabaseService } from '../services/database.service';

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

### Funcionalidades em Tempo Real

```typescript
import { RealtimeService } from '../services/realtime.service';

// Assinar eventos de inserção na tabela content
const unsubscribe = RealtimeService.onInsert(
  'content',
  (payload) => {
    console.log('Novo conteúdo criado:', payload.new);
    // Atualizar a UI com o novo conteúdo
  }
);

// Cancelar assinatura quando o componente for desmontado
useEffect(() => {
  return () => {
    unsubscribe();
  };
}, []);
```

## Recursos Adicionais

- [Documentação oficial do Supabase](https://supabase.io/docs)
- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)
- [Guia de Row Level Security do PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)