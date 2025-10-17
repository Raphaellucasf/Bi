


import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import ClientFormModal from './components/ClientFormModal';
import { useMemo } from 'react';
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
  const [detailsClient, setDetailsClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
      // Fetch only the 3 most recent clients
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('escritorio_id', eid)
        .order('created_at', { ascending: false })
        .limit(3);
      if (!ignore) setClients(data || []);
      setLoading(false);
    })();
    return () => { ignore = true; };
  }, []);

  // Search handler: fetch from Supabase when search is not empty
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!escritorioId || !search.trim()) return;
      setLoading(true);
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('escritorio_id', escritorioId)
        .or(`nome_completo.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`)
        .order('created_at', { ascending: false });
      setClients(data || []);
      setLoading(false);
    };
    if (search.trim()) {
      fetchSearchResults();
    } else {
      // If search is cleared, reload only the 3 most recent
      reloadClients(escritorioId, true);
    }
  }, [search, escritorioId]);

  // Helper to reload only 3 most recent clients
  const reloadClients = async (eid = escritorioId, onlyRecent = false) => {
    setLoading(true);
    let query = supabase.from('clientes').select('*').eq('escritorio_id', eid);
    if (onlyRecent) {
      query = query.order('created_at', { ascending: false }).limit(3);
    }
    const { data } = await query;
    setClients(data || []);
    setLoading(false);
  };

  // Filtrar clientes por tab (Todos, Ativos, Prospects)
  const filtered = clients.filter(c => {
    if (tab === 'Todos') return true;
    if (tab === 'Ativos') return c.status === 'Ativo';
    if (tab === 'Prospects') return c.status === 'Prospect';
    return true;
  });

  // CRUD Handlers
  const openNewClientModal = () => { setEditingClient(null); setModalOpen(true); };
  const openEditClientModal = (client) => { setEditingClient(client); setModalOpen(true); };
  const openDetailsModal = (client) => { setDetailsClient(client); setShowDetailsModal(true); };
  const closeDetailsModal = () => { setDetailsClient(null); setShowDetailsModal(false); };
  const closeModal = () => { setModalOpen(false); setEditingClient(null); setModalLoading(false); };

  // Helper to reload only 3 most recent clients (see above)

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    setDeletingId(id);
    setDeleteLoading(true);
    await supabase.from('clientes').delete().eq('id', id);
    setDeleteLoading(false);
    setDeletingId(null);
    // After delete, reload only 3 most recent
    reloadClients(escritorioId, true);
  };

  function formatDateToYMD(dateStr) {
    if (!dateStr) return "";
    // Accepts dd/mm/yyyy or yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    return dateStr;
  }

  const handleSaveClient = async (form) => {
    setModalLoading(true);
    if (!escritorioId) {
      setModalLoading(false);
      alert('Escritório não encontrado.');
      return;
    }
    // Formatar datas para YYYY-MM-DD, enviar null se vazio
    const formatOrNull = (dateStr) => {
      const val = formatDateToYMD(dateStr);
      return val === "" ? null : val;
    };
    const formToSave = {
      ...form,
      data_nascimento: formatOrNull(form.data_nascimento),
      data_entrevista: formatOrNull(form.data_entrevista)
    };
    let result;
    try {
      if (editingClient && editingClient.id) {
        // Update
  result = await supabase.from('clientes').update({ ...formToSave }).eq('id', editingClient.id);
      } else {
        // Create
  result = await supabase.from('clientes').insert([{ ...formToSave, escritorio_id: escritorioId }]);
      }
      if (result.error) {
        console.error('Erro ao salvar cliente:', result.error);
        alert('Erro ao salvar cliente: ' + (result.error.message || result.error.description || result.error));
      } else {
        closeModal();
        // After save, reload only 3 most recent
        reloadClients(escritorioId, true);
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
                    <div className="text-lg font-semibold text-foreground">{client.nome_completo}</div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Icon name="FileText" size={16} /> {client.tipo_pessoa === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF'}: {client.cpf_cnpj}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="hover:text-primary" onClick={() => openEditClientModal(client)}><Icon name="Edit2" size={18} /></button>
                    <button className="hover:text-primary" onClick={() => openDetailsModal(client)}><Icon name="Eye" size={18} /></button>
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
                  <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">{client.tipo_pessoa || 'Pessoa Física'}</span>
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
        {showDetailsModal && detailsClient && (
          <ClientDetailsModal
            client={detailsClient}
            onClose={closeDetailsModal}
          />
        )}

      </main>
    </div>
  );
};


// Modal de detalhes do cliente
const ClientDetailsModal = ({ client, onClose }) => {
  const getFirstNames = nome => nome?.split(' ').slice(0,2).join(' ');
  const comentarios = useMemo(() => [
    { tipo: 'Ligação', texto: 'eu quero chocolate', data: '16/09/2025 17:25' },
    { tipo: 'Reunião', texto: 'Primeiro cliente e teste', data: '16/09/2025 17:25' }
  ], []);
  const processos = useMemo(() => [
    { id: 1, titulo: 'Processo 1', numero: '12345', status: 'Ativo' },
    { id: 2, titulo: 'Processo 2', numero: '67890', status: 'Pendente' }
  ], []);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl relative">
        <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold mb-2">{getFirstNames(client.nome_completo)}</h2>
        <div className="flex gap-6 mb-4">
          <div className="flex-1 bg-gray-50 rounded p-4">
            <div className="font-semibold mb-2">Informações Pessoais</div>
            <div className="mb-1">CPF: <span className="font-bold">{client.cpf_cnpj}</span></div>
            <div className="mb-1">Telefone: <span className="font-bold">{client.telefone_celular}</span></div>
            <div className="mb-1">Email: <span className="font-bold">{client.email}</span></div>
          </div>
          <div className="flex-1 bg-gray-50 rounded p-4">
            <div className="font-semibold mb-2">Processos</div>
            {processos.length === 0 ? <div className="text-muted-foreground">Nenhum processo</div> : (
              <ul className="space-y-2">
                {processos.map(proc => (
                  <li key={proc.id} className="bg-blue-50 rounded p-2 flex justify-between items-center cursor-pointer hover:bg-blue-100" onClick={() => alert('Abrir processo ' + proc.id)}>
                    <div>
                      <div className="font-semibold">{proc.titulo}</div>
                      <div className="text-xs text-muted-foreground">Nº {proc.numero} - {proc.status}</div>
                    </div>
                    <Icon name="Eye" size={16} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-2">Comentários ({comentarios.length})</div>
          <div className="space-y-2">
            {comentarios.map((c, i) => (
              <div key={i} className="border rounded p-2 flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${c.tipo === 'Ligação' ? 'bg-yellow-100 text-yellow-700' : c.tipo === 'Reunião' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.tipo}</span>
                <span className="flex-1">{c.texto}</span>
                <span className="text-xs text-muted-foreground">{c.data}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;