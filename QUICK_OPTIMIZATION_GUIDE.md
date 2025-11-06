# 🎯 Guia Rápido: Como Aplicar as Otimizações

## 1️⃣ EXECUTAR AGORA (5 minutos)

### Criar Índices no Supabase
**CRÍTICO - Maior impacto em performance**

1. Abrir: https://supabase.com/dashboard/project/SEU_PROJECT/sql
2. Copiar todo o conteúdo de: `OPTIMIZE_SUPABASE_INDICES.sql`
3. Colar no SQL Editor
4. Clicar em "Run"
5. Aguardar confirmação (pode levar 30-60s)

**Resultado esperado:** ✅ "Success. No rows returned"

---

## 2️⃣ OTIMIZAR PÁGINAS (15 minutos)

### Process Management
**Arquivo:** `src/pages/process-management/index.jsx`

```jsx
// NO TOPO DO ARQUIVO
import { useCache } from '../../hooks/useOptimization';
import { fetchProcessosOptimized } from '../../services/optimizedQueries';

// DENTRO DO COMPONENTE (substituir fetch manual)
const { data: processos, loading, error } = useCache(
  `processos-${escritorioId}`,
  async () => {
    const result = await fetchProcessosOptimized(escritorioId);
    return result.data || [];
  },
  300000 // 5 minutos
);

// REMOVER: useEffect que faz fetch manual
// REMOVER: setState(processos)
// USAR: variável "processos" direto do useCache
```

### Client Management
**Arquivo:** `src/pages/client-management/index.jsx`

```jsx
// NO TOPO
import { useCache } from '../../hooks/useOptimization';
import { fetchWithCache } from '../../services/optimizedQueries';

// DENTRO DO COMPONENTE
const { data: clientes, loading } = useCache(
  `clientes-${escritorioId}`,
  () => fetchWithCache('clientes',
    supabase.from('clientes')
      .select('id, nome_completo, cpf_cnpj, tipo_pessoa, status, email, telefone')
      .eq('escritorio_id', escritorioId)
      .order('nome_completo')
  ),
  300000
);
```

---

## 3️⃣ APLICAR React.memo (10 minutos)

### Identificar Componentes
**Procurar por:**
- Cards em listas (ProcessCard, ClientCard, etc.)
- Itens de tabela
- Componentes que recebem muitas props
- Componentes renderizados em .map()

### Como Aplicar

**ANTES:**
```jsx
const ProcessCard = ({ processo, onEdit, onDelete }) => {
  return (
    <div className="card">
      {/* ... */}
    </div>
  );
};

export default ProcessCard;
```

**DEPOIS:**
```jsx
import { memo } from 'react';

const ProcessCard = memo(({ processo, onEdit, onDelete }) => {
  return (
    <div className="card">
      {/* ... */}
    </div>
  );
});

ProcessCard.displayName = 'ProcessCard';
export default ProcessCard;
```

### Prioridade de Componentes:
1. ✅ **ProcessCard** (process-management/components/)
2. ✅ **ClientCard** (client-management/components/)
3. ✅ **TaskCard** (tasks/components/)
4. ✅ **DocumentCard** (document-management/components/)
5. ✅ **ProcessListItem** (se existir)

---

## 4️⃣ ADICIONAR Loading States (5 minutos)

### Em todas as páginas que usam useCache:

```jsx
const { data, loading, error } = useCache(...);

if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <p className="ml-3 text-gray-600">Carregando...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">Erro ao carregar dados: {error.message}</p>
    </div>
  );
}

// Render normal com "data"
```

---

## 5️⃣ USAR useDebounce em Buscas (3 minutos cada)

### ProcessosSearch Component
**Arquivo:** `src/components/ui/ProcessosSearch.jsx`

```jsx
import { useDebounce } from '../../hooks/useOptimization';

const ProcessosSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Fazer busca com debouncedSearch
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar processo..."
    />
  );
};
```

### Aplicar em:
- ✅ ProcessosSearch
- ✅ ClientSearch (se existir)
- ✅ DocumentSearch (se existir)
- ✅ Qualquer input de busca

---

## 6️⃣ INVALIDAR Cache em Mutações (IMPORTANTE)

### Ao criar/editar/deletar, invalidar cache:

```jsx
import { updateAndInvalidate, deleteAndInvalidate } from '../../services/optimizedQueries';

// CRIAR PROCESSO
const handleCreateProcesso = async (data) => {
  const { data: novoProcesso, error } = await supabase
    .from('processos')
    .insert(data)
    .select();
  
  if (!error) {
    // Invalidar cache de processos
    updateAndInvalidate('processos', novoProcesso);
    updateAndInvalidate('dashboard', null); // Atualizar dashboard também
  }
};

// EDITAR PROCESSO
const handleEditProcesso = async (id, data) => {
  const { data: processoAtualizado, error } = await supabase
    .from('processos')
    .update(data)
    .eq('id', id)
    .select();
  
  if (!error) {
    updateAndInvalidate('processos', processoAtualizado);
    updateAndInvalidate('dashboard', null);
  }
};

// DELETAR PROCESSO
const handleDeleteProcesso = async (id) => {
  const { error } = await supabase
    .from('processos')
    .delete()
    .eq('id', id);
  
  if (!error) {
    deleteAndInvalidate('processos', id);
    updateAndInvalidate('dashboard', null);
  }
};
```

---

## 7️⃣ TESTAR Performance

### Console do navegador:

```javascript
// Limpar cache e testar
localStorage.clear();
location.reload();

// Medir tempo de carregamento
performance.mark('start');
// ... navegar pelo app
performance.mark('end');
performance.measure('navigation', 'start', 'end');
console.table(performance.getEntriesByType('measure'));
```

### DevTools Network:
1. Abrir DevTools (F12)
2. Aba Network
3. **Primeira carga:** Ver múltiplas requests
4. **Navegação:** Poucas/nenhuma request (cache hit!)

### Lighthouse:
1. DevTools > Lighthouse
2. Gerar relatório
3. Verificar métricas:
   - ✅ Performance > 90
   - ✅ First Contentful Paint < 1.5s
   - ✅ Time to Interactive < 3s

---

## ✅ Checklist Final

- [ ] Índices criados no Supabase
- [ ] Dashboard usando fetchDashboardStats ✅ (já feito)
- [ ] ProcessManagement usando useCache
- [ ] ClientManagement usando useCache
- [ ] ProcessCard com React.memo
- [ ] ClientCard com React.memo
- [ ] Buscas usando useDebounce
- [ ] Mutações invalidando cache
- [ ] Loading states em todas as páginas
- [ ] Testes de performance realizados

---

## 🚨 Troubleshooting

### Cache não está funcionando
```javascript
// Verificar se cache está sendo usado
console.log('Cache keys:', [...queryCache.keys()]);

// Limpar cache manualmente
import { clearCache } from './services/optimizedQueries';
clearCache();
```

### Dados desatualizados
```javascript
// Invalidar cache após mutations
updateAndInvalidate('tableName', newData);

// Ou forçar refresh
clearCache();
window.location.reload();
```

### Página não carrega (lazy loading)
```javascript
// Verificar erros no console
// Verificar se import está correto:
const Page = lazy(() => import('./pages/Page')); // ✅
const Page = lazy(() => import('./pages/Page.jsx')); // ❌ (pode não funcionar)
```

---

## 📊 Métricas de Sucesso

### Antes das otimizações:
- Dashboard: ~2-3s
- Lista de processos: ~1-2s
- Busca: lag visível
- Bundle: ~500KB

### Depois das otimizações:
- Dashboard (cache): ~50ms ⚡
- Dashboard (miss): ~1s
- Lista (cache): ~30ms ⚡
- Busca: suave (500ms debounce)
- Bundle inicial: ~150KB
- Lazy pages: carregam sob demanda

### KPIs:
- ✅ **Tempo de cache hit < 100ms**
- ✅ **Cache hit rate > 80%**
- ✅ **Lighthouse Performance > 90**
- ✅ **Bundle reduzido em 60%+**
