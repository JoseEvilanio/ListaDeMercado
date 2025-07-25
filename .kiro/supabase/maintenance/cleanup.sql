-- Script para limpeza e manutenção do banco de dados
-- Este script remove dados antigos e otimiza o banco de dados

-- Remover notificações antigas (mais de 30 dias)
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '30 days';

-- Remover logs de backup antigos (mais de 90 dias)
DELETE FROM backup_log
WHERE backup_date < NOW() - INTERVAL '90 days';

-- Remover logs de restauração antigos (mais de 90 dias)
DELETE FROM restore_log
WHERE restore_date < NOW() - INTERVAL '90 days';

-- Atualizar estatísticas para o otimizador de consultas
ANALYZE users;
ANALYZE profiles;
ANALYZE categories;
ANALYZE content;
ANALYZE content_categories;
ANALYZE comments;
ANALYZE interactions;
ANALYZE notifications;

-- Remover espaço não utilizado das tabelas
VACUUM FULL users;
VACUUM FULL profiles;
VACUUM FULL categories;
VACUUM FULL content;
VACUUM FULL content_categories;
VACUUM FULL comments;
VACUUM FULL interactions;
VACUUM FULL notifications;

-- Registrar limpeza
CREATE TABLE IF NOT EXISTS cleanup_log (
  id SERIAL PRIMARY KEY,
  cleanup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT,
  details JSONB
);

-- Registrar ações de limpeza
INSERT INTO cleanup_log (action, details)
VALUES (
  'cleanup',
  jsonb_build_object(
    'notifications_removed', (SELECT COUNT(*) FROM notifications WHERE created_at < NOW() - INTERVAL '30 days'),
    'backup_logs_removed', (SELECT COUNT(*) FROM backup_log WHERE backup_date < NOW() - INTERVAL '90 days'),
    'restore_logs_removed', (SELECT COUNT(*) FROM restore_log WHERE restore_date < NOW() - INTERVAL '90 days')
  )
);

-- Exibir resultado da limpeza
SELECT 'Limpeza concluída com sucesso!' AS message;
SELECT action, details, cleanup_date
FROM cleanup_log
ORDER BY id DESC
LIMIT 1;