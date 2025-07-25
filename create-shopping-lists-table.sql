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
INSERT INTO shopping_lists (id, name, description, user_id, total_amount)
VALUES
  (uuid_generate_v4(), 'Compras da Semana', 'Lista semanal de compras', 'd2474a88-ecdf-426e-8599-dda82f58141f', 125.50),
  (uuid_generate_v4(), 'Lista de Emergência', 'Itens essenciais para emergências', 'd2474a88-ecdf-426e-8599-dda82f58141f', 45.30),
  (uuid_generate_v4(), 'Festa de Aniversário', 'Compras para a festa', 'd2474a88-ecdf-426e-8599-dda82f58141f', 89.75)
ON CONFLICT (id) DO NOTHING;