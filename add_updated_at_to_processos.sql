-- Add updated_at column to processos table
ALTER TABLE processos
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_processos_updated_at ON processos(updated_at DESC);

-- Create trigger to automatically update updated_at on row updates
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

-- Optional: Make updated_at NOT NULL after migration
-- ALTER TABLE processos ALTER COLUMN updated_at SET NOT NULL;
