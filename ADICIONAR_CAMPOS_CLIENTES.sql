-- ========================================
-- ADICIONAR CAMPOS FALTANTES NA TABELA CLIENTES
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Adicionar coluna CPF
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);

-- 2. Adicionar coluna Data de Nascimento
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- 3. Adicionar coluna RG
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS rg VARCHAR(20);

-- 4. Adicionar coluna Naturalidade
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS naturalidade VARCHAR(100);

-- 5. Adicionar coluna Estado Civil
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(30);

-- 6. Adicionar coluna Profissão
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS profissao VARCHAR(100);

-- 7. Garantir que processos tem escritorio_id (para compatibilidade)
ALTER TABLE processos
ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES escritorios(id);

-- 8. Criar índices para buscas
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome_completo);
CREATE INDEX IF NOT EXISTS idx_clientes_escritorio ON clientes(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_processos_escritorio ON processos(escritorio_id);

-- 9. Adicionar comentários
COMMENT ON COLUMN clientes.cpf IS 'CPF do cliente (apenas números)';
COMMENT ON COLUMN clientes.data_nascimento IS 'Data de nascimento do cliente';
COMMENT ON COLUMN clientes.rg IS 'RG do cliente';
COMMENT ON COLUMN clientes.naturalidade IS 'Cidade/Estado de nascimento';
COMMENT ON COLUMN clientes.estado_civil IS 'Estado civil (Solteiro, Casado, etc.)';
COMMENT ON COLUMN clientes.profissao IS 'Profissão do cliente';

-- ========================================
-- VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    colunas_clientes INTEGER;
    col_processos INTEGER;
BEGIN
    -- Verificar colunas de clientes
    SELECT COUNT(*) INTO colunas_clientes
    FROM information_schema.columns
    WHERE table_name = 'clientes'
    AND column_name IN ('cpf', 'data_nascimento', 'rg', 'naturalidade', 'estado_civil', 'profissao');
    
    -- Verificar coluna de processos
    SELECT COUNT(*) INTO col_processos
    FROM information_schema.columns
    WHERE table_name = 'processos'
    AND column_name = 'escritorio_id';
    
    RAISE NOTICE '✅ Colunas criadas em clientes: % de 6', colunas_clientes;
    RAISE NOTICE '✅ Coluna escritorio_id em processos: %', CASE WHEN col_processos > 0 THEN 'Sim' ELSE 'Não' END;
    
    IF colunas_clientes = 6 AND col_processos > 0 THEN
        RAISE NOTICE '✅ SUCESSO! Todos os campos foram adicionados!';
        RAISE NOTICE '📋 Julia AI agora pode criar clientes e processos corretamente!';
    ELSE
        RAISE WARNING '⚠️ ATENÇÃO! Algumas colunas podem estar faltando';
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
