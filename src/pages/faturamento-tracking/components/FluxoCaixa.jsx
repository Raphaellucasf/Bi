import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FluxoCaixa = ({ refreshKey = 0 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transacoes, setTransacoes] = useState([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  useEffect(() => {
    fetchFluxoCaixa();
  }, [refreshKey]);

  const fetchFluxoCaixa = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: patronoData } = await supabase
        .from('patronos')
        .select('escritorio_id')
        .eq('id', userData.user.id)
        .single();

      if (!patronoData?.escritorio_id) return;

      // Buscar receitas (parcelas pagas)
      const { data: receitas } = await supabase
        .from('parcelas')
        .select(`
          id,
          valor,
          data_pagamento,
          status,
          faturamento:faturamentos(
            cliente:clientes(nome),
            processo:processos(numero_processo)
          )
        `)
        .eq('escritorio_id', patronoData.escritorio_id)
        .eq('status', 'paga')
        .not('data_pagamento', 'is', null)
        .order('data_pagamento', { ascending: false })
        .limit(20);

      // Buscar despesas
      const { data: despesas } = await supabase
        .from('gastos')
        .select('id, valor, data_gasto, categoria, descricao')
        .eq('escritorio_id', patronoData.escritorio_id)
        .order('data_gasto', { ascending: false })
        .limit(20);

      // Combinar e ordenar por data
      const todasTransacoes = [
        ...(receitas || []).map(r => ({
          id: `receita-${r.id}`,
          tipo: 'receita',
          data: r.data_pagamento,
          valor: r.valor,
          descricao: r.faturamento?.cliente?.nome || 'Cliente não identificado',
          categoria: 'Honorários',
          processo: r.faturamento?.processo?.numero_processo,
          original: r
        })),
        ...(despesas || []).map(d => ({
          id: `despesa-${d.id}`,
          tipo: 'despesa',
          data: d.data_gasto,
          valor: d.valor,
          descricao: d.descricao || d.categoria,
          categoria: d.categoria,
          original: d
        }))
      ].sort((a, b) => new Date(b.data) - new Date(a.data));

      setTransacoes(todasTransacoes);
    } catch (error) {
      console.error('Erro ao buscar fluxo de caixa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calcularSaldoAcumulado = () => {
    let saldo = 0;
    return transacoes.map(t => {
      if (t.tipo === 'receita') {
        saldo += t.valor;
      } else {
        saldo -= t.valor;
      }
      return { ...t, saldoAcumulado: saldo };
    });
  };

  const transacoesComSaldo = calcularSaldoAcumulado();
  const transacoesExibidas = mostrarTodas ? transacoesComSaldo : transacoesComSaldo.slice(0, 10);

  const getTotalReceitas = () => {
    return transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);
  };

  const getTotalDespesas = () => {
    return transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
  };

  const getSaldoLiquido = () => {
    return getTotalReceitas() - getTotalDespesas();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="border-b px-6 py-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-8">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Icon name="TrendingUp" size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">💰 Fluxo de Caixa</h2>
              <p className="text-sm text-muted-foreground">
                Histórico unificado de receitas e despesas
              </p>
            </div>
          </div>
          
          {/* Resumo Rápido */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-sm font-bold text-green-600">{formatCurrency(getTotalReceitas())}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(getTotalDespesas())}</p>
            </div>
            <div className="text-right bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg border-2 border-purple-200">
              <p className="text-xs text-muted-foreground">Saldo Líquido</p>
              <p className={`text-lg font-bold ${getSaldoLiquido() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(getSaldoLiquido())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="divide-y">
        {transacoesExibidas.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="Inbox" size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          </div>
        ) : (
          transacoesExibidas.map((transacao) => (
            <div
              key={transacao.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                transacao.tipo === 'receita' ? 'bg-green-50/30' : 'bg-red-50/30'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Info da Transação */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Ícone e Tipo */}
                  <div className={`p-2.5 rounded-lg ${
                    transacao.tipo === 'receita' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    <Icon 
                      name={transacao.tipo === 'receita' ? 'TrendingUp' : 'TrendingDown'} 
                      size={20} 
                      className={transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'} 
                    />
                  </div>

                  {/* Descrição e Detalhes */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-foreground">
                        {transacao.descricao}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        transacao.tipo === 'receita'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        {formatDate(transacao.data)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Icon name="Tag" size={14} />
                        {transacao.categoria}
                      </span>
                      {transacao.processo && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Icon name="FileText" size={14} />
                            {transacao.processo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Valores */}
                <div className="flex items-center gap-6 ml-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} {formatCurrency(transacao.valor)}
                    </p>
                  </div>

                  {/* Saldo Acumulado */}
                  <div className="text-right min-w-[120px] bg-gray-50 px-3 py-2 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-0.5">Saldo</p>
                    <p className={`text-sm font-bold ${
                      transacao.saldoAcumulado >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transacao.saldoAcumulado)}
                    </p>
                  </div>

                  {/* Botão de Ações */}
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <Icon name="MoreVertical" size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer com Botão Ver Todas */}
      {transacoes.length > 10 && (
        <div className="border-t px-6 py-4 bg-gray-50">
          <Button
            onClick={() => setMostrarTodas(!mostrarTodas)}
            className="w-full bg-white hover:bg-gray-100 text-foreground border"
          >
            <Icon name={mostrarTodas ? "ChevronUp" : "ChevronDown"} size={18} className="mr-2" />
            {mostrarTodas ? 'Mostrar Menos' : `Ver Todas as Transações (${transacoes.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FluxoCaixa;
