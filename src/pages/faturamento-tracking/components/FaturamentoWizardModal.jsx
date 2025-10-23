import React from 'react';
import { supabase } from '../../../services/supabaseClient';
import { useFaturamentoWizard } from '../hooks/useFaturamentoWizard';
import Etapa1DadosGerais from './wizard/Etapa1DadosGerais';
import Etapa2DefinicaoParcelas from './wizard/Etapa2DefinicaoParcelas';
import Icon from '../../../components/AppIcon';

const FaturamentoWizardModal = ({ isOpen, onClose, onSuccess }) => {
  const wizard = useFaturamentoWizard();

  const handleSalvar = async () => {
    wizard.setIsLoading(true);

    try {
      console.log('📝 Iniciando salvamento de faturamento...');
      
      // Validar dados do faturamento
      if (!wizard.faturamentoData.processo_id) {
        throw new Error('Processo não selecionado');
      }

      // Preparar dados do faturamento
      const formatDate = (dateStr) => {
        console.log('🔍 Formatando data:', dateStr);
        
        if (!dateStr) {
          console.warn('⚠️ Data vazia ou undefined');
          return null;
        }

        // Se já estiver no formato YYYY-MM-DD, retorna como está
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          console.log('✅ Data já está no formato correto:', dateStr);
          return dateStr;
        }

        // Se estiver no formato DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          const [day, month, year] = dateStr.split('/');
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log('✅ Data formatada com sucesso:', formattedDate);
          return formattedDate;
        }

        console.error('❌ Formato de data inválido:', dateStr);
        throw new Error(`Formato de data inválido: ${dateStr}`);
      };

      console.log('📝 Dados brutos do faturamento:', wizard.faturamentoData);

      // Validações básicas
      if (!wizard.faturamentoData.data_acordo) {
        throw new Error('Data do acordo não informada');
      }

      // Converter e validar valor total
      let valorFaturamento;
      try {
        valorFaturamento = wizard.faturamentoData.valor_total 
          ? parseFloat(wizard.faturamentoData.valor_total.toString().replace(/[^\d.,]/g, '').replace(',', '.'))
          : 0;
        
        if (isNaN(valorFaturamento)) {
          throw new Error('Valor não é um número válido');
        }
      } catch (error) {
        console.error('❌ Erro ao converter valor total:', error);
        throw new Error('Valor total inválido: ' + error.message);
      }

      // Converter e validar data
      let dataAcordo;
      try {
        dataAcordo = formatDate(wizard.faturamentoData.data_acordo);
        if (!dataAcordo) {
          throw new Error('Data do acordo inválida');
        }
      } catch (error) {
        console.error('❌ Erro ao converter data do acordo:', error);
        throw new Error('Data do acordo inválida: ' + error.message);
      }

      const faturamentoPayload = {
        processo_id: wizard.faturamentoData.processo_id,
        descricao: wizard.faturamentoData.descricao || '',
        valor_total: valorFaturamento,
        data_acordo: dataAcordo,
        status: 'Ativo',
        numero_de_parcelas: wizard.parcelasData.modo === 'iguais' 
          ? wizard.parcelasData.numero_parcelas 
          : wizard.parcelasData.parcelas_personalizadas.length
      };

      console.log('📅 Data do acordo formatada:', faturamentoPayload.data_acordo);

      console.log('📦 Dados do faturamento:', faturamentoPayload);

      // Preparar dados das parcelas
      let parcelasPayload = [];
      
      console.log('🔍 Modo de parcelas:', wizard.parcelasData.modo);
      console.log('🔍 Parcelas personalizadas:', wizard.parcelasData.parcelas_personalizadas);
      console.log('🔍 Parcelas geradas (iguais):', wizard.parcelasGeradas);
      
      if (wizard.parcelasData.modo === 'iguais') {
        parcelasPayload = wizard.parcelasGeradas.map((parcela, index) => {
          // Converter valor corretamente (remover formatação brasileira)
          let valorStr = parcela.valor?.toString() || '0';
          valorStr = valorStr
            .replace(/[R$\s]/g, '')  // Remove R$ e espaços
            .replace(/\./g, '')       // Remove pontos (separador de milhar)
            .replace(',', '.');       // Substitui vírgula por ponto (decimal)
          const valor = parseFloat(valorStr) || 0;

          // Converter e validar data de vencimento
          let dataVencimento;
          try {
            console.log(`🔍 Processando data da parcela ${index + 1}:`, parcela.data_vencimento);
            dataVencimento = formatDate(parcela.data_vencimento);
            if (!dataVencimento) {
              throw new Error(`Data de vencimento inválida na parcela ${index + 1}`);
            }
          } catch (error) {
            console.error(`❌ Erro ao processar data da parcela ${index + 1}:`, error);
            throw new Error(`Erro na data de vencimento da parcela ${index + 1}: ${error.message}`);
          }

          return {
            numero_parcela: parcela.numero,
            valor: valor,
            data_vencimento: dataVencimento,
            status: 'pendente',
            descricao: parcela.descricao || `Parcela ${index + 1}`
          };
        });
      } else {
        parcelasPayload = wizard.parcelasData.parcelas_personalizadas.map((parcela, index) => {
          // O valor já vem como número puro do MaskedCurrencyInput (ex: "50000")
          let valorStr = parcela.valor?.toString() || '0';
          console.log(`💰 Parcela ${index + 1} - Valor original:`, parcela.valor);
          console.log(`💰 Parcela ${index + 1} - Valor como string:`, valorStr);
          
          // Se vier com formatação, limpa; se vier puro, apenas converte
          valorStr = valorStr
            .replace(/[R$\s]/g, '')  // Remove R$ e espaços
            .replace(/\./g, '')       // Remove pontos (separador de milhar)
            .replace(',', '.');       // Substitui vírgula por ponto (decimal)
          
          const valor = parseFloat(valorStr) || 0;
          console.log(`💰 Parcela ${index + 1} - Valor limpo:`, valorStr);
          console.log(`💰 Parcela ${index + 1} - Valor final convertido:`, valor);

          // Converter e validar data de vencimento
          let dataVencimento;
          try {
            dataVencimento = formatDate(parcela.data_vencimento);
            if (!dataVencimento) {
              throw new Error(`Data de vencimento inválida na parcela personalizada ${index + 1}`);
            }
          } catch (error) {
            throw new Error(`Erro na data de vencimento da parcela personalizada ${index + 1}: ${error.message}`);
          }

          return {
            numero_parcela: index + 1,
            valor: valor,
            data_vencimento: dataVencimento,
            status: 'pendente',
            descricao: parcela.descricao || `Parcela ${index + 1}`
          };
        });
      }

      console.log('📦 Dados das parcelas:', parcelasPayload);

      // Validar valores
      const totalParcelas = parcelasPayload.reduce((sum, parcela) => sum + parcela.valor, 0);
      const valorTotal = faturamentoPayload.valor_total;

      if (Math.abs(totalParcelas - valorTotal) > 0.01) {
        throw new Error(`Soma das parcelas (${totalParcelas}) difere do valor total (${valorTotal})`);
      }

      // Tentar salvar primeiro manualmente, sem RPC
      console.log('💾 Iniciando salvamento manual...');
      const resultado = await criarFaturamentoManual(faturamentoPayload, parcelasPayload);
      console.log('✅ Faturamento salvo com sucesso:', resultado);
      
      // Sucesso - resetar wizard e fechar
      wizard.resetWizard();
      onSuccess?.();
      onClose();
      
      // Notificação de sucesso
      alert('Faturamento criado com sucesso!');

    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
      alert('Erro ao salvar faturamento. Tente novamente.');
    } finally {
      wizard.setIsLoading(false);
    }
  };

  // Função para criar faturamento manualmente
  const criarFaturamentoManual = async (faturamentoData, parcelasData) => {
    console.log('🏁 Iniciando criação manual do faturamento...');

    // Criar faturamento
    const { data: novoFaturamento, error: faturamentoError } = await supabase
      .from('faturamentos')
      .insert([faturamentoData])
      .select()
      .single();

    if (faturamentoError) {
      console.error('❌ Erro ao criar faturamento:', faturamentoError);
      throw new Error(`Erro ao criar faturamento: ${faturamentoError.message}`);
    }

    console.log('✅ Faturamento criado com sucesso:', novoFaturamento);

    // Criar parcelas
    const parcelasComFaturamentoId = parcelasData.map(parcela => ({
      ...parcela,
      faturamento_id: novoFaturamento.id
    }));

    console.log('📝 Criando parcelas:', parcelasComFaturamentoId);

    const { data: parcelasInseridas, error: parcelasError } = await supabase
      .from('parcelas')
      .insert(parcelasComFaturamentoId)
      .select();

    if (parcelasError) {
      console.error('❌ Erro ao criar parcelas:', parcelasError);
      
      // Tentar deletar o faturamento se as parcelas falharem
      await supabase
        .from('faturamentos')
        .delete()
        .eq('id', novoFaturamento.id);
        
      throw new Error(`Erro ao criar parcelas: ${parcelasError.message}`);
    }

    console.log('✅ Parcelas criadas com sucesso:', parcelasInseridas);

    return novoFaturamento;
  };

  const handleClose = () => {
    if (!wizard.isLoading) {
      wizard.resetWizard();
      onClose();
    }
  };

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  // Renderiza o modal
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" 
      onClick={handleClose}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Novo Faturamento
            </h2>
            
            {/* Indicador de Progresso */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizard.currentStep >= 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${
                wizard.currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizard.currentStep >= 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={wizard.isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {wizard.currentStep === 1 && (
            <Etapa1DadosGerais
              faturamentoData={wizard.faturamentoData}
              setFaturamentoData={wizard.setFaturamentoData}
              onAvancar={wizard.avancarPasso}
              isValida={wizard.isEtapa1Valida}
            />
          )}

          {wizard.currentStep === 2 && (
            <Etapa2DefinicaoParcelas
              faturamentoData={wizard.faturamentoData}
              parcelasData={wizard.parcelasData}
              setParcelasData={wizard.setParcelasData}
              parcelasGeradas={wizard.parcelasGeradas}
              gerarParcelasIguais={wizard.gerarParcelasIguais}
              adicionarParcelaPersonalizada={wizard.adicionarParcelaPersonalizada}
              removerParcelaPersonalizada={wizard.removerParcelaPersonalizada}
              atualizarParcelaPersonalizada={wizard.atualizarParcelaPersonalizada}
              somaParcelasPersonalizadas={wizard.somaParcelasPersonalizadas}
              isParcelasPersonalizadasValidas={wizard.isParcelasPersonalizadasValidas}
              onVoltar={wizard.voltarPasso}
              onSalvar={handleSalvar}
              isLoading={wizard.isLoading}
              isValida={wizard.isEtapa2Valida}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FaturamentoWizardModal;