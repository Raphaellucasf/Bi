-- Verificar configuração da coluna patrono_id
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'processos' 
AND column_name = 'patrono_id';

-- Verificar constraints da tabela processos
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'processos'::regclass
AND conname LIKE '%patrono%';

-- Verificar se há triggers na tabela processos
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'processos';
