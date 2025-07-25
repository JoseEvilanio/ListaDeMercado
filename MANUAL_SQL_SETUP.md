# Setup Manual da Tabela Shopping Lists

## Passo 1: Acesse o Supabase Dashboard
1. Vá para https://app.supabase.io
2. Selecione o projeto: fvmkpwouqxnhtmlydjui
3. Clique em "SQL Editor"

## Passo 2: Execute este SQL

```sql
-- Criar tabela de listas de compras
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON shopping_lists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Inserir algumas listas de exemplo para o usuário logado
INSERT INTO shopping_lists (name, description, user_id, total_amount)
VALUES
  ('Compras da Semana', 'Lista semanal de compras', 'd2474a88-ecdf-426e-8599-dda82f58141f', 125.50),
  ('Lista de Emergência', 'Itens essenciais para emergências', 'd2474a88-ecdf-426e-8599-dda82f58141f', 45.30),
  ('Festa de Aniversário', 'Compras para a festa', 'd2474a88-ecdf-426e-8599-dda82f58141f', 89.75);
```

## Passo 3: Habilitar Email Logins
1. Vá para Authentication → Settings
2. Habilite:
   - ✅ Enable email signups
   - ✅ Enable email logins
   - ✅ Enable email confirmations (opcional)
3. Clique em Save

## Passo 4: Teste na Aplicação
1. Faça login com: jose_evilanio@hotmail.com / Mae@2106
2. Tente criar uma nova lista
3. Deve funcionar perfeitamente!

## Verificação
Após executar o SQL, você deve ver:
- ✅ Tabela `shopping_lists` criada
- ✅ 3 listas de exemplo inseridas
- ✅ Funcionalidade de criar listas funcionando na aplicação