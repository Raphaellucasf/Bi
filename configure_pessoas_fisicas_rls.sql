-- Configuração de Row Level Security (RLS) para tabelas de pessoas físicas
-- Execute este script APÓS criar as tabelas pessoas_fisicas e processos_pessoas_fisicas

-- Habilitar RLS nas tabelas
ALTER TABLE pessoas_fisicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos_pessoas_fisicas ENABLE ROW LEVEL SECURITY;

-- ================================================
-- POLÍTICAS PARA TABELA pessoas_fisicas
-- ================================================

-- Permitir SELECT (leitura) para usuários autenticados
CREATE POLICY "Permitir leitura de pessoas físicas para usuários autenticados"
ON pessoas_fisicas
FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT (inserção) para usuários autenticados
CREATE POLICY "Permitir inserção de pessoas físicas para usuários autenticados"
ON pessoas_fisicas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir UPDATE (atualização) para usuários autenticados
CREATE POLICY "Permitir atualização de pessoas físicas para usuários autenticados"
ON pessoas_fisicas
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir DELETE (exclusão) para usuários autenticados
CREATE POLICY "Permitir exclusão de pessoas físicas para usuários autenticados"
ON pessoas_fisicas
FOR DELETE
TO authenticated
USING (true);

-- ================================================
-- POLÍTICAS PARA TABELA processos_pessoas_fisicas
-- ================================================

-- Permitir SELECT (leitura) para usuários autenticados
CREATE POLICY "Permitir leitura de relações processo-pessoa para usuários autenticados"
ON processos_pessoas_fisicas
FOR SELECT
TO authenticated
USING (true);

-- Permitir INSERT (inserção) para usuários autenticados
CREATE POLICY "Permitir inserção de relações processo-pessoa para usuários autenticados"
ON processos_pessoas_fisicas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir DELETE (exclusão) para usuários autenticados
CREATE POLICY "Permitir exclusão de relações processo-pessoa para usuários autenticados"
ON processos_pessoas_fisicas
FOR DELETE
TO authenticated
USING (true);

-- ================================================
-- OBSERVAÇÕES
-- ================================================
-- Se você precisar de políticas mais restritivas baseadas em escritório_id,
-- você pode modificar as políticas acima. Exemplo:
--
-- CREATE POLICY "Permitir leitura apenas do próprio escritório"
-- ON pessoas_fisicas
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM processos_pessoas_fisicas ppf
--     JOIN processos p ON ppf.processo_id = p.id
--     WHERE ppf.pessoa_fisica_id = pessoas_fisicas.id
--     AND p.escritorio_id = auth.uid()
--   )
-- );
