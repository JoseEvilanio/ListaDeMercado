-- Dados iniciais para o banco de dados do aplicativo
-- Este arquivo contém os comandos SQL para inserir dados iniciais nas tabelas

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
  ('d3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'Aprendizado contínuo', 'O aprendizado contínuo é essencial para o desenvolvimento pessoal e profissional em um mundo em constante mudança.', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'),
  ('c4b5a6f7-e8d9-0c1b-2a3c-4d5e6f7a8b9c', 'Introdução ao Supabase', 'Supabase é uma alternativa de código aberto ao Firebase, oferecendo banco de dados PostgreSQL, autenticação e armazenamento.', 'd0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0'),
  ('b5a6f7e8-d90c-1b2a-3c4d-5e6f7a8b9c0d', 'Alimentação saudável', 'Uma alimentação equilibrada é fundamental para manter a saúde e prevenir doenças.', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f')
ON CONFLICT (id) DO NOTHING;

-- Relacionar conteúdo com categorias
INSERT INTO content_categories (content_id, category_id)
VALUES
  ('f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'f7e8d9c0-b1a2-3c4d-5e6f-7a8b9c0d1e2f'), -- React -> Tecnologia
  ('c4b5a6f7-e8d9-0c1b-2a3c-4d5e6f7a8b9c', 'f7e8d9c0-b1a2-3c4d-5e6f-7a8b9c0d1e2f'), -- Supabase -> Tecnologia
  ('e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'e8d9c0b1-a2f3-4e5d-6c7b-8a9b0c1d2e3f'), -- Meditação -> Saúde
  ('b5a6f7e8-d90c-1b2a-3c4d-5e6f7a8b9c0d', 'e8d9c0b1-a2f3-4e5d-6c7b-8a9b0c1d2e3f'), -- Alimentação -> Saúde
  ('d3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'd9c0b1a2-f3e4-5d6c-7b8a-9b0c1d2e3f4a')  -- Aprendizado -> Educação
ON CONFLICT DO NOTHING;

-- Inserir comentários de exemplo
INSERT INTO comments (id, content_id, user_id, body, parent_id)
VALUES
  ('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'Ótimo artigo sobre React!', NULL),
  ('b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', 'f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Concordo, muito útil para iniciantes.', 'a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d'),
  ('c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', 'e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'd0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0', 'Comecei a meditar recentemente e já sinto os benefícios!', NULL),
  ('d0e1f2a3-b4c5-6d7e-8f9a-0b1c2d3e4f5a', 'd3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'Recomendo o livro "Mindset" sobre este tema.', NULL)
ON CONFLICT (id) DO NOTHING;

-- Inserir interações de exemplo
INSERT INTO interactions (id, user_id, content_id, type)
VALUES
  ('e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b', 'd0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0', 'e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'like'),
  ('f2a3b4c5-d6e7-8f9a-0b1c-2d3e4f5a6b7c', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'd3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'like'),
  ('a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'like'),
  ('b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e', 'd0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0', 'd3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b', 'share'),
  ('c5d6e7f8-a9b0-1c2d-3e4f-5a6b7c8d9e0f', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f', 'bookmark'),
  ('d6e7f8a9-b0c1-2d3e-4f5a-6b7c8d9e0f1a', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a', 'share')
ON CONFLICT (id) DO NOTHING;

-- Inserir notificações de exemplo
INSERT INTO notifications (id, user_id, type, data, read)
VALUES
  ('e7f8a9b0-c1d2-3e4f-5a6b-7c8d9e0f1a2b', 'd0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0', 'like', '{"content_id": "f1e2d3c4-b5a6-7f8e-9d0c-1b2a3c4d5e6f", "user_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"}', false),
  ('f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c', 'b9c3f4e2-7d6a-4b5c-8e9f-1a2b3c4d5e6f', 'comment', '{"content_id": "e2d3c4b5-a6f7-8e9d-0c1b-2a3c4d5e6f7a", "user_id": "d0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0", "comment_id": "c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f"}', true),
  ('a9b0c1d2-e3f4-5a6b-7c8d-9e0f1a2b3c4d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'share', '{"content_id": "d3c4b5a6-f7e8-9d0c-1b2a-3c4d5e6f7a8b", "user_id": "d0e7df67-8a5d-4d00-9c0e-91a5c1d3d8f0"}', false)
ON CONFLICT (id) DO NOTHING;