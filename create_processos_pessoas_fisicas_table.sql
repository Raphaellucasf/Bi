-- Criação da tabela processos_pessoas_fisicas para relacionar processos com pessoas físicas (partes contrárias)
-- Similar à tabela processos_empresas, mas para CPF

CREATE TABLE IF NOT EXISTS processos_pessoas_fisicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  pessoa_fisica_id UUID NOT NULL REFERENCES pessoas_fisicas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(processo_id, pessoa_fisica_id)
);

-- Índices para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_processos_pessoas_fisicas_processo_id ON processos_pessoas_fisicas(processo_id);
CREATE INDEX IF NOT EXISTS idx_processos_pessoas_fisicas_pessoa_fisica_id ON processos_pessoas_fisicas(pessoa_fisica_id);

-- Comentários na tabela
COMMENT ON TABLE processos_pessoas_fisicas IS 'Tabela de relacionamento entre processos e pessoas físicas (partes contrárias)';
COMMENT ON COLUMN processos_pessoas_fisicas.processo_id IS 'ID do processo';
COMMENT ON COLUMN processos_pessoas_fisicas.pessoa_fisica_id IS 'ID da pessoa física (parte contrária)';
