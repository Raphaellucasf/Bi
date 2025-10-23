-- Tabela de Gastos para integração com o sistema
CREATE TABLE IF NOT EXISTS public.gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    escritorio_id UUID REFERENCES public.escritorios(id) ON DELETE CASCADE,
    valor NUMERIC(12,2) NOT NULL,
    descricao TEXT,
    categoria TEXT,
    data_gasto DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_gastos_escritorio ON public.gastos(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_gastos_data_gasto ON public.gastos(data_gasto DESC);

-- Habilitar RLS
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Política de SELECT: usuários podem ver gastos do seu escritório
DROP POLICY IF EXISTS "Usuários podem ver gastos do escritório" ON public.gastos;
CREATE POLICY "Usuários podem ver gastos do escritório"
ON public.gastos
FOR SELECT
USING (
  escritorio_id IN (
    SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
  )
);
