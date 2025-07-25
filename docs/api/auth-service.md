# Serviço de Autenticação

O serviço de autenticação (`AuthService`) é responsável por gerenciar a autenticação de usuários no aplicativo.

## Métodos

### `signIn`

Autentica um usuário com email e senha.

```typescript
static async signIn(email: string, password: string): Promise<{
  user: User | null;
  error: string | null;
}>
```

**Parâmetros:**
- `email`: Email do usuário
- `password`: Senha do usuário

**Retorno:**
- `user`: Objeto com os dados do usuário autenticado, ou `null` em caso de erro
- `error`: Mensagem de erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { user, error } = await AuthService.signIn('usuario@exemplo.com', 'senha123');

if (error) {
  console.error('Erro ao fazer login:', error);
} else {
  console.log('Usuário autenticado:', user);
}
```

### `signUp`

Registra um novo usuário.

```typescript
static async signUp(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<{
  user: User | null;
  error: string | null;
}>
```

**Parâmetros:**
- `email`: Email do usuário
- `password`: Senha do usuário
- `metadata`: Dados adicionais do usuário (opcional)

**Retorno:**
- `user`: Objeto com os dados do usuário registrado, ou `null` em caso de erro
- `error`: Mensagem de erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { user, error } = await AuthService.signUp(
  'novo@exemplo.com',
  'senha123',
  { name: 'Novo Usuário' }
);

if (error) {
  console.error('Erro ao registrar:', error);
} else {
  console.log('Usuário registrado:', user);
}
```

### `signOut`

Encerra a sessão do usuário atual.

```typescript
static async signOut(): Promise<{
  error: string | null;
}>
```

**Retorno:**
- `error`: Mensagem de erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { error } = await AuthService.signOut();

if (error) {
  console.error('Erro ao fazer logout:', error);
} else {
  console.log('Logout realizado com sucesso');
}
```

### `resetPassword`

Envia um email para redefinição de senha.

```typescript
static async resetPassword(email: string): Promise<{
  error: string | null;
}>
```

**Parâmetros:**
- `email`: Email do usuário

**Retorno:**
- `error`: Mensagem de erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { error } = await AuthService.resetPassword('usuario@exemplo.com');

if (error) {
  console.error('Erro ao solicitar redefinição de senha:', error);
} else {
  console.log('Email de redefinição enviado com sucesso');
}
```

### `updatePassword`

Atualiza a senha do usuário.

```typescript
static async updatePassword(password: string): Promise<{
  error: string | null;
}>
```

**Parâmetros:**
- `password`: Nova senha do usuário

**Retorno:**
- `error`: Mensagem de erro, ou `null` em caso de sucesso

**Exemplo:**
```typescript
const { error } = await AuthService.updatePassword('novaSenha123');

if (error) {
  console.error('Erro ao atualizar senha:', error);
} else {
  console.log('Senha atualizada com sucesso');
}
```

## Hook `useSupabase`

O hook `useSupabase` facilita o uso do serviço de autenticação nos componentes React.

```typescript
const {
  user,
  session,
  loading,
  error,
  signIn,
  signUp,
  signOut
} = useSupabase();
```

**Retorno:**
- `user`: Usuário atual ou `null` se não autenticado
- `session`: Sessão atual ou `null` se não autenticado
- `loading`: Indica se uma operação de autenticação está em andamento
- `error`: Mensagem de erro da última operação, ou `null`
- `signIn`: Função para autenticar um usuário
- `signUp`: Função para registrar um novo usuário
- `signOut`: Função para encerrar a sessão

**Exemplo:**
```tsx
import { useSupabase } from '../hooks';

const LoginComponent = () => {
  const { signIn, loading, error } = useSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
};
```