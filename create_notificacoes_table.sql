-- Tabela de Notificações
-- Script SQL para criar a tabela notificacoes no Supabase

-- 1. Criar a tabela
CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    escritorio_id UUID REFERENCES public.escritorios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'prazo', 'audiencia', 'reuniao', 'publicacao', 'tarefa', 'sistema'
    titulo TEXT NOT NULL,
    mensagem TEXT,
    link TEXT, -- URL para redirecionar ao clicar na notificação
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_leitura TIMESTAMP WITH TIME ZONE,
    prioridade VARCHAR(20) DEFAULT 'normal', -- 'baixa', 'normal', 'alta', 'urgente'
    icone VARCHAR(50), -- nome do ícone a ser exibido
    metadata JSONB, -- dados adicionais (ex: processo_id, tarefa_id, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_escritorio ON public.notificacoes(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON public.notificacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data_criacao ON public.notificacoes(data_criacao DESC);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_notificacoes_updated_at ON public.notificacoes;
CREATE TRIGGER trigger_update_notificacoes_updated_at
    BEFORE UPDATE ON public.notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_notificacoes_updated_at();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS

-- Política de SELECT: usuários podem ver apenas suas próprias notificações ou do seu escritório
DROP POLICY IF EXISTS "Usuários podem ver suas notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem ver suas notificações"
ON public.notificacoes
FOR SELECT
USING (
    auth.uid() = user_id
    OR
    escritorio_id IN (
        SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
    )
);

-- Política de INSERT: apenas o sistema pode criar notificações
DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notificacoes;
CREATE POLICY "Sistema pode criar notificações"
ON public.notificacoes
FOR INSERT
WITH CHECK (
    escritorio_id IN (
        SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
    )
);

-- Política de UPDATE: usuários podem atualizar apenas suas próprias notificações (ex: marcar como lida)
DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem atualizar suas notificacoes"
ON public.notificacoes
FOR UPDATE
USING (
    auth.uid() = user_id
    OR
    escritorio_id IN (
        SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
    )
);

-- Política de DELETE: usuários podem deletar suas próprias notificações
DROP POLICY IF EXISTS "Usuários podem deletar suas notificações" ON public.notificacoes;
CREATE POLICY "Usuários podem deletar suas notificações"
ON public.notificacoes
FOR DELETE
USING (
    auth.uid() = user_id
    OR
    escritorio_id IN (
        SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
    )
);

-- 7. Comentários para documentação
COMMENT ON TABLE public.notificacoes IS 'Armazena todas as notificações do sistema para usuários e escritórios';
COMMENT ON COLUMN public.notificacoes.tipo IS 'Tipo da notificação: prazo, audiencia, reuniao, publicacao, tarefa, sistema';
COMMENT ON COLUMN public.notificacoes.prioridade IS 'Prioridade: baixa, normal, alta, urgente';
COMMENT ON COLUMN public.notificacoes.metadata IS 'Dados adicionais em formato JSON (processo_id, tarefa_id, etc)';
COMMENT ON COLUMN public.notificacoes.lida IS 'Indica se a notificação foi lida pelo usuário';

-- 8. Inserir notificações de exemplo (opcional - remover em produção)
-- INSERT INTO public.notificacoes (escritorio_id, user_id, tipo, titulo, mensagem, prioridade)
-- VALUES 
-- (
--     (SELECT id FROM public.escritorios LIMIT 1),
--     (SELECT id FROM auth.users LIMIT 1),
--     'sistema',
--     'Bem-vindo ao sistema!',
--     'Esta é uma notificação de teste.',
--     'normal'
-- );
