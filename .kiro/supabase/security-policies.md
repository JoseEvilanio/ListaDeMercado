# Políticas de Segurança (RLS) do Supabase

Este documento descreve em detalhes as políticas de segurança Row Level Security (RLS) implementadas no banco de dados Supabase.

## Visão Geral do RLS

O Row Level Security (RLS) é um recurso do PostgreSQL que permite controlar quais linhas de uma tabela podem ser acessadas por diferentes usuários. O Supabase utiliza RLS para implementar controle de acesso granular aos dados.

## Habilitando RLS

Para cada tabela no banco de dados, o RLS deve ser explicitamente habilitado:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

Por padrão, quando o RLS é habilitado para uma tabela, todas as operações são bloqueadas a menos que uma política específica permita o acesso.

## Políticas Implementadas

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

Esta política permite que um usuário atualize apenas seu próprio registro, verificando se o ID do usuário autenticado (`auth.uid()`) corresponde ao ID do registro que está sendo atualizado.

### Tabela: profiles

#### 1. Leitura de Perfis

```sql
CREATE POLICY "Usuários podem ler qualquer perfil"
  ON profiles FOR SELECT
  USING (true);
```

Esta política permite que qualquer usuário autenticado leia informações de qualquer perfil no sistema.

#### 2. Atualização de Perfis

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

Esta política permite que um usuário atualize apenas seu próprio perfil, verificando se o ID do usuário autenticado corresponde ao ID do perfil que está sendo atualizado.

### Tabela: content

#### 1. Leitura de Conteúdo

```sql
CREATE POLICY "Usuários podem ler qualquer conteúdo"
  ON content FOR SELECT
  USING (true);
```

Esta política permite que qualquer usuário autenticado leia qualquer conteúdo no sistema.

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

Esta política permite que qualquer usuário autenticado leia qualquer interação no sistema.

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

## Políticas para Administradores

Para permitir que administradores tenham acesso completo a todas as tabelas, podemos criar políticas específicas:

```sql
-- Exemplo de política para administradores na tabela users
CREATE POLICY "Administradores podem gerenciar todos os usuários"
  ON users
  USING (auth.jwt() ->> 'role' = 'admin');
```

Para implementar isso, precisamos adicionar um campo `role` aos claims do JWT durante o processo de autenticação.

## Testando Políticas de Segurança

Para testar se as políticas estão funcionando corretamente, podemos usar o seguinte procedimento:

1. **Autenticar como usuário regular**:
   ```javascript
   const { user, error } = await supabase.auth.signIn({
     email: 'usuario@exemplo.com',
     password: 'senha123'
   });
   ```

2. **Tentar acessar dados próprios**:
   ```javascript
   const { data, error } = await supabase
     .from('content')
     .select('*')
     .eq('user_id', user.id);
   ```
   Este acesso deve ser permitido.

3. **Tentar modificar dados de outro usuário**:
   ```javascript
   const { data, error } = await supabase
     .from('content')
     .update({ title: 'Novo título' })
     .eq('id', 'id-de-conteudo-de-outro-usuario');
   ```
   Este acesso deve ser negado, e `error` deve conter uma mensagem de erro.

4. **Autenticar como administrador** (se implementado):
   ```javascript
   const { user, error } = await supabase.auth.signIn({
     email: 'admin@exemplo.com',
     password: 'senha123'
   });
   ```

5. **Tentar modificar dados de qualquer usuário**:
   ```javascript
   const { data, error } = await supabase
     .from('content')
     .update({ title: 'Novo título' })
     .eq('id', 'id-de-conteudo-de-outro-usuario');
   ```
   Se o usuário for um administrador, este acesso deve ser permitido.

## Considerações de Segurança Adicionais

### 1. Validação no Cliente

Além das políticas RLS, é importante implementar validação no cliente para fornecer feedback imediato aos usuários:

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

Para operações sensíveis, é recomendável implementar um sistema de auditoria:

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

-- Exemplo de trigger para auditoria
CREATE OR REPLACE FUNCTION audit_content_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, 'content', NEW.id, 
          CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(OLD) END,
          CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE row_to_json(NEW) END);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_audit
AFTER INSERT OR UPDATE OR DELETE ON content
FOR EACH ROW EXECUTE FUNCTION audit_content_changes();
```

### 3. Proteção contra Injeção SQL

O Supabase já fornece proteção contra injeção SQL através de consultas parametrizadas, mas é importante garantir que todas as consultas sigam as melhores práticas:

```javascript
// Bom: Usar métodos do Supabase com parâmetros
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// Ruim: Concatenar strings para formar consultas SQL
const { data, error } = await supabase
  .rpc('custom_query', { 
    query_string: `SELECT * FROM users WHERE id = '${userId}'` // Vulnerável a injeção SQL
  });
```