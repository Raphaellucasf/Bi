-- Políticas RLS completas para tabela clientes
-- Adiciona políticas de INSERT, UPDATE e DELETE

-- Política de INSERT: usuários podem inserir clientes no seu escritório
DROP POLICY IF EXISTS "Usuários podem criar clientes no escritório" ON public.clientes;
CREATE POLICY "Usuários podem criar clientes no escritório"
ON public.clientes
FOR INSERT
WITH CHECK (
  escritorio_id IN (
    SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
  )
);

-- Política de UPDATE: usuários podem atualizar clientes do seu escritório
DROP POLICY IF EXISTS "Usuários podem atualizar clientes do escritório" ON public.clientes;
CREATE POLICY "Usuários podem atualizar clientes do escritório"
ON public.clientes
FOR UPDATE
USING (
  escritorio_id IN (
    SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
  )
);

-- Política de DELETE: usuários podem deletar clientes do seu escritório
DROP POLICY IF EXISTS "Usuários podem deletar clientes do escritório" ON public.clientes;
CREATE POLICY "Usuários podem deletar clientes do escritório"
ON public.clientes
FOR DELETE
USING (
  escritorio_id IN (
    SELECT escritorio_id FROM public.perfis WHERE user_id = auth.uid()
  )
);
