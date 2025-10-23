-- Add updated_at column to clientes table
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_clientes_updated_at ON clientes(updated_at DESC);

-- Create trigger to automatically update updated_at on row updates
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

-- Optional: Make updated_at NOT NULL after migration
-- ALTER TABLE clientes ALTER COLUMN updated_at SET NOT NULL;
