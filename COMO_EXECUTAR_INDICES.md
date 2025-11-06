# 🔧 Como Executar os Índices no Supabase

## ⚠️ IMPORTANTE - Leia Antes de Executar

O script `OPTIMIZE_SUPABASE_INDICES.sql` foi corrigido para corresponder ao schema real do banco de dados:

- ✅ Usa tabela **`andamentos`** (não `prazos`, `audiencias`, `reunioes` separadas)
- ✅ Usa tabela **`faturamentos`** e **`parcelas`**
- ✅ Usa tabela **`gastos`**
- ✅ Todos os índices são criados com `IF NOT EXISTS` (seguro para executar múltiplas vezes)

## 📋 Passo a Passo

### 1. Abrir Supabase Dashboard
1. Acesse https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto (Bi-master)

### 2. Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

### 3. Executar o Script
1. Abra o arquivo `OPTIMIZE_SUPABASE_INDICES.sql` neste projeto
2. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
3. **Cole** no SQL Editor do Supabase (Ctrl+V)
4. Clique em **"Run"** (ou pressione Ctrl+Enter)

### 4. Verificar Execução
Se tudo correu bem, você verá:
```
Success. No rows returned
```

Isso é **NORMAL**! CREATE INDEX não retorna dados.

### 5. Confirmar Índices Criados

Execute este comando no SQL Editor para ver todos os índices:

```sql
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Você deve ver algo como:

| schemaname | tablename | indexname |
|------------|-----------|-----------|
| public | andamentos | idx_andamentos_concluido |
| public | andamentos | idx_andamentos_data |
| public | andamentos | idx_andamentos_processo |
| public | andamentos | idx_andamentos_tipo |
| public | andamentos | idx_andamentos_tipo_data |
| public | clientes | idx_clientes_cpf_cnpj |
| public | clientes | idx_clientes_escritorio |
| public | clientes | idx_clientes_nome |
| public | clientes | idx_clientes_updated |
| public | faturamentos | idx_faturamentos_data |
| public | faturamentos | idx_faturamentos_escritorio |
| public | faturamentos | idx_faturamentos_processo |
| public | gastos | idx_gastos_data |
| public | gastos | idx_gastos_escritorio |
| public | parcelas | idx_parcelas_faturamento |
| public | parcelas | idx_parcelas_status |
| public | parcelas | idx_parcelas_vencimento |
| public | processos | idx_processos_area |
| public | processos | idx_processos_cliente |
| public | processos | idx_processos_escritorio_status |
| public | processos | idx_processos_escritorio_updated |
| ... | ... | ... |

## 🐛 Troubleshooting

### Erro: "relation does not exist"

**Causa:** A tabela mencionada não existe no seu banco de dados.

**Solução:**
1. Identifique qual tabela está causando o erro
2. Comente a linha do índice no SQL (adicione `--` no início da linha)
3. Execute novamente

Exemplo:
```sql
-- Esta tabela não existe, então comentei o índice
-- CREATE INDEX IF NOT EXISTS idx_minha_tabela ON minha_tabela(campo);
```

### Erro: "relation already exists"

**Causa:** Impossível, pois usamos `IF NOT EXISTS`

**Solução:** Se acontecer, é um erro estranho. Execute cada índice individualmente.

### Erro: "permission denied"

**Causa:** Seu usuário não tem permissão para criar índices.

**Solução:** Use o usuário `postgres` (admin) no Supabase.

## ✅ Resultado Esperado

Depois de executar os índices:

### Antes (sem índices)
```
Dashboard: 2-3 segundos
Listagem de processos: 1-2 segundos  
Busca de clientes: 1-2 segundos
```

### Depois (com índices)
```
Dashboard: 0.5-1 segundo
Listagem de processos: 0.2-0.5 segundos
Busca de clientes: 0.1-0.3 segundos
```

**Ganho:** 3-5x mais rápido! 🚀

## 🔄 Manutenção

### Reindexar (opcional)

Se notar lentidão após meses de uso:

```sql
REINDEX TABLE processos;
REINDEX TABLE clientes;
REINDEX TABLE andamentos;
```

### Analisar Performance

Ver tamanho dos índices:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### VACUUM e ANALYZE

Melhorar performance das queries:

```sql
VACUUM ANALYZE processos;
VACUUM ANALYZE clientes;
VACUUM ANALYZE andamentos;
VACUUM ANALYZE faturamentos;
VACUUM ANALYZE parcelas;
```

## 📊 Monitoramento

### Ver queries lentas

```sql
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_time DESC
LIMIT 10;
```

**Nota:** Precisa ativar extensão `pg_stat_statements` primeiro.

## 🎯 Próximos Passos

Depois de executar os índices:

1. ✅ Testar o dashboard - deve carregar muito mais rápido
2. ✅ Testar listagem de processos e clientes
3. ✅ Verificar console do navegador - menos tempo nas queries
4. ✅ Continuar implementando `useCache` nos componentes

## 📝 Notas

- Os índices ocupam espaço em disco (geralmente 10-30% do tamanho da tabela)
- Índices tornam SELECT mais rápido, mas INSERT/UPDATE ligeiramente mais lentos
- Para aplicações read-heavy (mais leituras que escritas), índices são essenciais
- Supabase free tier tem limite de storage, monitore o uso
