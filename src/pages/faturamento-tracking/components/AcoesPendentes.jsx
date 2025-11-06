import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AcoesPendentes = ({ refreshKey = 0, onUpdated }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [parcelasAtrasadas, setParcelasAtrasadas] = useState([]);
  const [faturamentosPendentes, setFaturamentosPendentes] = useState([]);

  useEffect(() => {
    fetchAcoesPendentes();
  }, [refreshKey]);

  const fetchAcoesPendentes = async () => {
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

      const hoje = new Date().toISOString().split('T')[0];

      // Buscar parcelas atrasadas
      const { data: parcelas } = await supabase
        .from('parcelas')
        .select(`
          *,
          faturamento:faturamentos(
            cliente:clientes(nome),
            processo:processos(numero_processo)
          )
        `)
        .eq('escritorio_id', patronoData.escritorio_id)
        .eq('status', 'pendente')
        .lt('data_vencimento', hoje)
        .order('data_vencimento', { ascending: true })
        .limit(5);

      // Buscar faturamentos aprovados sem parcelas geradas
      const { data: faturamentos } = await supabase
        .from('faturamentos')
        .select(`
          *,
          cliente:clientes(nome),
          processo:processos(numero_processo),
          parcelas_count:parcelas(count)
        `)
        .eq('escritorio_id', patronoData.escritorio_id)
        .eq('status', 'aprovado')
        .limit(5);

      // Filtrar apenas faturamentos sem parcelas
      const faturamentosSemParcelas = (faturamentos || []).filter(
        f => !f.parcelas_count || f.parcelas_count.length === 0
      );

      setParcelasAtrasadas(parcelas || []);
      setFaturamentosPendentes(faturamentosSemParcelas);
    } catch (error) {
      console.error('Erro ao buscar ações pendentes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrarPagamento = async (parcela) => {
    const confirmacao = window.confirm(
      `Deseja registrar o pagamento da parcela de ${formatCurrency(parcela.valor)}?`
    );
    
    if (!confirmacao) return;

    try {
      const { error } = await supabase
        .from('parcelas')
        .update({
          status: 'paga',
          data_pagamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', parcela.id);

      if (error) throw error;

      alert('✅ Pagamento registrado com sucesso!');
      fetchAcoesPendentes();
      onUpdated?.();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('❌ Erro ao registrar pagamento: ' + error.message);
    }
  };

  const handleGerarParcelas = (faturamento) => {
    alert(`Funcionalidade de gerar parcelas para o faturamento #${faturamento.id} será implementada em breve!`);
    // TODO: Implementar modal de geração de parcelas
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
    return date.toLocaleDateString('pt-BR');
  };

  const getDiasAtraso = (dataVencimento) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento + 'T00:00:00');
    const diffTime = Math.abs(hoje - vencimento);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPendencias = parcelasAtrasadas.length + faturamentosPendentes.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (totalPendencias === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Icon name="CheckCircle2" size={32} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">🎉 Tudo em dia!</h3>
            <p className="text-green-700">Não há ações pendentes no momento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-8">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Icon name="AlertCircle" size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">⚠️ Ações Pendentes</h2>
              <p className="text-sm text-muted-foreground">
                {totalPendencias} {totalPendencias === 1 ? 'item requer' : 'itens requerem'} sua atenção
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full">
            <Icon name="AlertTriangle" size={18} />
            <span className="font-bold">{totalPendencias}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Parcelas Atrasadas */}
        {parcelasAtrasadas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Clock" size={20} className="text-red-600" />
              <h3 className="font-semibold text-foreground">
                Parcelas Atrasadas ({parcelasAtrasadas.length})
              </h3>
            </div>
            <div className="space-y-2">
              {parcelasAtrasadas.map((parcela) => (
                <div
                  key={parcela.id}
                  className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-foreground">
                        {parcela.faturamento?.cliente?.nome || 'Cliente não identificado'}
                      </span>
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-medium">
                        {getDiasAtraso(parcela.data_vencimento)} dias de atraso
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Vencimento: {formatDate(parcela.data_vencimento)}</span>
                      <span>•</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(parcela.valor)}
                      </span>
                      {parcela.faturamento?.processo?.numero_processo && (
                        <>
                          <span>•</span>
                          <span>Processo: {parcela.faturamento.processo.numero_processo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRegistrarPagamento(parcela)}
                    className="bg-green-600 hover:bg-green-700 text-white ml-4"
                  >
                    <Icon name="Check" size={16} className="mr-1" />
                    Registrar Pagamento
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Faturamentos Aguardando Geração de Parcelas */}
        {faturamentosPendentes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="FileText" size={20} className="text-orange-600" />
              <h3 className="font-semibold text-foreground">
                Faturamentos Aguardando Ação ({faturamentosPendentes.length})
              </h3>
            </div>
            <div className="space-y-2">
              {faturamentosPendentes.map((faturamento) => (
                <div
                  key={faturamento.id}
                  className="flex items-center justify-between p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-foreground">
                        {faturamento.cliente?.nome || 'Cliente não identificado'}
                      </span>
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full font-medium">
                        Parcelas não geradas
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Valor Total: <span className="font-medium text-orange-600">{formatCurrency(faturamento.valor_total)}</span></span>
                      {faturamento.processo?.numero_processo && (
                        <>
                          <span>•</span>
                          <span>Processo: {faturamento.processo.numero_processo}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Parcelas: {faturamento.numero_parcelas}x</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleGerarParcelas(faturamento)}
                    className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                  >
                    <Icon name="Plus" size={16} className="mr-1" />
                    Gerar Parcelas
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="pt-4 border-t">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Icon name="Info" size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Dica:</strong> Resolva as ações pendentes para manter o fluxo de caixa organizado e evitar inadimplência.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcoesPendentes;
