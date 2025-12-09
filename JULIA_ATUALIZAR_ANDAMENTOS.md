# 🤖 Julia - Atualizar Andamentos de Processos

## 📋 Visão Geral

A Julia agora pode **atualizar automaticamente** a fase e o andamento processual de qualquer processo que você esteja visualizando!

## ✨ Como Funciona

### 1. **Contexto Automático**

Quando você abre os **Detalhes do Processo** (modal), a Julia automaticamente:
- Detecta qual processo você está visualizando
- Carrega as informações do processo (número, título, fase atual, andamento atual)
- Fica pronta para receber comandos sobre esse processo específico

### 2. **Comandos Naturais**

Você pode pedir para a Julia atualizar o andamento usando **linguagem natural**:

#### Exemplos de Comandos:

```
✅ "atualiza andamento para execução"
✅ "muda fase para recurso"
✅ "coloca como tentativa extrajudicial"
✅ "atualiza para conhecimento"
✅ "muda para encerramento"
✅ "fase de liquidação"
✅ "andamento de execução com observação: aguardando pagamento"
```

### 3. **Fluxo Completo**

**Passo a Passo:**

1. **Abra o Modal de Detalhes do Processo**
   - Clique em qualquer processo da lista
   - O modal "Detalhes do Processo" será aberto

2. **Vá para a aba "Andamentos"**
   - Você verá um banner roxo/azul no topo
   - Banner diz: "Julia pode atualizar andamentos para você!"

3. **Abra o Chat da Julia**
   - Clique no botão flutuante da Julia (canto inferior direito)
   - A Julia já sabe qual processo você está visualizando!

4. **Peça a Atualização**
   ```
   Você: "atualiza andamento para execução"
   
   Julia: ✅ Andamento atualizado com sucesso!
   • Fase: Execução
   • Andamento: Execução
   ```

5. **Feche e Reabra o Modal** (ou atualize a página)
   - As mudanças aparecerão no seletor de Fase e Andamento

## 🎯 Funcionalidades

### ✅ O que a Julia Pode Fazer:

- ✅ Identificar automaticamente o processo visualizado
- ✅ Atualizar a fase processual por nome (ex: "Conhecimento", "Execução", "Recurso")
- ✅ Atualizar o andamento por nome (ex: "Tentativa Extrajudicial", "Citação")
- ✅ Buscar automaticamente os IDs corretos das fases e andamentos
- ✅ Adicionar observações personalizadas
- ✅ Confirmar a atualização com mensagem de sucesso

### 🔍 Fases e Andamentos Disponíveis:

A Julia conhece todas as fases processuais trabalhistas padrão:

**Fases Processuais:**
1. Captação e Análise (Fase 1)
2. Tentativa Extrajudicial (Fase 2)
3. Conhecimento/Instrução (Fase 3)
4. Recursal (Fase 4)
5. Execução (Fase 5)
6. Encerramento (Fase 6)

**Exemplos de Andamentos:**
- Tentativa Extrajudicial
- Petição Inicial
- Citação
- Audiência Inicial
- Audiência de Instrução
- Sentença
- Recurso Ordinário
- Cálculos de Liquidação
- Execução Provisória
- Penhora
- Pagamento
- Encerramento

## 🔧 Implementação Técnica

### Arquivos Modificados:

1. **`juliaAIService.js`**
   - Nova função: `atualizarAndamento()`
   - Métodos: `setProcessoContext()`, `clearProcessoContext()`, `getProcessoContext()`
   - Contexto do processo injetado no prompt da IA

2. **`juliaSystemPrompt.js`**
   - Documentação da ação `atualizarAndamento`
   - Instruções para usar processo_id do contexto

3. **`ProcessoDetalhesModal.jsx`**
   - Importa `juliaService`
   - Define contexto ao abrir modal: `juliaService.setProcessoContext(processo)`
   - Limpa contexto ao fechar: `juliaService.clearProcessoContext()`
   - Banner informativo na aba Andamentos

### Estrutura da Função:

```javascript
atualizarAndamento: async (dados) => {
  // Busca processo pelo ID ou número
  // Busca fase e andamento pelos nomes fornecidos
  // Atualiza o registro na tabela processos
  // Retorna mensagem de sucesso
}
```

### Parâmetros Aceitos:

```javascript
{
  processo_id: number,        // (obrigatório) ID do processo
  fase_nome: string,          // Nome da fase (ex: "Execução")
  andamento_nome: string,     // Nome do andamento (ex: "Tentativa Extrajudicial")
  fase_id: number,           // (opcional) ID direto da fase
  andamento_id: number,      // (opcional) ID direto do andamento
  observacoes: string        // (opcional) Observações sobre o andamento
}
```

## 🎨 Interface do Usuário

### Banner na Aba Andamentos:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖  Julia pode atualizar andamentos para você!          │
│                                                          │
│  Peça para a Julia: "atualiza andamento para execução"  │
│  ou "muda fase para recurso"                        ✨  │
└─────────────────────────────────────────────────────────┘
```

- Background: Gradiente roxo/azul claro
- Border: Roxo
- Ícone: 🤖 (robô)
- Animação: ✨ (pulsando)

## 💡 Casos de Uso

### Caso 1: Processo Passou para Execução

**Situação:** O processo recebeu sentença favorável e agora está em fase de execução.

```
Usuário: "atualiza para execução"

Julia: ✅ Andamento atualizado com sucesso!
• Fase: Execução
• Andamento: Execução
```

### Caso 2: Interpor Recurso

**Situação:** Cliente decidiu recorrer da sentença.

```
Usuário: "muda fase para recurso ordinário"

Julia: ✅ Andamento atualizado com sucesso!
• Fase: Recursal (Tribunal)
• Andamento: Recurso Ordinário
```

### Caso 3: Tentativa de Acordo

**Situação:** Antes de entrar com a ação, tentará acordo extrajudicial.

```
Usuário: "coloca como tentativa extrajudicial com observação: enviado carta ao réu"

Julia: ✅ Andamento atualizado com sucesso!
• Fase: Tentativa Extrajudicial
• Andamento: Tentativa Extrajudicial
• Observações: enviado carta ao réu
```

## 🚀 Benefícios

✅ **Agilidade:** Atualiza andamentos em segundos com linguagem natural
✅ **Contexto:** Julia sabe automaticamente qual processo você está vendo
✅ **Inteligente:** Busca automaticamente os IDs corretos das fases
✅ **Flexível:** Aceita comandos em português natural
✅ **Seguro:** Sempre confirma a ação antes de executar

## 📊 Exemplo Completo

**Cenário Real:**

1. Advogado abre processo nº 0001234-56.2023.5.02.0001
2. Vai na aba "Andamentos"
3. Vê que o processo está em "Conhecimento" mas já houve sentença
4. Abre chat da Julia
5. Digita: "atualiza andamento para execução"
6. Julia responde confirmando a atualização
7. Advogado recarrega e vê que o processo agora está em "Execução"

---

## 🎯 Próximos Passos

Possíveis melhorias futuras:
- [ ] Atualização automática do modal após Julia modificar
- [ ] Histórico de mudanças de fase/andamento
- [ ] Sugestões inteligentes de próximos andamentos
- [ ] Alertas quando processo ficar muito tempo na mesma fase
- [ ] Integração com prazos automáticos por fase

---

**Desenvolvido com ❤️ para o Sistema Meritus**
**Powered by Google Gemini AI 🤖**
