-- SQL para verificar TODOS os campos da tabela processos com seus nomes COMPLETOS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'processos'
  AND table_schema = 'public'
ORDER BY ordinal_position;
