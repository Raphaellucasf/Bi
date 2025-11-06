import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import ClientFormModal from './components/ClientFormModal';
import ClientDetailsModal from './components/ClientDetailsModal';
import ClientCard from './components/ClientCard';
import ClientListItem from './components/ClientListItem';
import { useMemo } from 'react';
import Button from '../../components/ui/Button';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import { formatProperName } from '../../utils/formatters';
import Icon from '../../components/AppIcon';
import { useCache } from '../../hooks/useOptimization';

const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfis } = await supabase.from('perfis').select('escritorio_id').eq('user_id', user.id).limit(1);
  return perfis && perfis[0]?.escritorio_id;
};

/**
 * 🚀 Funções de fetch para useCache
 * Encapsulam a lógica de busca do Supabase
 */
const fetchRecentClients = async (escritorioId) => {
  if (!escritorioId) return [];
  
  const { data } = await supabase
    .from('clientes')
    .select('id, nome_completo, cpf_cnpj, tipo_pessoa, status, escritorio_id')
    .eq('escritorio_id', escritorioId)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3);
  
  return data || [];
};

const ClientManagement = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Recentes');
  const [allClients, setAllClients] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [detailsClient, setDetailsClient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [escritorioId, setEscritorioId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🚀 USANDO useCache PARA CLIENTES RECENTES (cache de 5 minutos)
  const { 
    data: clients, 
    loading, 
    refetch: refetchClients 
  } = useCache(
    `clientes-recentes-${escritorioId}`,
    () => fetchRecentClients(escritorioId),
    5 * 60 * 1000 // 5 minutos de cache
  );

  // Carregar escritório inicial
  useEffect(() => {
    let ignore = false;
    (async () => {
      const eid = await getEscritorioId();
      if (!ignore) {
        setEscritorioId(eid);
        
        if (!eid) {
          setAllClients([]);
          setTotalPages(1);
          return;
        }
        
        // Buscar todos os clientes para tab 'Todos' (paginado)
        const { data: allData, count } = await supabase
          .from('clientes')
          .select('id, nome_completo, cpf_cnpj, escritorio_id', { count: 'exact' })
          .eq('escritorio_id', eid)
          .order('nome_completo', { ascending: true })
          .range(0, 29);
        
        if (!ignore) {
          setAllClients(allData || []);
          setTotalPages(count ? Math.ceil(count / 30) : 1);
        }
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Busca e paginação
  useEffect(() => {
    if (tab === 'Todos') {
      // Busca paginada para aba 'Todos'
      const fetchAllClients = async () => {
        if (!escritorioId) return;
        
        setAllLoading(true);
        const from = (page - 1) * 30;
        const to = from + 29;
        
        const { data, count } = await supabase
          .from('clientes')
          .select('id, nome_completo, cpf_cnpj, escritorio_id', { count: 'exact' })
          .eq('escritorio_id', escritorioId)
          .order('nome_completo', { ascending: true })
          .range(from, to);
        
        setAllClients(data || []);
        setTotalPages(count ? Math.ceil(count / 30) : 1);
        setAllLoading(false);
      };
      fetchAllClients();
    }
    // Para tab Recentes/Ativos, o useCache já cuida automaticamente
  }, [search, escritorioId, tab, page]);

  // Filtrar clientes por tab (Recentes, Ativos)
  const filtered = (clients || []).filter(c => {
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
    // 🚀 Atualizar cache após delete
    await refetchClients();
  };

  // 🚀 Navegar para edição de processo
  const handleEditProcess = (process) => {
    // Navega para a página de processos com o processo selecionado para edição
    navigate('/process-management', { state: { editProcess: process } });
  };

  // 🚀 Navegar para detalhes do processo
  const handleViewProcessDetails = (process) => {
    // Navega para a página de processos com o processo selecionado para visualização
    navigate('/process-management', { state: { viewProcess: process } });
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
        // 🚀 Atualizar cache após save
        await refetchClients();
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
                <ClientCard
                  key={client.id}
                  cliente={client}
                  onEdit={openEditClientModal}
                  onShowDetails={openDetailsModal}
                  onDelete={handleDeleteClient}
                  isDeleting={deleteLoading && deletingId === client.id}
                />
              ))}
              {loading && <div className="text-center text-muted-foreground py-8">Carregando...</div>}
              {!loading && filtered.length === 0 && <div className="text-center text-muted-foreground py-8">Nenhum cliente encontrado.</div>}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-2">
              {allClients.map(client => (
                <ClientListItem key={client.id} cliente={client} />
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
            onEditProcess={handleEditProcess}
            onViewProcessDetails={handleViewProcessDetails}
          />
        )}

      </main>
    </div>
  );
};

export default ClientManagement;