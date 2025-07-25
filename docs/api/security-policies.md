# Políticas de Segurança

## Visão Geral

Este documento descreve as políticas de segurança implementadas no aplicativo, com foco nas políticas de Row Level Security (RLS) do Supabase e outras medidas de segurança adotadas.

## Row Level Security (RLS)

O Row Level Security é um recurso do PostgreSQL que permite controlar quais linhas de uma tabela podem ser acessadas por diferentes usuários. O Supabase utiliza RLS para implementar controle de acesso granular aos dados.

### Habilitando RLS

Para cada tabela no banco de dados, o RLS é explicitamente habilitado:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

Por padrão, quando o RLS é habilitado para uma tabela, todas as operações são bloqueadas a menos que uma política específica permita o acesso.

## Políticas Implementadas por Tabela

### Tabela: users

#### 1. Leitura de Usuários

```sql
CREATE POLICY "Usuários podem ler qualquer usuário"
  ON users FOR SELECT
  USING (true);
```

**Descrição**: Esta política permite que qualquer usuário autenticado leia informações de qualquer usuário no sistema.

**Justificativa**: Informações básicas de usuários são consideradas públicas dentro do aplicativo, permitindo que usuários encontrem e interajam com outros usuários.

#### 2. Atualização de Usuários

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio registro"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Descrição**: Esta política permite que um usuário atualize apenas seu próprio registro, verificando se o ID do usuário autenticado (`auth.uid()`) corresponde ao ID do registro que está sendo atualizado.

**Justificativa**: Protege a integridade dos dados do usuário, garantindo que apenas o próprio usuário possa modificar suas informações.

#### 3. Exclusão de Usuários

```sql
CREATE POLICY "Usuários não podem excluir registros"
  ON users FOR DELETE
  USING (false);
```

**Descrição**: Esta política impede que usuários excluam registros de usuário.

**Justificativa**: A exclusão de usuários é uma operação sensível que deve ser gerenciada através de um processo controlado, como desativação da conta, em vez de exclusão direta.

### Tabela: profiles

#### 1. Leitura de Perfis

```sql
CREATE POLICY "Usuários podem ler qualquer perfil"
  ON profiles FOR SELECT
  USING (true);
```

**Descrição**: Esta política permite que qualquer usuário autenticado leia informações de qualquer perfil no sistema.

**Justificativa**: Perfis de usuários são considerados públicos dentro do aplicativo, permitindo que usuários visualizem informações de perfil de outros usuários.

#### 2. Atualização de Perfis

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Descrição**: Esta política permite que um usuário atualize apenas seu próprio perfil, verificando se o ID do usuário autenticado corresponde ao ID do perfil que está sendo atualizado.

**Justificativa**: Protege a integridade dos dados de perfil, garantindo que apenas o próprio usuário possa modificar suas informações de perfil.

#### 3. Inserção de Perfis

```sql
CREATE POLICY "Usuários só podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Descrição**: Esta política permite que um usuário insira apenas seu próprio perfil.

**Justificativa**: Garante que um usuário só possa criar um perfil para si mesmo, mantendo a integridade do relacionamento entre usuários e perfis.

#### 4. Exclusão de Perfis

```sql
CREATE POLICY "Usuários não podem excluir perfis"
  ON profiles FOR DELETE
  USING (false);
```

**Descrição**: Esta política impede que usuários excluam perfis.

**Justificativa**: A exclusão de perfis deve ser gerenciada em conjunto com a exclusão ou desativação de contas de usuário, não como uma operação independente.

### Tabela: content

#### 1. Leitura de Conteúdo

```sql
CREATE POLICY "Usuários podem ler qualquer conteúdo"
  ON content FOR SELECT
  USING (true);
```

**Descrição**: Esta política permite que qualquer usuário autenticado leia qualquer conteúdo no sistema.

**Justificativa**: O conteúdo é considerado público dentro do aplicativo, permitindo que todos os usuários visualizem o conteúdo criado por outros usuários.

#### 2. Inserção de Conteúdo

```sql
CREATE POLICY "Usuários podem inserir conteúdo"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Descrição**: Esta política permite que um usuário insira conteúdo apenas se o `user_id` do conteúdo corresponder ao ID do usuário autenticado.

**Justificativa**: Garante que um usuário só possa criar conteúdo em seu próprio nome, prevenindo a falsificação de autoria.

#### 3. Atualização de Conteúdo

```sql
CREATE POLICY "Usuários só podem atualizar seu próprio conteúdo"
  ON content FOR UPDATE
  USING (auth.uid() = user_id);
```

**Descrição**: Esta política permite que um usuário atualize apenas o conteúdo que ele mesmo criou.

**Justificativa**: Protege a integridade do conteúdo, garantindo que apenas o autor possa modificar seu próprio conteúdo.

#### 4. Exclusão de Conteúdo

```sql
CREATE POLICY "Usuários só podem deletar seu próprio conteúdo"
  ON content FOR DELETE
  USING (auth.uid() = user_id);
```

**Descrição**: Esta política permite que um usuário exclua apenas o conteúdo que ele mesmo criou.

**Justificativa**: Garante que apenas o autor do conteúdo possa excluí-lo, prevenindo a exclusão não autorizada de conteúdo.

### Tabela: interactions

#### 1. Leitura de Interações

```sql
CREATE POLICY "Usuários podem ler qualquer interação"
  ON interactions FOR SELECT
  USING (true);
```

**Descrição**: Esta política permite que qualquer usuário autenticado leia qualquer interação no sistema.

**Justificativa**: As interações são consideradas públicas dentro do aplicativo, permitindo que todos os usuários vejam como outros usuários interagem com o conteúdo.

#### 2. Inserção de Interações

```sql
CREATE POLICY "Usuários podem inserir interações"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Descrição**: Esta política permite que um usuário insira interações apenas se o `user_id` da interação corresponder ao ID do usuário autenticado.

**Justificativa**: Garante que um usuário só possa criar interações em seu próprio nome, prevenindo a falsificação de interações.

#### 3. Atualização de Interações

```sql
CREATE POLICY "Usuários só podem atualizar suas próprias interações"
  ON interactions FOR UPDATE
  USING (auth.uid() = user_id);
```

**Descrição**: Esta política permite que um usuário atualize apenas as interações que ele mesmo criou.

**Justificativa**: Protege a integridade das interações, garantindo que apenas o autor possa modificar suas próprias interações.

#### 4. Exclusão de Interações

```sql
CREATE POLICY "Usuários só podem deletar suas próprias interações"
  ON interactions FOR DELETE
  USING (auth.uid() = user_id);
```

**Descrição**: Esta política permite que um usuário exclua apenas as interações que ele mesmo criou.

**Justificativa**: Garante que apenas o autor da interação possa excluí-la, prevenindo a exclusão não autorizada de interações.

## Políticas para Administradores

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

**Descrição**: Estas políticas permitem que usuários com função de administrador realizem qualquer operação em qualquer registro das tabelas.

**Justificativa**: Administradores precisam de acesso completo para gerenciar o sistema, moderar conteúdo e resolver problemas.

## Função is_admin()

A função `is_admin()` é utilizada para verificar se o usuário atual tem a função de administrador:

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql;
```

## Medidas de Segurança Adicionais

### 1. Validação no Cliente

Além das políticas RLS, o aplicativo implementa validação no cliente para fornecer feedback imediato aos usuários:

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

**Justificativa**: A validação no cliente melhora a experiência do usuário, evitando que ele tente realizar operações que seriam rejeitadas pelo servidor.

### 2. Auditoria de Acesso

Para operações sensíveis, o aplicativo implementa um sistema de auditoria:

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

**Justificativa**: A auditoria permite rastrear quem fez o quê e quando, facilitando a investigação de incidentes de segurança e o cumprimento de requisitos regulatórios.

### 3. Proteção contra Injeção SQL

O Supabase fornece proteção contra injeção SQL através de consultas parametrizadas:

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

**Justificativa**: A injeção SQL é uma das vulnerabilidades mais comuns em aplicativos web. O uso de consultas parametrizadas previne esse tipo de ataque.

### 4. Autenticação Segura

O aplicativo utiliza o sistema de autenticação do Supabase, que implementa as melhores práticas de segurança:

- Senhas armazenadas com hash e salt
- Tokens JWT para autenticação
- Refresh tokens para renovação de sessão
- Autenticação multifator (quando habilitada)
- Proteção contra ataques de força bruta

**Justificativa**: A autenticação é a primeira linha de defesa do aplicativo. Um sistema de autenticação robusto previne acesso não autorizado.

### 5. HTTPS

Todas as comunicações entre o cliente e o Supabase são realizadas através de HTTPS:

```javascript
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Justificativa**: O HTTPS criptografa as comunicações entre o cliente e o servidor, prevenindo ataques de interceptação (man-in-the-middle).

### 6. Sanitização de Inputs

O aplicativo implementa sanitização de inputs para prevenir ataques de XSS (Cross-Site Scripting):

```javascript
function sanitizeHtml(html) {
  // Implementação de sanitização de HTML
  return sanitizedHtml;
}

// Exemplo de uso
const sanitizedContent = sanitizeHtml(userProvidedContent);
```

**Justificativa**: A sanitização de inputs previne ataques de XSS, que poderiam permitir a execução de código malicioso no navegador dos usuários.

## Testes de Segurança

### 1. Testes de Penetração

O aplicativo é submetido a testes de penetração regulares para identificar vulnerabilidades:

- Testes de injeção SQL
- Testes de XSS
- Testes de CSRF (Cross-Site Request Forgery)
- Testes de escalação de privilégios
- Testes de autenticação e autorização

### 2. Testes Automatizados de Segurança

O aplicativo inclui testes automatizados para verificar a correta aplicação das políticas de segurança:

```javascript
// Exemplo de teste para verificar políticas RLS
test('Usuário não pode atualizar conteúdo de outro usuário', async () => {
  // Autenticar como usuário 1
  await supabase.auth.signIn({ email: 'user1@example.com', password: 'password' });
  
  // Tentar atualizar conteúdo do usuário 2
  const { data, error } = await supabase
    .from('content')
    .update({ title: 'Novo título' })
    .eq('id', 'content-id-do-usuario-2');
    
  // Verificar que a operação foi rejeitada
  expect(error).not.toBeNull();
  expect(data).toBeNull();
});
```

## Monitoramento e Resposta a Incidentes

### 1. Monitoramento de Atividades Suspeitas

O aplicativo implementa monitoramento de atividades suspeitas:

- Tentativas de login malsucedidas
- Padrões de acesso anormais
- Operações sensíveis (exclusão em massa, atualizações em massa)
- Erros de autorização

### 2. Plano de Resposta a Incidentes

O aplicativo possui um plano de resposta a incidentes de segurança:

1. **Detecção**: Identificar e confirmar o incidente
2. **Contenção**: Limitar o impacto do incidente
3. **Erradicação**: Remover a causa raiz do incidente
4. **Recuperação**: Restaurar sistemas e dados afetados
5. **Lições Aprendidas**: Documentar o incidente e implementar melhorias

## Conclusão

As políticas de segurança implementadas no aplicativo seguem as melhores práticas da indústria e são projetadas para proteger os dados dos usuários e a integridade do sistema. O uso de Row Level Security do Supabase fornece uma camada adicional de segurança, garantindo que os usuários só possam acessar e modificar os dados que têm permissão para acessar.