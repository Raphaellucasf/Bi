-- ========================================
-- ADICIONAR SUPORTE COMPLETO À SINCRONIZAÇÃO COM GOOGLE CALENDAR
-- ========================================

-- 1. Adicionar coluna para armazenar ID do evento no Google Calendar
ALTER TABLE andamentos ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255);

-- 2. Adicionar coluna data_fim para eventos que têm duração (CRÍTICO)
ALTER TABLE andamentos ADD COLUMN IF NOT EXISTS data_fim TIMESTAMP WITH TIME ZONE;

-- 3. Adicionar coluna para armazenar a cor do evento do Google Calendar
ALTER TABLE andamentos ADD COLUMN IF NOT EXISTS google_calendar_color VARCHAR(10);

-- 4. Adicionar coluna para identificar a origem do evento (app ou google_calendar)
ALTER TABLE andamentos ADD COLUMN IF NOT EXISTS origem VARCHAR(50) DEFAULT 'app';

-- 5. Criar índice para buscar eventos sincronizados
CREATE INDEX IF NOT EXISTS idx_andamentos_google_event 
ON andamentos(google_calendar_event_id) 
WHERE google_calendar_event_id IS NOT NULL;

-- 6. Criar índice para buscar por origem
CREATE INDEX IF NOT EXISTS idx_andamentos_origem 
ON andamentos(origem);

-- 7. Adicionar comentários
COMMENT ON COLUMN andamentos.google_calendar_event_id IS 'ID do evento no Google Calendar';
COMMENT ON COLUMN andamentos.data_fim IS 'Data/hora de término do evento';
COMMENT ON COLUMN andamentos.google_calendar_color IS 'Cor do evento no Google Calendar (colorId)';
COMMENT ON COLUMN andamentos.origem IS 'Origem do evento: app (criado no Meritus) ou google_calendar (importado do Google Calendar)';

-- ========================================
-- VERIFICAÇÃO
-- ========================================
DO $$
DECLARE
    colunas_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO colunas_count
    FROM information_schema.columns
    WHERE table_name = 'andamentos'
    AND column_name IN ('google_calendar_event_id', 'data_fim', 'google_calendar_color', 'origem');
    
    RAISE NOTICE '✅ Colunas criadas: % de 4', colunas_count;
    
    IF colunas_count = 4 THEN
        RAISE NOTICE '✅ SUCESSO! Todas as colunas necessárias foram criadas';
    ELSE
        RAISE WARNING '⚠️ ATENÇÃO! Algumas colunas podem estar faltando';
    END IF;
END $$;
