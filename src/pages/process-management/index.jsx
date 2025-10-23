import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../services/supabaseClient';
import { formatProperName } from '../../utils/formatters';

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
			// Buscar apenas os 3 processos mais recentes
			const { data: processos } = await supabase
				.from('processos')
				.select(`*, processos_empresas:processos_empresas (empresa_id, empresa:empresas!empresa_id (*))`)
				.eq('escritorio_id', eid)
				.order('updated_at', { ascending: false })
				.order('created_at', { ascending: false })
				.limit(3);
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

	// Search handler: fetch from Supabase when search is not empty
	useEffect(() => {
		const fetchSearchResults = async () => {
			if (!escritorioId || !search.trim()) return;
			setLoading(true);
			const { data: processos } = await supabase
				.from('processos')
				.select(`*, processos_empresas:processos_empresas (empresa_id, empresa:empresas!empresa_id (*))`)
				.eq('escritorio_id', escritorioId)
				.or(`titulo.ilike.%${search}%,numero_processo.ilike.%${search}%`)
				.order('created_at', { ascending: false });
			setProcesses(processos || []);
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
		if (search.trim()) {
			fetchSearchResults();
		} else {
			// If search is cleared, reload only the 3 most recent
			reloadProcesses(escritorioId, true);
		}
	}, [search, escritorioId]);

	// Helper to reload only 3 most recent processes
	const reloadProcesses = async (eid = escritorioId, onlyRecent = false) => {
		setLoading(true);
		let query = supabase
			.from('processos')
			.select(`*, processos_empresas:processos_empresas (empresa_id, empresa:empresas!empresa_id (*))`)
			.eq('escritorio_id', eid);
		if (onlyRecent) {
			query = query.order('updated_at', { ascending: false }).order('created_at', { ascending: false });
			// Removido o .limit(3) para garantir que todas as partes contrárias apareçam
		}
		const { data: processos } = await query;
		setProcesses(processos || []);
		setLoading(false);
	};

	// Filtrar processos por tab (Todos, Ativos, Pendentes)
	const filtered = processes.filter(p => {
		if (tab === 'Todos') return true;
		if (tab === 'Ativos') return p.status === 'Ativo';
		if (tab === 'Pendentes') return p.status === 'Pendente';
		return true;
	});

	// CRUD Supabase
	const handleCreateProcess = async (data) => {
		setModalLoading(true);
		if (!escritorioId) {
			setModalLoading(false);
			alert('Escritório não encontrado.');
			return;
		}
		// Validação do cliente_id
		const clienteId = typeof data.cliente === 'string' ? data.cliente.trim() : data.cliente;
		console.log('DEBUG clienteId:', clienteId);
		if (!clienteId) {
			alert('Selecione um cliente válido.');
			setModalLoading(false);
			return;
		}
		const { data: clienteExists, error: clienteError } = await supabase.from('clientes').select('id').eq('id', clienteId).single();
		console.log('DEBUG clienteExists:', clienteExists, 'error:', clienteError);
		if (!clienteExists) {
			alert('O cliente selecionado não existe.');
			setModalLoading(false);
			return;
		}
		// Função para converter dd/mm/yyyy para yyyy-mm-dd
		function toYMD(dateStr) {
			if (!dateStr) return null;
			if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
			const parts = dateStr.split('/');
			if (parts.length === 3) {
				return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
			}
			return dateStr;
		}
		// Mapeia dados do processo (usando EXATAMENTE os nomes do schema do banco)
		const mapped = {
			numero_processo: data.numero || '', // OBRIGATÓRIO
			cliente_id: clienteId, // OBRIGATÓRIO
			escritorio_id: escritorioId, // OBRIGATÓRIO
			titulo: data.titulo || null,
			area_direito: data.area || null,
			tribunal: data.tribunal || null,
			prioridade: data.media || data.prioridade || null,
			status: (data.situacao && typeof data.situacao === 'string' && data.situacao.trim() !== '' ? data.situacao : (data.status && typeof data.status === 'string' && data.status.trim() !== '' ? data.status : 'Ativo')),
			valor_causa: data.valor_causa ? Number(data.valor_causa) : (data.valor ? Number(data.valor) : null),
			honorarios: data.honorarios || null,
			data_inicio: toYMD(data.data_inicio || data.dataInicio) || null,
			proxima_audiencia: toYMD(data.proxima_audiencia || data.proximaAudiencia) || null,
			juiz: data.juiz || null,
			descricao: data.descricao || null,
			competencia_vara: data.competencia || null,
			ativo: 'Ativo'
			// NÃO inicializa patrono_id aqui - será adicionado apenas se válido
		};
		
		console.log('DEBUG data.patrono recebido:', data.patrono, 'tipo:', typeof data.patrono);
		
		// Só adiciona patrono_id se tiver valor válido e verificar se existe no banco
		if (data.patrono && typeof data.patrono === 'string' && data.patrono.trim() !== '' && /^[0-9a-fA-F-]{36}$/.test(data.patrono.trim())) {
			const patronoId = data.patrono.trim();
			console.log('DEBUG verificando patrono:', patronoId);
			// Verifica se o patrono existe no banco antes de adicionar
			const { data: patronoExists, error: patronoError } = await supabase.from('patrono').select('id').eq('id', patronoId).single();
			console.log('DEBUG patronoExists:', patronoExists, 'error:', patronoError);
			if (patronoExists && !patronoError) {
				mapped.patrono_id = patronoId;
				console.log('DEBUG patrono_id adicionado ao mapped');
			} else {
				console.log('DEBUG patrono NÃO existe ou deu erro, NÃO será adicionado');
			}
		} else {
			console.log('DEBUG patrono vazio ou inválido, NÃO será adicionado');
		}
		
		// Garante que todos os campos opcionais estejam presentes como null se undefined
		Object.keys(mapped).forEach(key => {
			if (mapped[key] === undefined) mapped[key] = null;
		});
		
		// REMOVE o campo patrono_id se for null (para não violar FK)
		if (!mapped.patrono_id || mapped.patrono_id === null) {
			delete mapped.patrono_id;
		}
		
		console.log('DEBUG mapped FINAL para insert:', mapped);
		console.log('DEBUG mapped tem patrono_id?', 'patrono_id' in mapped, mapped.patrono_id);
		// Insere processo
		const result = await supabase.from('processos').insert([mapped]).select();
		console.log('DEBUG insert result:', result);
		console.log('DEBUG insert error detalhado:', JSON.stringify(result.error, null, 2));
		if (result.error || !result.data || !result.data[0]) {
			console.error('ERRO COMPLETO:', result.error);
			alert('Erro ao salvar processo: ' + (result.error?.message || result.error?.details || result.error?.hint || JSON.stringify(result.error)));
			setModalLoading(false);
			return;
		}
		const processoId = result.data[0].id;
		console.log('DEBUG Processo criado com ID:', processoId);
		
		// Vincula empresas (partes contrárias)
		const empresas = Array.isArray(data.partesContrarias) ? data.partesContrarias : [];
		console.log('DEBUG CREATE partesContrarias recebidas:', empresas.length, 'empresas');
		
		for (const empresa of empresas) {
			// Verifica se empresa já existe pelo CNPJ
			let empresaId;
			const { data: empresasExistentes } = await supabase.from('empresas').select('id').eq('cnpj', empresa.cnpj).limit(1);
			if (empresasExistentes && empresasExistentes.length > 0) {
				empresaId = empresasExistentes[0].id;
				console.log('DEBUG empresa já existe, usando empresaId:', empresaId);
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
					console.error('ERRO ao salvar empresa:', empresaError);
					alert('Erro ao salvar empresa: ' + (empresaError?.message || empresaError?.description || empresaError));
					continue;
				}
				empresaId = empresaInsert[0].id;
				console.log('DEBUG empresa criada, empresaId:', empresaId);
			}
			// Insere vínculo na tabela de junção, garantindo que o processoId está correto
			if (processoId && empresaId) {
				const linkRes = await supabase.from('processos_empresas').insert([
					{
						processo_id: processoId,
						empresa_id: empresaId
					}
				]).select();
				console.log('DEBUG link processo-empresa:', linkRes);
				if (linkRes.error) {
					console.error('ERRO ao vincular empresa ao processo:', linkRes.error);
				} else {
					console.log('DEBUG Vínculo criado com sucesso:', { processo_id: processoId, empresa_id: empresaId });
				}
			}
		}
		setModalLoading(false);
		setShowModal(false);
		// After create, reload only 3 most recent
		await reloadProcesses(escritorioId, true);
	};

	const handleEditProcess = (proc) => {
		setEditingProcess(proc);
		setShowEditModal(true);
	};

	const handleSaveEditProcess = async (data) => {
		setModalLoading(true);
		if (!editingProcess?.id) return;
		const mapped = {
			numero_processo: data.numero || '', // OBRIGATÓRIO
			cliente_id: data.cliente, // OBRIGATÓRIO
			escritorio_id: escritorioId, // OBRIGATÓRIO
			titulo: data.titulo || null,
			area_direito: data.area || null,
			tribunal: data.tribunal || null,
			prioridade: data.prioridade || null,
			status: data.status || data.situacao || 'Ativo',
			valor_causa: data.valor ? Number(data.valor) : null,
			honorarios: data.honorarios || null,
			data_inicio: data.dataInicio || null,
			proxima_audiencia: data.proximaAudiencia || null,
			juiz: data.juiz || null,
			descricao: data.descricao || null,
			competencia_vara: data.competencia || null,
		};
		
		console.log('DEBUG EDIT data.patrono recebido:', data.patrono, 'tipo:', typeof data.patrono);

		// Vincula empresas (partes contrárias) - sempre processa, mesmo que vazia
		console.log('DEBUG EDIT partesContrarias recebidas:', data.partesContrarias);
		
		// Remove vínculos existentes primeiro (sempre)
		const { error: deleteError } = await supabase
			.from('processos_empresas')
			.delete()
			.eq('processo_id', editingProcess.id);
		
		if (deleteError) {
			console.error('ERRO ao remover vínculos existentes:', deleteError);
		} else {
			console.log('DEBUG Vínculos antigos removidos com sucesso');
		}

		// Adiciona novos vínculos se houver empresas
		if (Array.isArray(data.partesContrarias) && data.partesContrarias.length > 0) {
			console.log('DEBUG Adicionando', data.partesContrarias.length, 'novas empresas');
			for (const empresa of data.partesContrarias) {
				let empresaId;
				const { data: empresasExistentes } = await supabase
					.from('empresas')
					.select('id')
					.eq('cnpj', empresa.cnpj)
					.limit(1);

				if (empresasExistentes && empresasExistentes.length > 0) {
					empresaId = empresasExistentes[0].id;
				} else {
					// Insere nova empresa
							 console.log('DEBUG Inserting new empresa:', empresa);
							 const { data: novaEmpresa, error: insertError } = await supabase
								 .from('empresas')
								 .insert([{
									 cnpj: empresa.cnpj,
									 razao_social: empresa.razaoSocial,
									 nome_fantasia: empresa.nomeFantasia,
									 endereco_rfb: empresa.enderecoRfb,
									 endereco_trabalho: empresa.enderecoTrabalho,
									 advogado: empresa.advogado,
									 oab: empresa.oab,
									 telefone: empresa.telefone,
									 email: empresa.email,
									 observacoes: empresa.observacoes
								 }])
						.select('id')
						.limit(1);

					if (insertError) {
						console.error('ERRO ao inserir empresa:', insertError);
						continue;
					}
					empresaId = novaEmpresa[0].id;
				}

				// Vincula empresa ao processo
					 console.log('DEBUG Linking empresa:', empresaId, 'to processo:', editingProcess.id);
				const { error: linkError } = await supabase
					.from('processos_empresas')
					.insert([{
						processo_id: editingProcess.id,
						empresa_id: empresaId
					}]);

				if (linkError) {
					console.error('ERRO ao vincular empresa ao processo:', linkError);
						 console.error('Details:', { processo_id: editingProcess.id, empresa_id: empresaId });
				} else {
					console.log('DEBUG Vínculo criado com sucesso:', { processo_id: editingProcess.id, empresa_id: empresaId });
				}
			}
		} else {
			console.log('DEBUG Nenhuma empresa para adicionar (partesContrarias vazio ou undefined)');
		}
		
		// Só adiciona patrono_id se for um UUID válido e verificar se existe no banco
		if (data.patrono && typeof data.patrono === 'string' && data.patrono.trim() !== '' && /^[0-9a-fA-F-]{36}$/.test(data.patrono.trim())) {
			const patronoId = data.patrono.trim();
			console.log('DEBUG EDIT verificando patrono:', patronoId);
			const { data: patronoExists, error: patronoError } = await supabase.from('patrono').select('id').eq('id', patronoId).single();
			console.log('DEBUG EDIT patronoExists:', patronoExists, 'error:', patronoError);
			if (patronoExists && !patronoError) {
				mapped.patrono_id = patronoId;
				console.log('DEBUG EDIT patrono_id adicionado ao mapped');
			} else {
				console.log('DEBUG EDIT patrono NÃO existe ou deu erro, NÃO será adicionado');
			}
		} else {
			console.log('DEBUG EDIT patrono vazio ou inválido, NÃO será adicionado');
		}
		
		Object.keys(mapped).forEach(key => {
			if (mapped[key] === undefined) mapped[key] = null;
		});
		
		// REMOVE o campo patrono_id se for null (para não violar FK)
		if (!mapped.patrono_id || mapped.patrono_id === null) {
			delete mapped.patrono_id;
		}
		
		console.log('DEBUG update mapped:', mapped);
		const result = await supabase.from('processos').update(mapped).eq('id', editingProcess.id).select();
		console.log('DEBUG update result:', result);
		if (result.error) {
			console.error('Erro ao atualizar processo:', result.error);
			alert('Erro ao atualizar processo: ' + result.error.message);
			setModalLoading(false);
			return;
		}
		
		if (!result.data || result.data.length === 0) {
			console.error('Processo atualizado mas nenhum dado retornado (possível problema de RLS)');
			alert('Processo atualizado mas não foi possível confirmar. Verifique as permissões.');
		} else {
			console.log('DEBUG Processo atualizado com sucesso:', result.data[0]);
		}
		
		setModalLoading(false);
		setShowEditModal(false);
		setEditingProcess(null);
		await reloadProcesses(escritorioId, true);
	};

	const handleDeleteProcess = async (proc) => {
		if (!window.confirm('Deseja realmente excluir este processo?')) return;
		setDeletingId(proc.id);
		setDeleteLoading(true);
		await supabase.from('processos').delete().eq('id', proc.id);
		setDeleteLoading(false);
		setDeletingId(null);
		// After delete, reload only 3 most recent
		await reloadProcesses(escritorioId, true);
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
											<div className="text-lg font-semibold text-foreground">{formatProperName(proc.titulo)}</div>
											<div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
												<span className="flex items-center gap-1"><Icon name="User" size={16} /> {clientNames[proc.cliente_id] ? formatProperName(clientNames[proc.cliente_id]) : <span className="italic text-gray-400">Cliente não encontrado</span>}</span>
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
																		{formatProperName(pe.empresa.razao_social || pe.empresa.nome_fantasia || pe.empresa.cnpj)}
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