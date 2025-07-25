-- Script para verificar a estrutura do banco de dados
-- Este script retorna informações sobre as tabelas, colunas, índices e triggers do banco de dados

-- Listar todas as tabelas
SELECT 
  table_name,
  table_type
FROM 
  information_schema.tables
WHERE 
  table_schema = 'public'
ORDER BY 
  table_name;

-- Listar todas as colunas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public'
ORDER BY 
  table_name, ordinal_position;

-- Listar todos os índices
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

-- Listar todas as chaves estrangeiras
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
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
ORDER BY
  tc.table_name, kcu.column_name;

-- Listar todos os triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM
  information_schema.triggers
WHERE
  trigger_schema = 'public'
ORDER BY
  event_object_table, trigger_name;

-- Listar todas as funções
SELECT
  routine_name,
  data_type AS return_type,
  routine_definition
FROM
  information_schema.routines
WHERE
  routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY
  routine_name;