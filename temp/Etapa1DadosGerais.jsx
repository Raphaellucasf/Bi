import React from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Icon from '../../../../components/AppIcon';
import MaskedCurrencyInput from '../../../../components/ui/MaskedCurrencyInput';
import MaskedDateInput from '../../../../components/ui/MaskedDateInput';

const Etapa1DadosGerais = ({ 
  faturamentoData, 
  setFaturamentoData, 
  onAvancar, 
  isValida 
}) => {
  const handleInputChange = (field, value) => {
    setFaturamentoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Dados Gerais do Faturamento
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Passo 1 de 2: Defina as informações básicas do acordo
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Processo Associado *
        </label>
        <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Busca de processos temporariamente indisponível
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição do Serviço *
        </label>
        <Input
          value={faturamentoData.descricao}
          onChange={(e) => handleInputChange('descricao', e.target.value)}
          placeholder="Ex: Honorários advocatícios, consultoria jurídica..."
          className="w-full"
        />
        {!faturamentoData.descricao && (
          <p className="text-xs text-red-600 mt-1">Campo obrigatório</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valor Total do Acordo *
        </label>
        <MaskedCurrencyInput
          value={faturamentoData.valor_total}
          onChange={(value) => handleInputChange('valor_total', value)}
          className="w-full"
          placeholder="R$ 0,00"
        />
        {(!faturamentoData.valor_total || parseFloat(faturamentoData.valor_total) <= 0) && (
          <p className="text-xs text-red-600 mt-1">
            Informe um valor maior que zero
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data do Acordo *
        </label>
        <MaskedDateInput
          value={faturamentoData.data_acordo}
          onChange={(value) => handleInputChange('data_acordo', value)}
          className="w-full"
          placeholder="DD/MM/AAAA"
        />
        {!faturamentoData.data_acordo && (
          <p className="text-xs text-red-600 mt-1">Campo obrigatório</p>
        )}
      </div>

      {isValida() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Info" size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Resumo dos Dados
            </span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Valor Total:</strong> R$ {parseFloat(faturamentoData.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p><strong>Data:</strong> {new Date(faturamentoData.data_acordo).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={onAvancar}
          disabled={!isValida()}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Icon name="ArrowRight" size={16} className="mr-2" />
          Avançar para Parcelas
        </Button>
      </div>
    </div>
  );
};

export default Etapa1DadosGerais;