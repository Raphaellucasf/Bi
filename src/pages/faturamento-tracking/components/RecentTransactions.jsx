import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';

const RecentTransactions = ({ refreshKey }) => {
  const [receitas, setReceitas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, [refreshKey]);

  const fetchRecentTransactions = async () => {
    try {
      setIsLoading(true);

      
      // A tabela receitas pode não existir; se falhar, buscar parcelas pagas como receitas
      let receitasData = [];
      try {
        const { data, error: receitasError } = await supabase
          .from('receitas')
          .select('*')
          .order('data_receita', { ascending: false })
          .limit(5);

        if (!receitasError && data) {
          receitasData = data;
        } else {
        }
      } catch (err) {
      }

      if (!receitasData || receitasData.length === 0) {
        try {
          const { data: parcelasPagas, error: parcelasError } = await supabase
            .from('parcelas')
            .select('id, descricao, valor, data_pagamento, status')
            .eq('status', 'pago')
            .order('data_pagamento', { ascending: false })
            .limit(5);
          if (!parcelasError && parcelasPagas) {
            // Mapear para o formato esperado por TransactionItem
            receitasData = parcelasPagas.map(p => ({
              id: p.id,
              descricao: p.descricao || 'Recebimento de parcela',
              valor: p.valor,
              data_receita: p.data_pagamento,
              categoria: 'Parcela'
            }));
          }
        } catch (err) {
        }
      }


      // Buscar gastos recentes (últimos 5)
      let gastosData = [];
      try {
        const { data, error: gastosError } = await supabase
          .from('gastos')
          .select('*')
          .order('data_gasto', { ascending: false })
          .limit(5);

        if (gastosError) {
        } else {
          gastosData = data || [];
        }
      } catch (err) {
      }


      setReceitas(receitasData);
      setGastos(gastosData);
    } catch (error) {
    } finally {
      setIsLoading(false);
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

  const TransactionItem = ({ transaction, type }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">
          {transaction.descricao || 'Sem descrição'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatDate(transaction[type === 'receita' ? 'data_receita' : 'data_gasto'])}
          </span>
          {transaction.categoria && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {transaction.categoria}
            </span>
          )}
        </div>
      </div>
      <div className={`font-semibold ${type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
        {type === 'receita' ? '+' : '-'} {formatCurrency(transaction.valor)}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-border p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Receitas Recentes */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="TrendingUp" size={20} className="text-green-600" />
          <span className="font-semibold text-lg text-foreground">Receitas Recentes</span>
        </div>
        
        {receitas.length > 0 ? (
          <div className="space-y-1">
            {receitas.map((receita) => (
              <TransactionItem 
                key={receita.id} 
                transaction={receita} 
                type="receita" 
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            <Icon name="Inbox" size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Nenhuma receita recente.</p>
          </div>
        )}
      </div>

      {/* Gastos Recentes */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="ArrowDownCircle" size={20} className="text-red-600" />
          <span className="font-semibold text-lg text-foreground">Gastos Recentes</span>
        </div>
        
        {gastos.length > 0 ? (
          <div className="space-y-1">
            {gastos.map((gasto) => (
              <TransactionItem 
                key={gasto.id} 
                transaction={gasto} 
                type="gasto" 
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            <Icon name="Inbox" size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Nenhum gasto recente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

RecentTransactions.defaultProps = {
  refreshKey: 0,
};

export default RecentTransactions;