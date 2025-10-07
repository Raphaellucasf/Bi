
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../services/supabaseClient';

const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
	const { data: perfis } = await supabase.from('perfis').select('escritorio_id').eq('user_id', user.id).limit(1);
  return perfis && perfis[0]?.escritorio_id;
};

const statusColors = {
	Ativo: 'bg-green-100 text-green-700',
	Pendente: 'bg-yellow-100 text-yellow-700',
	Outro: 'bg-neutral-100 text-neutral-700',
	Média: 'bg-blue-100 text-blue-700',
};

import NewProcessModal from './components/NewProcessModal';
import ProcessoDetalhesModal from './components/ProcessoDetalhesModal';
import CommentModal from './components/CommentModal';



const ProcessManagement = () => {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [search, setSearch] = useState('');
	const [tab, setTab] = useState('Todos');
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [selectedProcess, setSelectedProcess] = useState(null);
	const [selectedProcessId, setSelectedProcessId] = useState(null);
	const [processes, setProcesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [clientNames, setClientNames] = useState({});
	const [clientsLoading, setClientsLoading] = useState(false);
	const [patronoNames, setPatronoNames] = useState({});
	const [escritorioName, setEscritorioName] = useState("");
	const [modalLoading, setModalLoading] = useState(false);
	const [editingProcess, setEditingProcess] = useState(null);
	const [escritorioId, setEscritorioId] = useState(null);
	const [deletingId, setDeletingId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Carregar escritório e processos
	useEffect(() => {
		let ignore = false;
		const fetchData = async () => {
			setLoading(true);
			const eid = await getEscritorioId();
			setEscritorioId(eid);
			if (!eid) { setProcesses([]); setLoading(false); return; }
			// Buscar nome do escritório do usuário
			try {
				const res = await supabase.from('escritorios').select('id, nome').eq('id', eid).single();
				const escrit = res.data;
				if (escrit) setEscritorioName(escrit.nome);
			} catch (err) {}
			// Buscar processos com empresas associadas (join)
			const { data: processos } = await supabase
				.from('processos')
				.select(`*, processos_empresas:processos_empresas (empresa_id, empresa:empresas!empresa_id (*))`)
				.eq('escritorio_id', eid);
			if (!ignore) setProcesses(processos || []);
			setLoading(false);
			// Buscar nomes dos clientes
			if (processos && processos.length > 0) {
				setClientsLoading(true);
				const ids = processos.map(p => p.cliente_id).filter(Boolean);
				if (ids.length > 0) {
					const { data: clientes } = await supabase.from('clientes').select('id, nome_completo').in('id', ids);
					const names = {};
					(clientes || []).forEach(c => { names[c.id] = c.nome_completo; });
					setClientNames(names);
				}
				setClientsLoading(false);
			}
			// Buscar nomes dos patronos
			if (processos && processos.length > 0) {
				try {
					const patronoIds = processos.map(p => p.patrono_id).filter(Boolean);
					if (patronoIds.length > 0) {
						const res = await supabase.from('patrono').select('id, razao_social, nome_fantasia').in('id', patronoIds);
						const patronos = res.data;
						const pnames = {};
						(patronos || []).forEach(p => { pnames[p.id] = p.nome_fantasia || p.razao_social; });
						setPatronoNames(pnames);
					}
				} catch (err) {}
			}
		};
		fetchData();
		return () => { ignore = true; };
	}, []);


	const filtered = processes.filter(p => {
		if (tab === 'Todos' && !search) return true;
		const clientName = clientNames[p.cliente_id] || '';
		const matchesSearch =
			(p.titulo || '').toLowerCase().includes(search.toLowerCase()) ||
			clientName.toLowerCase().includes(search.toLowerCase());
		if (tab === 'Todos') return matchesSearch;
		if (tab === 'Ativos') return matchesSearch && p.status === 'Ativo';
		if (tab === 'Pendentes') return matchesSearch && p.status === 'Pendente';
		return matchesSearch;
	});

	// CRUD Supabase
	const reloadProcesses = async (eid = escritorioId) => {
		setLoading(true);
			const { data } = await supabase.from('processos').select('*').eq('escritorio_id', eid);
		setProcesses(data || []);
		setLoading(false);
	};

	const handleCreateProcess = async (data) => {
		setModalLoading(true);
		if (!escritorioId) {
			setModalLoading(false);
			alert('Escritório não encontrado.');
			return;
		}
		// Validação do cliente_id
		const clienteId = data.cliente && /^[0-9a-fA-F-]{36}$/.test(data.cliente) ? data.cliente : null;
		if (!clienteId) {
			alert('Selecione um cliente válido.');
			setModalLoading(false);
			return;
		}
		const { data: clienteExists } = await supabase.from('clientes').select('id').eq('id', clienteId).single();
		if (!clienteExists) {
			alert('O cliente selecionado não existe.');
			setModalLoading(false);
			return;
		}
		// Mapeia dados do processo
		const mapped = {
			titulo: data.titulo,
			cliente_id: clienteId,
			area_direito: data.area,
			numero_processo: data.numero,
			tribunal: data.tribunal,
			prioridade: data.media || data.prioridade,
			status: data.situacao || data.status,
			valor_causa: data.valor_causa || data.valor,
			honorarios: data.honorarios,
			data_inicio: data.data_inicio || data.dataInicio,
			proxima_audiencia: data.proxima_audiencia || data.proximaAudiencia,
			juiz: data.juiz,
			descricao: data.descricao,
			patrono_id: data.patrono || data.escritorio || null,
			escritorio_id: escritorioId,
		};
		// Insere processo
		const result = await supabase.from('processos').insert([mapped]).select();
		if (result.error || !result.data || !result.data[0]) {
			alert('Erro ao salvar processo: ' + (result.error?.message || result.error?.description || result.error));
			setModalLoading(false);
			return;
		}
		const processoId = result.data[0].id;
		// Vincula empresas (partes contrárias)
		const empresas = Array.isArray(data.partesContrarias) ? data.partesContrarias : [];
		for (const empresa of empresas) {
			// Verifica se empresa já existe pelo CNPJ
			let empresaId;
			const { data: empresasExistentes } = await supabase.from('empresas').select('id').eq('cnpj', empresa.cnpj).limit(1);
			if (empresasExistentes && empresasExistentes.length > 0) {
				empresaId = empresasExistentes[0].id;
			} else {
				// Insere empresa
				const { data: empresaInsert, error: empresaError } = await supabase.from('empresas').insert([
					{
						razao_social: empresa.razaoSocial,
						nome_fantasia: empresa.nomeFantasia,
						cnpj: empresa.cnpj,
						endereco_rfb: empresa.enderecoRfb,
						endereco_trabalho: empresa.enderecoTrabalho,
						advogado: empresa.advogado,
						oab: empresa.oab,
						telefone: empresa.telefone,
						email: empresa.email,
						observacoes: empresa.observacoes
					}
				]).select();
				if (empresaError || !empresaInsert || !empresaInsert[0]) {
					alert('Erro ao salvar empresa: ' + (empresaError?.message || empresaError?.description || empresaError));
					continue;
				}
				empresaId = empresaInsert[0].id;
			}
			// Insere vínculo na tabela de junção
			await supabase.from('processos_empresas').insert([
				{
					processo_id: processoId,
					empresa_id: empresaId
				}
			]);
		}
		setModalLoading(false);
		setShowModal(false);
		reloadProcesses();
	};

	const handleEditProcess = (proc) => {
		setEditingProcess(proc);
		setShowEditModal(true);
	};

	const handleSaveEditProcess = async (data) => {
		setModalLoading(true);
		if (!editingProcess?.id) return;
		const mapped = {
			titulo: data.titulo,
			cliente_id: data.cliente, // deve ser o id do cliente
			area_direito: data.area,
			numero_processo: data.numero,
			tribunal_vara: data.tribunal,
			prioridade: data.prioridade,
			status: data.status,
			valor_causa: data.valor,
			honorarios: data.honorarios,
			data_inicio: data.dataInicio,
		proxima_audiencia: data.proximaAudiencia,
			juiz: data.juiz,
			descricao: data.descricao,
			patrono_id: data.escritorio || null,
		};
			await supabase.from('processos').update(mapped).eq('id', editingProcess.id);
		setModalLoading(false);
		setShowEditModal(false);
		setEditingProcess(null);
		reloadProcesses();
	};

	const handleDeleteProcess = async (proc) => {
		if (!window.confirm('Deseja realmente excluir este processo?')) return;
		setDeletingId(proc.id);
		setDeleteLoading(true);
			await supabase.from('processos').delete().eq('id', proc.id);
		setDeleteLoading(false);
		setDeletingId(null);
		reloadProcesses();
	};

	const handleAddComment = (proc) => {
		setSelectedProcess(proc);
		setShowCommentModal(true);
	};
	const handleShowDetails = (proc) => {
			setSelectedProcessId(proc.id);
			setShowDetailsModal(true);
	};
	// Andamentos (ainda local, migrar depois)
	const handleAddAndamento = (procId, andamento) => {
		// TODO: Integrar com Supabase
		setProcesses(prev => prev.map(p =>
			p.id === procId ? { ...p, andamentos: [...(p.andamentos || []), andamento] } : p
		));
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
								<h1 className="text-3xl font-bold text-foreground">Processos</h1>
								<p className="text-muted-foreground mt-1">Gerencie todos os processos jurídicos</p>
							</div>
							<Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setShowModal(true)}>Novo Processo</Button>
						</div>

						{/* Search and Filters */}
						<div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
							<div className="flex-1 relative">
								<input
									className="w-full rounded-lg border border-border bg-white py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Buscar por título, nº, cliente, escritório, parte contrária..."
									value={search}
									onChange={e => setSearch(e.target.value)}
								/>
								<span className="absolute left-3 top-2.5 text-muted-foreground">
									<Icon name="Search" size={18} />
								</span>
							</div>
							<div className="flex gap-2 mt-2 md:mt-0">
								{['Todos', 'Ativos', 'Pendentes'].map(t => (
									<button
										key={t}
										onClick={() => setTab(t)}
										className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${tab === t ? 'bg-black text-white border-black' : 'bg-white text-black border-border'}`}
									>
										{t}
									</button>
								))}
							</div>
							<div className="ml-auto">
								<select className="rounded-lg border border-border py-2 px-3 text-sm bg-white">
									<option>Todos</option>
								</select>
							</div>
						</div>

						{/* Card List */}
						<div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col gap-2">
							{filtered.map(proc => (
								<div key={proc.id} className="flex flex-col gap-2">
									<div className="flex items-center justify-between">
										<div>
											<div className="text-lg font-semibold text-foreground">{proc.titulo}</div>
											<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
												<span className="flex items-center gap-1"><Icon name="User" size={16} /> {clientNames[proc.cliente_id] || <span className="italic text-gray-400">Cliente não encontrado</span>}</span>
												<span className="flex items-center gap-1"><Icon name="UserCheck" size={16} /> {
													proc.patrono_id ?
														(patronoNames[proc.patrono_id] || <span className="italic text-gray-400">Patrono não encontrado</span>) :
														(escritorioName || <span className="italic text-gray-400">Escritório</span>)
												}</span>
												<span>{proc.andamentos?.length || 0} andamentos</span>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<button className="hover:text-primary" onClick={() => handleEditProcess(proc)}><Icon name="Edit2" size={18} /></button>
											<button className="hover:text-primary" onClick={() => handleAddComment(proc)}><Icon name="MessageCircle" size={18} /></button>
											<button className="hover:text-primary" onClick={() => handleShowDetails(proc)}><Icon name="Eye" size={18} /></button>
											<button
												className={`hover:text-red-600 ${deleteLoading && deletingId === proc.id ? 'opacity-50 pointer-events-none' : ''}`}
												onClick={() => handleDeleteProcess(proc)}
												disabled={deleteLoading && deletingId === proc.id}
												title="Excluir processo"
											>
												<Icon name="Trash2" size={18} />
											</button>
										</div>
									</div>
														<div className="flex flex-wrap gap-2 mt-2">
															<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">{proc.status}</span>
															<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{proc.prioridade}</span>
															<span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">{proc.area_direito}</span>
															<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Icon name="MessageCircle" size={14} /> {proc.comments || 0} comentários</span>
															{/* Empresas associadas (tags) */}
															{Array.isArray(proc.processos_empresas) && proc.processos_empresas.length > 0 && proc.processos_empresas.map((pe, idx) => (
																pe.empresa ? (
																	<span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
																		<Icon name="Building" size={13} />
																		{pe.empresa.razao_social || pe.empresa.nome_fantasia || pe.empresa.cnpj}
																	</span>
																) : null
															))}
														</div>
								</div>
							))}
							{(loading || clientsLoading) && <div className="text-center text-muted-foreground py-8">Carregando...</div>}
							{!loading && !clientsLoading && filtered.length === 0 && <div className="text-center text-muted-foreground py-8">Nenhum processo encontrado.</div>}
						</div>
					</div>
					{showModal && (
						<NewProcessModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleCreateProcess} loading={modalLoading} />
					)}
								{showEditModal && editingProcess && editingProcess.id && (
									<NewProcessModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingProcess(null); }} process={editingProcess} isEdit={true} onSave={handleSaveEditProcess} loading={modalLoading} />
								)}
								{showCommentModal && selectedProcess && (
									<CommentModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} process={selectedProcess} />
								)}
								{showDetailsModal && selectedProcessId && (
									<ProcessoDetalhesModal
										processoId={selectedProcessId}
										open={showDetailsModal}
										onClose={() => setShowDetailsModal(false)}
									/>
								)}
				</main>
			</div>
		);
};

export default ProcessManagement;