import React, { useState } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const mockProcesses = [
	{
		id: 1,
		title: 'Lucas x chocolate',
		client: 'Lucas Raphael',
		office: 'MF Advocacia',
		comments: 2,
		status: 'Ativo',
		priority: 'Média',
		type: 'Outro',
		value: 0,
		tags: ['Ativo', 'Média', 'Outro'],
		commentsLabel: '2 comentários',
	},
];

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

	const filtered = mockProcesses.filter(p =>
		p.title.toLowerCase().includes(search.toLowerCase()) ||
		p.client.toLowerCase().includes(search.toLowerCase())
	);

	// Handlers para abrir modais
	const handleEditProcess = (proc) => {
		setSelectedProcess(proc);
		setShowEditModal(true);
	};
	const handleAddComment = (proc) => {
		setSelectedProcess(proc);
		setShowCommentModal(true);
	};
	const handleShowDetails = (proc) => {
		setSelectedProcess(proc);
		setShowDetailsModal(true);
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
											<span>0</span>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<button className="hover:text-primary" onClick={() => handleEditProcess(proc)}><Icon name="Edit2" size={18} /></button>
										<button className="hover:text-primary" onClick={() => handleAddComment(proc)}><Icon name="MessageCircle" size={18} /></button>
										<button className="hover:text-primary" onClick={() => handleShowDetails(proc)}><Icon name="Eye" size={18} /></button>
									</div>
								</div>
								<div className="flex flex-wrap gap-2 mt-2">
									<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Ativo</span>
									<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Média</span>
									<span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">Outro</span>
									<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Icon name="MessageCircle" size={14} /> 2 comentários</span>
								</div>
							</div>
						))}
					</div>
				</div>
				{showModal && (
					<NewProcessModal isOpen={showModal} onClose={() => setShowModal(false)} />
				)}
				{showEditModal && (
					<NewProcessModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} process={selectedProcess} isEdit />
				)}
				{showCommentModal && (
					<CommentModal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} process={selectedProcess} />
				)}
				{showDetailsModal && (
					<ProcessDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} process={selectedProcess} />
				)}
			</main>
		</div>
	);
};

export default ProcessManagement;