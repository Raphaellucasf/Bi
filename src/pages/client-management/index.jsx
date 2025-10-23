


import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import ClientFormModal from './components/ClientFormModal';
import ClientDetailsModal from './components/ClientDetailsModal';
import { useMemo } from 'react';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import { formatProperName } from '../../utils/formatters';
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
  const [tab, setTab] = useState('Recentes');
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      if (!eid) {
        setClients([]);
        setAllClients([]);
        setTotalPages(1);
        return;
      }
      if (!eid) {
        setClients([]);
        return;
      }
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_completo, escritorio_id')
        .eq('escritorio_id', eid)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);
      if (!ignore) setClients(data || []);
      // Fetch all clients for 'Todos' tab (paginated, alphabetical)
      if (!eid) {
        setAllClients([]);
        setTotalPages(1);
        return;
      }
      const { data: allData, count, error: allError } = await supabase
        .from('clientes')
        .select('id, nome_completo, cpf_cnpj, escritorio_id', { count: 'exact' })
        .eq('escritorio_id', eid)
        .order('nome_completo', { ascending: true })
        .range(0, 29);
      if (!ignore) {
        setAllClients(allData || []);
        setTotalPages(count ? Math.ceil(count / 30) : 1);
      }
      setLoading(false);
    })();
    return () => { ignore = true; };
  }, []);

  // Search handler: fetch from Supabase when search is not empty
  useEffect(() => {
    if (tab === 'Todos') {
      // Paginated fetch for all clients
      const fetchAllClients = async () => {
        setAllLoading(true);
        const from = (page - 1) * 30;
        const to = from + 29;
        if (!eid) {
          setAllClients([]);
          setTotalPages(1);
          setAllLoading(false);
          return;
        }
        if (!eid) {
          setAllClients([]);
          setTotalPages(1);
          setAllLoading(false);
          return;
        }
        const { data, count, error } = await supabase
          .from('clientes')
          .select('id, nome_completo, cpf_cnpj, escritorio_id', { count: 'exact' })
          .eq('escritorio_id', eid)
          .order('nome_completo', { ascending: true })
          .range(from, to);
        setAllClients(data || []);
        setTotalPages(count ? Math.ceil(count / 30) : 1);
        setAllLoading(false);
      };
      fetchAllClients();
    } else {
      const fetchSearchResults = async () => {
        if (!escritorioId || !search.trim()) return;
        setLoading(true);
        if (!escritorioId) {
          setClients([]);
          setLoading(false);
          return;
        }
        if (!escritorioId) {
          setClients([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome_completo, cpf_cnpj, tipo_pessoa, status, escritorio_id')
          .eq('escritorio_id', escritorioId)
          .or(`nome_completo.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false });
        setClients(data || []);
        setLoading(false);
      };
      if (search.trim()) {
        fetchSearchResults();
      } else {
        reloadClients(escritorioId, true);
      }
    }
  }, [search, escritorioId, tab, page]);

  // Helper to reload only 3 most recent clients
  const reloadClients = async (eid = escritorioId, onlyRecent = false) => {
    setLoading(true);
    let query = supabase.from('clientes').select('id, nome_completo, cpf_cnpj, tipo_pessoa, status, escritorio_id').eq('escritorio_id', eid);
    if (onlyRecent) {
      query = query.order('updated_at', { ascending: false }).order('created_at', { ascending: false }).limit(3);
    }
    const { data } = await query;
    setClients(data || []);
    setLoading(false);
  };

  // Filtrar clientes por tab (Recentes, Ativos)
  const filtered = clients.filter(c => {
    if (tab === 'Recentes') return true;
    if (tab === 'Ativos') return c.status === 'Ativo';
    return true;
  });

  // CRUD Handlers
  const openNewClientModal = () => { setEditingClient(null); setModalOpen(true); };
  const openEditClientModal = (client) => { setEditingClient(client); setModalOpen(true); };
  const openDetailsModal = async (client) => {
    // Buscar dados completos do cliente antes de abrir o modal
    const { data: fullClient, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', client.id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar dados do cliente:', error);
      alert('Erro ao carregar dados do cliente');
      return;
    }
    
    setDetailsClient(fullClient);
    setShowDetailsModal(true);
  };
  const closeDetailsModal = () => { setDetailsClient(null); setShowDetailsModal(false); };
  const closeModal = () => { setModalOpen(false); setEditingClient(null); setModalLoading(false); };

  // Helper to reload only 3 most recent clients (see above)

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;
    setDeletingId(clientId);
    setDeleteLoading(true);
    await supabase.from('clientes').delete().eq('id', clientId);
    setDeleteLoading(false);
    setDeletingId(null);
    // After delete, reload only 3 most recent
    await reloadClients(escritorioId, true);
  };  function formatDateToYMD(dateStr) {
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
        result = await supabase.from('clientes').update({ ...formToSave, updated_at: new Date().toISOString() }).eq('id', editingClient.id);
      } else {
        // Create
        result = await supabase.from('clientes').insert([
          {
            ...formToSave,
            escritorio_id: escritorioId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
      if (result.error) {
        alert('Erro ao salvar cliente: ' + (result.error.message || result.error.description || result.error));
      } else {
        closeModal();
        // After save, reload only 3 most recent
        await reloadClients(escritorioId, true);
      }
    } catch (err) {
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
              {['Recentes', 'Ativos', 'Todos'].map(t => (
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
          {tab !== 'Todos' ? (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-2">
              {filtered.map(client => (
                <div key={client.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-foreground">{formatProperName(client.nome_completo)}</div>
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
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-2">
              {allClients.map(client => (
                <div key={client.id} className="flex flex-row items-center justify-between py-2 border-b last:border-b-0">
                  <span className="font-medium text-foreground">{formatProperName(client.nome_completo)}</span>
                  <span className="text-muted-foreground">{client.cpf_cnpj}</span>
                </div>
              ))}
              {allLoading && <div className="text-center text-muted-foreground py-8">Carregando...</div>}
              {!allLoading && allClients.length === 0 && <div className="text-center text-muted-foreground py-8">Nenhum cliente encontrado.</div>}
              {/* Paginação */}
              <div className="flex justify-center mt-4 gap-2">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="secondary">Anterior</Button>
                <span className="px-3 py-1 text-sm">Página {page} de {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage(page + 1)} variant="secondary">Próxima</Button>
              </div>
            </div>
          )}
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

export default ClientManagement;