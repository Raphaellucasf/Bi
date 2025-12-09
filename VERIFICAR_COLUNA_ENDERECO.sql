-- ========================================
-- DIAGNOSTICAR COLUNA ENDERECO
-- Execute este SQL para verificar se a coluna existe
-- ========================================

-- Verificar se coluna endereco existe
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
AND column_name = 'endereco';

-- Se retornar linhas = coluna EXISTE ✅
-- Se retornar vazio = coluna NÃO EXISTE ❌

-- ========================================
-- VERIFICAR TODAS AS COLUNAS DA TABELA CLIENTES
-- ========================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
