import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentTransactions = ({ refreshKey, onUpdated }) => {
  const [receitas, setReceitas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({ descricao: '', valor: 0, categoria: '' });

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

  const handleEdit = (transaction, type) => {
    setEditingTransaction({ ...transaction, type });
    setEditForm({
      descricao: transaction.descricao || '',
      valor: transaction.valor,
      categoria: transaction.categoria || ''
    });
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      const tableName = type === 'receita' ? 'receitas' : 'gastos';
      
      // Se for parcela, atualizar para pendente ao invés de deletar
      if (type === 'receita' && receitas.find(r => r.id === id)?.categoria === 'Parcela') {
        const { error } = await supabase
          .from('parcelas')
          .update({ status: 'pendente', data_pagamento: null })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }

      alert('Transação excluída com sucesso!');
      await fetchRecentTransactions();
      onUpdated && onUpdated();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir transação: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    try {
      const { type, id } = editingTransaction;
      const tableName = type === 'receita' ? 'receitas' : 'gastos';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          descricao: editForm.descricao,
          valor: parseFloat(editForm.valor),
          categoria: editForm.categoria
        })
        .eq('id', id);

      if (error) throw error;

      alert('Transação atualizada com sucesso!');
      setEditingTransaction(null);
      await fetchRecentTransactions();
      onUpdated && onUpdated();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar transação: ' + error.message);
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

  const TransactionItem = ({ transaction, type }) => {
    const isEditing = editingTransaction?.id === transaction.id && editingTransaction?.type === type;

    if (isEditing) {
      return (
        <div className="py-3 border-b border-gray-100 last:border-b-0 bg-blue-50 px-3 rounded">
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.descricao}
              onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Descrição"
            />
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={editForm.valor}
                onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })}
                className="flex-1 px-2 py-1 border rounded text-sm"
                placeholder="Valor"
              />
              <input
                type="text"
                value={editForm.categoria}
                onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                className="flex-1 px-2 py-1 border rounded text-sm"
                placeholder="Categoria"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setEditingTransaction(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
              >
                <Icon name="Check" size={14} className="mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded group">
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
        <div className="flex items-center gap-3">
          <div className={`font-semibold ${type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'receita' ? '+' : '-'} {formatCurrency(transaction.valor)}
          </div>
          {/* Botões de ação (aparecem no hover) */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {transaction.categoria !== 'Parcela' && (
              <button
                onClick={() => handleEdit(transaction, type)}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Editar"
              >
                <Icon name="Edit" size={16} className="text-blue-600" />
              </button>
            )}
            <button
              onClick={() => handleDelete(transaction.id, type)}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Excluir"
            >
              <Icon name="Trash2" size={16} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
  onUpdated: () => {}
};

export default RecentTransactions;