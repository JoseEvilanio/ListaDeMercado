-- Script para otimizar o banco de dados
-- Este script otimiza o desempenho do banco de dados

-- Atualizar estatísticas para o otimizador de consultas
ANALYZE VERBOSE;

-- Remover espaço não utilizado das tabelas
VACUUM FULL VERBOSE;

-- Reconstruir índices para melhorar o desempenho
REINDEX TABLE users;
REINDEX TABLE profiles;
REINDEX TABLE categories;
REINDEX TABLE content;
REINDEX TABLE content_categories;
REINDEX TABLE comments;
REINDEX TABLE interactions;
REINDEX TABLE notifications;

-- Verificar índices existentes
SELECT
  tablename,
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
ORDER BY
  tablename, indexname;

-- Verificar tabelas sem índices em chaves estrangeiras
SELECT
  tc.table_name, 
  kcu.column_name
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE 
  tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
    AND indexdef LIKE '%' || kcu.column_name || '%'
  )
ORDER BY
  tc.table_name, kcu.column_name;

-- Verificar consultas lentas (requer extensão pg_stat_statements)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) THEN
    EXECUTE '
      SELECT 
        query,
        calls,
        total_time / calls AS avg_time,
        rows / calls AS avg_rows
      FROM pg_stat_statements
      ORDER BY total_time / calls DESC
      LIMIT 10;
    ';
  ELSE
    RAISE NOTICE 'Extensão pg_stat_statements não está instalada. Consultas lentas não podem ser verificadas.';
  END IF;
END $$;

-- Registrar otimização
CREATE TABLE IF NOT EXISTS optimization_log (
  id SERIAL PRIMARY KEY,
  optimization_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT,
  details JSONB
);

-- Registrar ação de otimização
INSERT INTO optimization_log (action, details)
VALUES (
  'optimize',
  jsonb_build_object(
    'vacuum', true,
    'analyze', true,
    'reindex', true
  )
);

-- Exibir resultado da otimização
SELECT 'Otimização concluída com sucesso!' AS message;
SELECT action, details, optimization_date
FROM optimization_log
ORDER BY id DESC
LIMIT 1;