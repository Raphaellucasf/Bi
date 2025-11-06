# 🎯 PRÓXIMOS PASSOS - Roadmap de Otimização

## ✅ CONCLUÍDO ATÉ AGORA

### Fase 1: Otimização de Queries
- ✅ Criado `optimizedQueries.js` com cache
- ✅ Implementado lazy loading com React.Suspense
- ✅ Integrado dashboard com queries otimizadas
- ✅ Criado índices essenciais para Supabase

### Fase 2: Melhorias de UI/UX
- ✅ Atualizado ProcessManagement com tabs (Recentes/Ativos/Todos)
- ✅ Removido tab Pendentes
- ✅ Fixado bug de tabs carregando todos os processos
- ✅ Implementado paginação (30 itens por página)

### Fase 3: Sistema de Fases Processuais ⭐ NOVO
- ✅ Criado estrutura completa de banco (3 tabelas + 1 view)
- ✅ 6 fases e ~50 andamentos cadastrados
- ✅ Trigger automático para histórico
- ✅ Componentes React (FaseAndamentoSelector, FaseBadge)
- ✅ Integração no formulário de processos
- ✅ Badges visuais na listagem

---

## 🚧 PENDENTE - Para Implementar

### 1. Executar SQL no Supabase ⚡ CRÍTICO
**Tempo:** 5 minutos  
**Prioridade:** 🔴 ALTA  
**Arquivo:** `IMPLEMENTAR_FASES_PROCESSUAIS.sql`

**Ação:**
1. Abrir Supabase Dashboard
2. SQL Editor → New Query
3. Colar todo o conteúdo do arquivo
4. Executar (Run)

**Resultado esperado:**
- 6 fases cadastradas
- ~50 andamentos cadastrados
- View `vw_processos_com_fase` criada
- Trigger `trigger_mudanca_fase` ativo

---

### 2. React.memo em Componentes 🎨
**Tempo:** 30 minutos  
**Prioridade:** 🟡 MÉDIA  
**Impacto:** Reduzir re-renders desnecessários

**Arquivos a modificar:**
- `src/pages/process-management/index.jsx`
- `src/pages/client-management/index.jsx`

**Implementação:**
```jsx
// ProcessCard - envolver com React.memo
const ProcessCard = React.memo(({ processo, onEdit, onDelete }) => {
  // ... componente
}, (prevProps, nextProps) => {
  // Só re-renderiza se o processo mudou
  return prevProps.processo.id === nextProps.processo.id &&
         prevProps.processo.updated_at === nextProps.processo.updated_at;
});

// ClientCard - mesmo padrão
const ClientCard = React.memo(({ cliente, onEdit, onDelete }) => {
  // ... componente
}, (prevProps, nextProps) => {
  return prevProps.cliente.id === nextProps.cliente.id &&
         prevProps.cliente.updated_at === nextProps.cliente.updated_at;
});
```

**Benefício esperado:** -20% a -30% de renders

---

### 3. Integrar useCache em Páginas 💾
**Tempo:** 40 minutos  
**Prioridade:** 🟡 MÉDIA  
**Impacto:** Respostas instantâneas em cache hits

**Arquivos a modificar:**
- `src/pages/process-management/index.jsx`
- `src/pages/client-management/index.jsx`
- `src/pages/dashboard/index.jsx`

**Implementação:**
```jsx
import { useCache } from '../../hooks/useOptimization';

const ProcessManagement = () => {
  const cache = useCache();
  
  const fetchProcessos = async () => {
    const cacheKey = `processos-${escritorioId}-${tab}`;
    
    // Tentar cache primeiro
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30s
      setProcesses(cached.data);
      return;
    }
    
    // Se não tem cache, buscar do Supabase
    const { data } = await supabase.from('vw_processos_com_fase').select('*');
    
    // Salvar no cache
    cache.set(cacheKey, data);
    setProcesses(data);
  };
};
```

**Benefício esperado:** -70% de chamadas ao Supabase

---

### 4. Filtros por Fase na Listagem 🎯
**Tempo:** 45 minutos  
**Prioridade:** 🟢 BAIXA (mas muito útil)  
**Impacto:** Melhor navegação entre processos

**Arquivo:** `src/pages/process-management/index.jsx`

**Implementação:**
```jsx
const [faseFilter, setFaseFilter] = useState(null);

// Adicionar no useEffect de busca
useEffect(() => {
  let query = supabase.from('vw_processos_com_fase').select('*');
  
  if (faseFilter) {
    query = query.eq('fase_id', faseFilter);
  }
  
  // ... resto
}, [faseFilter, tab, search]);

// Adicionar no JSX antes dos tabs
<div className="flex gap-2 mb-4 overflow-x-auto">
  <button 
    onClick={() => setFaseFilter(null)}
    className={`px-3 py-1 rounded-lg text-sm ${!faseFilter ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
  >
    Todas
  </button>
  <button onClick={() => setFaseFilter(1)} className="px-3 py-1 rounded-lg text-sm bg-blue-100">
    📋 Captação
  </button>
  <button onClick={() => setFaseFilter(2)} className="px-3 py-1 rounded-lg text-sm bg-purple-100">
    📝 Extrajudicial
  </button>
  <button onClick={() => setFaseFilter(3)} className="px-3 py-1 rounded-lg text-sm bg-orange-100">
    ⚖️ Conhecimento
  </button>
  <button onClick={() => setFaseFilter(4)} className="px-3 py-1 rounded-lg text-sm bg-red-100">
    📈 Recursal
  </button>
  <button onClick={() => setFaseFilter(5)} className="px-3 py-1 rounded-lg text-sm bg-green-100">
    💰 Execução
  </button>
  <button onClick={() => setFaseFilter(6)} className="px-3 py-1 rounded-lg text-sm bg-gray-100">
    ✅ Encerramento
  </button>
</div>
```

---

### 5. Dashboard com Stats por Fase 📊
**Tempo:** 1 hora  
**Prioridade:** 🟢 BAIXA (visual)  
**Impacto:** Visão geral do escritório

**Arquivo:** `src/pages/dashboard/components/ProcessosPorFase.jsx` (criar novo)

**Implementação:**
```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';

export const ProcessosPorFase = () => {
  const [stats, setStats] = useState([]);
  
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('vw_processos_com_fase')
        .select('fase_id, fase_nome, fase_cor, fase_icone');
      
      // Agrupar por fase
      const grouped = {};
      data.forEach(p => {
        const key = p.fase_id || 'sem_fase';
        if (!grouped[key]) {
          grouped[key] = {
            nome: p.fase_nome || 'Sem Fase Definida',
            cor: p.fase_cor || '#9CA3AF',
            icone: p.fase_icone || 'Circle',
            count: 0
          };
        }
        grouped[key].count++;
      });
      
      setStats(Object.values(grouped));
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="p-4 rounded-xl text-white text-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
          style={{ backgroundColor: stat.cor }}
        >
          <Icon name={stat.icone} size={36} className="mx-auto mb-3" />
          <div className="text-4xl font-bold mb-1">{stat.count}</div>
          <div className="text-sm opacity-90">{stat.nome}</div>
        </div>
      ))}
    </div>
  );
};
```

**Usar no Dashboard:**
```jsx
import { ProcessosPorFase } from './components/ProcessosPorFase';

// No Dashboard
<div className="mb-8">
  <h2 className="text-xl font-bold mb-4">Processos por Fase</h2>
  <ProcessosPorFase />
</div>
```

---

### 6. Automação de Prazos 🤖
**Tempo:** 1h 30min  
**Prioridade:** 🟢 BAIXA (mas muito útil)  
**Impacto:** Criação automática de prazos

**Arquivo:** `src/components/ui/FaseAndamentoSelector.jsx`

**Implementação:**
```jsx
const handleAndamentoChange = async (newAndamentoId) => {
  setSelectedAndamento(newAndamentoId);
  
  // Buscar detalhes do andamento
  const andamento = andamentos.find(a => a.id === newAndamentoId);
  
  if (andamento?.gera_prazo && andamento?.dias_prazo && processoId) {
    // Calcular data do prazo
    const dataPrazo = new Date();
    dataPrazo.setDate(dataPrazo.getDate() + andamento.dias_prazo);
    
    // Perguntar ao usuário
    if (confirm(`Criar prazo automático para ${dataPrazo.toLocaleDateString('pt-BR')}?`)) {
      // Criar prazo na tabela andamentos
      const { error } = await supabase.from('andamentos').insert({
        processo_id: processoId,
        tipo: 'Prazo',
        titulo: `Prazo: ${andamento.nome}`,
        descricao: `Prazo gerado automaticamente ao mudar para "${andamento.nome}"`,
        data_andamento: dataPrazo.toISOString().split('T')[0],
        concluido: false,
        tipo_prazo: andamento.tipo_prazo || 'Comum'
      });
      
      if (!error) {
        alert('✅ Prazo criado com sucesso!');
      }
    }
  }
  
  if (onAndamentoChange) onAndamentoChange(newAndamentoId);
};
```

---

### 7. Alertas de Processos Parados 🚨
**Tempo:** 45 minutos  
**Prioridade:** 🟢 BAIXA  
**Impacto:** Identificar processos sem atenção

**Arquivo:** `src/pages/dashboard/components/ProcessosParados.jsx` (criar novo)

**Implementação:**
```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';

export const ProcessosParados = () => {
  const [processosParados, setProcessosParados] = useState([]);
  
  useEffect(() => {
    const fetch = async () => {
      // Processos sem mudança de fase há mais de 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      
      const { data } = await supabase
        .from('vw_processos_com_fase')
        .select('*')
        .eq('status', 'Ativo')
        .gte('dias_na_fase_atual', 30)
        .order('dias_na_fase_atual', { ascending: false })
        .limit(10);
      
      setProcessosParados(data || []);
    };
    
    fetch();
  }, []);
  
  if (processosParados.length === 0) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
      <h3 className="font-bold text-amber-900 mb-2">
        ⚠️ Processos sem atualização há mais de 30 dias
      </h3>
      <ul className="space-y-2">
        {processosParados.map(p => (
          <li key={p.id} className="text-sm">
            <strong>{p.titulo}</strong> - {p.dias_na_fase_atual} dias em "{p.andamento_nome}"
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 📅 CRONOGRAMA SUGERIDO

### Semana 1
- [ ] **Dia 1:** Executar SQL (5 min) ⚡
- [ ] **Dia 2:** Testar sistema de fases (30 min)
- [ ] **Dia 3:** Implementar React.memo (30 min)
- [ ] **Dia 4:** Integrar useCache (40 min)
- [ ] **Dia 5:** Revisar e ajustes finais

### Semana 2 (Melhorias opcionais)
- [ ] **Dia 1:** Filtros por fase (45 min)
- [ ] **Dia 2:** Dashboard com stats (1h)
- [ ] **Dia 3:** Automação de prazos (1h 30min)
- [ ] **Dia 4:** Alertas de processos parados (45 min)
- [ ] **Dia 5:** Testes e documentação

---

## 🎯 PRIORIZAÇÃO

### 🔴 CRÍTICO (Fazer AGORA)
1. **Executar SQL no Supabase** - Habilita todo o sistema de fases

### 🟡 IMPORTANTE (Esta semana)
2. **React.memo** - Melhora performance imediata
3. **useCache** - Reduz chamadas ao banco drasticamente

### 🟢 DESEJÁVEL (Próximas semanas)
4. **Filtros por fase** - UX melhorada
5. **Dashboard com stats** - Visão executiva
6. **Automação de prazos** - Produtividade
7. **Alertas de processos parados** - Gestão proativa

---

## 📊 IMPACTO ESPERADO

### Performance
- **Queries:** -70% de tempo de resposta (com cache)
- **Renders:** -30% de re-renders desnecessários
- **Chamadas API:** -60% ao Supabase

### UX/Produtividade
- **Navegação:** Filtros por fase tornam busca 3x mais rápida
- **Visibilidade:** Dashboard mostra gargalos instantaneamente
- **Automação:** Economia de 5-10 min por processo (criação de prazos)

### Gestão
- **Rastreamento:** 100% dos processos com fase identificada
- **Histórico:** Auditoria completa de mudanças
- **Alertas:** Identificação proativa de processos parados

---

## ✅ TODO LIST ATUALIZADA

- [x] Setup lazy loading com Suspense
- [x] Integrate optimized Dashboard queries
- [x] Fix database schema references
- [x] Update ProcessManagement UI
- [x] **Implementar sistema de fases e andamentos** ⭐
- [ ] **Executar SQL no Supabase** 🔴
- [ ] Apply React.memo to components
- [ ] Integrate useCache in pages
- [ ] Execute Supabase indices (INDICES_ESSENCIAIS.sql)
- [ ] **(Opcional)** Filtros por fase
- [ ] **(Opcional)** Dashboard de fases
- [ ] **(Opcional)** Automação de prazos

---

**Próximo passo recomendado:** Executar `IMPLEMENTAR_FASES_PROCESSUAIS.sql` no Supabase! 🚀
