-- =====================================================
-- ADICIONAR SUPORTE PARA ANÁLISE DE DOCUMENTOS COM IA
-- =====================================================

-- 1. ADICIONAR COLUNAS NA TABELA "documentos"
ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS resumo_ia TEXT,
ADD COLUMN IF NOT EXISTS analisado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conteudo_extraido TEXT,
ADD COLUMN IF NOT EXISTS caminho_local_documento TEXT;

-- Comentar colunas
COMMENT ON COLUMN documentos.resumo_ia IS 'Resumo gerado pela IA Julia';
COMMENT ON COLUMN documentos.analisado_em IS 'Quando o documento foi analisado pela IA';
COMMENT ON COLUMN documentos.conteudo_extraido IS 'Texto extraído do documento (primeiros 10k chars)';
COMMENT ON COLUMN documentos.caminho_local_documento IS 'Caminho no PC onde o documento está salvo';

-- 2. CRIAR ÍNDICE PARA BUSCAR DOCUMENTOS NÃO ANALISADOS
CREATE INDEX IF NOT EXISTS idx_documentos_pendentes_analise 
ON documentos(processo_id) 
WHERE resumo_ia IS NULL AND caminho_local_documento IS NOT NULL;

-- 3. VERIFICAÇÃO
DO $$
BEGIN
  RAISE NOTICE '✅ Colunas de análise IA adicionadas em documentos';
  RAISE NOTICE '📄 Documentos agora podem ter resumos gerados pela Julia AI';
END $$;
