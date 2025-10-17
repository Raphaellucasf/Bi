import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';

const FaturamentoSummaryCards = ({ refreshKey = 0 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    receitaTotal: 0,
    pagamentos: 0,
    novosAcordosMes: 0,
    aReceberNoMes: 0
  });
  // Quantidade de registros considerados em cada métrica
  const [counts, setCounts] = useState({
    receitaTotal: 0,
    pagamentos: 0,
    novosAcordosMes: 0,
    aReceberNoMes: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, [refreshKey]);

  const fetchMetrics = async () => {
    setIsLoading(true);

    // Formata data YYYY-MM-DD sem afetar por timezone
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

  let receitaTotal = 0;
  let pagamentos = 0;
  let aReceberNoMes = 0;
  let novosAcordosMes = 0;
  // Contadores
  let receitaTotalCount = 0;
  let pagamentosCount = 0;
  let aReceberNoMesCount = 0;
  let novosAcordosMesCount = 0;

    // 1) Parcelas pagas (Receita Total) — usa data_pagamento no mês, independente do status
    try {
      const { data, error } = await supabase
        .from('parcelas')
        .select('valor, status, data_pagamento')
        .not('data_pagamento', 'is', null)
        .gte('data_pagamento', inicioMesStr)
        .lte('data_pagamento', fimMesStr);
      if (error) throw error;
      receitaTotal = (data || []).reduce((sum, p) => sum + (Number(p.valor) || 0), 0);
      receitaTotalCount = (data || []).length;
      console.log('[Cards] ReceitaTotal parcelasPagas:', receitaTotalCount, receitaTotal);
    } catch (e) {
      console.warn('[Cards] Falha ao buscar parcelas pagas:', e.message);
    }

    // 2) Gastos do mês (Pagamentos)
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('valor, data_gasto')
        .gte('data_gasto', inicioMesStr)
        .lte('data_gasto', fimMesStr);
      if (error) throw error;
      pagamentos = (data || []).reduce((sum, g) => sum + (Number(g.valor) || 0), 0);
      pagamentosCount = (data || []).length;
      console.log('[Cards] Gastos do mês:', pagamentosCount, pagamentos);
    } catch (e) {
      console.warn('[Cards] Falha ao buscar gastos:', e.message);
    }

    // 3) Parcelas pendentes do mês (A Receber)
    try {
      const { data, error } = await supabase
        .from('parcelas')
        .select('valor, status, data_vencimento')
        .eq('status', 'pendente')
        .gte('data_vencimento', inicioMesStr)
        .lte('data_vencimento', fimMesStr);
      if (error) throw error;
      aReceberNoMes = (data || []).reduce((sum, p) => sum + (Number(p.valor) || 0), 0);
      aReceberNoMesCount = (data || []).length;
      console.log('[Cards] AReceber parcelasPendentes:', aReceberNoMesCount, aReceberNoMes);
    } catch (e) {
      console.warn('[Cards] Falha ao buscar parcelas pendentes:', e.message);
    }

    // 4) Novos acordos (Faturamentos do mês)
    try {
      const { data, error } = await supabase
        .from('faturamentos')
        .select('valor_total, data_acordo')
        .gte('data_acordo', inicioMesStr)
        .lte('data_acordo', fimMesStr);
      if (error) throw error;
      novosAcordosMes = (data || []).reduce((sum, f) => sum + (Number(f.valor_total) || 0), 0);
      novosAcordosMesCount = (data || []).length;
      console.log('[Cards] Novos acordos no mês:', novosAcordosMesCount, novosAcordosMes);
    } catch (e) {
      console.warn('[Cards] Falha ao buscar faturamentos:', e.message);
    }

    setMetrics({ receitaTotal, pagamentos, novosAcordosMes, aReceberNoMes });
    setCounts({
      receitaTotal: receitaTotalCount,
      pagamentos: pagamentosCount,
      novosAcordosMes: novosAcordosMesCount,
      aReceberNoMes: aReceberNoMesCount,
    });
    setIsLoading(false);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const cards = [
    {
      title: 'Receita Total do Escritório',
      value: metrics.receitaTotal,
      icon: 'TrendingUp',
      color: 'green',
      isPositive: true,
      count: counts.receitaTotal,
      countLabel: 'parcelas pagas'
    },
    {
      title: 'Pagamentos',
      value: metrics.pagamentos,
      icon: 'ArrowDownCircle',
      color: 'red',
      isPositive: false,
      count: counts.pagamentos,
      countLabel: 'gastos do mês'
    },
    {
      title: 'Pagamentos (Novos Acordos)',
      value: metrics.novosAcordosMes,
      icon: 'DollarSign',
      color: 'green',
      isPositive: true,
      count: counts.novosAcordosMes,
      countLabel: 'novos acordos'
    },
    {
      title: 'A Receber no Mês',
      value: metrics.aReceberNoMes,
      icon: 'Calendar',
      color: 'blue',
      isPositive: true,
      count: counts.aReceberNoMes,
      countLabel: 'parcelas pendentes'
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-border p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="w-7 h-7 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-border p-6 flex flex-col gap-2 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p
                className={`text-2xl font-bold ${
                  card.color === 'green'
                    ? 'text-green-700'
                    : card.color === 'red'
                    ? 'text-red-700'
                    : card.color === 'blue'
                    ? 'text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                {formatCurrency(card.value)}
              </p>
              <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 mt-1 inline-block">
                {card.count} {card.countLabel}
              </span>
            </div>
            <Icon
              name={card.icon}
              size={28}
              className={
                card.color === 'green'
                  ? 'text-green-600'
                  : card.color === 'red'
                  ? 'text-red-600'
                  : card.color === 'blue'
                  ? 'text-blue-600'
                  : 'text-gray-600'
              }
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon
              name={card.isPositive ? 'TrendingUp' : 'TrendingDown'}
              size={12}
              className={card.isPositive ? 'text-green-500' : 'text-red-500'}
            />
            <span>Atualizado</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaturamentoSummaryCards;