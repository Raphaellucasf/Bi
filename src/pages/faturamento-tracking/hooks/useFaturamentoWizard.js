import { useState, useCallback } from 'react';
import { addMonths } from 'date-fns';

export const useFaturamentoWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados da Etapa 1
  const [faturamentoData, setFaturamentoData] = useState({
    processo_id: '',
    descricao: '',
    valor_total: '',
    data_acordo: new Date().toISOString().split('T')[0]
  });

  // Dados da Etapa 2
  const [parcelasData, setParcelasData] = useState({
    modo: 'iguais', // 'iguais' ou 'personalizadas'
    numero_parcelas: 1,
    data_primeiro_vencimento: new Date().toISOString().split('T')[0],
    parcelas_personalizadas: []
  });

  // Estado derivado - parcelas geradas
  const [parcelasGeradas, setParcelasGeradas] = useState([]);

  // Gerar parcelas iguais
  const gerarParcelasIguais = useCallback(() => {
    if (!faturamentoData.valor_total || !parcelasData.numero_parcelas || !parcelasData.data_primeiro_vencimento) {
      setParcelasGeradas([]);
      return;
    }

    // Converter valor total corretamente (remover formatação brasileira)
    const valorLimpo = faturamentoData.valor_total
      .toString()
      .replace(/[R$\s]/g, '')  // Remove R$ e espaços
      .replace(/\./g, '')       // Remove pontos (separador de milhar)
      .replace(',', '.');       // Substitui vírgula por ponto (decimal)
    const valorTotal = parseFloat(valorLimpo) || 0;
    const numeroParcelas = parseInt(parcelasData.numero_parcelas);
    const dataInicial = new Date(parcelasData.data_primeiro_vencimento);

    // Calcular valor base por parcela
    const valorParcela = Math.floor((valorTotal * 100) / numeroParcelas) / 100;
    const diferenca = valorTotal - (valorParcela * numeroParcelas);

    const parcelas = [];
    for (let i = 0; i < numeroParcelas; i++) {
      const dataVencimento = addMonths(dataInicial, i);
      let valor = valorParcela;
      
      // Ajustar a última parcela com a diferença de arredondamento
      if (i === numeroParcelas - 1) {
        valor += diferenca;
      }

      parcelas.push({
        numero: i + 1,
        valor: Number(valor.toFixed(2)),
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        descricao: `Parcela ${i + 1}/${numeroParcelas}`
      });
    }

    setParcelasGeradas(parcelas);
  }, [faturamentoData.valor_total, parcelasData.numero_parcelas, parcelasData.data_primeiro_vencimento]);

  // Calcular soma das parcelas personalizadas
  const somaParcelasPersonalizadas = useCallback(() => {
    return parcelasData.parcelas_personalizadas.reduce((sum, parcela) => {
      let valorStr = parcela.valor;
      if (typeof valorStr === 'number') {
        valorStr = valorStr.toString();
      }
      if (!valorStr) valorStr = '';
      valorStr = valorStr.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
      return sum + (parseFloat(valorStr) || 0);
    }, 0);
  }, [parcelasData.parcelas_personalizadas]);

  // Validar se soma das parcelas personalizadas está correta
  const isParcelasPersonalizadasValidas = useCallback(() => {
    // Converter valor total corretamente
    const valorLimpo = faturamentoData.valor_total
      .toString()
      .replace(/[R$\s]/g, '')  // Remove R$ e espaços
      .replace(/\./g, '')       // Remove pontos (separador de milhar)
      .replace(',', '.');       // Substitui vírgula por ponto (decimal)
    const valorTotal = parseFloat(valorLimpo) || 0;
    const somaAtual = somaParcelasPersonalizadas();
    return Math.abs(valorTotal - somaAtual) < 0.01; // Tolerância para arredondamento
  }, [faturamentoData.valor_total, somaParcelasPersonalizadas]);

  // Funções para navegar no wizard
  const avancarPasso = () => setCurrentStep(prev => prev + 1);
  const voltarPasso = () => setCurrentStep(prev => prev - 1);
  const resetWizard = () => {
    setCurrentStep(1);
    setFaturamentoData({
      processo_id: '',
      descricao: '',
      valor_total: '',
      data_acordo: new Date().toISOString().split('T')[0]
    });
    setParcelasData({
      modo: 'iguais',
      numero_parcelas: 1,
      data_primeiro_vencimento: new Date().toISOString().split('T')[0],
      parcelas_personalizadas: []
    });
    setParcelasGeradas([]);
    setIsLoading(false);
  };

  // Adicionar parcela personalizada
  const adicionarParcelaPersonalizada = () => {
    setParcelasData(prev => {
      let novaData = new Date().toISOString().split('T')[0];
      if (prev.parcelas_personalizadas.length > 0) {
        const ultima = prev.parcelas_personalizadas[prev.parcelas_personalizadas.length - 1];
        const dataUltima = new Date(ultima.data_vencimento);
        // Adiciona 1 mês
        dataUltima.setMonth(dataUltima.getMonth() + 1);
        novaData = dataUltima.toISOString().split('T')[0];
      }
      return {
        ...prev,
        parcelas_personalizadas: [
          ...prev.parcelas_personalizadas,
          {
            id: Date.now(),
            valor: '',
            data_vencimento: novaData,
            descricao: ''
          }
        ]
      };
    });
  };

  // Remover parcela personalizada
  const removerParcelaPersonalizada = (id) => {
    setParcelasData(prev => ({
      ...prev,
      parcelas_personalizadas: prev.parcelas_personalizadas.filter(p => p.id !== id)
    }));
  };

  // Atualizar parcela personalizada
  const atualizarParcelaPersonalizada = (id, field, value) => {
    setParcelasData(prev => ({
      ...prev,
      parcelas_personalizadas: prev.parcelas_personalizadas.map(p => {
        if (p.id !== id) return p;
        if (field === 'valor') {
          // Sempre salva o valor mascarado (ex: '50.000,00')
          return { ...p, valor: value };
        }
        return { ...p, [field]: value };
      })
    }));
  };

  // Validações
  const isEtapa1Valida = () => {
    return faturamentoData.processo_id && 
           faturamentoData.descricao && 
           faturamentoData.valor_total && 
           parseFloat(faturamentoData.valor_total) > 0 &&
           faturamentoData.data_acordo;
  };

  const isEtapa2Valida = () => {
    if (parcelasData.modo === 'iguais') {
      return parcelasData.numero_parcelas > 0 && 
             parcelasData.data_primeiro_vencimento &&
             parcelasGeradas.length > 0;
    } else {
      return parcelasData.parcelas_personalizadas.length > 0 && 
             isParcelasPersonalizadasValidas();
    }
  };

  return {
    // Estado
    currentStep,
    isLoading,
    faturamentoData,
    parcelasData,
    parcelasGeradas,
    
    // Setters
    setIsLoading,
    setFaturamentoData,
    setParcelasData,
    
    // Funções de navegação
    avancarPasso,
    voltarPasso,
    resetWizard,
    
    // Funções de parcelas
    gerarParcelasIguais,
    adicionarParcelaPersonalizada,
    removerParcelaPersonalizada,
    atualizarParcelaPersonalizada,
    
    // Funções de validação
    isEtapa1Valida,
    isEtapa2Valida,
    isParcelasPersonalizadasValidas,
    somaParcelasPersonalizadas
  };
};