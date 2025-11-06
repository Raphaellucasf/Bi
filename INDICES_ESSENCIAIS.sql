-- ========================================
-- ÍNDICES ESSENCIAIS - VERSÃO MÍNIMA
-- Apenas para tabelas principais que existem
-- Execute este primeiro para garantir sucesso
-- ========================================

-- TABELA: processos
CREATE INDEX IF NOT EXISTS idx_processos_escritorio_status 
ON processos(escritorio_id, status);

CREATE INDEX IF NOT EXISTS idx_processos_escritorio_updated 
ON processos(escritorio_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_processos_cliente 
ON processos(cliente_id);

CREATE INDEX IF NOT EXISTS idx_processos_area 
ON processos(area_direito);

-- TABELA: clientes
CREATE INDEX IF NOT EXISTS idx_clientes_escritorio 
ON clientes(escritorio_id);

CREATE INDEX IF NOT EXISTS idx_clientes_nome 
ON clientes(nome_completo);

CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj 
ON clientes(cpf_cnpj);

CREATE INDEX IF NOT EXISTS idx_clientes_updated 
ON clientes(escritorio_id, updated_at DESC);

-- TABELA: andamentos
CREATE INDEX IF NOT EXISTS idx_andamentos_tipo 
ON andamentos(tipo);

CREATE INDEX IF NOT EXISTS idx_andamentos_data 
ON andamentos(data_andamento);

CREATE INDEX IF NOT EXISTS idx_andamentos_processo 
ON andamentos(processo_id);

CREATE INDEX IF NOT EXISTS idx_andamentos_concluido 
ON andamentos(concluido);

CREATE INDEX IF NOT EXISTS idx_andamentos_tipo_data 
ON andamentos(tipo, data_andamento);

CREATE INDEX IF NOT EXISTS idx_andamentos_processo_data 
ON andamentos(processo_id, data_andamento);

-- ========================================
-- VERIFICAR ÍNDICES CRIADOS
-- ========================================

SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
