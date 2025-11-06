# 🔧 Garantir Salvamento de Andamentos nos Processos

## 📋 Problema
Os campos `fase_id`, `andamento_id` e `observacoes_andamento` podem não estar sendo salvos corretamente na tabela `processos` do Supabase.

## ✅ Solução
Execute o script SQL `GARANTIR_SALVAMENTO_ANDAMENTOS.sql` que:

### 1. **Verifica e Cria Colunas**
- `fase_id` - Referência à fase processual atual
- `andamento_id` - Referência ao andamento atual
- `observacoes_andamento` - Texto livre com observações
- `data_ultima_mudanca_fase` - Timestamp da última alteração

### 2. **Cria Foreign Keys**
- Garante integridade referencial com `fases_processuais`
- Garante integridade referencial com `andamentos_processuais`

### 3. **Cria Índices**
- Melhora performance de consultas por fase/andamento
- Otimiza ordenação por data de mudança

### 4. **Registra Histórico Automático**
- Trigger que registra toda mudança de fase/andamento
- Mantém histórico completo em `processos_historico_fases`
- Finaliza registro anterior e cria novo automaticamente

### 5. **Configura Permissões RLS**
- Garante que usuários autenticados possam atualizar os campos
- Cria policy de UPDATE se RLS estiver ativo

---

## 🚀 Como Executar

### Passo 1: Abrir Supabase SQL Editor
1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** no menu lateral
3. Clique em **+ New Query**

### Passo 2: Copiar e Executar o Script
1. Abra o arquivo `GARANTIR_SALVAMENTO_ANDAMENTOS.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verificar Resultado
Você verá mensagens como:
```
✅ Coluna fase_id já existe na tabela processos
✅ Coluna andamento_id já existe na tabela processos
✅ Foreign key fase_id criada
✅ SUCESSO! Todas as 4 colunas necessárias existem na tabela processos
```

---

## 🧪 Como Testar

### Teste 1: Atualizar Fase/Andamento
```sql
-- Escolha um processo existente
UPDATE processos 
SET 
    fase_id = 3,  -- Fase: Conhecimento (Instrução)
    andamento_id = 16,  -- Andamento específico
    observacoes_andamento = 'Aguardando audiência de instrução'
WHERE numero_processo = '0000000-00.0000.0.00.0000';  -- Use um número real
```

### Teste 2: Verificar se Salvou
```sql
SELECT 
    numero_processo,
    fase_id,
    andamento_id,
    observacoes_andamento,
    data_ultima_mudanca_fase
FROM processos
WHERE numero_processo = '0000000-00.0000.0.00.0000';
```

**Resultado esperado:**
| numero_processo | fase_id | andamento_id | observacoes_andamento | data_ultima_mudanca_fase |
|-----------------|---------|--------------|------------------------|--------------------------|
| 0000000-00... | 3 | 16 | Aguardando audiência... | 2025-11-05 14:30:00 |

### Teste 3: Verificar Histórico
```sql
SELECT 
    processo_id,
    fase_id,
    andamento_id,
    observacoes,
    data_inicio,
    data_fim
FROM processos_historico_fases
WHERE processo_id = (
    SELECT id FROM processos 
    WHERE numero_processo = '0000000-00.0000.0.00.0000'
)
ORDER BY data_inicio DESC;
```

---

## 🎯 O Que o Script Faz

| Ação | Descrição |
|------|-----------|
| ✅ **Verifica colunas** | Se não existir, cria `fase_id`, `andamento_id`, `observacoes_andamento` |
| ✅ **Cria FKs** | Garante integridade com tabelas `fases_processuais` e `andamentos_processuais` |
| ✅ **Cria índices** | Melhora performance de consultas (até 10x mais rápido) |
| ✅ **Trigger automático** | Registra cada mudança no histórico sem código extra |
| ✅ **RLS policies** | Garante permissões corretas para UPDATE |
| ✅ **Mensagens claras** | Mostra exatamente o que foi criado ou já existia |

---

## 🔍 Diagnóstico de Problemas

### Problema: "Coluna não existe"
**Causa:** Script não foi executado completamente  
**Solução:** Execute novamente o script `GARANTIR_SALVAMENTO_ANDAMENTOS.sql`

### Problema: "Foreign key constraint violation"
**Causa:** Tabelas `fases_processuais` ou `andamentos_processuais` não existem  
**Solução:** Execute primeiro o script `IMPLEMENTAR_FASES_PROCESSUAIS.sql`

### Problema: "Permission denied"
**Causa:** RLS bloqueando UPDATE  
**Solução:** O script já cria a policy necessária. Se persistir, verifique policies manualmente:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'processos';
```

### Problema: "Não salva mesmo após o script"
**Causa:** Código frontend enviando valores incorretos  
**Solução:** Verifique no console do navegador:
```javascript
// Abra DevTools (F12) → Console → Network
// Faça uma atualização e veja o payload enviado
// Deve conter: { fase_id: 3, andamento_id: 16, observacoes_andamento: "texto" }
```

---

## 📊 Verificação Final

Execute esta query para ver o resumo completo:

```sql
-- Resumo de processos com fase/andamento
SELECT 
    COUNT(*) FILTER (WHERE fase_id IS NOT NULL) as processos_com_fase,
    COUNT(*) FILTER (WHERE andamento_id IS NOT NULL) as processos_com_andamento,
    COUNT(*) as total_processos,
    ROUND(
        COUNT(*) FILTER (WHERE fase_id IS NOT NULL)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as percentual_com_fase
FROM processos;
```

---

## 📝 Estrutura Criada

```
processos
├── id (UUID)
├── numero_processo (TEXT)
├── fase_id (INTEGER) → fases_processuais.id
├── andamento_id (INTEGER) → andamentos_processuais.id
├── observacoes_andamento (TEXT)
└── data_ultima_mudanca_fase (TIMESTAMP)

processos_historico_fases
├── id (SERIAL)
├── processo_id (UUID) → processos.id
├── fase_id (INTEGER) → fases_processuais.id
├── andamento_id (INTEGER) → andamentos_processuais.id
├── data_inicio (TIMESTAMP)
├── data_fim (TIMESTAMP)
├── user_id (UUID)
├── observacoes (TEXT)
└── created_at (TIMESTAMP)
```

---

## ⚡ Benefícios

1. **Histórico completo** - Toda mudança é registrada automaticamente
2. **Performance** - Índices otimizam consultas
3. **Integridade** - Foreign keys garantem dados válidos
4. **Rastreabilidade** - Sabe quem mudou e quando
5. **Automático** - Triggers fazem tudo sem código extra

---

## 🆘 Suporte

Se após executar o script os andamentos ainda não salvarem:

1. **Verifique as colunas:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns
   WHERE table_name = 'processos' 
   AND column_name IN ('fase_id', 'andamento_id', 'observacoes_andamento');
   ```

2. **Teste UPDATE manual:**
   ```sql
   UPDATE processos 
   SET fase_id = 1, andamento_id = 1 
   WHERE id = (SELECT id FROM processos LIMIT 1);
   ```

3. **Verifique logs do Supabase:**
   - Vá em **Logs** → **Database**
   - Procure por erros relacionados a `processos`

4. **Verifique código frontend:**
   - Arquivo: `ProcessoDetalhesModal.jsx`
   - Linha ~170: Verifique se o UPDATE está correto
   - Console do navegador: Veja se há erros JavaScript

---

✅ **Script pronto para executar!** Qualquer dúvida, consulte os comentários dentro do arquivo SQL.
