-- Função RPC para criar faturamento e parcelas atomicamente
-- Execute este script no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION criar_faturamento_e_parcelas(
    faturamento_data JSONB,
    parcelas_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    novo_faturamento_id INTEGER;
    parcela JSONB;
    resultado JSONB;
BEGIN
    -- Inserir faturamento
    INSERT INTO faturamentos (
        processo_id,
        descricao,
        valor_total,
        data_acordo,
        status,
        created_at
    ) VALUES (
        (faturamento_data->>'processo_id')::INTEGER,
        faturamento_data->>'descricao',
        (faturamento_data->>'valor_total')::DECIMAL(10,2),
        (faturamento_data->>'data_acordo')::DATE,
        COALESCE(faturamento_data->>'status', 'Ativo'),
        NOW()
    ) RETURNING id INTO novo_faturamento_id;

    -- Inserir parcelas
    FOR parcela IN SELECT * FROM jsonb_array_elements(parcelas_data)
    LOOP
        INSERT INTO parcelas (
            faturamento_id,
            numero_parcela,
            valor,
            data_vencimento,
            status,
            descricao,
            created_at
        ) VALUES (
            novo_faturamento_id,
            (parcela->>'numero_parcela')::INTEGER,
            (parcela->>'valor')::DECIMAL(10,2),
            (parcela->>'data_vencimento')::DATE,
            COALESCE(parcela->>'status', 'Pendente'),
            parcela->>'descricao',
            NOW()
        );
    END LOOP;

    -- Retornar resultado
    resultado := jsonb_build_object(
        'success', true,
        'faturamento_id', novo_faturamento_id,
        'message', 'Faturamento e parcelas criados com sucesso'
    );

    RETURN resultado;

EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro, fazer rollback automático
    RAISE EXCEPTION 'Erro ao criar faturamento: %', SQLERRM;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION criar_faturamento_e_parcelas(JSONB, JSONB) IS 
'Função para criar faturamento e suas parcelas de forma atômica. 
Parâmetros:
- faturamento_data: dados do faturamento (processo_id, descricao, valor_total, data_acordo, status)
- parcelas_data: array de parcelas (numero_parcela, valor, data_vencimento, status, descricao)';

-- Exemplo de uso:
/*
SELECT criar_faturamento_e_parcelas(
    '{"processo_id": 1, "descricao": "Honorários advocatícios", "valor_total": 1000.00, "data_acordo": "2024-01-15", "status": "Ativo"}'::jsonb,
    '[
        {"numero_parcela": 1, "valor": 333.33, "data_vencimento": "2024-02-15", "status": "Pendente", "descricao": "Parcela 1/3"},
        {"numero_parcela": 2, "valor": 333.33, "data_vencimento": "2024-03-15", "status": "Pendente", "descricao": "Parcela 2/3"},
        {"numero_parcela": 3, "valor": 333.34, "data_vencimento": "2024-04-15", "status": "Pendente", "descricao": "Parcela 3/3"}
    ]'::jsonb
);
*/