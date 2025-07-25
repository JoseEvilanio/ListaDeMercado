# 🗃️ Guia Manual: Criar Tabela shopping_items no Supabase

## 📋 Passo a Passo

### 1. **Acesse o Dashboard do Supabase**
- Vá para: https://supabase.com/dashboard/project/fvmkpwouqxnhtmlydjui
- Faça login na sua conta

### 2. **Abra o SQL Editor**
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique em **"New query"** para criar uma nova consulta

### 3. **Cole o SQL Abaixo**
```sql
-- Criar tabela shopping_items
CREATE TABLE IF NOT EXISTS shopping_items (
  id BIGSERIAL PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
  is_in_cart BOOLEAN DEFAULT FALSE,
  is_sold_by_weight BOOLEAN DEFAULT FALSE,
  weight_kg DECIMAL(8,3) DEFAULT 0 CHECK (weight_kg >= 0),
  price_per_kg DECIMAL(10,2) DEFAULT 0 CHECK (price_per_kg >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id ON shopping_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_created_at ON shopping_items(created_at);
CREATE INDEX IF NOT EXISTS idx_shopping_items_is_in_cart ON shopping_items(is_in_cart);

-- Habilitar RLS (Row Level Security)
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view their own shopping items" ON shopping_items
    FOR SELECT USING (
        shopping_list_id IN (
            SELECT id FROM shopping_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own shopping items" ON shopping_items
    FOR INSERT WITH CHECK (
        shopping_list_id IN (
            SELECT id FROM shopping_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own shopping items" ON shopping_items
    FOR UPDATE USING (
        shopping_list_id IN (
            SELECT id FROM shopping_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own shopping items" ON shopping_items
    FOR DELETE USING (
        shopping_list_id IN (
            SELECT id FROM shopping_lists WHERE user_id = auth.uid()
        )
    );
```

### 4. **Execute o SQL**
- Clique no botão **"Run"** (ou pressione Ctrl+Enter)
- Aguarde a execução completar
- Você deve ver uma mensagem de sucesso

### 5. **Verificar se a Tabela foi Criada**
- Vá para a aba **"Table Editor"** no menu lateral
- Você deve ver a tabela **"shopping_items"** na lista
- Clique nela para ver a estrutura

### 6. **Inserir Dados de Teste (Opcional)**
```sql
-- Inserir alguns itens de exemplo
INSERT INTO shopping_items (shopping_list_id, name, quantity, price, is_in_cart) 
SELECT 
    id as shopping_list_id,
    'Leite' as name,
    1 as quantity,
    4.50 as price,
    false as is_in_cart
FROM shopping_lists 
WHERE name = 'Compras do Mês' 
LIMIT 1;

INSERT INTO shopping_items (shopping_list_id, name, quantity, price, is_in_cart) 
SELECT 
    id as shopping_list_id,
    'Pão' as name,
    2 as quantity,
    3.00 as price,
    false as is_in_cart
FROM shopping_lists 
WHERE name = 'Compras do Mês' 
LIMIT 1;

INSERT INTO shopping_items (shopping_list_id, name, is_sold_by_weight, weight_kg, price_per_kg, is_in_cart) 
SELECT 
    id as shopping_list_id,
    'Carne Bovina' as name,
    true as is_sold_by_weight,
    1.5 as weight_kg,
    35.00 as price_per_kg,
    true as is_in_cart
FROM shopping_lists 
WHERE name = 'Compras do Mês' 
LIMIT 1;
```

## ✅ **Após Criar a Tabela**

1. **Recarregue a aplicação**: http://localhost:5175/
2. **Faça login** novamente
3. **Clique na lista** "Compras do Mês"
4. **Teste adicionar itens** - agora deve salvar no banco!

## 🎯 **Resultado Esperado**

Após criar a tabela, os erros do console devem desaparecer:
- ❌ `relation "public.shopping_items" does not exist` → ✅ Resolvido
- ❌ `404 (Not Found)` → ✅ Resolvido
- ✅ Itens serão salvos no banco de dados
- ✅ Funcionalidade completa disponível

## 📊 **Estrutura da Tabela**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único do item |
| `shopping_list_id` | UUID | ID da lista (FK) |
| `name` | VARCHAR(255) | Nome do produto |
| `quantity` | INTEGER | Quantidade (unidades) |
| `price` | DECIMAL(10,2) | Preço unitário |
| `is_in_cart` | BOOLEAN | Se está no carrinho |
| `is_sold_by_weight` | BOOLEAN | Se é vendido por peso |
| `weight_kg` | DECIMAL(8,3) | Peso em kg |
| `price_per_kg` | DECIMAL(10,2) | Preço por kg |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

---

**Execute esses passos e me avise quando terminar!** 🚀