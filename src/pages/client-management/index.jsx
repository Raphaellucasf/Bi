


import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import ClientFormModal from './components/ClientFormModal';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';

const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfis } = await supabase.from('perfis').select('escritorio_id').eq('user_id', user.id).limit(1);
  return perfis && perfis[0]?.escritorio_id;
};


const ClientManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Todos');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [escritorioId, setEscritorioId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Carregar escritório e clientes
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      const eid = await getEscritorioId();
      setEscritorioId(eid);
      if (!eid) { setClients([]); setLoading(false); return; }
      const { data } = await supabase.from('clientes').select('*').eq('escritorio_id', eid);
      if (!ignore) setClients(data || []);
      setLoading(false);
    })();
    return () => { ignore = true; };
  }, []);

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf?.toLowerCase().includes(search.toLowerCase())
  );

  // CRUD Handlers
  const openNewClientModal = () => { setEditingClient(null); setModalOpen(true); };
  const openEditClientModal = (client) => { setEditingClient(client); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingClient(null); setModalLoading(false); };

  const reloadClients = async (eid = escritorioId) => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').eq('escritorio_id', eid);
    setClients(data || []);
    setLoading(false);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    setDeletingId(id);
    setDeleteLoading(true);
    await supabase.from('clientes').delete().eq('id', id);
    setDeleteLoading(false);
    setDeletingId(null);
    reloadClients();
  };

  const handleSaveClient = async (form) => {
    setModalLoading(true);
    if (!escritorioId) {
      setModalLoading(false);
      alert('Escritório não encontrado.');
      return;
    }
    let result;
    try {
      if (editingClient && editingClient.id) {
        // Update
        result = await supabase.from('clientes').update({ ...form }).eq('id', editingClient.id);
      } else {
        // Create
        result = await supabase.from('clientes').insert([{ ...form, escritorio_id: escritorioId }]);
      }
      if (result.error) {
        console.error('Erro ao salvar cliente:', result.error);
        alert('Erro ao salvar cliente: ' + (result.error.message || result.error.description || result.error));
      } else {
        closeModal();
        reloadClients();
      }
    } catch (err) {
      console.error('Erro inesperado ao salvar cliente:', err);
      alert('Erro inesperado ao salvar cliente: ' + err.message);
    }
    setModalLoading(false);
  };

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
            <Button variant="default" iconName="UserPlus" iconPosition="left" onClick={openNewClientModal}>Novo Cliente</Button>
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
                    <button className="hover:text-primary" onClick={() => openEditClientModal(client)}><Icon name="Edit2" size={18} /></button>
                    <button className="hover:text-primary"><Icon name="Eye" size={18} /></button>
                    <button
                      className={`hover:text-red-600 ${deleteLoading && deletingId === client.id ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => handleDeleteClient(client.id)}
                      disabled={deleteLoading && deletingId === client.id}
                      title="Excluir cliente"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">{client.status || 'Ativo'}</span>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">{client.type || 'Pessoa Física'}</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Icon name="MessageCircle" size={14} /> 2 comentários</span>
                </div>
              </div>
            ))}
            {loading && <div className="text-center text-muted-foreground py-8">Carregando...</div>}
            {!loading && filtered.length === 0 && <div className="text-center text-muted-foreground py-8">Nenhum cliente encontrado.</div>}
          </div>
        </div>
        <ClientFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          client={editingClient}
          onSave={handleSaveClient}
          loading={modalLoading}
          escritorioId={escritorioId}
        />
      </main>
    </div>
  );
};

export default ClientManagement;