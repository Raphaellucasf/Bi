import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../services/supabaseClient';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import Icon from '../../../../components/AppIcon';
import MaskedCurrencyInput from '../../../../components/ui/MaskedCurrencyInput';
import MaskedDateInput from '../../../../components/ui/MaskedDateInput';
import Select from '../../../../components/ui/Select';

const Etapa1DadosGerais = ({ 
  faturamentoData, 
  setFaturamentoData, 
  onAvancar, 
  isValida 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processos, setProcessos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProcessos = async (search = '') => {
    try {
      console.log('🔍 Iniciando busca de processos com termo:', search);
      setLoading(true);
      setError('');

      // Simplificando a query para evitar erros de parse
      let query = supabase
        .from('processos')
        .select('id, numero_processo, cliente_id, clientes!inner(id, nome_completo)')
        .eq('status', 'Ativo')
        .limit(100);

      // Aplicando filtros de busca separadamente
      if (search) {
        query = query.ilike('numero_processo', `%${search}%`);
      }

      const { data, error } = await query;

      console.log('📥 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro Supabase:', error);
        setError('Erro ao buscar processos: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Nenhum processo encontrado');
        setProcessos([]);
        return;
      }

      const formattedData = data.map(p => ({
        value: p.id,
        label: `${p.numero_processo} (Cliente: ${p.clientes?.nome_completo || '-'})`
      }));

      console.log('✨ Dados formatados:', formattedData);
      setProcessos(formattedData);

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      setError('Erro inesperado ao buscar processos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Busca inicial de processos
  useEffect(() => {
    fetchProcessos();
  }, []);

  // Busca quando o usuário digita
  const handleSearch = (term) => {
    console.log('🔤 Novo termo de busca:', term);
    setSearchTerm(term);
    fetchProcessos(term);
  };

  const handleInputChange = (field, value) => {
    console.log(`📝 Campo alterado: ${field} =`, value);
    const stringValue = value?.toString() || '';
    setFaturamentoData(prev => ({
      ...prev,
      [field]: stringValue
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}
        <Select
          value={faturamentoData.processo_id || ''}
          onChange={(value) => handleInputChange('processo_id', value)}
          onInputChange={handleSearch}
          options={processos}
          isSearchable={true}
          isClearable={true}
          isLoading={loading}
          placeholder="Digite para buscar por número do processo ou nome do cliente"
          noOptionsMessage={() => "Nenhum processo encontrado"}
          loadingMessage={() => "Buscando processos..."}
          className="w-full"
        />
        {loading && (
          <p className="text-xs text-blue-600 mt-1">
            Buscando processos...
          </p>
        )}
        {!faturamentoData.processo_id && (
          <p className="text-xs text-red-600 mt-1">Campo obrigatório</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição do Serviço *
        </label>
        <Input
          value={faturamentoData.descricao || ''}
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
          value={faturamentoData.valor_total?.toString() || ''}
          onChange={(e) => handleInputChange('valor_total', e.target.value)}
          className="w-full"
          placeholder="R$ 0,00"
        />
        {(!faturamentoData.valor_total || parseFloat(faturamentoData.valor_total || '0') <= 0) && (
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
          value={faturamentoData.data_acordo?.toString() || ''}
          onChange={(e) => handleInputChange('data_acordo', e.target.value)}
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
            <p><strong>Valor Total:</strong> R$ {parseFloat(faturamentoData.valor_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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