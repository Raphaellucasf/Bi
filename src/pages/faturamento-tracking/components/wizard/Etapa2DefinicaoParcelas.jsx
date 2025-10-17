import React, { useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import MaskedCurrencyInput from '../../../../components/ui/MaskedCurrencyInput';
import Icon from '../../../../components/AppIcon';

const Etapa2DefinicaoParcelas = ({ 
  faturamentoData,
  parcelasData, 
  setParcelasData,
  parcelasGeradas,
  gerarParcelasIguais,
  adicionarParcelaPersonalizada,
  removerParcelaPersonalizada,
  atualizarParcelaPersonalizada,
  somaParcelasPersonalizadas,
  isParcelasPersonalizadasValidas,
  onVoltar,
  onSalvar,
  isLoading,
  isValida
}) => {
  // Gerar parcelas automaticamente quando dados mudarem
  useEffect(() => {
    if (parcelasData.modo === 'iguais') {
      gerarParcelasIguais();
    }
  }, [parcelasData.modo, parcelasData.numero_parcelas, parcelasData.data_primeiro_vencimento, gerarParcelasIguais]);

  const handleModoChange = (modo) => {
    setParcelasData(prev => ({
      ...prev,
      modo,
      parcelas_personalizadas: modo === 'personalizadas' && prev.parcelas_personalizadas.length === 0 
        ? [{ id: Date.now(), valor: '', data_vencimento: new Date().toISOString().split('T')[0], descricao: '' }]
        : prev.parcelas_personalizadas
    }));
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Converter valor total corretamente (remover formatação brasileira)
  const valorLimpo = faturamentoData.valor_total
    ? faturamentoData.valor_total.toString().replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
    : '0';
  const valorTotal = parseFloat(valorLimpo) || 0;
  const somaAtual = somaParcelasPersonalizadas();
  const diferenca = valorTotal - somaAtual;

  return (
    <div className="space-y-6">
      {/* Header da Etapa */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Definição das Parcelas
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Passo 2 de 2: Configure como o pagamento será dividido
        </p>
        <div className="mt-2 text-sm text-blue-600 font-medium">
          Valor Total: {formatCurrency(valorTotal)}
        </div>
      </div>

      {/* Seletor de Modo */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleModoChange('iguais')}
          className={`p-4 border-2 rounded-lg transition-all ${
            parcelasData.modo === 'iguais'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Icon name="Grid3X3" size={24} className={`mx-auto mb-2 ${
            parcelasData.modo === 'iguais' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <div className="font-medium">Parcelas Iguais</div>
          <div className="text-xs text-gray-600 mt-1">
            Dividir valor em parcelas de mesmo valor
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleModoChange('personalizadas')}
          className={`p-4 border-2 rounded-lg transition-all ${
            parcelasData.modo === 'personalizadas'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Icon name="Settings" size={24} className={`mx-auto mb-2 ${
            parcelasData.modo === 'personalizadas' ? 'text-blue-600' : 'text-gray-400'
          }`} />
          <div className="font-medium">Personalizado</div>
          <div className="text-xs text-gray-600 mt-1">
            Definir valor e data de cada parcela
          </div>
        </button>
      </div>

      {/* Modo: Parcelas Iguais */}
      {parcelasData.modo === 'iguais' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas *
              </label>
              <Input
                type="number"
                min="1"
                max="60"
                value={parcelasData.numero_parcelas}
                onChange={(e) => setParcelasData(prev => ({
                  ...prev,
                  numero_parcelas: e.target.value === '' ? '' : parseInt(e.target.value)
                }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Primeiro Vencimento *
              </label>
              <Input
                type="date"
                value={parcelasData.data_primeiro_vencimento}
                onChange={(e) => setParcelasData(prev => ({
                  ...prev,
                  data_primeiro_vencimento: e.target.value
                }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Preview das Parcelas Iguais */}
          {parcelasGeradas.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Eye" size={16} />
                Prévia das Parcelas
              </h4>
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {parcelasGeradas.map((parcela, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <span className="font-medium">{parcela.descricao}</span>
                        <div className="text-sm text-gray-600">
                          Vencimento: {formatDate(parcela.data_vencimento)}
                        </div>
                      </div>
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(parcela.valor)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(parcelasGeradas.reduce((sum, p) => sum + p.valor, 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modo: Parcelas Personalizadas */}
      {parcelasData.modo === 'personalizadas' && (
        <div className="space-y-4">
          {/* Status da Soma */}
          <div className={`p-4 rounded-lg border-2 ${
            isParcelasPersonalizadasValidas()
              ? 'border-green-200 bg-green-50'
              : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Soma das Parcelas:</span>
                <span className={`ml-2 font-bold ${
                  isParcelasPersonalizadasValidas() ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {formatCurrency(somaAtual)}
                </span>
              </div>
              <div className={`flex items-center gap-2 ${
                isParcelasPersonalizadasValidas() ? 'text-green-600' : 'text-yellow-600'
              }`}>
                <Icon name={isParcelasPersonalizadasValidas() ? "CheckCircle" : "AlertTriangle"} size={20} />
                {isParcelasPersonalizadasValidas() ? (
                  <span className="text-sm font-medium">Valor correto!</span>
                ) : (
                  <span className="text-sm font-medium">
                    Diferença: {formatCurrency(Math.abs(diferenca))}
                    {diferenca > 0 ? ' faltando' : ' excedendo'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Parcelas Personalizadas */}
          <div className="space-y-3">
            {parcelasData.parcelas_personalizadas.map((parcela, index) => (
              <div key={parcela.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Parcela {index + 1}</h5>
                  {parcelasData.parcelas_personalizadas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerParcelaPersonalizada(parcela.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Valor *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">R$</span>
                      </div>
                      <MaskedCurrencyInput
                        value={parcela.valor}
                        onChange={e => atualizarParcelaPersonalizada(parcela.id, 'valor', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data de Vencimento *
                    </label>
                    <Input
                      type="date"
                      value={parcela.data_vencimento}
                      onChange={(e) => atualizarParcelaPersonalizada(parcela.id, 'data_vencimento', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <Input
                    placeholder={`Parcela ${index + 1}`}
                    value={parcela.descricao}
                    onChange={(e) => atualizarParcelaPersonalizada(parcela.id, 'descricao', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Botão Adicionar Parcela */}
          <button
            type="button"
            onClick={adicionarParcelaPersonalizada}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <Icon name="Plus" size={20} className="mx-auto mb-1" />
            <div className="text-sm font-medium">Adicionar Nova Parcela</div>
          </button>
        </div>
      )}

      {/* Botões de Navegação */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          onClick={onVoltar}
          variant="outline"
          disabled={isLoading}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Voltar
        </Button>

        <Button
          onClick={onSalvar}
          disabled={!isValida() || isLoading}
          className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Icon name="Save" size={16} />
              Salvar Faturamento
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Etapa2DefinicaoParcelas;