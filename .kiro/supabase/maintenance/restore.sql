-- Script para restaurar o banco de dados a partir do backup
-- Este script restaura os dados das tabelas de backup

-- Verificar se as tabelas de backup existem
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_backup') THEN
    RAISE EXCEPTION 'Tabela de backup users_backup não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles_backup') THEN
    RAISE EXCEPTION 'Tabela de backup profiles_backup não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories_backup') THEN
    RAISE EXCEPTION 'Tabela de backup categories_backup não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_backup') THEN
    RAISE EXCEPTION 'Tabela de backup content_backup não encontrada';
  END IF;
END $$;

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

-- Restaurar dados
INSERT INTO users SELECT * FROM users_backup;
INSERT INTO profiles SELECT * FROM profiles_backup;
INSERT INTO categories SELECT * FROM categories_backup;
INSERT INTO content SELECT * FROM content_backup;
INSERT INTO content_categories SELECT * FROM content_categories_backup;
INSERT INTO comments SELECT * FROM comments_backup;
INSERT INTO interactions SELECT * FROM interactions_backup;
INSERT INTO notifications SELECT * FROM notifications_backup;

-- Habilitar novamente os triggers
ALTER TABLE users ENABLE TRIGGER ALL;
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE categories ENABLE TRIGGER ALL;
ALTER TABLE content ENABLE TRIGGER ALL;
ALTER TABLE content_categories ENABLE TRIGGER ALL;
ALTER TABLE comments ENABLE TRIGGER ALL;
ALTER TABLE interactions ENABLE TRIGGER ALL;
ALTER TABLE notifications ENABLE TRIGGER ALL;

-- Registrar restauração
CREATE TABLE IF NOT EXISTS restore_log (
  id SERIAL PRIMARY KEY,
  restore_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  table_name TEXT,
  record_count INTEGER
);

-- Registrar contagem de registros
INSERT INTO restore_log (table_name, record_count)
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'content', COUNT(*) FROM content
UNION ALL
SELECT 'content_categories', COUNT(*) FROM content_categories
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'interactions', COUNT(*) FROM interactions
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Exibir resultado da restauração
SELECT 'Restauração concluída com sucesso!' AS message;
SELECT table_name, record_count, restore_date
FROM restore_log
ORDER BY id DESC
LIMIT 8;