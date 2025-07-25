-- Script para verificar a integridade do banco de dados
-- Este script verifica se há problemas de integridade nos dados

-- Verificar registros órfãos em profiles (sem usuário correspondente)
SELECT p.id, 'Perfil sem usuário correspondente' AS issue
FROM profiles p
LEFT JOIN users u ON p.id = u.id
WHERE u.id IS NULL;

-- Verificar registros órfãos em content (sem usuário correspondente)
SELECT c.id, c.title, 'Conteúdo sem usuário correspondente' AS issue
FROM content c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Verificar registros órfãos em content_categories (sem conteúdo ou categoria correspondente)
SELECT cc.content_id, cc.category_id, 'Relação conteúdo-categoria inválida' AS issue
FROM content_categories cc
LEFT JOIN content c ON cc.content_id = c.id
LEFT JOIN categories cat ON cc.category_id = cat.id
WHERE c.id IS NULL OR cat.id IS NULL;

-- Verificar registros órfãos em comments (sem conteúdo ou usuário correspondente)
SELECT com.id, com.body, 'Comentário sem conteúdo ou usuário correspondente' AS issue
FROM comments com
LEFT JOIN content c ON com.content_id = c.id
LEFT JOIN users u ON com.user_id = u.id
WHERE c.id IS NULL OR u.id IS NULL;

-- Verificar comentários com parent_id inválido
SELECT com.id, com.body, 'Comentário com parent_id inválido' AS issue
FROM comments com
LEFT JOIN comments parent ON com.parent_id = parent.id
WHERE com.parent_id IS NOT NULL AND parent.id IS NULL;

-- Verificar registros órfãos em interactions (sem conteúdo ou usuário correspondente)
SELECT i.id, i.type, 'Interação sem conteúdo ou usuário correspondente' AS issue
FROM interactions i
LEFT JOIN content c ON i.content_id = c.id
LEFT JOIN users u ON i.user_id = u.id
WHERE c.id IS NULL OR u.id IS NULL;

-- Verificar registros órfãos em notifications (sem usuário correspondente)
SELECT n.id, n.type, 'Notificação sem usuário correspondente' AS issue
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
WHERE u.id IS NULL;

-- Verificar duplicatas em content_categories
SELECT content_id, category_id, COUNT(*) AS count, 'Duplicata em content_categories' AS issue
FROM content_categories
GROUP BY content_id, category_id
HAVING COUNT(*) > 1;

-- Verificar se há problemas de integridade
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles p LEFT JOIN users u ON p.id = u.id WHERE u.id IS NULL
      UNION ALL
      SELECT 1 FROM content c LEFT JOIN users u ON c.user_id = u.id WHERE u.id IS NULL
      UNION ALL
      SELECT 1 FROM content_categories cc LEFT JOIN content c ON cc.content_id = c.id LEFT JOIN categories cat ON cc.category_id = cat.id WHERE c.id IS NULL OR cat.id IS NULL
      UNION ALL
      SELECT 1 FROM comments com LEFT JOIN content c ON com.content_id = c.id LEFT JOIN users u ON com.user_id = u.id WHERE c.id IS NULL OR u.id IS NULL
      UNION ALL
      SELECT 1 FROM comments com LEFT JOIN comments parent ON com.parent_id = parent.id WHERE com.parent_id IS NOT NULL AND parent.id IS NULL
      UNION ALL
      SELECT 1 FROM interactions i LEFT JOIN content c ON i.content_id = c.id LEFT JOIN users u ON i.user_id = u.id WHERE c.id IS NULL OR u.id IS NULL
      UNION ALL
      SELECT 1 FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE u.id IS NULL
      UNION ALL
      SELECT 1 FROM (SELECT content_id, category_id FROM content_categories GROUP BY content_id, category_id HAVING COUNT(*) > 1) AS dup
    ) 
    THEN 'Problemas de integridade encontrados'
    ELSE 'Nenhum problema de integridade encontrado'
  END AS result;