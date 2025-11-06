import { supabase } from './supabaseClient';

/**
 * Utilitários para queries otimizadas do Supabase
 * - Reduz over-fetching
 * - Usa índices corretamente
 * - Implementa paginação eficiente
 */

// Cache em memória para dados que mudam pouco
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Busca com cache automático
 */
export const fetchWithCache = async (cacheKey, queryFn, ttl = CACHE_TTL) => {
  const cached = queryCache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data;
  }

  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: now });
  return data;
};

/**
 * Invalidar cache específico
 */
export const invalidateCache = (cacheKey) => {
  if (cacheKey) {
    queryCache.delete(cacheKey);
  } else {
    queryCache.clear();
  }
};

/**
 * Buscar processos otimizado (apenas campos necessários)
 */
export const fetchProcessosOptimized = async (escritorioId, options = {}) => {
  const {
    status = null,
    limit = 50,
    offset = 0,
    orderBy = 'updated_at',
    ascending = false,
    includeCliente = false
  } = options;

  let query = supabase
    .from('processos')
    .select(includeCliente 
      ? 'id, titulo, numero_processo, status, prioridade, area_direito, valor_causa, updated_at, cliente_id, clientes(id, nome_completo)'
      : 'id, titulo, numero_processo, status, prioridade, area_direito, valor_causa, updated_at, cliente_id'
    )
    .eq('escritorio_id', escritorioId)
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: data || [], count };
};

/**
 * Buscar clientes otimizado
 */
export const fetchClientesOptimized = async (escritorioId, options = {}) => {
  const {
    search = '',
    limit = 30,
    offset = 0,
    status = null
  } = options;

  let query = supabase
    .from('clientes')
    .select('id, nome_completo, cpf_cnpj, tipo_pessoa, status', { count: 'exact' })
    .eq('escritorio_id', escritorioId)
    .order('nome_completo', { ascending: true })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`nome_completo.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: data || [], count };
};

/**
 * Buscar tarefas do dia otimizado
 */
export const fetchTarefasDoDia = async (escritorioId, date = new Date()) => {
  const dateStr = date.toISOString().split('T')[0];
  const dateStart = `${dateStr}T00:00:00`;
  const dateEnd = `${dateStr}T23:59:59`;
  
  // Buscar todos os andamentos do dia
  const { data, error } = await supabase
    .from('andamentos')
    .select('id, titulo, descricao, data_andamento, tipo, processo_id, concluido')
    .gte('data_andamento', dateStart)
    .lte('data_andamento', dateEnd)
    .order('data_andamento', { ascending: true });

  if (error) throw error;

  // Separar por tipo
  const andamentos = data || [];
  return {
    prazos: andamentos.filter(a => a.tipo === 'Prazo'),
    audiencias: andamentos.filter(a => a.tipo === 'Audiência'),
    reunioes: andamentos.filter(a => a.tipo === 'Reunião'),
    todos: andamentos
  };
};

/**
 * Buscar estatísticas do dashboard otimizado
 */
export const fetchDashboardStats = async (escritorioId) => {
  const cacheKey = `dashboard_${escritorioId}`;
  
  return fetchWithCache(cacheKey, async () => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    const proximosDias = new Date();
    proximosDias.setDate(proximosDias.getDate() + 7);
    const proximosDiasStr = proximosDias.toISOString().split('T')[0];

    const [processos, clientes, andamentos] = await Promise.all([
      // Processos ativos
      supabase
        .from('processos')
        .select('id, valor_causa, area_direito, cliente_id, status, updated_at', { count: 'exact' })
        .eq('escritorio_id', escritorioId)
        .or('status.is.null,status.eq.Ativo,status.eq.Suspenso,status.eq.Em Andamento'),
      
      // Total de clientes
      supabase
        .from('clientes')
        .select('id, nome_completo', { count: 'exact' })
        .eq('escritorio_id', escritorioId),
      
      // Andamentos próximos (prazos fatais nos próximos 7 dias)
      supabase
        .from('andamentos')
        .select('id, titulo, tipo, data_andamento, processo_id, concluido')
        .gte('data_andamento', `${hojeStr}T00:00:00`)
        .lte('data_andamento', `${proximosDiasStr}T23:59:59`)
        .eq('concluido', false)
        .order('data_andamento', { ascending: true })
    ]);

    // Calcular prazos fatais (tipo "Prazo")
    const prazosFatais = (andamentos.data || []).filter(a => a.tipo === 'Prazo' || a.tipo === 'Prazo Fatal').length;

    // Valor total dos processos
    const valorTotal = (processos.data || []).reduce((sum, p) => sum + (parseFloat(p.valor_causa) || 0), 0);

    // Processos recentes com nomes de clientes
    const processosRecentes = (processos.data || [])
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
      .map(p => {
        const cliente = (clientes.data || []).find(c => c.id === p.cliente_id);
        return {
          ...p,
          clienteNome: cliente?.nome_completo || 'Sem cliente'
        };
      });

    // Tarefas próximas (combinar todos os andamentos)
    const tarefasProximas = (andamentos.data || [])
      .map(a => ({
        ...a,
        tipo_tarefa: a.tipo,
        data: a.data_andamento
      }))
      .slice(0, 5);

    return {
      processosAtivos: processos.count || 0,
      totalClientes: clientes.count || 0,
      prazosFatais,
      valorTotal,
      processosRecentes,
      tarefasProximas,
      processosPorArea: calcularProcessosPorArea(processos.data || [])
    };
  }, 2 * 60 * 1000); // Cache de 2 minutos
};

/**
 * Calcular distribuição de processos por área
 */
const calcularProcessosPorArea = (processos) => {
  const areaCount = {};
  processos.forEach(p => {
    const area = p.area_direito || 'Outro';
    areaCount[area] = (areaCount[area] || 0) + 1;
  });

  const total = processos.length || 1;
  return Object.entries(areaCount).map(([area, quantidade]) => ({
    area,
    quantidade,
    percentual: Math.round((quantidade / total) * 100)
  }));
};

/**
 * Buscar um único registro por ID (com cache)
 */
export const fetchById = async (table, id, select = '*') => {
  const cacheKey = `${table}_${id}`;
  
  return fetchWithCache(cacheKey, async () => {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  });
};

/**
 * Atualizar registro e invalidar cache
 */
export const updateAndInvalidate = async (table, id, updates) => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  // Invalidar caches relacionados
  invalidateCache(`${table}_${id}`);
  invalidateCache(`dashboard_${updates.escritorio_id}`);
  
  return data;
};

/**
 * Deletar registro e invalidar cache
 */
export const deleteAndInvalidate = async (table, id, escritorioId) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  // Invalidar caches relacionados
  invalidateCache(`${table}_${id}`);
  invalidateCache(`dashboard_${escritorioId}`);
};
