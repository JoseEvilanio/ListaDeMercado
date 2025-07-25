# Usando o Supabase no Frontend

Este documento explica como usar o cliente Supabase no frontend da aplicação.

## Configuração

O cliente Supabase está configurado no arquivo `supabase.ts`. As configurações específicas para cada ambiente (desenvolvimento, teste, produção) estão no arquivo `config.ts`.

## Variáveis de Ambiente

As variáveis de ambiente são definidas no arquivo `.env` na raiz do projeto. Para desenvolvimento local, você pode criar um arquivo `.env.local` que não será versionado pelo Git.

```
VITE_SUPABASE_URL=sua-url-do-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

## Autenticação

O componente `SupabaseProvider` fornece acesso ao estado de autenticação e funções relacionadas para toda a aplicação.

### Exemplo de Uso

```tsx
import { useSupabase } from './components/SupabaseProvider';

function LoginPage() {
  const { signIn, signUp, signOut, user, loading } = useSupabase();
  
  const handleLogin = async (email, password) => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Erro ao fazer login:', error);
    }
  };
  
  return (
    <div>
      {loading ? (
        <p>Carregando...</p>
      ) : user ? (
        <div>
          <p>Logado como: {user.email}</p>
          <button onClick={signOut}>Sair</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          {/* Formulário de login */}
        </form>
      )}
    </div>
  );
}
```

## Hooks Personalizados

### useAuth

Hook para gerenciar autenticação.

```tsx
import { useAuth } from './hooks/useSupabase';

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <p>Carregando...</p>;
  if (!user) return <p>Não autenticado</p>;
  
  return (
    <div>
      <h1>Perfil de {user.name}</h1>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### useProfile

Hook para gerenciar perfis de usuário.

```tsx
import { useProfile } from './hooks/useSupabase';

function UserProfile({ userId }) {
  const { profile, loading, updateProfile } = useProfile(userId);
  
  if (loading) return <p>Carregando...</p>;
  if (!profile) return <p>Perfil não encontrado</p>;
  
  const handleUpdateBio = async (newBio) => {
    const { error } = await updateProfile({ bio: newBio });
    if (error) {
      console.error('Erro ao atualizar bio:', error);
    }
  };
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.bio || 'Sem bio'}</p>
      <button onClick={() => handleUpdateBio('Nova bio')}>Atualizar Bio</button>
    </div>
  );
}
```

### useContent

Hook para gerenciar conteúdo.

```tsx
import { useContent } from './hooks/useSupabase';

function ContentList() {
  const { contents, loading, fetchContents, createContent, updateContent, deleteContent } = useContent();
  
  useEffect(() => {
    fetchContents();
  }, []);
  
  if (loading) return <p>Carregando...</p>;
  
  return (
    <div>
      <h1>Conteúdos</h1>
      <ul>
        {contents.map(content => (
          <li key={content.id}>
            <h2>{content.title}</h2>
            <p>{content.body}</p>
            <button onClick={() => updateContent(content.id, { title: 'Título Atualizado' })}>
              Atualizar
            </button>
            <button onClick={() => deleteContent(content.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => createContent('Novo Conteúdo', 'Corpo do conteúdo', userId)}>
        Criar Novo
      </button>
    </div>
  );
}
```

### useInteractions

Hook para gerenciar interações.

```tsx
import { useInteractions } from './hooks/useSupabase';

function ContentInteractions({ contentId, userId }) {
  const { interactions, loading, fetchInteractions, createInteraction, deleteInteraction } = useInteractions();
  
  useEffect(() => {
    fetchInteractions(contentId);
  }, [contentId]);
  
  if (loading) return <p>Carregando...</p>;
  
  const likeCount = interactions.filter(i => i.type === 'like').length;
  
  const handleLike = async () => {
    const userLike = interactions.find(i => i.user_id === userId && i.type === 'like');
    
    if (userLike) {
      await deleteInteraction(userLike.id);
    } else {
      await createInteraction(contentId, userId, 'like');
    }
  };
  
  return (
    <div>
      <button onClick={handleLike}>
        {interactions.some(i => i.user_id === userId && i.type === 'like') ? 'Descurtir' : 'Curtir'}
      </button>
      <span>{likeCount} curtidas</span>
    </div>
  );
}
```

## Tempo Real (Realtime)

O Supabase oferece recursos de tempo real para manter os dados sincronizados entre clientes. Exemplo:

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function RealtimeContent({ contentId }) {
  const [content, setContent] = useState(null);
  
  useEffect(() => {
    // Buscar conteúdo inicial
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .single();
        
      if (!error) {
        setContent(data);
      }
    };
    
    fetchContent();
    
    // Configurar assinatura em tempo real
    const subscription = supabase
      .channel('public:content')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'content',
        filter: `id=eq.${contentId}`
      }, (payload) => {
        setContent(payload.new);
      })
      .subscribe();
      
    // Limpar assinatura ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [contentId]);
  
  if (!content) return <p>Carregando...</p>;
  
  return (
    <div>
      <h1>{content.title}</h1>
      <p>{content.body}</p>
    </div>
  );
}
```

## Tratamento de Erros

É importante tratar erros ao interagir com o Supabase:

```tsx
const handleAction = async () => {
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
};
```

## Depuração

Para depurar problemas com o Supabase, você pode habilitar logs detalhados:

```tsx
// Em desenvolvimento
if (config.debug) {
  supabase.realtime.setLogger(console);
}
```