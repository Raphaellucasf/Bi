-- ========================================
-- OTIMIZAÇÃO DE PERFORMANCE DO SUPABASE
-- Índices para melhorar velocidade de queries
-- VERSÃO SEGURA - Apenas colunas que existem
-- ========================================

-- ========================================
-- ÍNDICES OPCIONAIS - Apenas se as tabelas existirem
-- Comente/descomente conforme necessário
-- ========================================

-- TABELA: empresas (se existir)
-- Índices para busca de partes contrárias

-- CREATE INDEX IF NOT EXISTS idx_empresas_cnpj 
-- ON empresas(cnpj);

-- TABELA: pessoas_fisicas (se existir)
-- Índices para busca de partes contrárias

-- CREATE INDEX IF NOT EXISTS idx_pessoas_fisicas_cpf 
-- ON pessoas_fisicas(cpf);

-- TABELA: processos_empresas (se existir)
-- Índices para relacionamento

-- CREATE INDEX IF NOT EXISTS idx_processos_empresas_processo 
-- ON processos_empresas(processo_id);

-- CREATE INDEX IF NOT EXISTS idx_processos_empresas_empresa 
-- ON processos_empresas(empresa_id);

-- TABELA: processos_pessoas_fisicas (se existir)
-- Índices para relacionamento

-- CREATE INDEX IF NOT EXISTS idx_processos_pessoas_fisicas_processo 
-- ON processos_pessoas_fisicas(processo_id);

-- CREATE INDEX IF NOT EXISTS idx_processos_pessoas_fisicas_pessoa 
-- ON processos_pessoas_fisicas(pessoa_fisica_id);

-- TABELA: faturamentos (se existir)
-- Índices para tracking de faturamento

-- CREATE INDEX IF NOT EXISTS idx_faturamentos_escritorio 
-- ON faturamentos(escritorio_id);

-- CREATE INDEX IF NOT EXISTS idx_faturamentos_processo 
-- ON faturamentos(processo_id);

-- CREATE INDEX IF NOT EXISTS idx_faturamentos_data 
-- ON faturamentos(data_acordo DESC);

-- TABELA: parcelas (se existir)
-- Índices para faturamento

-- CREATE INDEX IF NOT EXISTS idx_parcelas_faturamento 
-- ON parcelas(faturamento_id);

-- CREATE INDEX IF NOT EXISTS idx_parcelas_status 
-- ON parcelas(status);

-- CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento 
-- ON parcelas(data_vencimento);

-- TABELA: gastos (se existir)
-- Índices para gastos

-- CREATE INDEX IF NOT EXISTS idx_gastos_escritorio 
-- ON gastos(escritorio_id);

-- CREATE INDEX IF NOT EXISTS idx_gastos_data 
-- ON gastos(data_gasto DESC);

-- ========================================
-- ANÁLISE DE PERFORMANCE
-- Execute para verificar queries lentas
-- ========================================

-- Verificar índices existentes
-- SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Verificar tamanho das tabelas
-- SELECT 
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- VACUUM E ANALYZE
-- Melhora performance de queries
-- Descomente apenas para tabelas que existem
-- ========================================

-- Tabelas principais (sempre existem)
-- VACUUM ANALYZE processos;
-- VACUUM ANALYZE clientes;
-- VACUUM ANALYZE andamentos;

-- Tabelas opcionais (descomente se existirem)
-- VACUUM ANALYZE faturamentos;
-- VACUUM ANALYZE parcelas;
-- VACUUM ANALYZE gastos;
-- VACUUM ANALYZE empresas;
-- VACUUM ANALYZE pessoas_fisicas;
