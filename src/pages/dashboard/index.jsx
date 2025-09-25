import React from "react";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

const Dashboard = () => {
  // Mock data for demonstration
  const processosAtivos = 1;
  const totalClientes = 1;
  const prazosFatais = 0;
  const valorTotal = 0;
  const processosRecentes = [
    {
      titulo: "Lucas x chocolate",
      cliente: "Lucas Raphael",
      status: ["Ativo", "Média", "Outro"],
    },
  ];
  const tarefasProximas = [];
  const processosPorArea = [
    { area: "Outro", quantidade: 1, percentual: 100 },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-6 space-y-6">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral do escritório jurídico</p>
            </div>
            <Button variant="default" iconName="Plus" iconPosition="left" className="w-full md:w-auto">Novo Processo</Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="Gift" size={24} className="text-primary" />
                <span className="font-semibold text-gray-700">Processos Ativos</span>
              </div>
              <div className="text-2xl font-bold">{processosAtivos}</div>
              <div className="text-xs text-blue-600">+12% este mês</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="Users" size={24} className="text-success" />
                <span className="font-semibold text-gray-700">Total de Clientes</span>
              </div>
              <div className="text-2xl font-bold">{totalClientes}</div>
              <div className="text-xs text-green-600">+5 novos</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="AlertTriangle" size={24} className="text-warning" />
                <span className="font-semibold text-gray-700">Prazos Fatais</span>
              </div>
              <div className="text-2xl font-bold">{prazosFatais}</div>
              <div className="text-xs text-red-600">Requer atenção</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={24} className="text-purple-600" />
                <span className="font-semibold text-gray-700">Valor Total</span>
              </div>
              <div className="text-2xl font-bold">R$ {valorTotal}</div>
              <div className="text-xs text-purple-600">+8% este mês</div>
            </div>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Processos Recentes */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Icon name="Gift" size={20} /> Processos Recentes
                </h2>
                <Button variant="outline" size="sm">Ver Todos</Button>
              </div>
              {processosRecentes.length > 0 ? (
                processosRecentes.map((proc, idx) => (
                  <div key={idx} className="bg-[#f7f8fa] rounded-lg p-4 flex flex-col gap-2 border border-gray-200 mb-2">
                    <div className="font-medium text-gray-800">{proc.titulo}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Icon name="User" size={14} /> {proc.cliente}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {proc.status.map((s, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-xs font-semibold ${s === 'Ativo' ? 'bg-green-100 text-green-700' : s === 'Média' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">Nenhum processo recente</div>
              )}
            </div>

            {/* Próximas Tarefas */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Icon name="CheckSquare" size={20} /> Próximas Tarefas
                </h2>
                <Button variant="outline" size="sm">Ver Todas</Button>
              </div>
              {tarefasProximas.length > 0 ? (
                tarefasProximas.map((t, idx) => (
                  <div key={idx} className="bg-[#f7f8fa] rounded-lg p-4 flex flex-col gap-2 border border-gray-200 mb-2">
                    <div className="font-medium text-gray-800">{t.titulo}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                  <Icon name="CheckSquare" size={32} className="mb-2" />
                  Nenhuma tarefa próxima
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Processos por Área */}
            <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex flex-col items-center">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Icon name="BalanceScale" size={20} /> Processos por Área
              </h2>
              {/* Donut Chart Placeholder */}
              <div className="w-40 h-40 flex items-center justify-center">
                <svg width="100%" height="100%" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="#e5e7eb" />
                  <path d="M60 10 A50 50 0 1 1 59.99 10" fill="#2563eb" />
                  <circle cx="60" cy="60" r="30" fill="#fff" />
                </svg>
              </div>
              <div className="mt-4 flex flex-col items-center">
                {processosPorArea.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#2563eb' }}></span>
                    {a.area} <span className="text-gray-500">{a.quantidade} ({a.percentual}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;