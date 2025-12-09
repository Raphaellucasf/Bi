import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import './AcompanhamentoProcessual.css';

const AcompanhamentoProcessual = () => {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      
      console.log('Total de processos:', processosData?.length);
      
      const result = await Promise.all(
        (processosData || []).map(async (p) => {
          const { data: ands } = await supabase
            .from('andamentos')
            .select('*')
            .eq('processo_id', p.id)
            .order('data_andamento', { ascending: false, nullsFirst: false });
          
          const ultimo = ands?.[0];
          
          return {
            processo_id: p.id,
            numero_processo: p.numero_processo,
            cliente_nome: p.clientes?.nome_completo,
            titulo: p.titulo,
            orgao_julgador: p.tribunal,
            processo_status: p.status,
            andamento_titulo: ultimo?.titulo,
            andamento_descricao: ultimo?.descricao,
            data_andamento: ultimo?.data_andamento,
            andamento_fonte: ultimo?.fonte,
            andamento_sincronizado_em: ultimo?.sincronizado_em,
            created_at: p.created_at
          };
        })
      );
      
      console.log('Processos processados:', result.length);
      setProcessos(result);
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

  return (
    <div className='min-h-screen bg-background'>
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className={'transition-all duration-300 pt-16 ' + (sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        <div className='acompanhamento-container'>
          <div className='acompanhamento-header'>
            <h1>📋 Acompanhamento Processual PJe</h1>
            <p>Processos sincronizados automaticamente do sistema PJe</p>
          </div>
          {loading ? (
            <div className='acompanhamento-loading'>
              <div className='spinner'></div>
              <p>Carregando processos...</p>
            </div>
          ) : (
            <div className='acompanhamento-content'>
              <div className='processos-stats'>
                <div className='stat-card'>
                  <span className='stat-label'>Total de Processos</span>
                  <span className='stat-value'>{processos.length}</span>
                </div>
              </div>
              {processos.length === 0 ? (
                <div className='empty-state'>
                  <p>Nenhum processo encontrado.</p>
                  <p className='empty-hint'>Verifique o console para mais informações.</p>
                </div>
              ) : (
                <div className='processos-list'>
                  {processos.map((processo, index) => (
                    <div key={index} className='processo-card'>
                      <div className='processo-header'>
                        <div>
                          <h3>{processo.numero_processo || 'Sem número'}</h3>
                          {processo.titulo && <p className='processo-titulo'>{processo.titulo}</p>}
                        </div>
                        {processo.andamento_fonte && (
                          <span className={'fonte-badge ' + processo.andamento_fonte}>
                            {processo.andamento_fonte}
                          </span>
                        )}
                      </div>

                      {processo.cliente_nome && (
                        <div className='processo-info'>
                          <strong>Cliente:</strong> {processo.cliente_nome}
                        </div>
                      )}

                      {processo.orgao_julgador && (
                        <div className='processo-info'>
                          <strong>Órgão:</strong> {processo.orgao_julgador}
                        </div>
                      )}

                      {processo.processo_status && (
                        <div className='processo-info'>
                          <strong>Status:</strong> 
                          <span className={'status-badge ' + processo.processo_status}>
                            {processo.processo_status}
                          </span>
                        </div>
                      )}

                      {processo.andamento_titulo && (
                        <div className='processo-detail'>
                          <strong>Último Andamento:</strong>
                          <p>{processo.andamento_titulo}</p>
                          {processo.andamento_descricao && (
                            <p className='descricao'>{processo.andamento_descricao.substring(0, 200)}{processo.andamento_descricao.length > 200 ? '...' : ''}</p>
                          )}
                          {processo.data_andamento && (
                            <span className='data-andamento'>
                              {formatDate(processo.data_andamento)}
                            </span>
                          )}
                        </div>
                      )}

                      <div className='processo-footer'>
                        {processo.andamento_sincronizado_em && (
                          <span className='sync-time'>
                            🔄 Sincronizado: {formatDate(processo.andamento_sincronizado_em)}
                          </span>
                        )}
                        {processo.created_at && (
                          <span className='created-time'>
                            Criado: {formatDate(processo.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AcompanhamentoProcessual;