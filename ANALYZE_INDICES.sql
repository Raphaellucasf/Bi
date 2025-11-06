-- ========================================
-- ANÁLISE RÁPIDA DOS ÍNDICES
-- Execute isto para forçar o Postgres a 
-- otimizar e usar os novos índices imediatamente
-- ========================================

-- Analisa a tabela de processos e seus índices
ANALYZE processos;

-- Analisa a tabela de clientes e seus índices
ANALYZE clientes;

-- Analisa a tabela de andamentos e seus índices
ANALYZE andamentos;

-- ========================================
-- VERIFICAR SE ESTÁ USANDO OS ÍNDICES
-- ========================================

-- Esta query deve mostrar "Index Scan" se estiver usando os índices
EXPLAIN ANALYZE 
SELECT * 
FROM processos 
WHERE escritorio_id IS NOT NULL 
ORDER BY updated_at DESC 
LIMIT 10;

-- ========================================
-- RESULTADO ESPERADO:
-- Se você ver "Index Scan using idx_processos..." = ✅ FUNCIONANDO!
-- Se você ver "Seq Scan" = ⚠️ Ainda não otimizado
-- ========================================
