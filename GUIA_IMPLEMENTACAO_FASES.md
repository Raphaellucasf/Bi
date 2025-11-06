# 🚀 Guia de Implementação: Sistema de Fases e Andamentos Processuais

## 📋 O QUE FOI IMPLEMENTADO

### ✅ Arquivos Criados

1. **IMPLEMENTAR_FASES_PROCESSUAIS.sql** (203 linhas)
   - Tabelas: `fases_processuais`, `andamentos_processuais`, `processos_historico_fases`
   - Campos adicionados em `processos`: `fase_id`, `andamento_id`, `data_ultima_mudanca_fase`, `observacoes_andamento`
   - View: `vw_processos_com_fase` (para consultas otimizadas)
   - Trigger automático: `trigger_mudanca_fase` (registra histórico)
   - 6 fases pré-cadastradas (~50 andamentos processuais)

2. **src/components/ui/FaseAndamentoSelector.jsx**
   - Componente interativo para seleção de fase e andamento
   - Modo compacto (2 selects) e modo expandido (cards visuais)
   - Exibição de histórico de mudanças
   - Integração completa com Supabase

3. **src/components/ui/FaseBadge.jsx**
   - Badge visual colorido para exibir fase/andamento
   - Timeline de progresso entre fases
   - Card compacto com informações detalhadas

### ✅ Arquivos Modificados

1. **src/pages/process-management/index.jsx**
   - Queries alteradas para usar `vw_processos_com_fase`
   - Badges de fase exibidos em cards de processos
   - Campos fase/andamento incluídos no create e update

2. **src/pages/process-management/components/NewProcessModal.jsx**
   - Formulário com seleção de fase e andamento
   - Campos adicionados ao estado do form
   - Observações de andamento incluídas

---

## 🎯 COMO EXECUTAR (PASSO A PASSO)

### Passo 1: Executar SQL no Supabase ⚡

1. Abra o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue para **SQL Editor** (ícone </> na barra lateral)
4. Clique em **New Query**
5. Cole **TODO** o conteúdo do arquivo `IMPLEMENTAR_FASES_PROCESSUAIS.sql`
6. Clique em **Run** (ou pressione `Ctrl+Enter`)
7. Aguarde a execução (deve levar ~5 segundos)

**Verificação:**
```sql
-- Execute para verificar se foi criado corretamente
SELECT COUNT(*) FROM fases_processuais;        -- Deve retornar 6
SELECT COUNT(*) FROM andamentos_processuais;   -- Deve retornar ~50
SELECT * FROM vw_processos_com_fase LIMIT 3;   -- Deve mostrar processos com fase
```

### Passo 2: Verificar Instalação ✅
1. Abra o Supabase Dashboard
2. Navegue para **SQL Editor**
3. Cole o conteúdo do arquivo `IMPLEMENTAR_FASES_PROCESSUAIS.sql`
4. Clique em **Run** (Executar)
5. Verifique se todas as tabelas foram criadas:
   - `fases_processuais` (6 registros)
   - `andamentos_processuais` (~50 registros)
   - `processos_historico_fases` (vazia inicialmente)
   - Campos adicionados em `processos`: `fase_id`, `andamento_id`, `data_ultima_mudanca_fase`, `observacoes_andamento`

### Passo 2: Verificar Instalação ✅

Execute no terminal do projeto:

```bash
# Verificar se não há erros de importação
npm run dev
```

Abra o navegador e:
1. Faça login no sistema
2. Vá para **Processos**
3. Clique em **Novo Processo**
4. Role até a seção "Fase e Andamento Processual" (logo acima de Descrição)
5. Você deve ver 6 botões de fase (Captação, Extrajudicial, Conhecimento, etc.)

**Se aparecer erro de componente não encontrado:**
- Verifique se os arquivos foram criados corretamente
- Reinicie o servidor de desenvolvimento

### Passo 3: Testar Criação de Processo com Fase 🧪

1. Clique em **Novo Processo**
2. Preencha os campos obrigatórios (Título, Cliente, Número)
3. **Selecione uma Fase** (ex: "Captação e Análise")
4. **Selecione um Andamento** (ex: "Novo Contato (Lead)")
5. Adicione observações (opcional)
6. Clique em **Salvar Processo**

**Verificação no Supabase:**
```sql
-- Ver processos com fase
SELECT 
    titulo,
    fase_nome,
    andamento_nome,
    observacoes_andamento
FROM vw_processos_com_fase 
WHERE fase_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### Passo 4: Testar Histórico de Mudanças 📜

1. Edite um processo existente
2. Mude a fase ou andamento
3. Salve

**Verificação:**
```sql
-- Ver histórico de mudanças
SELECT 
    p.titulo as processo,
    f.nome as fase,
    a.nome as andamento,
    h.data_inicio,
    h.data_fim,
    h.observacoes
FROM processos_historico_fases h
JOIN processos p ON h.processo_id = p.id
JOIN fases_processuais f ON h.fase_id = f.id
LEFT JOIN andamentos_processuais a ON h.andamento_id = a.id
ORDER BY h.data_inicio DESC
LIMIT 10;
```

---

## 🎨 COMO USAR OS COMPONENTES

### 1. FaseAndamentoSelector (Formulários)

**Modo Compacto** (2 dropdowns lado a lado):
```jsx
<FaseAndamentoSelector
  processoId={processo?.id}
  faseAtual={faseId}
  andamentoAtual={andamentoId}
  onFaseChange={setFaseId}
  onAndamentoChange={setAndamentoId}
  compact={true}
  showHistory={false}
/>
```

**Modo Expandido** (cards visuais):
```jsx
<FaseAndamentoSelector
  processoId={processo.id}
  faseAtual={faseId}
  andamentoAtual={andamentoId}
  onFaseChange={setFaseId}
  onAndamentoChange={setAndamentoId}
  compact={false}
  showHistory={true}  // Mostra histórico de mudanças
/>
```

### 2. FaseBadge (Exibição)
