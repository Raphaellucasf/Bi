import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import { supabase } from '../../../services/supabaseClient';

const NovoFaturamentoModal = ({ isOpen, onClose, onSuccess }) => {
  const [faturamento, setFaturamento] = useState({
    cliente_id: '',
    descricao: '',
    valor_total: '',
    data_acordo: new Date().toISOString().split('T')[0],
    forma_pagamento: 'avista',
    numero_parcelas: 1,
    observacoes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      fetchClientes();
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Criar faturamento
      const { data: novoFaturamento, error: faturamentoError } = await supabase
        .from('faturamentos')
        .insert({
          cliente_id: faturamento.cliente_id,
          descricao: faturamento.descricao,
          valor_total: parseFloat(faturamento.valor_total),
          data_acordo: faturamento.data_acordo,
          forma_pagamento: faturamento.forma_pagamento,
          numero_parcelas: parseInt(faturamento.numero_parcelas),
          observacoes: faturamento.observacoes,
          status: 'Ativo'
        })
        .select()
        .single();

      if (faturamentoError) throw faturamentoError;

      // Criar parcelas se pagamento parcelado
      if (faturamento.forma_pagamento === 'parcelado') {
        const valorParcela = parseFloat(faturamento.valor_total) / parseInt(faturamento.numero_parcelas);
        const parcelas = [];

        for (let i = 0; i < parseInt(faturamento.numero_parcelas); i++) {
          const dataVencimento = new Date(faturamento.data_acordo);
          dataVencimento.setMonth(dataVencimento.getMonth() + i + 1);

          parcelas.push({
            faturamento_id: novoFaturamento.id,
            numero_parcela: i + 1,
            valor: valorParcela,
            data_vencimento: dataVencimento.toISOString().split('T')[0],
            status: 'Pendente',
            descricao: `Parcela ${i + 1}/${faturamento.numero_parcelas} - ${faturamento.descricao}`
          });
        }

        const { error: parcelasError } = await supabase
          .from('parcelas')
          .insert(parcelas);

        if (parcelasError) throw parcelasError;
      } else {
        // Se à vista, criar receita imediata
        const { error: receitaError } = await supabase
          .from('receitas')
          .insert({
            faturamento_id: novoFaturamento.id,
            descricao: `Pagamento à vista - ${faturamento.descricao}`,
            valor: parseFloat(faturamento.valor_total),
            data_receita: faturamento.data_acordo,
            categoria: 'Honorários',
            tipo: 'À Vista'
          });

        if (receitaError) throw receitaError;
      }

      // Reset form e fechar modal
      setFaturamento({
        cliente_id: '',
        descricao: '',
        valor_total: '',
        data_acordo: new Date().toISOString().split('T')[0],
        forma_pagamento: 'avista',
        numero_parcelas: 1,
        observacoes: ''
      });

      onSuccess?.();
      onClose();
      alert('Faturamento criado com sucesso!');

    } catch (error) {
      console.error('Erro ao criar faturamento:', error);
      alert('Erro ao criar faturamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formasPagamento = [
    { value: 'avista', label: 'À Vista' },
    { value: 'parcelado', label: 'Parcelado' }
  ];

  const clientesOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: cliente.nome
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Novo Faturamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <Select
              value={faturamento.cliente_id}
              onChange={(value) => setFaturamento(prev => ({ ...prev, cliente_id: value }))}
              options={clientesOptions}
              placeholder="Selecione um cliente"
              className="w-full"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Serviço *
            </label>
            <Input
              value={faturamento.descricao}
              onChange={(e) => setFaturamento(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Ex: Consultoria jurídica, processo trabalhista, etc."
              className="w-full"
              required
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total *
              </label>
              <Input
                type="number"
                step="0.01"
                value={faturamento.valor_total}
                onChange={(e) => setFaturamento(prev => ({ ...prev, valor_total: e.target.value }))}
                placeholder="0,00"
                className="w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Acordo *
              </label>
              <Input
                type="date"
                value={faturamento.data_acordo}
                onChange={(e) => setFaturamento(prev => ({ ...prev, data_acordo: e.target.value }))}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma de Pagamento *
            </label>
            <Select
              value={faturamento.forma_pagamento}
              onChange={(value) => setFaturamento(prev => ({ 
                ...prev, 
                forma_pagamento: value,
                numero_parcelas: value === 'avista' ? 1 : prev.numero_parcelas
              }))}
              options={formasPagamento}
              className="w-full"
            />
          </div>

          {/* Número de Parcelas (se parcelado) */}
          {faturamento.forma_pagamento === 'parcelado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas *
              </label>
              <Input
                type="number"
                min="2"
                max="24"
                value={faturamento.numero_parcelas}
                onChange={(e) => setFaturamento(prev => ({ ...prev, numero_parcelas: e.target.value }))}
                className="w-full"
                required
              />
              {faturamento.valor_total && faturamento.numero_parcelas > 1 && (
                <p className="text-sm text-gray-600 mt-1">
                  Valor por parcela: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(parseFloat(faturamento.valor_total) / parseInt(faturamento.numero_parcelas))}
                </p>
              )}
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={faturamento.observacoes}
              onChange={(e) => setFaturamento(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre o faturamento"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </div>
              ) : (
                'Criar Faturamento'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoFaturamentoModal;