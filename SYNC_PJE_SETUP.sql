-- =====================================================
-- SYNC PJE - ADICIONAR COLUNAS PARA SINCRONIZAÇÃO
-- Este SQL é SEGURO e não afeta tabelas existentes
-- =====================================================

-- 1. ADICIONAR COLUNAS NA TABELA "andamentos" (se não existirem)
ALTER TABLE andamentos 
ADD COLUMN IF NOT EXISTS sincronizado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fonte TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP WITH TIME ZONE;

-- Comentar colunas
COMMENT ON COLUMN andamentos.sincronizado_em IS 'Quando foi sincronizado do PJe';
COMMENT ON COLUMN andamentos.fonte IS 'Origem: pje, manual, bot';
COMMENT ON COLUMN andamentos.atualizado_em IS 'Última atualização';

-- 2. ADICIONAR COLUNAS NA TABELA "documentos" (se não existirem)
ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS sincronizado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fonte TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS hash_arquivo TEXT,
ADD COLUMN IF NOT EXISTS tamanho_bytes BIGINT;

-- Comentar colunas
COMMENT ON COLUMN documentos.sincronizado_em IS 'Quando foi sincronizado do PJe';
COMMENT ON COLUMN documentos.fonte IS 'Origem: pje, manual, bot';
COMMENT ON COLUMN documentos.hash_arquivo IS 'SHA256 para detectar duplicatas';
COMMENT ON COLUMN documentos.tamanho_bytes IS 'Tamanho do arquivo em bytes';

-- 3. CRIAR TABELA "sync_log" (histórico de sincronizações)
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processo_id UUID REFERENCES processos(id) ON DELETE CASCADE,
  
  -- Informações da sincronização
  tipo_sync TEXT NOT NULL, -- 'completa', 'incremental', 'documento'
  status TEXT NOT NULL, -- 'sucesso', 'erro', 'pendente'
  mensagem_erro TEXT,
  
  -- Quantidade sincronizada
  andamentos_sincronizados INT DEFAULT 0,
  documentos_sincronizados INT DEFAULT 0,
  
  -- Timestamps
  iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finalizado_em TIMESTAMP WITH TIME ZONE,
  duracao_segundos INT,
  
  -- Próxima sincronização
  proxima_sync TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentar tabela
COMMENT ON TABLE sync_log IS 'Histórico de sincronizações do bot PJe';

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_andamentos_sincronizado_em ON andamentos(sincronizado_em);
CREATE INDEX IF NOT EXISTS idx_andamentos_fonte ON andamentos(fonte);
CREATE INDEX IF NOT EXISTS idx_documentos_sincronizado_em ON documentos(sincronizado_em);
CREATE INDEX IF NOT EXISTS idx_documentos_hash ON documentos(hash_arquivo);
CREATE INDEX IF NOT EXISTS idx_sync_log_processo_id ON sync_log(processo_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_iniciado_em ON sync_log(iniciado_em DESC);

-- 5. CRIAR VIEW PARA ABA DE ACOMPANHAMENTO
CREATE OR REPLACE VIEW acompanhamento_processos AS
SELECT 
  p.id as processo_id,
  p.numero_processo,
  c.nome_completo as cliente_nome,
  p.titulo,
  p.tribunal as orgao_julgador,
  p.status as processo_status,
  
  -- Último andamento
  a.id as andamento_id,
  a.titulo as andamento_titulo,
  a.descricao as andamento_descricao,
  a.tipo as andamento_tipo,
  a.data_andamento,
  a.sincronizado_em as andamento_sincronizado_em,
  a.fonte as andamento_fonte,
  
  -- Próxima audiência (do tipo Audiência em andamentos)
  aud.id as audiencia_id,
  aud.titulo as audiencia_titulo,
  aud.data_andamento as data_audiencia,
  
  p.created_at,
  a.created_at as andamento_data
  
FROM processos p
LEFT JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN LATERAL (
  SELECT * FROM andamentos 
  WHERE processo_id = p.id 
  ORDER BY data_andamento DESC, created_at DESC
  LIMIT 1
) a ON true
LEFT JOIN LATERAL (
  SELECT id, titulo, data_andamento FROM andamentos 
  WHERE processo_id = p.id 
    AND tipo = 'Audiência'
    AND data_andamento >= NOW()
  ORDER BY data_andamento ASC
  LIMIT 1
) aud ON true;

-- Comentar view
COMMENT ON VIEW acompanhamento_processos IS 'View agregada para aba de Acompanhamento - mostra processo com último andamento e próxima audiência';

-- 6. HABILITAR RLS (se não estiver habilitado)
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- 7. CRIAR POLICY PARA sync_log
DROP POLICY IF EXISTS "Usuários veem sync_log de seus escritórios" ON sync_log;
CREATE POLICY "Usuários veem sync_log de seus escritórios" ON sync_log
FOR SELECT
USING (
  processo_id IN (
    SELECT id FROM processos 
    WHERE escritorio_id IN (
      SELECT escritorio_id FROM perfis WHERE user_id = auth.uid()
    )
  )
);

-- 8. TRIGGER PARA ATUALIZAR "atualizado_em" NA TABELA andamentos
CREATE OR REPLACE FUNCTION atualizar_andamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_andamentos_updated_at ON andamentos;
CREATE TRIGGER trigger_andamentos_updated_at
BEFORE UPDATE ON andamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_andamentos_updated_at();

-- 9. VERIFICAÇÃO FINAL
DO $$
BEGIN
  RAISE NOTICE '✅ Script executado com sucesso!';
  RAISE NOTICE '📋 Verificando...';
  
  -- Verificar colunas em andamentos
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'andamentos' AND column_name = 'sincronizado_em') THEN
    RAISE NOTICE '✓ Coluna sincronizado_em adicionada em andamentos';
  END IF;
  
  -- Verificar tabela sync_log
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sync_log') THEN
    RAISE NOTICE '✓ Tabela sync_log criada';
  END IF;
  
  -- Verificar view
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'acompanhamento_processos') THEN
    RAISE NOTICE '✓ View acompanhamento_processos criada';
  END IF;
  
  RAISE NOTICE '🎉 Tudo pronto para o bot sincronizar!';
END $$;
