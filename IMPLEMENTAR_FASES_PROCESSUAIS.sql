-- ========================================
-- SISTEMA DE FASES E ANDAMENTOS PROCESSUAIS
-- Implementação completa para rastreamento de processos trabalhistas
-- ========================================

-- 1. TABELA: fases_processuais
-- Representa as 6 grandes fases de um processo trabalhista
CREATE TABLE IF NOT EXISTS public.fases_processuais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL UNIQUE, -- 1 a 6
    cor VARCHAR(20) DEFAULT '#6B7280', -- Cor hexadecimal para UI
    icone VARCHAR(50), -- Nome do ícone (ex: 'UserPlus', 'FileText', etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA: andamentos_processuais
-- Representa os andamentos possíveis dentro de cada fase
CREATE TABLE IF NOT EXISTS public.andamentos_processuais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    fase_id INTEGER REFERENCES public.fases_processuais(id) ON DELETE CASCADE,
    gera_prazo BOOLEAN DEFAULT FALSE, -- Se ao selecionar, deve criar um prazo automático
    dias_prazo INTEGER, -- Quantos dias de prazo (se gera_prazo = true)
    tipo_prazo VARCHAR(20), -- 'Fatal', 'Comum', 'Dilatório'
    proximos_andamentos TEXT, -- JSON array com IDs de próximos andamentos possíveis
    ordem_na_fase INTEGER, -- Ordem dentro da fase
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADICIONAR campos aos processos existentes
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS fase_id INTEGER REFERENCES public.fases_processuais(id),
ADD COLUMN IF NOT EXISTS andamento_id INTEGER REFERENCES public.andamentos_processuais(id),
ADD COLUMN IF NOT EXISTS data_ultima_mudanca_fase TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS observacoes_andamento TEXT;

-- 4. TABELA: processos_historico_fases
-- Histórico completo de mudanças de fase/andamento
CREATE TABLE IF NOT EXISTS public.processos_historico_fases (
    id SERIAL PRIMARY KEY,
    processo_id UUID REFERENCES public.processos(id) ON DELETE CASCADE,
    fase_id INTEGER REFERENCES public.fases_processuais(id),
    andamento_id INTEGER REFERENCES public.andamentos_processuais(id),
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_fim TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id), -- Quem fez a mudança
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_processos_fase ON public.processos(fase_id);
CREATE INDEX IF NOT EXISTS idx_processos_andamento ON public.processos(andamento_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_fase ON public.andamentos_processuais(fase_id);
CREATE INDEX IF NOT EXISTS idx_historico_processo ON public.processos_historico_fases(processo_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON public.processos_historico_fases(data_inicio DESC);

-- 6. POPULAR com as 6 fases principais
INSERT INTO public.fases_processuais (nome, descricao, ordem, cor, icone) VALUES
('Captação e Análise', 'Fase pré-processual de análise de viabilidade e contratação', 1, '#3B82F6', 'UserPlus'),
('Tentativa Extrajudicial', 'Negociação prévia e elaboração da petição inicial', 2, '#8B5CF6', 'FileEdit'),
('Conhecimento (Instrução)', 'Fase de instrução processual e conhecimento dos fatos', 3, '#F59E0B', 'Scale'),
('Recursal (Tribunal)', 'Fase de recursos em segunda instância (TRT/TJ)', 4, '#EF4444', 'TrendingUp'),
('Execução', 'Liquidação, cálculos e cobrança dos valores devidos', 5, '#10B981', 'DollarSign'),
('Encerramento', 'Pagamento realizado e arquivamento definitivo', 6, '#6B7280', 'CheckCircle')
ON CONFLICT DO NOTHING;

-- 7. POPULAR com andamentos da Fase 1: Captação e Análise
INSERT INTO public.andamentos_processuais (nome, fase_id, gera_prazo, ordem_na_fase) VALUES
('Novo Contato (Lead)', 1, false, 1),
('Aguardando Agendamento', 1, true, 2), -- Pode gerar lembrete de 3 dias
('Aguardando Documentos do Cliente', 1, true, 3),
('Em Análise de Viabilidade', 1, false, 4),
('Aguardando Proposta', 1, true, 5),
('Aguardando Contrato/Procuração', 1, true, 6),
('Não Contratado (Perdido)', 1, false, 7),
('Contratado (A Preparar)', 1, false, 8);

-- 8. POPULAR com andamentos da Fase 2: Tentativa Extrajudicial
INSERT INTO public.andamentos_processuais (nome, fase_id, gera_prazo, ordem_na_fase) VALUES
('Em Negociação Extrajudicial', 2, false, 1),
('Em Elaboração de Petição Inicial', 2, false, 2),
('Aguardando Distribuição/Protocolo', 2, true, 3),
('Processo Distribuído (Aguardando Citação)', 2, false, 4);

-- 9. POPULAR com andamentos da Fase 3: Conhecimento
INSERT INTO public.andamentos_processuais (nome, fase_id, gera_prazo, dias_prazo, tipo_prazo, ordem_na_fase) VALUES
('Aguardando Audiência (Inicial/Conciliação)', 3, true, null, 'Comum', 1),
('Aguardando Prazo (Geral)', 3, true, null, 'Comum', 2),
('Aguardando Prazo (Contestação/Réplica)', 3, true, 15, 'Fatal', 3),
('Aguardando Audiência (Instrução)', 3, true, null, 'Comum', 4),
('Aguardando Perícia', 3, false, null, null, 5),
('Aguardando Laudo Pericial', 3, false, null, null, 6),
('Prazo: Manifestação sobre Laudo', 3, true, 10, 'Fatal', 7),
('Processo Suspenso', 3, false, null, null, 8),
('Concluso para Despacho', 3, false, null, null, 9),
('Concluso para Decisão', 3, false, null, null, 10),
('Concluso para Sentença', 3, false, null, null, 11),
('Sentença Publicada (Aguardando Prazo)', 3, true, 15, 'Fatal', 12);

-- 10. POPULAR com andamentos da Fase 4: Recursal
INSERT INTO public.andamentos_processuais (nome, fase_id, gera_prazo, dias_prazo, tipo_prazo, ordem_na_fase) VALUES
('Em Elaboração de Recurso', 4, true, 15, 'Fatal', 1),
('Em Elaboração de Contrarrazões', 4, true, 15, 'Fatal', 2),
('Aguardando Admissibilidade', 4, false, null, null, 3),
('Remetido ao Tribunal (TRT/TJ)', 4, false, null, null, 4),
('Aguardando Distribuição (Tribunal)', 4, false, null, null, 5),
('Concluso para Relator', 4, false, null, null, 6),
('Aguardando Pauta de Julgamento', 4, false, null, null, 7),
('Julgamento Agendado (Sessão Virtual/Presencial)', 4, true, null, 'Comum', 8),
('Acórdão Publicado (Aguardando Prazo)', 4, true, 15, 'Fatal', 9),
('Aguardando Trânsito em Julgado', 4, false, null, null, 10),
('Processo Baixado (Retorno à Origem)', 4, false, null, null, 11);

-- 11. POPULAR com andamentos da Fase 5: Execução
INSERT INTO public.andamentos_processuais (nome, fase_id, gera_prazo, dias_prazo, tipo_prazo, ordem_na_fase) VALUES
('Aguardando Início da Execução', 5, false, null, null, 1),
('Em Fase de Liquidação (Cálculos)', 5, false, null, null, 2),
('Aguardando Impugnação de Cálculos', 5, true, 15, 'Fatal', 3),
('Cálculos Homologados (Aguardando Pagamento)', 5, true, 10, 'Comum', 4),
('Aguardando Pagamento Voluntário', 5, false, null, null, 5),
('Em Pesquisa Patrimonial (Bacen/SisbaJud)', 5, false, null, null, 6),
('Em Pesquisa de Bens (RenaJud / InfoJud)', 5, false, null, null, 7),
('Aguardando Leilão/Hasta Pública', 5, false, null, null, 8),
('Valor Depositado (Aguardando Liberação)', 5, false, null, null, 9),
('Expedição de Alvará / Guia de Retirada', 5, true, 5, 'Comum', 10);

-- 12. POPULAR com andamentos da Fase 6: Encerramento
INSERT INTO public.andamentos_processuais (nome, fase_id, gera_prazo, ordem_na_fase) VALUES
('Valor Recebido (Em Prestação de Contas)', 6, false, 1),
('Pagamento Realizado ao Cliente', 6, false, 2),
('Aguardando Arquivamento Definitivo', 6, false, 3),
('Arquivado Definitivamente', 6, false, 4);

-- 13. RLS (Row Level Security) - Políticas de acesso
ALTER TABLE public.fases_processuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.andamentos_processuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_historico_fases ENABLE ROW LEVEL SECURITY;

-- Todos podem ver fases e andamentos (são dados mestres)
CREATE POLICY "Todos podem ver fases" ON public.fases_processuais FOR SELECT USING (true);
CREATE POLICY "Todos podem ver andamentos" ON public.andamentos_processuais FOR SELECT USING (true);

-- Histórico: só pode ver do seu escritório
CREATE POLICY "Ver histórico do escritório" ON public.processos_historico_fases
FOR SELECT USING (
    processo_id IN (
        SELECT id FROM public.processos 
        WHERE escritorio_id IN (
            SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
        )
    )
);

-- Histórico: só pode inserir se for do escritório
CREATE POLICY "Inserir histórico do escritório" ON public.processos_historico_fases
FOR INSERT WITH CHECK (
    processo_id IN (
        SELECT id FROM public.processos 
        WHERE escritorio_id IN (
            SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
        )
    )
);

-- 14. FUNÇÃO para registrar mudança de fase automaticamente
CREATE OR REPLACE FUNCTION public.registrar_mudanca_fase()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a fase ou andamento mudou
    IF (OLD.fase_id IS DISTINCT FROM NEW.fase_id) OR (OLD.andamento_id IS DISTINCT FROM NEW.andamento_id) THEN
        -- Finalizar o registro anterior
        UPDATE public.processos_historico_fases
        SET data_fim = NOW()
        WHERE processo_id = NEW.id AND data_fim IS NULL;
        
        -- Criar novo registro
        INSERT INTO public.processos_historico_fases (
            processo_id, 
            fase_id, 
            andamento_id, 
            user_id,
            observacoes
        ) VALUES (
            NEW.id,
            NEW.fase_id,
            NEW.andamento_id,
            auth.uid(),
            NEW.observacoes_andamento
        );
        
        -- Atualizar data da última mudança
        NEW.data_ultima_mudanca_fase = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. TRIGGER para chamar a função automaticamente
DROP TRIGGER IF EXISTS trigger_mudanca_fase ON public.processos;
CREATE TRIGGER trigger_mudanca_fase
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.registrar_mudanca_fase();

-- 16. VIEW útil: processos com fase e andamento
CREATE OR REPLACE VIEW public.vw_processos_com_fase AS
SELECT 
    p.*,
    f.nome as fase_nome,
    f.cor as fase_cor,
    f.icone as fase_icone,
    f.ordem as fase_ordem,
    a.nome as andamento_nome,
    a.gera_prazo,
    a.dias_prazo,
    a.tipo_prazo,
    EXTRACT(DAY FROM (NOW() - p.data_ultima_mudanca_fase)) as dias_na_fase_atual
FROM public.processos p
LEFT JOIN public.fases_processuais f ON p.fase_id = f.id
LEFT JOIN public.andamentos_processuais a ON p.andamento_id = a.id;

-- FIM DO SCRIPT
-- Execute este arquivo completo no Supabase SQL Editor
