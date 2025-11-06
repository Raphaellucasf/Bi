-- Criação da tabela pessoas_fisicas para armazenar dados de pessoas físicas (partes contrárias)
-- Similar à tabela empresas, mas para CPF

CREATE TABLE IF NOT EXISTS pessoas_fisicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf VARCHAR(14) UNIQUE NOT NULL, -- CPF com máscara: 000.000.000-00
  nome_completo VARCHAR(255) NOT NULL,
  endereco_rfb TEXT,
  endereco_trabalho TEXT,
  advogado VARCHAR(255),
  oab VARCHAR(50),
  telefone VARCHAR(20),
  email VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para busca rápida por CPF
CREATE INDEX IF NOT EXISTS idx_pessoas_fisicas_cpf ON pessoas_fisicas(cpf);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pessoas_fisicas_updated_at
    BEFORE UPDATE ON pessoas_fisicas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários na tabela
COMMENT ON TABLE pessoas_fisicas IS 'Tabela para armazenar dados de pessoas físicas que são partes contrárias em processos';
COMMENT ON COLUMN pessoas_fisicas.cpf IS 'CPF com máscara (000.000.000-00)';
COMMENT ON COLUMN pessoas_fisicas.nome_completo IS 'Nome completo da pessoa física';
COMMENT ON COLUMN pessoas_fisicas.endereco_rfb IS 'Endereço cadastrado na Receita Federal';
COMMENT ON COLUMN pessoas_fisicas.endereco_trabalho IS 'Endereço do local de trabalho';
COMMENT ON COLUMN pessoas_fisicas.advogado IS 'Nome do advogado da parte contrária';
COMMENT ON COLUMN pessoas_fisicas.oab IS 'Número da OAB do advogado';
COMMENT ON COLUMN pessoas_fisicas.telefone IS 'Telefone de contato';
COMMENT ON COLUMN pessoas_fisicas.email IS 'Email de contato';
COMMENT ON COLUMN pessoas_fisicas.observacoes IS 'Observações adicionais';
