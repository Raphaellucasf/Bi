-- ========================================
-- ADICIONAR COLUNA ENDERECO NA TABELA CLIENTES
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- Adicionar coluna endereco (se não existir)
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS endereco TEXT;

-- Adicionar comentário
COMMENT ON COLUMN clientes.endereco IS 'Endereço completo do cliente (rua, número, bairro, cidade, CEP, complemento)';

-- Criar índice para buscas
CREATE INDEX IF NOT EXISTS idx_clientes_endereco ON clientes USING gin(to_tsvector('portuguese', endereco));

-- ========================================
-- VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    col_endereco INTEGER;
BEGIN
    -- Verificar coluna endereco
    SELECT COUNT(*) INTO col_endereco
    FROM information_schema.columns
    WHERE table_name = 'clientes'
    AND column_name = 'endereco';
    
    IF col_endereco > 0 THEN
        RAISE NOTICE '✅ SUCESSO! Coluna endereco foi adicionada na tabela clientes!';
        RAISE NOTICE '📋 Agora você pode salvar endereços dos clientes!';
    ELSE
        RAISE WARNING '⚠️ ERRO! Coluna endereco não foi criada.';
    END IF;
END $$;

-- ========================================
-- INSTRUÇÕES
-- ========================================
-- 1. Acesse: https://zodfekamwsidlrjrujmr.supabase.co/project/zodfekamwsidlrjrujmr/editor
-- 2. Clique em "SQL Editor" no menu lateral
-- 3. Cole este código completo
-- 4. Clique em "Run" ou pressione Ctrl+Enter
-- 5. Verifique a mensagem de sucesso
