import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import NewContentBadge from '../../components/ui/NewContentBadge';
import ProcessoPjeModal from '../../components/ui/ProcessoPjeModal';
import Icon from '../../components/AppIcon';
import { detectarPrazo, extrairInfoPrazo, calcularCriticidadePrazo } from '../../utils/prazoDetector';
import { marcarAndamentoComoVisualizado } from '../../services/visualizacaoService';
import './AcompanhamentoProcessual.css';

const AcompanhamentoProcessual = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarProcessos();
  }, []);

  const carregarProcessos = async () => {
    try {
      setLoading(true);
      
      const { data: processosData, error: processosError } = await supabase
        .from('processos')
        .select('*, clientes:cliente_id(nome_completo)')
        .order('created_at', { ascending: false });
      
      if (processosError) {
        console.error('Erro:', processosError);
        return;
      }
      
      const result = await Promise.all(
        (processosData || []).map(async (p) => {
          // Buscar apenas o último andamento (sem duplicatas)
          const { data: ands } = await supabase
            .from('andamentos')
            .select('*')
            .eq('processo_id', p.id)
            .order('data_andamento', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false })
            .limit(1);
          
          const ultimo = ands?.[0];
          
          // Buscar documento mais recente para resumo
          const { data: docs } = await supabase
            .from('documentos')
            .select('resumo_ia, titulo')
            .eq('processo_id', p.id)
            .not('resumo_ia', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1);
          
          // Detectar prazo e extrair informações
          const descricao = ultimo?.descricao || '';
          const temPrazo = detectarPrazo(descricao);
          const infoPrazo = extrairInfoPrazo(descricao);
          const criticidade = temPrazo ? calcularCriticidadePrazo(descricao) : null;
          
          return {
            processo_id: p.id,
            numero_processo: p.numero_processo,
            cliente_nome: p.clientes?.nome_completo,
            titulo: p.titulo,
            orgao_julgador: p.tribunal,
            processo_status: p.status,
            andamento_id: ultimo?.id,
            andamento_titulo: ultimo?.titulo,
            andamento_descricao: ultimo?.descricao,
            data_andamento: ultimo?.data_andamento,
            andamento_fonte: ultimo?.fonte,
            andamento_sincronizado_em: ultimo?.sincronizado_em,
            andamento_visualizado: ultimo?.visualizado,
            resumo_ia: docs?.[0]?.resumo_ia,
            documento_titulo: docs?.[0]?.titulo,
            tem_prazo: temPrazo,
            info_prazo: infoPrazo,
            criticidade_prazo: criticidade,
            created_at: p.created_at
          };
        })
      );
      
      // Ordenar processos pelo andamento mais recente primeiro
      const sortedResult = result.sort((a, b) => {
        const dateA = a.data_andamento || a.created_at;
        const dateB = b.data_andamento || b.created_at;
        return new Date(dateB) - new Date(dateA);
      });
      
      console.log('Processos processados:', sortedResult.length);
      setProcessos(sortedResult);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleAbrirProcesso = async (processo) => {
    setProcessoSelecionado(processo);
    setModalAberto(true);
    
    // Marcar o andamento como visualizado se não foi visualizado ainda
    if (processo.andamento_id && !processo.andamento_visualizado) {
      await marcarAndamentoComoVisualizado(processo.andamento_id);
    }
  };

  return (
    <div className='min-h-screen bg-[#f8f9fb]'>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className={'transition-all duration-300 pt-16 ' + (sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <div className='p-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-foreground mb-2'>🤖 Sincronização PJe</h1>
            <p className='text-muted-foreground'>Processos e andamentos sincronizados automaticamente</p>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
            <div className='bg-white rounded-xl p-4 shadow border border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='bg-blue-100 p-3 rounded-lg'>
                  <Icon name="FileText" size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Total de Processos</p>
                  <p className='text-2xl font-bold'>{processos.length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl p-4 shadow border border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='bg-purple-100 p-3 rounded-lg'>
                  <Icon name="Brain" size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Com Resumo IA</p>
                  <p className='text-2xl font-bold'>{processos.filter(p => p.resumo_ia).length}</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-xl p-4 shadow border border-gray-100'>
              <div className='flex items-center gap-3'>
                <div className='bg-red-100 p-3 rounded-lg'>
                  <Icon name="AlertCircle" size={24} className="text-red-600" />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Com Prazos</p>
                  <p className='text-2xl font-bold'>{processos.filter(p => p.tem_prazo).length}</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'></div>
              <p className='text-muted-foreground'>Carregando processos...</p>
            </div>
          ) : processos.length === 0 ? (
            <div className='text-center py-20 bg-white rounded-xl border border-gray-200'>
              <Icon name="Inbox" size={64} className="mx-auto mb-4 text-gray-300" />
              <p className='text-lg font-medium text-gray-600'>Nenhum processo encontrado</p>
              <p className='text-sm text-muted-foreground mt-2'>Os processos sincronizados aparecerão aqui</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {processos.map((processo, index) => (
                <div 
                  key={index} 
                  onClick={() => handleAbrirProcesso(processo)}
                  className='bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-300 overflow-hidden group'
                >
                  {/* Header do Card com Badge */}
                  <div className='relative h-28 bg-gradient-to-br from-blue-500 to-blue-600 p-4'>
                    <div className='absolute top-3 right-3'>
                      <NewContentBadge 
                        fonte={processo.andamento_fonte}
                        visualizado={processo.andamento_visualizado}
                        sincronizadoEm={processo.andamento_sincronizado_em}
                      />
                    </div>
                    {processo.tem_prazo && (
                      <div className='absolute top-3 left-3'>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
                          ${processo.criticidade_prazo === 'alta' 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : processo.criticidade_prazo === 'media'
                            ? 'bg-orange-500 text-white'
                            : 'bg-yellow-500 text-white'
                          }
                        `}>
                          <Icon name="AlertCircle" size={12} />
                          {processo.criticidade_prazo === 'alta' ? '🔴 URGENTE' : 'PRAZO'}
                        </span>
                      </div>
                    )}
                    <div className='text-white mt-8'>
                      <p className='text-xs font-medium opacity-90'>Processo</p>
                      <p className='text-sm font-bold truncate'>{processo.numero_processo || 'Sem número'}</p>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className='p-4 space-y-3'>
                    {/* Cliente */}
                    <div>
                      <p className='text-xs text-muted-foreground mb-1'>Cliente</p>
                      <p className='text-sm font-semibold text-gray-800 truncate'>
                        {processo.cliente_nome || 'Não informado'}
                      </p>
                    </div>

                    {/* Status e Órgão */}
                    <div className='flex items-center gap-2 text-xs'>
                      <span className='bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium'>
                        {processo.processo_status || 'Ativo'}
                      </span>
                      {processo.andamento_fonte && (
                        <span className='bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium'>
                          {processo.andamento_fonte}
                        </span>
                      )}
                    </div>

                    {/* Último Andamento */}
                    {processo.andamento_descricao && (
                      <div className='border-t pt-3'>
                        <p className='text-xs text-muted-foreground mb-1 flex items-center gap-1'>
                          <Icon name="FileText" size={12} />
                          Último Andamento
                        </p>
                        <p className='text-xs text-gray-700 line-clamp-2'>
                          {processo.andamento_descricao}
                        </p>
                        <div className='flex items-center justify-between mt-2'>
                          {processo.data_andamento && (
                            <p className='text-xs text-muted-foreground'>
                              {new Date(processo.data_andamento).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {processo.info_prazo && (
                            <p className='text-xs font-semibold text-red-600'>
                              ⚠️ {processo.info_prazo.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Resumo IA */}
                    {processo.resumo_ia && (
                      <div className='border-t pt-3 bg-purple-50 -mx-4 -mb-4 px-4 py-3'>
                        <p className='text-xs text-purple-700 font-semibold mb-1 flex items-center gap-1'>
                          <Icon name="Brain" size={12} />
                          Resumo Julia AI
                        </p>
                        <p className='text-xs text-purple-900 line-clamp-2'>
                          {processo.resumo_ia.substring(0, 120)}...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer com ação */}
                  <div className='px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between group-hover:bg-blue-50 transition-colors'>
                    <span className='text-xs text-muted-foreground'>Clique para ver detalhes</span>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Informações do PJe */}
      <ProcessoPjeModal
        processo={processoSelecionado}
        open={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setProcessoSelecionado(null);
          carregarProcessos(); // Recarregar para atualizar badges
        }}
      />
    </div>
  );
};

export default AcompanhamentoProcessual;