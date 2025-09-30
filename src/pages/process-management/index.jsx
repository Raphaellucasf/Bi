
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
import ProcessDetailsModal from './components/ProcessDetailsModal';
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
	const [processes, setProcesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modalLoading, setModalLoading] = useState(false);
	const [editingProcess, setEditingProcess] = useState(null);
	const [escritorioId, setEscritorioId] = useState(null);
	const [deletingId, setDeletingId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Carregar escritório e processos
	useEffect(() => {
		let ignore = false;
		(async () => {
			setLoading(true);
			const eid = await getEscritorioId();
			setEscritorioId(eid);
			if (!eid) { setProcesses([]); setLoading(false); return; }
			const { data } = await supabase.from('processos').select('*').eq('escritorio_id', eid);
			if (!ignore) setProcesses(data || []);
			setLoading(false);
		})();
		return () => { ignore = true; };
	}, []);


	const filtered = processes.filter(p => {
		if (tab === 'Todos' && !search) return true;
		const matchesSearch =
			(p.title || '').toLowerCase().includes(search.toLowerCase()) ||
			(p.client || '').toLowerCase().includes(search.toLowerCase());
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
		if (!escritorioId) return;
		const mapped = {
			title: data.titulo,
			client: data.cliente,
			office: data.escritorio,
			area: data.area,
			numero: data.numero,
			tribunal: data.tribunal,
			priority: data.prioridade,
			status: data.status,
			value: data.valor,
			honorarios: data.honorarios,
			dataInicio: data.dataInicio,
			proximaAudiencia: data.proximaAudiencia,
			juiz: data.juiz,
			descricao: data.descricao,
			type: data.type || 'Outro',
			escritorio_id: escritorioId,
		};
		await supabase.from('processos').insert([mapped]);
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
			title: data.titulo,
			client: data.cliente,
			office: data.escritorio,
			area: data.area,
			numero: data.numero,
			tribunal: data.tribunal,
			priority: data.prioridade,
			status: data.status,
			value: data.valor,
			honorarios: data.honorarios,
			dataInicio: data.dataInicio,
			proximaAudiencia: data.proximaAudiencia,
			juiz: data.juiz,
			descricao: data.descricao,
			type: data.type || 'Outro',
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
		setSelectedProcess(proc);
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
											<div className="text-lg font-semibold text-foreground">{proc.title}</div>
											<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
												<span className="flex items-center gap-1"><Icon name="User" size={16} /> {proc.client}</span>
												<span className="flex items-center gap-1"><Icon name="Building" size={16} /> {proc.office}</span>
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
										<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{proc.priority}</span>
										<span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">{proc.type}</span>
										<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Icon name="MessageCircle" size={14} /> {proc.comments || 0} comentários</span>
									</div>
								</div>
							))}
							{loading && <div className="text-center text-muted-foreground py-8">Carregando...</div>}
							{!loading && filtered.length === 0 && <div className="text-center text-muted-foreground py-8">Nenhum processo encontrado.</div>}
						</div>
					</div>
					{showModal && (
						<NewProcessModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleCreateProcess} loading={modalLoading} />
					)}
					{showEditModal && editingProcess && (
						<NewProcessModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingProcess(null); }} process={editingProcess} isEdit onSave={handleSaveEditProcess} loading={modalLoading} />
					)}
					{showCommentModal && selectedProcess && (
						<CommentModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} process={selectedProcess} />
					)}
					{showDetailsModal && selectedProcess && (
						<ProcessDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} process={selectedProcess} onAddAndamento={handleAddAndamento} />
					)}
				</main>
			</div>
		);
};

export default ProcessManagement;