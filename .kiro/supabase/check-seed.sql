-- Script para verificar os dados iniciais
-- Este script retorna informações sobre os dados nas tabelas do banco de dados

-- Contar registros em cada tabela
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'profiles' AS table_name, COUNT(*) AS record_count FROM profiles
UNION ALL
SELECT 'categories' AS table_name, COUNT(*) AS record_count FROM categories
UNION ALL
SELECT 'content' AS table_name, COUNT(*) AS record_count FROM content
UNION ALL
SELECT 'content_categories' AS table_name, COUNT(*) AS record_count FROM content_categories
UNION ALL
SELECT 'comments' AS table_name, COUNT(*) AS record_count FROM comments
UNION ALL
SELECT 'interactions' AS table_name, COUNT(*) AS record_count FROM interactions
UNION ALL
SELECT 'notifications' AS table_name, COUNT(*) AS record_count FROM notifications
ORDER BY table_name;

-- Listar usuários
SELECT id, email, name, created_at, updated_at
FROM users
ORDER BY name;

-- Listar perfis
SELECT p.id, u.name, p.avatar_url, p.bio, p.created_at, p.updated_at
FROM profiles p
JOIN users u ON p.id = u.id
ORDER BY u.name;

-- Listar categorias
SELECT id, name, description, created_at, updated_at
FROM categories
ORDER BY name;

-- Listar conteúdo com autor
SELECT c.id, c.title, c.body, u.name AS author, c.created_at, c.updated_at
FROM content c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- Listar conteúdo com categorias
SELECT c.title, cat.name AS category
FROM content c
JOIN content_categories cc ON c.id = cc.content_id
JOIN categories cat ON cc.category_id = cat.id
ORDER BY c.title, cat.name;

-- Listar comentários com autor e conteúdo
SELECT com.id, u.name AS author, c.title AS content_title, com.body, com.parent_id, com.created_at
FROM comments com
JOIN users u ON com.user_id = u.id
JOIN content c ON com.content_id = c.id
ORDER BY com.created_at DESC;

-- Listar interações com usuário e conteúdo
SELECT i.id, u.name AS user_name, c.title AS content_title, i.type, i.created_at
FROM interactions i
JOIN users u ON i.user_id = u.id
JOIN content c ON i.content_id = c.id
ORDER BY i.created_at DESC;

-- Listar notificações com usuário
SELECT n.id, u.name AS user_name, n.type, n.data, n.read, n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC;