
import React, { useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const mockClients = [
  {
    id: 1,
    name: 'Lucas Raphael',
    cpf: '230.772.918-60',
    status: 'Ativo',
    type: 'Pessoa Física',
    comments: 2,
    commentsLabel: '2 comentários',
  },
];

const ClientManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Todos');

  const filtered = mockClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
              <p className="text-muted-foreground mt-1">Gerencie todos os seus clientes</p>
            </div>
            <Button variant="default" iconName="UserPlus" iconPosition="left">Novo Cliente</Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Buscar por nome, CPF, RG ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <Icon name="Search" size={18} />
              </span>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              {['Todos', 'Ativos', 'Prospects'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${tab === t ? 'bg-black text-white border-black' : 'bg-white text-black border-border'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Card List */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-2">
            {filtered.map(client => (
              <div key={client.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-foreground">{client.name}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Icon name="FileText" size={16} /> CPF: {client.cpf}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="hover:text-primary"><Icon name="Edit2" size={18} /></button>
                    <button className="hover:text-primary"><Icon name="Eye" size={18} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Ativo</span>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">Pessoa Física</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Icon name="MessageCircle" size={14} /> 2 comentários</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientManagement;