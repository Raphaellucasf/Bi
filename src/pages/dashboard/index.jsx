import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";
import { formatProperName } from "../../utils/formatters";

const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfis } = await supabase.from('perfis').select('escritorio_id').eq('user_id', user.id).limit(1);
  return perfis && perfis[0]?.escritorio_id;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [escritorioId, setEscritorioId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para os dados reais
  const [processosAtivos, setProcessosAtivos] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [prazosFatais, setPrazosFatais] = useState(0);
  const [valorTotal, setValorTotal] = useState(0);
  const [processosRecentes, setProcessosRecentes] = useState([]);
  const [tarefasProximas, setTarefasProximas] = useState([]);
  const [processosPorArea, setProcessosPorArea] = useState([]);

  // Buscar escritório ID
  useEffect(() => {
    const init = async () => {
      const eid = await getEscritorioId();
      setEscritorioId(eid);
    };
    init();
  }, []);

  // Carregar dados do dashboard
  useEffect(() => {
    if (!escritorioId) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);

      // 1. Buscar processos ativos (todos exceto Arquivado e Encerrado)
      const { data: processos, count: processosCount } = await supabase
        .from('processos')
        .select('id, titulo, status, valor_causa, area_direito, cliente_principal_id', { count: 'exact' })
        .eq('escritorio_id', escritorioId)
        .not('status', 'in', '("Arquivado","Encerrado")');
      
      setProcessosAtivos(processosCount || 0);

      // 2. Buscar total de clientes
      const { count: clientesCount } = await supabase
        .from('clientes')
        .select('id', { count: 'exact' })
        .eq('escritorio_id', escritorioId);
      
      setTotalClientes(clientesCount || 0);

      // 3. Buscar prazos fatais (próximos 7 dias)
      const hoje = new Date();
      const proximosDias = new Date(hoje);
      proximosDias.setDate(hoje.getDate() + 7);
      
      const { count: prazosCount } = await supabase
        .from('prazos')
        .select('id', { count: 'exact' })
        .eq('escritorio_id', escritorioId)
        .eq('tipo', 'Fatal')
        .gte('data_vencimento', hoje.toISOString().split('T')[0])
        .lte('data_vencimento', proximosDias.toISOString().split('T')[0]);
      
      setPrazosFatais(prazosCount || 0);

      // 4. Calcular valor total dos processos
      const valorTotalProcessos = (processos || []).reduce((sum, proc) => sum + (parseFloat(proc.valor_causa) || 0), 0);
      setValorTotal(valorTotalProcessos);

      // 5. Buscar processos recentes (últimos 2 atualizados pelo usuário)
      const { data: recentes } = await supabase
        .from('processos')
        .select('id, titulo, status, prioridade, area_direito, cliente_principal_id, updated_at')
        .eq('escritorio_id', escritorioId)
        .order('updated_at', { ascending: false })
        .limit(2);

      // Buscar nomes dos clientes
      if (recentes && recentes.length > 0) {
        const clienteIds = recentes.map(p => p.cliente_principal_id).filter(Boolean);
        const { data: clientes } = await supabase
          .from('clientes')
          .select('id, nome_completo')
          .in('id', clienteIds);
        
        const clientesMap = (clientes || []).reduce((acc, c) => ({ ...acc, [c.id]: c.nome_completo }), {});
        
        setProcessosRecentes(recentes.map(p => ({
          ...p,
          clienteNome: clientesMap[p.cliente_principal_id] || 'Sem cliente'
        })));
      } else {
        setProcessosRecentes([]);
      }

      // 6. Buscar próximas tarefas (próximos 7 dias)
      const { data: prazos } = await supabase
        .from('prazos')
        .select('id, titulo, data_vencimento, tipo, processo_id')
        .eq('escritorio_id', escritorioId)
        .gte('data_vencimento', hoje.toISOString().split('T')[0])
        .lte('data_vencimento', proximosDias.toISOString().split('T')[0])
        .order('data_vencimento', { ascending: true })
        .limit(5);

      const { data: audiencias } = await supabase
        .from('audiencias')
        .select('id, titulo, data_hora, tipo, processo_id')
        .eq('escritorio_id', escritorioId)
        .gte('data_hora', hoje.toISOString())
        .lte('data_hora', proximosDias.toISOString())
        .order('data_hora', { ascending: true })
        .limit(5);

      const { data: reunioes } = await supabase
        .from('reunioes')
        .select('id, titulo, data_hora, local, processo_id')
        .eq('escritorio_id', escritorioId)
        .gte('data_hora', hoje.toISOString())
        .lte('data_hora', proximosDias.toISOString())
        .order('data_hora', { ascending: true })
        .limit(5);

      // Combinar e ordenar tarefas
      const todasTarefas = [
        ...(prazos || []).map(p => ({ ...p, tipo_tarefa: 'Prazo', data: p.data_vencimento })),
        ...(audiencias || []).map(a => ({ ...a, tipo_tarefa: 'Audiência', data: a.data_hora })),
        ...(reunioes || []).map(r => ({ ...r, tipo_tarefa: 'Reunião', data: r.data_hora }))
      ].sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 5);

      setTarefasProximas(todasTarefas);

      // 7. Calcular processos por área
      const areaCount = {};
      (processos || []).forEach(p => {
        const area = p.area_direito || 'Outro';
        areaCount[area] = (areaCount[area] || 0) + 1;
      });

      const total = processosCount || 1;
      const areas = Object.entries(areaCount).map(([area, quantidade]) => ({
        area,
        quantidade,
        percentual: Math.round((quantidade / total) * 100)
      }));

      setProcessosPorArea(areas);
      setLoading(false);
    };

    fetchDashboardData();

    // Configurar realtime subscriptions
    const processosSubscription = supabase
      .channel('processos_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'processos', filter: `escritorio_id=eq.${escritorioId}` },
        () => fetchDashboardData()
      )
      .subscribe();

    const clientesSubscription = supabase
      .channel('clientes_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'clientes', filter: `escritorio_id=eq.${escritorioId}` },
        () => fetchDashboardData()
      )
      .subscribe();

    const prazosSubscription = supabase
      .channel('prazos_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'prazos', filter: `escritorio_id=eq.${escritorioId}` },
        () => fetchDashboardData()
      )
      .subscribe();

    const audienciasSubscription = supabase
      .channel('audiencias_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'audiencias', filter: `escritorio_id=eq.${escritorioId}` },
        () => fetchDashboardData()
      )
      .subscribe();

    const reunioesSubscription = supabase
      .channel('reunioes_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reunioes', filter: `escritorio_id=eq.${escritorioId}` },
        () => fetchDashboardData()
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(processosSubscription);
      supabase.removeChannel(clientesSubscription);
      supabase.removeChannel(prazosSubscription);
      supabase.removeChannel(audienciasSubscription);
      supabase.removeChannel(reunioesSubscription);
    };
  }, [escritorioId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Ativo': 'bg-green-100 text-green-700',
      'Arquivado': 'bg-gray-100 text-gray-700',
      'Suspenso': 'bg-yellow-100 text-yellow-700',
      'Encerrado': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPrioridadeColor = (prioridade) => {
    const colors = {
      'Alta': 'bg-red-100 text-red-700',
      'Média': 'bg-blue-100 text-blue-700',
      'Baixa': 'bg-gray-100 text-gray-700'
    };
    return colors[prioridade] || 'bg-gray-100 text-gray-700';
  };

  const getTipoTarefaColor = (tipo) => {
    const colors = {
      'Prazo': 'bg-red-100 text-red-700',
      'Audiência': 'bg-blue-100 text-blue-700',
      'Reunião': 'bg-green-100 text-green-700'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-700';
  };

  // Cores para o gráfico de áreas
  const areaColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <Sidebar />
        <Header />
        <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-6 space-y-6">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do escritório jurídico</p>
            </div>
            <Button 
              variant="default" 
              iconName="Plus" 
              iconPosition="left" 
              className="w-full md:w-auto"
              onClick={() => navigate('/process-management')}
            >
              Novo Processo
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="Gift" size={24} className="text-primary" />
                <span className="font-semibold text-gray-700">Processos Ativos</span>
              </div>
              <div className="text-2xl font-bold">{processosAtivos}</div>
              <div className="text-xs text-blue-600">+12% este mês</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={24} className="text-success" />
                <span className="font-semibold text-gray-700">Total de Clientes</span>
              </div>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <div className="text-xs text-green-600">+5 novos</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={24} className="text-warning" />
                <span className="font-semibold text-gray-700">Prazos Fatais</span>
              </div>
              <div className="text-2xl font-bold">{prazosFatais}</div>
              <div className="text-xs text-red-600">Requer atenção</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={24} className="text-purple-600" />
                <span className="font-semibold text-gray-700">Valor Total</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(valorTotal)}</div>
              <div className="text-xs text-purple-600">+8% este mês</div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Processos Recentes */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Icon name="Gift" size={20} /> Processos Recentes
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/process-management')}
                >
                  Ver Todos
                </Button>
              </div>
              {processosRecentes.length > 0 ? (
                processosRecentes.map((proc) => (
                  <div 
                    key={proc.id} 
                    className="bg-[#f7f8fa] rounded-lg p-4 flex flex-col gap-2 border border-gray-200 mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/process-management')}
                  >
                    <div className="font-medium text-gray-800">{formatProperName(proc.titulo)}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Icon name="User" size={14} /> {formatProperName(proc.clienteNome)}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {proc.status && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(proc.status)}`}>
                          {proc.status}
                        </span>
                      )}
                      {proc.prioridade && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPrioridadeColor(proc.prioridade)}`}>
                          {proc.prioridade}
                        </span>
                      )}
                      {proc.area_direito && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                          {proc.area_direito}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">Nenhum processo recente</div>
              )}
            </div>

            {/* Próximas Tarefas */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Icon name="CheckSquare" size={20} /> Próximas Tarefas
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/tasks')}
                >
                  Ver Todas
                </Button>
              </div>
              {tarefasProximas.length > 0 ? (
                tarefasProximas.map((t) => (
                  <div 
                    key={`${t.tipo_tarefa}-${t.id}`} 
                    className="bg-[#f7f8fa] rounded-lg p-4 flex flex-col gap-2 border border-gray-200 mb-2 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-800">{formatProperName(t.titulo)}</div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTipoTarefaColor(t.tipo_tarefa)}`}>
                        {t.tipo_tarefa}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Icon name="Calendar" size={14} />
                      {t.tipo_tarefa === 'Prazo' ? formatDate(t.data) : formatDateTime(t.data)}
                    </div>
                    {t.tipo === 'Fatal' && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 w-fit">
                        Fatal
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <Icon name="CheckSquare" size={32} className="mb-2" />
                  Nenhuma tarefa próxima
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Processos por Área */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={20} /> Processos por Área
              </h2>
              {processosPorArea.length > 0 ? (
                <>
                  {/* Donut Chart com SVG dinâmico */}
                  <div className="w-40 h-40 flex items-center justify-center mb-4">
                    <svg width="100%" height="100%" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="#f3f4f6" />
                      {(() => {
                        let startAngle = 0;
                        return processosPorArea.map((area, idx) => {
                          const angle = (area.percentual / 100) * 360;
                          const endAngle = startAngle + angle;
                          
                          const startRad = (startAngle - 90) * (Math.PI / 180);
                          const endRad = (endAngle - 90) * (Math.PI / 180);
                          
                          const x1 = 60 + 50 * Math.cos(startRad);
                          const y1 = 60 + 50 * Math.sin(startRad);
                          const x2 = 60 + 50 * Math.cos(endRad);
                          const y2 = 60 + 50 * Math.sin(endRad);
                          
                          const largeArc = angle > 180 ? 1 : 0;
                          const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          
                          startAngle = endAngle;
                          
                          return (
                            <path 
                              key={idx} 
                              d={path} 
                              fill={areaColors[idx % areaColors.length]} 
                            />
                          );
                        });
                      })()}
                      <circle cx="60" cy="60" r="30" fill="#fff" />
                    </svg>
                  </div>
                  <div className="mt-2 flex flex-col items-start gap-2 w-full">
                    {processosPorArea.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm w-full">
                        <span 
                          className="w-3 h-3 rounded-full inline-block flex-shrink-0" 
                          style={{ background: areaColors[idx % areaColors.length] }}
                        ></span>
                        <span className="flex-1">{a.area}</span>
                        <span className="text-gray-500">{a.quantidade} ({a.percentual}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <Icon name="BarChart3" size={32} className="mb-2" />
                  Nenhum processo cadastrado
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;