-- =====================================================
-- REMOVER ANDAMENTOS DUPLICADOS
-- Remove andamentos com mesmo título, descrição e data
-- =====================================================

-- 1. IDENTIFICAR E REMOVER DUPLICATAS
-- Mantém apenas o registro mais recente (com maior created_at)
DELETE FROM andamentos a
USING andamentos b
WHERE a.id < b.id
  AND a.processo_id = b.processo_id
  AND a.titulo = b.titulo
  AND COALESCE(a.descricao, '') = COALESCE(b.descricao, '')
  AND COALESCE(a.data_andamento::date, a.created_at::date) = COALESCE(b.data_andamento::date, b.created_at::date);

-- 2. CRIAR ÍNDICE ÚNICO PARA EVITAR DUPLICATAS FUTURAS
-- Este índice impede que andamentos idênticos sejam inseridos
-- Usando apenas campos simples para compatibilidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_andamentos_unique 
ON andamentos (processo_id, titulo, data_andamento)
WHERE titulo IS NOT NULL AND data_andamento IS NOT NULL;

-- 3. VERIFICAÇÃO
DO $$
DECLARE
  duplicatas_count INTEGER;
BEGIN
  -- Verificar se ainda há duplicatas
  SELECT COUNT(*) INTO duplicatas_count
  FROM (
    SELECT processo_id, titulo, data_andamento, COUNT(*) as cnt
    FROM andamentos
    WHERE titulo IS NOT NULL
    GROUP BY processo_id, titulo, data_andamento
    HAVING COUNT(*) > 1
  ) sub;
  
  IF duplicatas_count > 0 THEN
    RAISE NOTICE '⚠️  Ainda há % grupos de andamentos duplicados', duplicatas_count;
  ELSE
    RAISE NOTICE '✅ Nenhum andamento duplicado encontrado';
  END IF;
  
  RAISE NOTICE '📊 Total de andamentos únicos: %', (SELECT COUNT(*) FROM andamentos);
END $$;
