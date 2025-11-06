import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';

const FaturamentoSummaryCards = ({ refreshKey = 0 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRecebido: 0,
    aReceber: 0,
    despesasTotais: 0,
    novosAcordos: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, [refreshKey]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    const toYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const inicioMesStr = toYMD(inicioMes);
    const fimMesStr = toYMD(fimMes);

    let totalRecebido = 0, aReceber = 0, despesasTotais = 0, novosAcordos = 0;
    let totalRecebidoCount = 0, aReceberCount = 0, despesasTotaisCount = 0, novosAcordosCount = 0;

    try {
      const { data } = await supabase.from('parcelas').select('valor').eq('status', 'paga').not('data_pagamento', 'is', null).gte('data_pagamento', inicioMesStr).lte('data_pagamento', fimMesStr);
      totalRecebido = (data || []).reduce((sum, p) => sum + (Number(p.valor) || 0), 0);
      totalRecebidoCount = (data || []).length;
    } catch (e) {}

    try {
      const { data } = await supabase.from('parcelas').select('valor').eq('status', 'pendente').gte('data_vencimento', inicioMesStr).lte('data_vencimento', fimMesStr);
      aReceber = (data || []).reduce((sum, p) => sum + (Number(p.valor) || 0), 0);
      aReceberCount = (data || []).length;
    } catch (e) {}

    try {
      const { data } = await supabase.from('gastos').select('valor').gte('data_gasto', inicioMesStr).lte('data_gasto', fimMesStr);
      despesasTotais = (data || []).reduce((sum, g) => sum + (Number(g.valor) || 0), 0);
      despesasTotaisCount = (data || []).length;
    } catch (e) {}

    try {
      const { data } = await supabase.from('faturamentos').select('valor_total').gte('data_acordo', inicioMesStr).lte('data_acordo', fimMesStr);
      novosAcordos = (data || []).reduce((sum, f) => sum + (Number(f.valor_total) || 0), 0);
      novosAcordosCount = (data || []).length;
    } catch (e) {}

    setMetrics({ totalRecebido, aReceber, despesasTotais, novosAcordos });
    setIsLoading(false);
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const cards = [
    { title: 'Total Recebido (Mês)', value: metrics.totalRecebido, icon: 'TrendingUp', iconColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
    { title: 'A Receber (Mês Atual)', value: metrics.aReceber, icon: 'Calendar', iconColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' },
    { title: 'Despesas Totais (Mês)', value: metrics.despesasTotais, icon: 'TrendingDown', iconColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
    { title: 'Novos Acordos (Mês)', value: metrics.novosAcordos, icon: 'DollarSign', iconColor: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700' }
  ];

  if (isLoading) {
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">{[...Array(4)].map((_, i) => (<div key={i} className="bg-white rounded-lg border p-6 animate-pulse"><div className="h-4 bg-gray-200 rounded w-32 mb-4"></div><div className="h-8 bg-gray-200 rounded w-28 mb-2"></div></div>))}</div>);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className={`bg-white rounded-lg border-2 ${card.borderColor} p-6 hover:shadow-lg transition-all cursor-pointer group`}
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <div className={`${card.bgColor} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
              <Icon name={card.icon} size={24} className={card.iconColor} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${card.textColor}`}>{formatCurrency(card.value)}</p>
        </div>
      ))}
    </div>
  );
};

export default FaturamentoSummaryCards;
