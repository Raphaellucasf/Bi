import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ExportReportModal = ({ isOpen, onClose, onExport }) => {
  const [reportConfig, setReportConfig] = useState({
    periodo: 'mes_atual',
    dataInicio: '',
    dataFim: '',
    incluirResumo: true,
    incluirReceitas: true,
    incluirGastos: true,
    incluirParcelas: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const handlePeriodoChange = (periodo) => {
    const hoje = new Date();
    let dataInicio, dataFim;

    switch (periodo) {
      case 'mes_atual':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'ano_atual':
        dataInicio = new Date(hoje.getFullYear(), 0, 1);
        dataFim = new Date(hoje.getFullYear(), 11, 31);
        break;
      case 'ultimo_mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'customizado':
        // Usuário define as datas
        return;
      default:
        return;
    }

    setReportConfig(prev => ({
      ...prev,
      periodo,
      dataInicio: dataInicio.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0]
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(reportConfig);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const periodosOptions = [
    { value: 'mes_atual', label: 'Mês Atual' },
    { value: 'ultimo_mes', label: 'Último Mês' },
    { value: 'ano_atual', label: 'Ano Atual' },
    { value: 'customizado', label: 'Período Customizado' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Exportar Relatório de Faturamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Seleção de Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período do Relatório
            </label>
            <Select
              value={reportConfig.periodo}
              onChange={(value) => handlePeriodoChange(value)}
              options={periodosOptions}
              className="w-full"
            />
          </div>

          {/* Datas customizadas */}
          {reportConfig.periodo === 'customizado' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={reportConfig.dataInicio}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dataInicio: e.target.value
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <Input
                  type="date"
                  value={reportConfig.dataFim}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    dataFim: e.target.value
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Preview do período selecionado */}
          {reportConfig.dataInicio && reportConfig.dataFim && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Icon name="Info" size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Período Selecionado
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {new Date(reportConfig.dataInicio).toLocaleDateString('pt-BR')} até{' '}
                {new Date(reportConfig.dataFim).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          {/* Opções de conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Conteúdo do Relatório
            </label>
            <div className="space-y-3">
              {[
                { key: 'incluirResumo', label: 'Resumo Executivo', icon: 'BarChart3' },
                { key: 'incluirReceitas', label: 'Detalhamento de Receitas', icon: 'TrendingUp' },
                { key: 'incluirGastos', label: 'Detalhamento de Gastos', icon: 'TrendingDown' },
                { key: 'incluirParcelas', label: 'Status das Parcelas', icon: 'CreditCard' }
              ].map((option) => (
                <label key={option.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportConfig[option.key]}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      [option.key]: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Icon name={option.icon} size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Icon name="Download" size={16} className="text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Formato do Arquivo
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  O relatório será gerado em formato Excel (.xlsx) com abas separadas para cada seção selecionada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isExporting || !reportConfig.dataInicio || !reportConfig.dataFim}
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Gerando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name="Download" size={16} />
                Exportar Relatório
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;