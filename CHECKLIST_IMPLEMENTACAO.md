# ✅ CHECKLIST DE IMPLEMENTAÇÃO

Use este arquivo para acompanhar o progresso da implementação do sistema de fases.

---

## 🔴 FASE 1: BANCO DE DADOS (5 minutos)

- [ ] Abrir Supabase Dashboard (https://app.supabase.com)
- [ ] Ir para SQL Editor (ícone </> na barra lateral)
- [ ] Clicar em "New Query"
- [ ] Abrir arquivo `IMPLEMENTAR_FASES_PROCESSUAIS.sql`
- [ ] Copiar TODO o conteúdo (Ctrl+A → Ctrl+C)
- [ ] Colar no SQL Editor (Ctrl+V)
- [ ] Clicar em "Run" (ou Ctrl+Enter)
- [ ] Aguardar execução (~5 segundos)
- [ ] Verificar sucesso (mensagem "Success" aparece)

### ✅ Verificação:
- [ ] Executar: `SELECT COUNT(*) FROM fases_processuais;` → Deve retornar **6**
- [ ] Executar: `SELECT COUNT(*) FROM andamentos_processuais;` → Deve retornar **~50**
- [ ] Executar: `SELECT * FROM vw_processos_com_fase LIMIT 1;` → Deve mostrar dados

---

## 🟡 FASE 2: APLICAÇÃO REACT (Automático)

- [x] Arquivos criados:
  - [x] `src/components/ui/FaseAndamentoSelector.jsx`
  - [x] `src/components/ui/FaseBadge.jsx`
- [x] Integração no formulário:
  - [x] Import adicionado em `NewProcessModal.jsx`
  - [x] Campos fase_id e andamento_id no estado
  - [x] Componente renderizado no form
- [x] Queries atualizadas:
  - [x] `process-management/index.jsx` usa `vw_processos_com_fase`
  - [x] Badges exibidos na listagem

### ✅ Verificação:
- [ ] Reiniciar servidor: `npm run dev`
- [ ] Abrir aplicação no navegador
- [ ] Fazer login
- [ ] Ir para página "Processos"
- [ ] Clicar em "Novo Processo"
- [ ] Scroll até "Fase e Andamento Processual"
- [ ] Ver 6 botões de fase coloridos
- [ ] Selecionar uma fase
- [ ] Ver lista de andamentos aparecer

---

## 🟢 FASE 3: TESTES FUNCIONAIS (10 minutos)

### Teste 1: Criar Processo com Fase
- [ ] Clicar em "Novo Processo"
- [ ] Preencher campos obrigatórios (Título, Cliente, Número)
- [ ] Selecionar Fase: "Captação e Análise"
- [ ] Selecionar Andamento: "Novo Contato (Lead)"
- [ ] Adicionar observação: "Cliente entrou em contato por WhatsApp"
- [ ] Salvar processo
- [ ] Verificar que processo foi criado com sucesso

### Teste 2: Visualizar Badge
- [ ] Na listagem de processos
- [ ] Ver badge azul com "Captação e Análise"
- [ ] Ver andamento "Novo Contato (Lead)" abaixo

### Teste 3: Editar e Mudar Fase
- [ ] Clicar em editar no processo criado
- [ ] Mudar fase para "Conhecimento (Instrução)"
- [ ] Mudar andamento para "Aguardando Audiência"
- [ ] Salvar
- [ ] Verificar que badge mudou de cor (azul → laranja)

### Teste 4: Verificar Histórico no Banco
- [ ] Abrir Supabase
- [ ] SQL Editor
- [ ] Executar:
```sql
SELECT 
    p.titulo,
    f.nome as fase,
    a.nome as andamento,
    h.data_inicio,
    h.data_fim
FROM processos_historico_fases h
JOIN processos p ON h.processo_id = p.id
JOIN fases_processuais f ON h.fase_id = f.id
LEFT JOIN andamentos_processuais a ON h.andamento_id = a.id
ORDER BY h.data_inicio DESC
LIMIT 5;
```
- [ ] Verificar que há 2 registros:
  - Captação (data_fim preenchida)
  - Conhecimento (data_fim null - fase atual)

---

## 🔵 FASE 4: MELHORIAS OPCIONAIS

### Implementar Filtros por Fase
- [ ] Adicionar botões de filtro acima da listagem
- [ ] Filtrar processos por fase específica
- [ ] Testar filtros

### Dashboard de Fases
- [ ] Criar componente ProcessosPorFase
- [ ] Adicionar no Dashboard
- [ ] Visualizar cards coloridos com contadores

### Automação de Prazos
- [ ] Implementar criação automática de prazos
- [ ] Testar com andamento "Aguardando Contestação" (15 dias)
- [ ] Verificar prazo criado automaticamente

---

## 📊 MÉTRICAS DE SUCESSO

Após implementação completa:

- [ ] **Database:** 6 fases + 50 andamentos cadastrados ✅
- [ ] **Frontend:** Componentes renderizando sem erros ✅
- [ ] **UX:** Badges coloridos visíveis em todos os processos ✅
- [ ] **Histórico:** Mudanças sendo registradas automaticamente ✅
- [ ] **Performance:** Queries usando view otimizada ✅

---

## 🆘 TROUBLESHOOTING

### ❌ Erro: "relation vw_processos_com_fase does not exist"
**Solução:** Execute o SQL novamente no Supabase

### ❌ Erro: "column fase_id does not exist"
**Solução:** Execute a parte ALTER TABLE do SQL

### ❌ Componente não aparece
**Solução:** 
1. Verifique console do navegador (F12)
2. Confirme que arquivos foram criados corretamente
3. Reinicie servidor (`Ctrl+C` → `npm run dev`)

### ❌ Fases não carregam no select
**Solução:**
1. Abra Network tab (F12 → Network)
2. Veja se há erro 401/403 (problema de RLS)
3. Confirme que policies foram criadas no SQL

---

## 📞 RECURSOS

| Documento | Para que serve |
|-----------|----------------|
| `IMPLEMENTAR_FASES_PROCESSUAIS.sql` | Script SQL completo para executar |
| `GUIA_IMPLEMENTACAO_FASES.md` | Documentação detalhada com exemplos |
| `IMPLEMENTACAO_FASES_SUMARIO.md` | Resumo executivo e referência rápida |
| `PROXIMOS_PASSOS.md` | Roadmap de melhorias futuras |
| `FASES_PROCESSUAIS_TRABALHISTAS.md` | Workflow completo (referência) |

---

## ✅ STATUS FINAL

Quando todos os itens estiverem marcados:

- [ ] **SQL executado com sucesso**
- [ ] **Aplicação rodando sem erros**
- [ ] **Processos podem ser criados com fase**
- [ ] **Badges aparecendo na listagem**
- [ ] **Histórico sendo registrado**

**🎉 IMPLEMENTAÇÃO CONCLUÍDA! 🎉**

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0
