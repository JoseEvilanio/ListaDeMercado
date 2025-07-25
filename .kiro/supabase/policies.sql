-- Políticas de segurança para o banco de dados do aplicativo
-- Este arquivo contém os comandos SQL para configurar as políticas de acesso às tabelas

-- Habilitar Row Level Security para todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela users
-- Usuários podem ler qualquer usuário
CREATE POLICY "Usuários podem ler qualquer usuário"
  ON users FOR SELECT
  USING (true);

-- Usuários só podem atualizar seu próprio registro
CREATE POLICY "Usuários só podem atualizar seu próprio registro"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para a tabela profiles
-- Usuários podem ler qualquer perfil
CREATE POLICY "Usuários podem ler qualquer perfil"
  ON profiles FOR SELECT
  USING (true);

-- Usuários só podem atualizar seu próprio perfil
CREATE POLICY "Usuários só podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para a tabela content
-- Usuários podem ler qualquer conteúdo
CREATE POLICY "Usuários podem ler qualquer conteúdo"
  ON content FOR SELECT
  USING (true);

-- Usuários podem inserir conteúdo
CREATE POLICY "Usuários podem inserir conteúdo"
  ON content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar seu próprio conteúdo
CREATE POLICY "Usuários só podem atualizar seu próprio conteúdo"
  ON content FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários só podem deletar seu próprio conteúdo
CREATE POLICY "Usuários só podem deletar seu próprio conteúdo"
  ON content FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para a tabela interactions
-- Usuários podem ler qualquer interação
CREATE POLICY "Usuários podem ler qualquer interação"
  ON interactions FOR SELECT
  USING (true);

-- Usuários podem inserir interações
CREATE POLICY "Usuários podem inserir interações"
  ON interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários só podem atualizar suas próprias interações
CREATE POLICY "Usuários só podem atualizar suas próprias interações"
  ON interactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários só podem deletar suas próprias interações
CREATE POLICY "Usuários só podem deletar suas próprias interações"
  ON interactions FOR DELETE
  USING (auth.uid() = user_id);