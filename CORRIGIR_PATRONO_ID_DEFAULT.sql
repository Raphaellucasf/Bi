-- Remove o valor padrão gen_random_uuid() da coluna patrono_id
-- Isso estava causando o erro de FK quando o campo não era enviado
ALTER TABLE processos 
ALTER COLUMN patrono_id DROP DEFAULT;

-- Verifica se a alteração foi aplicada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'processos' 
AND column_name = 'patrono_id';
