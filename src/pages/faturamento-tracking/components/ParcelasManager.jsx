import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ParcelasManager = ({ refreshKey, onUpdated }) => {
  const [parcelas, setParcelas] = useState({ pendentes: [], pagas: [] });
  const [parcelasAtrasadas, setParcelasAtrasadas] = useState([]);
  const [atrasadasPage, setAtrasadasPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParcela, setSelectedParcela] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pendentes'); // 'pendentes' ou 'pagas'

  useEffect(() => {
    fetchParcelas();
  }, [refreshKey]);

  const fetchParcelas = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todas as parcelas (sem o JOIN que está causando erro)
      const { data: todasParcelas, error } = await supabase
        .from('parcelas')
        .select('*')
        .order('data_vencimento', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar parcelas:', error);
        throw error;
      }

      console.log('📦 Parcelas retornadas do banco:', todasParcelas);
      console.log('📦 Total de parcelas:', todasParcelas?.length);

      const hoje = new Date();
      
      // Separar parcelas por status (case insensitive para evitar problemas)
      const pendentes = todasParcelas?.filter(p => {
        const statusLower = p.status?.toLowerCase();
        console.log(`Parcela ${p.id}: status = "${p.status}" (lower: "${statusLower}")`);
        return statusLower === 'pendente';
      }) || [];
      
      const pagas = todasParcelas?.filter(p => {
        const statusLower = p.status?.toLowerCase();
        return statusLower === 'pago' || statusLower === 'paga';
      }) || [];
      
      console.log('✅ Parcelas pendentes:', pendentes.length);
      console.log('✅ Parcelas pagas:', pagas.length);
      
      // Identificar parcelas que vencem em até 3 dias ou já estão atrasadas
      const atrasadas = pendentes.filter(parcela => {
        const vencimento = new Date(parcela.data_vencimento);
        const diffDias = Math.floor((vencimento - hoje) / (1000 * 60 * 60 * 24));
        return vencimento < hoje || (diffDias >= 0 && diffDias <= 3);
      });
      
      console.log('⚠️ Parcelas atrasadas:', atrasadas.length);
      
      setParcelas({ pendentes, pagas });
      setParcelasAtrasadas(atrasadas);
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = (parcela) => {
    setSelectedParcela(parcela);
    setIsPaymentModalOpen(true);
  };

  const confirmPayment = async (parcelaId, dataPagamento) => {
    try {
      console.log('💳 Registrando pagamento da parcela:', parcelaId, 'Data:', dataPagamento);

      // Atualizar status da parcela
      const { error: updateError } = await supabase
        .from('parcelas')
        .update({
          status: 'pago',
          data_pagamento: dataPagamento
        })
        .eq('id', parcelaId);

      if (updateError) {
        console.error('❌ Erro ao atualizar parcela:', updateError);
        throw updateError;
      }

  console.log('✅ Pagamento registrado com sucesso!');

      // Recarregar dados
      await fetchParcelas();
  // Notificar parent para atualizar cards/listas
  try { onUpdated && onUpdated(); } catch (_) {}
      
      alert('Pagamento registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao registrar pagamento: ' + error.message);
      throw error;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Alerta de parcelas atrasadas */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Icon name="AlertTriangle" size={28} className="text-yellow-500" />
          <div>
            <div className="font-semibold text-lg text-foreground">
              Prestação de Contas - Parcelas Atrasadas
            </div>
            <div className="text-muted-foreground mt-1">
              {parcelasAtrasadas.length > 0 
                ? `${parcelasAtrasadas.length} parcela(s) em atraso` 
                : 'Nenhuma parcela pendente ou atrasada.'}
            </div>
          </div>
        </div>

        {parcelasAtrasadas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Atraso</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {parcelasAtrasadas
                  .slice(atrasadasPage * 5, atrasadasPage * 5 + 5)
                  .map((parcela) => {
                    const diasAtraso = Math.floor(
                      (new Date() - new Date(parcela.data_vencimento)) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <tr key={parcela.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{parcela.descricao || 'Sem descrição'}</td>
                        <td className="py-3 px-4 font-medium text-red-600">
                          {formatCurrency(parcela.valor)}
                        </td>
                        <td className="py-3 px-4">{formatDate(parcela.data_vencimento)}</td>
                        <td className="py-3 px-4">
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {diasAtraso} dia(s)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => handlePayment(parcela)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                          >
                            <Icon name="CheckCircle" size={16} className="mr-1" />
                            Registrar Pagamento
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {/* Paginação */}
            <div className="flex justify-end items-center mt-2 gap-2">
              <Button
                onClick={() => setAtrasadasPage(p => Math.max(0, p - 1))}
                disabled={atrasadasPage === 0}
                className="px-2 py-1 text-xs"
              >Anterior</Button>
              <span className="text-xs">Página {atrasadasPage + 1} de {Math.ceil(parcelasAtrasadas.length / 5)}</span>
              <Button
                onClick={() => setAtrasadasPage(p => p + 1)}
                disabled={(atrasadasPage + 1) * 5 >= parcelasAtrasadas.length}
                className="px-2 py-1 text-xs"
              >Próxima</Button>
            </div>
          </div>
        )}
      </div>

      {/* Todas as parcelas pendentes */}
      {parcelas.length > 0 && (
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="CreditCard" size={20} className="text-blue-600" />
            <h3 className="font-semibold text-lg text-foreground">Parcelas Pendentes</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Vencimento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map((parcela) => {
                  const isAtrasada = new Date(parcela.data_vencimento) < new Date();
                  
                  return (
                    <tr key={parcela.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{parcela.descricao || 'Sem descrição'}</td>
                      <td className="py-3 px-4 font-medium">
                        {formatCurrency(parcela.valor)}
                      </td>
                      <td className="py-3 px-4">{formatDate(parcela.data_vencimento)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          isAtrasada 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isAtrasada ? 'Atrasada' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handlePayment(parcela)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                        >
                          <Icon name="CheckCircle" size={16} className="mr-1" />
                          Registrar Pagamento
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmação de pagamento */}
      <PaymentConfirmationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        parcela={selectedParcela}
        onConfirm={confirmPayment}
      />
    </>
  );
};

export default ParcelasManager;