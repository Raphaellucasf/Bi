-- ========================================
-- VERIFICAÇÃO COMPLETA DE PERFORMANCE
-- Execute este script no Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. LISTAR TODOS OS ÍNDICES CRIADOS
-- ========================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename IN ('processos', 'clientes', 'andamentos')
ORDER BY 
    tablename, indexname;

-- ========================================
-- 2. VERIFICAR TAMANHO DAS TABELAS
-- ========================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
    AND tablename IN ('processos', 'clientes', 'andamentos')
ORDER BY 
    pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- 3. TESTE DE PERFORMANCE - PROCESSOS
-- ========================================

-- Teste 3.1: Buscar processos por escritório
-- DEVE MOSTRAR: "Index Scan using idx_processos_escritorio_updated"
EXPLAIN ANALYZE 
SELECT * 
FROM processos 
WHERE escritorio_id IS NOT NULL
ORDER BY updated_at DESC 
LIMIT 10;

-- Teste 3.2: Buscar processos ativos
-- DEVE MOSTRAR: "Index Scan using idx_processos_escritorio_status"
EXPLAIN ANALYZE 
SELECT * 
FROM processos 
WHERE escritorio_id IS NOT NULL 
  AND status = 'Ativo'
LIMIT 10;

-- Teste 3.3: Buscar processos por cliente
-- DEVE MOSTRAR: "Index Scan using idx_processos_cliente"
EXPLAIN ANALYZE 
SELECT * 
FROM processos 
WHERE cliente_id IS NOT NULL
LIMIT 10;

-- ========================================
-- 4. TESTE DE PERFORMANCE - CLIENTES
-- ========================================

-- Teste 4.1: Buscar clientes por escritório
-- DEVE MOSTRAR: "Index Scan using idx_clientes_escritorio"
EXPLAIN ANALYZE 
SELECT * 
FROM clientes 
WHERE escritorio_id IS NOT NULL
LIMIT 10;

-- Teste 4.2: Buscar cliente por nome (case-insensitive)
-- DEVE MOSTRAR: "Index Scan using idx_clientes_nome"
EXPLAIN ANALYZE 
SELECT * 
FROM clientes 
WHERE nome_completo ILIKE '%silva%'
LIMIT 10;

-- Teste 4.3: Buscar cliente por CPF/CNPJ
-- DEVE MOSTRAR: "Index Scan using idx_clientes_cpf_cnpj"
EXPLAIN ANALYZE 
SELECT * 
FROM clientes 
WHERE cpf_cnpj = '12345678900'
LIMIT 1;

-- ========================================
-- 5. TESTE DE PERFORMANCE - ANDAMENTOS
-- ========================================

-- Teste 5.1: Buscar andamentos por tipo
-- DEVE MOSTRAR: "Index Scan using idx_andamentos_tipo"
EXPLAIN ANALYZE 
SELECT * 
FROM andamentos 
WHERE tipo = 'Audiência'
LIMIT 10;

-- Teste 5.2: Buscar andamentos por data
-- DEVE MOSTRAR: "Index Scan using idx_andamentos_data"
EXPLAIN ANALYZE 
SELECT * 
FROM andamentos 
WHERE data >= NOW() - INTERVAL '30 days'
ORDER BY data DESC
LIMIT 10;

-- Teste 5.3: Buscar andamentos não concluídos
-- DEVE MOSTRAR: "Index Scan using idx_andamentos_concluido"
EXPLAIN ANALYZE 
SELECT * 
FROM andamentos 
WHERE concluido = false
LIMIT 10;

-- ========================================
-- 6. TESTE COMBINADO (MAIS COMPLEXO)
-- ========================================

-- Buscar processos com andamentos recentes
-- DEVE USAR: idx_andamentos_processo_data e idx_processos_escritorio_updated
EXPLAIN ANALYZE 
SELECT 
    p.id,
    p.titulo,
    p.numero_processo,
    COUNT(a.id) as total_andamentos
FROM 
    processos p
LEFT JOIN 
    andamentos a ON a.processo_id = p.id
WHERE 
    p.escritorio_id IS NOT NULL
    AND p.updated_at >= NOW() - INTERVAL '7 days'
GROUP BY 
    p.id, p.titulo, p.numero_processo
ORDER BY 
    p.updated_at DESC
LIMIT 20;

-- ========================================
-- 7. ESTATÍSTICAS DE USO DE ÍNDICES
-- ========================================
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "Vezes Usado",
    idx_tup_read as "Tuplas Lidas",
    idx_tup_fetch as "Tuplas Retornadas"
FROM 
    pg_stat_user_indexes
WHERE 
    schemaname = 'public'
    AND tablename IN ('processos', 'clientes', 'andamentos')
ORDER BY 
    idx_scan DESC;

-- ========================================
-- 8. ANÁLISE DE CACHE DE ÍNDICES
-- ========================================
SELECT 
    relname as "Tabela/Índice",
    heap_blks_read as "Blocos Lidos do Disco",
    heap_blks_hit as "Blocos do Cache",
    CASE 
        WHEN (heap_blks_hit + heap_blks_read) = 0 THEN 0
        ELSE ROUND(100.0 * heap_blks_hit / (heap_blks_hit + heap_blks_read), 2)
    END as "Cache Hit Ratio %"
FROM 
    pg_statio_user_tables
WHERE 
    schemaname = 'public'
    AND relname IN ('processos', 'clientes', 'andamentos')
ORDER BY 
    "Cache Hit Ratio %" DESC;

-- ========================================
-- INTERPRETAÇÃO DOS RESULTADOS
-- ========================================

/*
✅ BOM SINAL:
- "Index Scan using idx_..." nas queries
- Cache Hit Ratio > 90%
- idx_scan (Vezes Usado) > 0

⚠️ SINAL DE ALERTA:
- "Seq Scan" (varredura sequencial) - significa que NÃO está usando índice
- Cache Hit Ratio < 80%
- idx_scan = 0 (índice nunca foi usado)

🔧 AÇÕES CORRETIVAS SE APARECER "Seq Scan":
1. Execute novamente: ANALYZE processos; ANALYZE clientes; ANALYZE andamentos;
2. Aguarde 5-10 minutos para o Postgres atualizar estatísticas
3. Execute as queries novamente
4. Se ainda mostrar "Seq Scan", o Postgres pode estar achando que é mais rápido
   (isso acontece em tabelas com poucos registros - é normal)

📊 BENCHMARK DE PERFORMANCE:
- < 10ms = Excelente ✅
- 10-50ms = Bom ✅
- 50-200ms = Aceitável ⚠️
- > 200ms = Precisa otimizar ❌
*/
