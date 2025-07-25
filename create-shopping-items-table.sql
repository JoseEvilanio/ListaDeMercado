-- Criar tabela shopping_items no Supabase
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

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopping_items_updated_at 
    BEFORE UPDATE ON shopping_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- Comentários para documentação
COMMENT ON TABLE shopping_items IS 'Itens das listas de compras dos usuários';
COMMENT ON COLUMN shopping_items.shopping_list_id IS 'ID da lista de compras (FK)';
COMMENT ON COLUMN shopping_items.name IS 'Nome do produto';
COMMENT ON COLUMN shopping_items.quantity IS 'Quantidade do produto (para venda por unidade)';
COMMENT ON COLUMN shopping_items.price IS 'Preço unitário do produto';
COMMENT ON COLUMN shopping_items.is_in_cart IS 'Se o item está no carrinho (comprado)';
COMMENT ON COLUMN shopping_items.is_sold_by_weight IS 'Se o produto é vendido por peso (kg)';
COMMENT ON COLUMN shopping_items.weight_kg IS 'Peso em kg (para venda por peso)';
COMMENT ON COLUMN shopping_items.price_per_kg IS 'Preço por kg (para venda por peso)';

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO shopping_items (shopping_list_id, name, quantity, price, is_in_cart) 
SELECT 
    id as shopping_list_id,
    'Leite' as name,
    1 as quantity,
    4.50 as price,
    false as is_in_cart
FROM shopping_lists 
WHERE name = 'Compras do Mês' 
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO shopping_items (shopping_list_id, name, quantity, price, is_in_cart) 
SELECT 
    id as shopping_list_id,
    'Pão' as name,
    2 as quantity,
    3.00 as price,
    false as is_in_cart
FROM shopping_lists 
WHERE name = 'Compras do Mês' 
LIMIT 1
ON CONFLICT DO NOTHING;

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
LIMIT 1
ON CONFLICT DO NOTHING;