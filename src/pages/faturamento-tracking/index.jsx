
import React, { useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import FaturamentoSummaryCards from './components/FaturamentoSummaryCards';
import AcoesPendentes from './components/AcoesPendentes';
import ParcelasManager from './components/ParcelasManager';
import FluxoCaixa from './components/FluxoCaixa';
import PrevisaoFutura from './components/PrevisaoFutura';
import ExportReportModal from './components/ExportReportModal';
import FaturamentoWizardModal from './components/FaturamentoWizardModal';
import GastoModal from './components/GastoModal';
import { generateFaturamentoReport } from '../../services/reportService';

const FaturamentoTracking = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFaturamentoModalOpen, setIsFaturamentoModalOpen] = useState(false);
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleExportReport = async (config) => {
    try {
      await generateFaturamentoReport(config);
      setIsExportModalOpen(false);
      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  };

  const handleFaturamentoSuccess = () => {
    setRefreshKey(prev => prev + 1); // Força refresh dos componentes
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0`}>
        <div className="p-6">
          {/* Header com botões de ação */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Faturamento</h1>
              <p className="text-muted-foreground mt-1">Controle de faturamento detalhado do escritório</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsGastoModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Icon name="TrendingDown" size={18} className="mr-2" />
                Registrar Novo Gasto
              </Button>
              <Button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Icon name="Download" size={18} className="mr-2" />
                Exportar Relatório
              </Button>
              <Button
                onClick={() => setIsFaturamentoModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Lançar Novo Faturamento
              </Button>
            </div>
          </div>

          {/* Cards de resumo de faturamento */}
          <FaturamentoSummaryCards refreshKey={refreshKey} />

          {/* Ações Pendentes */}
          <AcoesPendentes 
            refreshKey={refreshKey} 
            onUpdated={() => setRefreshKey((k) => k + 1)} 
          />

          {/* Gerenciador de parcelas */}
          <ParcelasManager
            refreshKey={refreshKey}
            onUpdated={() => setRefreshKey((k) => k + 1)}
          />

          {/* Fluxo de Caixa Unificado */}
          <FluxoCaixa refreshKey={refreshKey} />

          {/* Previsão Futura */}
          <PrevisaoFutura refreshKey={refreshKey} />
        </div>
      </main>

      {/* Modal de exportação */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportReport}
      />

      {/* Modal de novo faturamento */}
      <FaturamentoWizardModal
        isOpen={isFaturamentoModalOpen}
        onClose={() => setIsFaturamentoModalOpen(false)}
        onSuccess={handleFaturamentoSuccess}
      />

      {/* Modal de novo gasto */}
      <GastoModal
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        onSuccess={handleFaturamentoSuccess}
      />
    </div>
  );
};

export default FaturamentoTracking;