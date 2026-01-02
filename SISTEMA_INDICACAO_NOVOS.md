# 🤖 Sistema de Indicação de Conteúdos Novos do Robô

## ✅ Implementado

Sistema completo para indicar quando o app recebe atualizações do robô PJe.

## 📋 O que foi implementado

### 1. **SQL - Colunas de Controle** (`SYNC_PJE_SETUP.sql`)
- ✅ Adicionada coluna `visualizado` nas tabelas `andamentos` e `documentos`
- ✅ Índices otimizados para consultas rápidas de não visualizados
- ✅ Colunas `fonte`, `sincronizado_em` já existentes

### 2. **Componente NewContentBadge** 
`src/components/ui/NewContentBadge.jsx`

Badge animado que mostra quando conteúdo é novo:
- 🤖 **NOVO - PJe** (azul) - Sincronizado do PJe
- 🤖 **NOVO - Bot** (verde) - Adicionado pelo bot
- 🆕 **NOVO** (roxo) - Outras fontes automáticas
- Não aparece para conteúdo `manual` ou já `visualizado`

### 3. **Serviço de Visualização**
`src/services/visualizacaoService.js`

Funções para gerenciar visualizações:
- `marcarAndamentoComoVisualizado(id)` - Marca um andamento
- `marcarDocumentoComoVisualizado(id)` - Marca um documento
- `marcarTodosAndamentosComoVisualizados(processoId)` - Marca todos de um processo
- `contarAndamentosNaoVisualizados(processoId)` - Conta não lidos de processo
- `contarTotalAndamentosNaoVisualizados(escritorioId)` - Conta total do escritório

### 4. **Badge de Contador no Header**
`src/components/ui/UnreadCountBadge.jsx`

Badge no header que mostra:
- Número de novos andamentos não visualizados
- Ícone de sino com animação pulsante
- Atualização em tempo real via Supabase Realtime
- Só aparece quando há itens não lidos

### 5. **Páginas Atualizadas**

#### **AcompanhamentoProcessual**
- Badge "NOVO" em cada andamento sincronizado pelo bot
- Indicador de fonte (pje/bot/manual)
- Data de sincronização

#### **Monitoring (Acompanhamento Processual)**
- Badge "NOVO" em cada entrada do feed
- Timestamp de sincronização
- Indicação visual clara de origem

#### **ProcessoDetalhesModal**
- Badges em cada andamento na aba "Andamentos"
- Marcação automática como visualizado ao abrir o modal
- Informação de sincronização em cada item

## 🎯 Como Funciona

### Fluxo Automático:

1. **Robô sincroniza** → Cria andamento com:
   - `fonte: 'pje'` ou `'bot'`
   - `sincronizado_em: timestamp`
   - `visualizado: false`

2. **App detecta** → Badge "NOVO" aparece:
   - No header (contador total)
   - Na lista de processos
   - Nos detalhes do andamento

3. **Usuário visualiza** → Sistema marca:
   - Ao abrir modal de detalhes
   - Badge desaparece
   - Contador atualiza

### Exemplo Visual:

```
┌──────────────────────────────────────────┐
│ Header                  [🔔 5]  [👤]    │ ← Contador no header
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Processo 0001234-56.2024.5.02.0001      │
│ 🤖 NOVO - PJe                            │ ← Badge animado
│ Cliente: João Silva                      │
│ Último Andamento: Sentença publicada    │
│ 🔄 Sincronizado: 15/12/2024 10:30       │
└──────────────────────────────────────────┘
```

## 🗄️ Estrutura do Banco

```sql
-- andamentos
visualizado BOOLEAN DEFAULT FALSE
fonte TEXT (pje, bot, manual)
sincronizado_em TIMESTAMP

-- documentos  
visualizado BOOLEAN DEFAULT FALSE
fonte TEXT (pje, bot, manual)
sincronizado_em TIMESTAMP
```

## 📝 Para o Robô

O robô deve inserir registros com:

```javascript
{
  titulo: "Sentença publicada",
  descricao: "...",
  data_andamento: "2024-12-15",
  processo_id: "uuid",
  fonte: "pje",  // ou "bot"
  sincronizado_em: new Date().toISOString(),
  visualizado: false  // sempre false no insert
}
```

## 🚀 Próximos Passos Opcionais

- [ ] Filtro para mostrar apenas não visualizados
- [ ] Página dedicada "Novidades do Bot"
- [ ] Notificação push quando robô sincroniza
- [ ] Relatório de sincronizações por período
- [ ] Badge também para documentos

## ⚡ Performance

- Índices parciais para queries otimizadas
- Realtime subscription apenas para não lidos
- Marcação em lote ao abrir modal
- Cache no contador do header

## 🎨 Personalização

Para ajustar cores dos badges, edite `NewContentBadge.jsx`:

```javascript
const getBadgeStyle = () => {
  switch (fonte) {
    case 'pje':
      return { bg: 'bg-blue-100', ... }
    // ...
  }
}
```
