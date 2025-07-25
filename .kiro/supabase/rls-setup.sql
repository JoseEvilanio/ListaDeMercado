-- Script para configurar Row Level Security (RLS) no Supabase
-- Este script deve ser executado no Editor SQL do Supabase após a criação das tabelas

-- Habilitar RLS para todas as tabelas
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

-- Usuários não podem excluir registros de usuário (apenas desativar)
CREATE POLICY "Usuários não podem excluir registros"
  ON users FOR DELETE
  USING (false);

-- Políticas para a tabela profiles
-- Usuários podem ler qualquer perfil
CREATE POLICY "Usuários podem ler qualquer perfil"
  ON profiles FOR SELECT
  USING (true);

-- Usuários só podem atualizar seu próprio perfil
CREATE POLICY "Usuários só podem atualizar seu próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Usuários só podem inserir seu próprio perfil
CREATE POLICY "Usuários só podem inserir seu próprio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários não podem excluir perfis
CREATE POLICY "Usuários não podem excluir perfis"
  ON profiles FOR DELETE
  USING (false);

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

-- Criar função para verificar se um usuário é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT (auth.jwt() ->> 'role')::text = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para administradores (opcional)
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

-- Criar tabela de auditoria para operações sensíveis
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para registrar alterações em tabelas
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE
      WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE
      WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW)
      ELSE NULL
    END
  );
  
  RETURN CASE
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers de auditoria para cada tabela
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_content
AFTER INSERT OR UPDATE OR DELETE ON content
FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER audit_interactions
AFTER INSERT OR UPDATE OR DELETE ON interactions
FOR EACH ROW EXECUTE FUNCTION audit_changes();