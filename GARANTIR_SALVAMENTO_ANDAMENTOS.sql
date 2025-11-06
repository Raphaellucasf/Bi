-- ========================================
-- GARANTIR SALVAMENTO DE ANDAMENTOS NOS PROCESSOS
-- Script completo para assegurar que fase_id, andamento_id e observacoes_andamento
-- sejam salvos corretamente na tabela processos
-- ========================================

-- 1. VERIFICAR e ADICIONAR colunas na tabela processos (se não existirem)
DO $$ 
BEGIN
    -- Adicionar coluna fase_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'processos' 
        AND column_name = 'fase_id'
    ) THEN
        ALTER TABLE public.processos ADD COLUMN fase_id INTEGER;
        RAISE NOTICE 'Coluna fase_id adicionada à tabela processos';
    ELSE
        RAISE NOTICE 'Coluna fase_id já existe na tabela processos';
    END IF;

    -- Adicionar coluna andamento_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'processos' 
        AND column_name = 'andamento_id'
    ) THEN
        ALTER TABLE public.processos ADD COLUMN andamento_id INTEGER;
        RAISE NOTICE 'Coluna andamento_id adicionada à tabela processos';
    ELSE
        RAISE NOTICE 'Coluna andamento_id já existe na tabela processos';
    END IF;

    -- Adicionar coluna observacoes_andamento se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'processos' 
        AND column_name = 'observacoes_andamento'
    ) THEN
        ALTER TABLE public.processos ADD COLUMN observacoes_andamento TEXT;
        RAISE NOTICE 'Coluna observacoes_andamento adicionada à tabela processos';
    ELSE
        RAISE NOTICE 'Coluna observacoes_andamento já existe na tabela processos';
    END IF;

    -- Adicionar coluna data_ultima_mudanca_fase se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'processos' 
        AND column_name = 'data_ultima_mudanca_fase'
    ) THEN
        ALTER TABLE public.processos ADD COLUMN data_ultima_mudanca_fase TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna data_ultima_mudanca_fase adicionada à tabela processos';
    ELSE
        RAISE NOTICE 'Coluna data_ultima_mudanca_fase já existe na tabela processos';
    END IF;
END $$;

-- 2. ADICIONAR foreign keys se não existirem
DO $$
BEGIN
    -- Foreign key para fase_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'processos_fase_id_fkey'
        AND table_name = 'processos'
    ) THEN
        ALTER TABLE public.processos 
        ADD CONSTRAINT processos_fase_id_fkey 
        FOREIGN KEY (fase_id) REFERENCES public.fases_processuais(id);
        RAISE NOTICE 'Foreign key fase_id criada';
    END IF;

    -- Foreign key para andamento_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'processos_andamento_id_fkey'
        AND table_name = 'processos'
    ) THEN
        ALTER TABLE public.processos 
        ADD CONSTRAINT processos_andamento_id_fkey 
        FOREIGN KEY (andamento_id) REFERENCES public.andamentos_processuais(id);
        RAISE NOTICE 'Foreign key andamento_id criada';
    END IF;
END $$;

-- 3. CRIAR ÍNDICES para melhor performance
CREATE INDEX IF NOT EXISTS idx_processos_fase_id ON public.processos(fase_id);
CREATE INDEX IF NOT EXISTS idx_processos_andamento_id ON public.processos(andamento_id);
CREATE INDEX IF NOT EXISTS idx_processos_data_mudanca_fase ON public.processos(data_ultima_mudanca_fase);

-- 4. VERIFICAR se tabela processos_historico_fases existe
CREATE TABLE IF NOT EXISTS public.processos_historico_fases (
    id SERIAL PRIMARY KEY,
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    fase_id INTEGER REFERENCES public.fases_processuais(id),
    andamento_id INTEGER REFERENCES public.andamentos_processuais(id),
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fim TIMESTAMP WITH TIME ZONE,
    user_id UUID, -- Pode referenciar auth.users(id) se disponível
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÍNDICES para tabela de histórico
CREATE INDEX IF NOT EXISTS idx_historico_processo_id ON public.processos_historico_fases(processo_id);
CREATE INDEX IF NOT EXISTS idx_historico_data_inicio ON public.processos_historico_fases(data_inicio DESC);
CREATE INDEX IF NOT EXISTS idx_historico_fase_id ON public.processos_historico_fases(fase_id);

-- 6. FUNÇÃO para registrar mudanças de fase/andamento automaticamente no histórico
CREATE OR REPLACE FUNCTION public.registrar_mudanca_fase()
RETURNS TRIGGER AS $$
BEGIN
    -- Se houve mudança em fase_id ou andamento_id
    IF (OLD.fase_id IS DISTINCT FROM NEW.fase_id) OR 
       (OLD.andamento_id IS DISTINCT FROM NEW.andamento_id) THEN
        
        -- Finalizar registro anterior (se existir)
        UPDATE public.processos_historico_fases
        SET data_fim = NOW()
        WHERE processo_id = NEW.id
        AND data_fim IS NULL;
        
        -- Criar novo registro no histórico
        INSERT INTO public.processos_historico_fases 
        (processo_id, fase_id, andamento_id, observacoes, data_inicio)
        VALUES 
        (NEW.id, NEW.fase_id, NEW.andamento_id, NEW.observacoes_andamento, NOW());
        
        -- Atualizar data_ultima_mudanca_fase
        NEW.data_ultima_mudanca_fase = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGER para executar a função automaticamente
DROP TRIGGER IF EXISTS trigger_registrar_mudanca_fase ON public.processos;
CREATE TRIGGER trigger_registrar_mudanca_fase
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_mudanca_fase();

-- 8. VERIFICAR permissões RLS (Row Level Security)
-- Se RLS estiver habilitado, garantir que as policies permitam UPDATE
DO $$
BEGIN
    -- Verificar se RLS está ativo na tabela processos
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'processos' 
        AND rowsecurity = true
    ) THEN
        -- Criar policy de UPDATE se não existir
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'processos' 
            AND policyname = 'Permitir update de fases e andamentos'
        ) THEN
            EXECUTE 'CREATE POLICY "Permitir update de fases e andamentos" 
                     ON public.processos 
                     FOR UPDATE 
                     USING (auth.uid() IS NOT NULL)';
            RAISE NOTICE 'Policy de UPDATE criada';
        END IF;
    END IF;
END $$;

-- 9. TESTE: Verificar estrutura final
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'processos'
    AND column_name IN ('fase_id', 'andamento_id', 'observacoes_andamento', 'data_ultima_mudanca_fase');
    
    RAISE NOTICE '✅ Total de colunas encontradas: %', col_count;
    
    IF col_count = 4 THEN
        RAISE NOTICE '✅ SUCESSO! Todas as 4 colunas necessárias existem na tabela processos';
    ELSE
        RAISE WARNING '⚠️ ATENÇÃO! Esperado 4 colunas, encontrado: %', col_count;
    END IF;
END $$;

-- 10. CONSULTA DE VERIFICAÇÃO: Mostrar estrutura das colunas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'processos'
AND column_name IN ('fase_id', 'andamento_id', 'observacoes_andamento', 'data_ultima_mudanca_fase')
ORDER BY column_name;

-- ========================================
-- INSTRUÇÕES DE USO
-- ========================================
/*
1. Execute este script inteiro no Supabase SQL Editor
2. Verifique os NOTICES no console para confirmar que tudo foi criado
3. Teste atualizando um processo:
   
   UPDATE processos 
   SET fase_id = 1, andamento_id = 2, observacoes_andamento = 'Teste de atualização'
   WHERE id = 'seu-processo-id-aqui';
   
4. Verifique se foi salvo:
   
   SELECT id, numero_processo, fase_id, andamento_id, observacoes_andamento, data_ultima_mudanca_fase
   FROM processos
   WHERE id = 'seu-processo-id-aqui';
   
5. Verifique o histórico:
   
   SELECT * FROM processos_historico_fases
   WHERE processo_id = 'seu-processo-id-aqui'
   ORDER BY data_inicio DESC;
*/
