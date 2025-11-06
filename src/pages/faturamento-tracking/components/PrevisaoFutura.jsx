import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PrevisaoFutura = ({ refreshKey = 0 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [previsoes, setPrevisoes] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState(30); // 30, 60 ou 90 dias

  useEffect(() => {
    fetchPrevisoes();
  }, [refreshKey, periodoSelecionado]);

  const fetchPrevisoes = async () => {
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

      const hoje = new Date();
      const dataFinal = new Date();
      dataFinal.setDate(hoje.getDate() + periodoSelecionado);

      const hojeStr = hoje.toISOString().split('T')[0];
      const dataFinalStr = dataFinal.toISOString().split('T')[0];

      // Buscar parcelas a receber (pendentes) nos próximos X dias
      const { data: parcelasAReceber } = await supabase
        .from('parcelas')
        .select(`
          id,
          valor,
          data_vencimento,
          status,
          faturamento:faturamentos(
            cliente:clientes(nome),
            processo:processos(numero_processo)
          )
        `)
        .eq('escritorio_id', patronoData.escritorio_id)
        .eq('status', 'pendente')
        .gte('data_vencimento', hojeStr)
        .lte('data_vencimento', dataFinalStr)
        .order('data_vencimento', { ascending: true });

      // Mapear para formato unificado
      const todasPrevisoes = [
        ...(parcelasAReceber || []).map(p => ({
          id: `receita-${p.id}`,
          tipo: 'receita',
          data: p.data_vencimento,
          valor: p.valor,
          descricao: p.faturamento?.cliente?.nome || 'Cliente não identificado',
          categoria: 'Honorários',
          processo: p.faturamento?.processo?.numero_processo,
          status: 'pendente',
          original: p
        }))
      ].sort((a, b) => new Date(a.data) - new Date(b.data));

      setPrevisoes(todasPrevisoes);
    } catch (error) {
      console.error('Erro ao buscar previsões:', error);
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
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      weekday: 'short'
    });
  };

  const getDiasRestantes = (dataVencimento) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento + 'T00:00:00');
    const diffTime = vencimento - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTotalPrevistoReceitas = () => {
    return previsoes
      .filter(p => p.tipo === 'receita')
      .reduce((sum, p) => sum + p.valor, 0);
  };

  const agruparPorMes = () => {
    const grupos = {};
    previsoes.forEach(prev => {
      const data = new Date(prev.data + 'T00:00:00');
      const mesAno = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!grupos[mesAno]) {
        grupos[mesAno] = [];
      }
      grupos[mesAno].push(prev);
    });
    return grupos;
  };

  const gruposPorMes = agruparPorMes();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="border-b px-6 py-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-8">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Icon name="Calendar" size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">📅 Previsão Futura</h2>
              <p className="text-sm text-muted-foreground">
                Próximos recebimentos e compromissos financeiros
              </p>
            </div>
          </div>

          {/* Seletor de Período */}
          <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
            <button
              onClick={() => setPeriodoSelecionado(30)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodoSelecionado === 30
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriodoSelecionado(60)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodoSelecionado === 60
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              60 dias
            </button>
            <button
              onClick={() => setPeriodoSelecionado(90)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                periodoSelecionado === 90
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              90 dias
            </button>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="mt-4 flex items-center gap-6">
          <div className="bg-white rounded-lg px-4 py-3 border-2 border-green-200">
            <p className="text-xs text-muted-foreground mb-1">Receitas Previstas</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalPrevistoReceitas())}
            </p>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 border-2 border-blue-200">
            <p className="text-xs text-muted-foreground mb-1">Total de Parcelas</p>
            <p className="text-2xl font-bold text-blue-600">
              {previsoes.filter(p => p.tipo === 'receita').length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Previsões */}
      <div className="p-6">
        {previsoes.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="CalendarX" size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma receita prevista para os próximos {periodoSelecionado} dias
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(gruposPorMes).map(([mesAno, items]) => (
              <div key={mesAno}>
                {/* Cabeçalho do Mês */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                    {mesAno}
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <div className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>

                {/* Itens do Mês */}
                <div className="space-y-2">
                  {items.map((previsao) => {
                    const diasRestantes = getDiasRestantes(previsao.data);
                    const isProximo = diasRestantes <= 7;
                    
                    return (
                      <div
                        key={previsao.id}
                        className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                          previsao.tipo === 'receita'
                            ? isProximo
                              ? 'bg-yellow-50 border-yellow-400'
                              : 'bg-green-50 border-green-400'
                            : 'bg-red-50 border-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Info da Previsão */}
                          <div className="flex items-center gap-4 flex-1">
                            {/* Ícone */}
                            <div className={`p-2.5 rounded-lg ${
                              previsao.tipo === 'receita'
                                ? isProximo
                                  ? 'bg-yellow-100'
                                  : 'bg-green-100'
                                : 'bg-red-100'
                            }`}>
                              <Icon 
                                name={previsao.tipo === 'receita' ? 'ArrowDownCircle' : 'ArrowUpCircle'} 
                                size={20} 
                                className={
                                  previsao.tipo === 'receita'
                                    ? isProximo
                                      ? 'text-yellow-600'
                                      : 'text-green-600'
                                    : 'text-red-600'
                                } 
                              />
                            </div>

                            {/* Detalhes */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-foreground">
                                  {previsao.descricao}
                                </span>
                                {isProximo && previsao.tipo === 'receita' && (
                                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium animate-pulse">
                                    ⚡ Vence em breve
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  previsao.tipo === 'receita'
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-red-200 text-red-800'
                                }`}>
                                  {previsao.tipo === 'receita' ? 'A Receber' : 'Despesa'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium">
                                  <Icon name="Calendar" size={14} />
                                  {formatDate(previsao.data)}
                                </span>
                                <span>•</span>
                                <span className="text-blue-600 font-medium">
                                  {diasRestantes === 0 
                                    ? 'Hoje' 
                                    : diasRestantes === 1 
                                    ? 'Amanhã'
                                    : `${diasRestantes} dias`}
                                </span>
                                {previsao.processo && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Icon name="FileText" size={14} />
                                      {previsao.processo}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Valor */}
                          <div className="text-right ml-4">
                            <p className={`text-xl font-bold ${
                              previsao.tipo === 'receita' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {formatCurrency(previsao.valor)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {previsao.categoria}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer com Info */}
      <div className="border-t px-6 py-4 bg-gray-50">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <Icon name="Info" size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="mb-1">
              <strong>💡 Planejamento Financeiro:</strong> Acompanhe os vencimentos futuros para organizar o fluxo de caixa.
            </p>
            <p className="text-xs">
              Parcelas com vencimento em até 7 dias são destacadas em amarelo para facilitar a gestão.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrevisaoFutura;
