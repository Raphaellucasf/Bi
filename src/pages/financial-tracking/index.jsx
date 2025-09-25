
import React, { useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const FinancialTracking = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0`}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground mt-1">Controle financeiro detalhado do escritório</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-border p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-700">R$ 0,00</p>
                </div>
                <Icon name="TrendingUp" size={28} className="text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-border p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gastos Totais</p>
                  <p className="text-2xl font-bold text-red-700">R$ 0,00</p>
                </div>
                <Icon name="ArrowDownCircle" size={28} className="text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-border p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-green-700">R$ 0,00</p>
                </div>
                <Icon name="DollarSign" size={28} className="text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-border p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold text-blue-700">R$ 0,00</p>
                </div>
                <Icon name="Calendar" size={28} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Alerta de parcelas atrasadas */}
          <div className="bg-white rounded-lg border border-border p-6 flex items-center gap-4 mb-6">
            <Icon name="AlertTriangle" size={28} className="text-yellow-500" />
            <div>
              <div className="font-semibold text-lg text-foreground">Prestação de Contas - Parcelas Atrasadas</div>
              <div className="text-muted-foreground mt-1">Nenhuma parcela pendente ou atrasada.</div>
            </div>
          </div>

          {/* Receitas e Gastos Recentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="TrendingUp" size={20} className="text-green-600" />
                <span className="font-semibold text-lg text-foreground">Receitas Recentes</span>
              </div>
              <div className="text-muted-foreground">Nenhuma receita recente.</div>
            </div>
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="ArrowDownCircle" size={20} className="text-red-600" />
                <span className="font-semibold text-lg text-foreground">Gastos Recentes</span>
              </div>
              <div className="text-muted-foreground">Nenhum gasto recente.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialTracking;