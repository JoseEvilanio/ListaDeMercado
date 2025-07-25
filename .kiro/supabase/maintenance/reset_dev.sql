-- Script para resetar o ambiente de desenvolvimento
-- Este script remove todos os dados e reinicia o banco de dados com dados de exemplo

-- Desabilitar temporariamente os triggers
ALTER TABLE users DISABLE TRIGGER ALL;
ALTER TABLE profiles DISABLE TRIGGER ALL;
ALTER TABLE categories DISABLE TRIGGER ALL;
ALTER TABLE content DISABLE TRIGGER ALL;
ALTER TABLE content_categories DISABLE TRIGGER ALL;
ALTER TABLE comments DISABLE TRIGGER ALL;
ALTER TABLE interactions DISABLE TRIGGER ALL;
ALTER TABLE notifications DISABLE TRIGGER ALL;

-- Limpar tabelas
TRUNCATE TABLE notifications, interactions, comments, content_categories, content, categories, profiles, users CASCADE;

-- Habilitar novamente os triggers
ALTER TABLE users ENABLE TRIGGER ALL;
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE categories ENABLE TRIGGER ALL;
ALTER TABLE content ENABLE TRIGGER ALL;
ALTER TABLE content_categories ENABLE TRIGGER ALL;
ALTER TABLE comments ENABLE TRIGGER ALL;
ALTER TABLE interactions ENABLE TRIGGER ALL;
ALTER TABLE notifications ENABLE TRIGGER ALL;

-- Inserir dados de exemplo
-- Inserir usuários de exemplo
INSERT INTO users (id, email, name)
VALUES
  ('d0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0', 'usuario1@exemplo.com', 'Usuário 1'),
  ('b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'usuario2@exemplo.com', 'Usuário 2'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'usuario3@exemplo.com', 'Usuário 3')
ON CONFLICT (id) DO NOTHING;

-- Inserir perfis de exemplo
INSERT INTO profiles (id, avatar_url, bio)
VALUES
  ('d0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0', 'https://i.pravatar.cc/150?u=1', 'Bio do usuário 1'),
  ('b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'https://i.pravatar.cc/150?u=2', 'Bio do usuário 2'),
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'https://i.pravatar.cc/150?u=3', 'Bio do usuário 3')
ON CONFLICT (id) DO NOTHING;

-- Inserir categorias de exemplo
INSERT INTO categories (id, name, description)
VALUES
  ('f7e8d9c0-b1a2-3c4d-5e6f-7a8b9c0d1e2f', 'Tecnologia', 'Artigos sobre tecnologia e inovação'),
  ('e8d9c0b1-a2f3-4e5d-6c7b-8a9b0c1d2e3f', 'Saúde', 'Dicas e informações sobre saúde e bem-estar'),
  ('d9c0b1a2-f3e4-5d6c-7b8a-9b0c1d2e3f4a', 'Educação', 'Conteúdo educacional e acadêmico')
ON CONFLICT (id) DO NOTHING;

-- Inserir conteúdo de exemplo
INSERT INTO content (id, title, body, user_id)
VALUES
  ('f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'Introdução ao React', 'React é uma biblioteca JavaScript para construir interfaces de usuário. É mantida pelo Facebook e uma comunidade de desenvolvedores individuais e empresas.', 'd0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0'),
  ('e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'Benefícios da meditação', 'A meditação pode ajudar a reduzir o estresse, melhorar a concentração e promover o bem-estar emocional.', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f'),
  ('d3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'Aprendizado contínuo', 'O aprendizado contínuo é essencial para o desenvolvimento pessoal e profissional em um mundo em constante mudança.', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
ON CONFLICT (id) DO NOTHING;

-- Relacionar conteúdo com categorias
INSERT INTO content_categories (content_id, category_id)
VALUES
  ('f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'f7e8d9c0-b1a2-3c4d-5e6f-7a8b9c0d1e2f'), -- React -> Tecnologia
  ('e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'e8d9c0b1-a2f3-4e5d-6c7b-8a9b0c1d2e3f'), -- Meditação -> Saúde
  ('d3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'd9c0b1a2-f3e4-5d6c-7b8a-9b0c1d2e3f4a')  -- Aprendizado -> Educação
ON CONFLICT DO NOTHING;

-- Registrar reset
CREATE TABLE IF NOT EXISTS reset_log (
  id SERIAL PRIMARY KEY,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reset_by TEXT,
  environment TEXT
);

-- Registrar reset
INSERT INTO reset_log (reset_by, environment)
VALUES (current_user, 'development');

-- Exibir resultado do reset
SELECT 'Reset do ambiente de desenvolvimento concluído com sucesso!' AS message;
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'profiles' AS table_name, COUNT(*) AS record_count FROM profiles
UNION ALL
SELECT 'categories' AS table_name, COUNT(*) AS record_count FROM categories
UNION ALL
SELECT 'content' AS table_name, COUNT(*) AS record_count FROM content
UNION ALL
SELECT 'content_categories' AS table_name, COUNT(*) AS record_count FROM content_categories
ORDER BY table_name;