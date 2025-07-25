-- Script para fazer backup do banco de dados
-- Este script cria uma cópia de segurança das tabelas principais

-- Criar tabelas de backup se não existirem
CREATE TABLE IF NOT EXISTS users_backup (LIKE users INCLUDING ALL);
CREATE TABLE IF NOT EXISTS profiles_backup (LIKE profiles INCLUDING ALL);
CREATE TABLE IF NOT EXISTS categories_backup (LIKE categories INCLUDING ALL);
CREATE TABLE IF NOT EXISTS content_backup (LIKE content INCLUDING ALL);
CREATE TABLE IF NOT EXISTS content_categories_backup (LIKE content_categories INCLUDING ALL);
CREATE TABLE IF NOT EXISTS comments_backup (LIKE comments INCLUDING ALL);
CREATE TABLE IF NOT EXISTS interactions_backup (LIKE interactions INCLUDING ALL);
CREATE TABLE IF NOT EXISTS notifications_backup (LIKE notifications INCLUDING ALL);

-- Limpar tabelas de backup
TRUNCATE TABLE users_backup, profiles_backup, categories_backup, content_backup, 
  content_categories_backup, comments_backup, interactions_backup, notifications_backup;

-- Copiar dados para tabelas de backup
INSERT INTO users_backup SELECT * FROM users;
INSERT INTO profiles_backup SELECT * FROM profiles;
INSERT INTO categories_backup SELECT * FROM categories;
INSERT INTO content_backup SELECT * FROM content;
INSERT INTO content_categories_backup SELECT * FROM content_categories;
INSERT INTO comments_backup SELECT * FROM comments;
INSERT INTO interactions_backup SELECT * FROM interactions;
INSERT INTO notifications_backup SELECT * FROM notifications;

-- Registrar backup
CREATE TABLE IF NOT EXISTS backup_log (
  id SERIAL PRIMARY KEY,
  backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  table_name TEXT,
  record_count INTEGER
);

-- Registrar contagem de registros
INSERT INTO backup_log (table_name, record_count)
SELECT 'users', COUNT(*) FROM users_backup
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles_backup
UNION ALL
SELECT 'categories', COUNT(*) FROM categories_backup
UNION ALL
SELECT 'content', COUNT(*) FROM content_backup
UNION ALL
SELECT 'content_categories', COUNT(*) FROM content_categories_backup
UNION ALL
SELECT 'comments', COUNT(*) FROM comments_backup
UNION ALL
SELECT 'interactions', COUNT(*) FROM interactions_backup
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications_backup;

-- Exibir resultado do backup
SELECT 'Backup concluído com sucesso!' AS message;
SELECT table_name, record_count, backup_date
FROM backup_log
ORDER BY id DESC
LIMIT 8;