-- ========================================
-- ADICIONAR SUPORTE À SINCRONIZAÇÃO COM GOOGLE CALENDAR
-- Adiciona colunas necessárias para rastrear eventos sincronizados
-- ========================================

-- 1. Adicionar coluna para armazenar ID do evento no Google Calendar
ALTER TABLE public.andamentos 
ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255);

-- 2. Adicionar coluna data_fim para eventos que têm duração
ALTER TABLE public.andamentos 
ADD COLUMN IF NOT EXISTS data_fim TIMESTAMP WITH TIME ZONE;

-- 3. Criar índice para buscar rapidamente por eventos sincronizados
CREATE INDEX IF NOT EXISTS idx_andamentos_google_event 
ON public.andamentos(google_calendar_event_id) 
WHERE google_calendar_event_id IS NOT NULL;

-- 4. Adicionar colunas na tabela usuarios para controlar conexão Google
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios' 
        AND column_name = 'google_calendar_connected'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN google_calendar_connected BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios' 
        AND column_name = 'google_calendar_token'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN google_calendar_token TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios' 
        AND column_name = 'google_calendar_connected_at'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN google_calendar_connected_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 5. Verificação final
DO $$
DECLARE
    andamentos_cols INTEGER;
    usuarios_cols INTEGER;
BEGIN
    -- Verificar colunas em andamentos
    SELECT COUNT(*) INTO andamentos_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'andamentos'
    AND column_name IN ('google_calendar_event_id', 'data_fim');
    
    -- Verificar colunas em usuarios
    SELECT COUNT(*) INTO usuarios_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'usuarios'
    AND column_name IN ('google_calendar_connected', 'google_calendar_token', 'google_calendar_connected_at');
    
    RAISE NOTICE '✅ Colunas em andamentos: % de 2', andamentos_cols;
    RAISE NOTICE '✅ Colunas em usuarios: % de 3', usuarios_cols;
    
    IF andamentos_cols = 2 AND usuarios_cols = 3 THEN
        RAISE NOTICE '✅ SUCESSO! Todas as colunas necessárias foram criadas';
    ELSE
        RAISE WARNING '⚠️ ATENÇÃO! Algumas colunas podem estar faltando';
    END IF;
END $$;

-- ========================================
-- INSTRUÇÕES
-- ========================================
/*
Execute este script no Supabase SQL Editor para adicionar suporte
à sincronização com Google Calendar.

Após executar:
1. Eventos criados no app serão automaticamente enviados ao Google Calendar
2. Atualizações e exclusões também serão sincronizadas
3. O ID do evento do Google será armazenado em google_calendar_event_id
4. Usuários podem conectar/desconectar suas contas Google nas configurações
*/
