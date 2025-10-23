-- ============================================
-- SCRIPT COMPLETO DE CORREÇÃO - UPDATED_AT
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- PARTE 1: TABELA CLIENTES
-- ============================================

-- Add updated_at column to clientes table
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_clientes_updated_at ON clientes(updated_at DESC);

-- Create trigger to automatically update updated_at on row updates (only UPDATE, not INSERT)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if it's an UPDATE operation (not INSERT)
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set updated_at to created_at for existing rows (one-time migration)
UPDATE clientes
SET updated_at = created_at
WHERE updated_at IS NULL;


-- ============================================
-- PARTE 2: TABELA PROCESSOS
-- ============================================

-- Add updated_at column to processos table
ALTER TABLE processos
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_processos_updated_at ON processos(updated_at DESC);

-- Create trigger to automatically update updated_at on row updates (only UPDATE, not INSERT)
CREATE OR REPLACE FUNCTION update_processos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if it's an UPDATE operation (not INSERT)
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_processos_updated_at ON processos;

CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON processos
    FOR EACH ROW
    EXECUTE FUNCTION update_processos_updated_at_column();

-- Set updated_at to created_at for existing rows (one-time migration)
UPDATE processos
SET updated_at = created_at
WHERE updated_at IS NULL;


-- ============================================
-- VERIFICAÇÃO (Opcional - para confirmar)
-- ============================================

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientes' AND column_name = 'updated_at';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'processos' AND column_name = 'updated_at';

-- Verificar se os triggers foram criados
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('update_clientes_updated_at', 'update_processos_updated_at');
