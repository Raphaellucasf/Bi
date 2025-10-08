import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabaseClient";
import Button from "../../../components/ui/Button";
import AndamentoModal from "./AndamentoModal";


function ProcessoDetalhesModal({ processoId, open, onClose }) {
  const [showAndamentoModal, setShowAndamentoModal] = useState(false);
  const [aba, setAba] = useState(0);
  const [processo, setProcesso] = useState(null);
  const [andamentos, setAndamentos] = useState([]);
  const [partesContrarias, setPartesContrarias] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [documentos, setDocumentos] = useState([]);

  useEffect(() => {
    if (!processoId || !open) return;
    // Detalhes + cliente
    supabase
      .from('processos')
      .select('*, clientes(*)')
      .eq('id', processoId)
      .single()
      .then(({ data }) => setProcesso(data));
    // Andamentos
    supabase.from('andamentos').select('*').eq('processo_id', processoId).order('data', { ascending: false }).then(({ data }) => setAndamentos(data || []));
    // Financeiro
    supabase.from('receitas').select('*').eq('processo_id', processoId).then(({ data }) => setReceitas(data || []));
    supabase.from('gastos').select('*').eq('processo_id', processoId).then(({ data }) => setGastos(data || []));
    // Documentos
    supabase.from('documentos').select('*').eq('processo_id', processoId).then(({ data }) => setDocumentos(data || []));
  }, [processoId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto my-8 p-8 relative">
        <button
          className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-black"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-4">Detalhes do Processo</h2>
        <div className="flex border-b mb-4">
          {['Detalhes', 'Andamentos', 'Partes Contrárias', 'Financeiro', 'Documentos'].map((tab, idx) => (
            <button key={tab} className={`px-4 py-2 ${aba === idx ? 'border-b-2 border-blue-600 font-bold' : ''}`} onClick={() => setAba(idx)}>{tab}</button>
          ))}
        </div>
        <div className="py-2">
          {aba === 0 && (
            <div>
              {/* Detalhes */}
              {processo === null ? (
                <div>Carregando...</div>
              ) : !processo ? (
                <div className="text-red-600 font-semibold">Processo não encontrado.</div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">{processo.status}</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{processo.prioridade}</span>
                    <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">{processo.area_direito}</span>
                    {/* Empresas associadas (tags) */}
                    {Array.isArray(processo.processos_empresas) && processo.processos_empresas.length > 0 && processo.processos_empresas.map((pe, idx) => (
                      pe.empresa ? (
                        <span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          🏢 {pe.empresa.razao_social || pe.empresa.nome_fantasia || pe.empresa.cnpj}
                        </span>
                      ) : null
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded p-4">
                      <div className="font-bold mb-2 flex items-center gap-2">👤 Informações do Cliente</div>
                      <div><span className="font-semibold">Nome:</span> {processo.clientes?.nome_completo || processo.clientes?.nome || '-'}</div>
                      <div><span className="font-semibold">CPF/CNPJ:</span> {processo.clientes?.cpf_cnpj || '-'}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-4">
                      <div className="font-bold mb-2 flex items-center gap-2">💼 Detalhes do Processo</div>
                      <div><span className="font-semibold">Nº Processo:</span> {processo.numero_processo || processo.numero || '-'}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {aba === 1 && (
            <div>
              {/* Andamentos */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Andamentos</h3>
                <Button onClick={() => setShowAndamentoModal(true)}>+ Novo Andamento</Button>
              </div>
              {andamentos.length === 0 ? (
                <div className="text-muted-foreground">Nenhum andamento cadastrado.</div>
              ) : (
                <ul className="space-y-2">
                  {andamentos.map(a => (
                    <li key={a.id} className="border p-2 rounded bg-white">
                      <div><strong>Data:</strong> {a.data_final}</div>
                      <div><strong>Título:</strong> {a.titulo}</div>
                      <div><strong>Tipo:</strong> {a.tipo}</div>
                      <div><strong>Descrição:</strong> {a.descricao}</div>
                    </li>
                  ))}
                </ul>
              )}
              <AndamentoModal
                open={showAndamentoModal}
                onClose={() => setShowAndamentoModal(false)}
                processoId={processoId}
                onSave={async andamento => {
                  // Salvar no Supabase
                  await supabase.from('andamentos').insert([andamento]);
                  setShowAndamentoModal(false);
                  // Atualizar lista
                  const { data } = await supabase.from('andamentos').select('*').eq('processo_id', processoId).order('data_final', { ascending: true });
                  setAndamentos(data || []);
                }}
              />
            </div>
          )}
          {aba === 2 && (
            <div>
              {/* Partes Contrárias */}
              <h3 className="font-bold mb-2">Partes Contrárias</h3>
              {partesContrarias.length === 0 ? (
                <div>Nenhuma parte contrária cadastrada.</div>
              ) : (
                <ul className="space-y-2">
                  {partesContrarias.map(e => (
                    <li key={e.id} className="border p-2 rounded">
                      <div><strong>Razão Social:</strong> {e.razaoSocial}</div>
                      <div><strong>CNPJ:</strong> {e.cnpj}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {aba === 3 && (
            <div>
              {/* Financeiro - Cards de Resumo */}
              <h3 className="font-bold text-lg mb-6">Resumo Financeiro do Processo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-100 rounded-lg p-6 flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-green-700 mb-2">Total Receitas</div>
                  <div className="text-3xl font-bold text-green-700">R$ {receitas.reduce((acc, r) => acc + (r.valor || 0), 0).toFixed(2)}</div>
                </div>
                <div className="bg-red-100 rounded-lg p-6 flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-red-700 mb-2">Total Gastos</div>
                  <div className="text-3xl font-bold text-red-700">R$ {gastos.reduce((acc, g) => acc + (g.valor || 0), 0).toFixed(2)}</div>
                </div>
                <div className="bg-blue-100 rounded-lg p-6 flex flex-col items-center justify-center">
                  <div className="text-lg font-semibold text-blue-700 mb-2">Resultado Líquido</div>
                  <div className="text-3xl font-bold text-blue-700">R$ {(receitas.reduce((acc, r) => acc + (r.valor || 0), 0) - gastos.reduce((acc, g) => acc + (g.valor || 0), 0)).toFixed(2)}</div>
                </div>
              </div>
              {/* Seções verticais Receitas/Gastos */}
              <div className="flex flex-col gap-6 mb-8">
                <div className="w-full bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Receitas (Honorários, Acordos, etc)</h4>
                  {receitas.length === 0 ? <div className="text-muted-foreground">Nenhuma receita registrada.</div> : (
                    <ul className="space-y-2">
                      {receitas.map(r => (
                        <li key={r.id} className="border p-2 rounded bg-white">
                          <div><strong>Descrição:</strong> {r.descricao}</div>
                          <div><strong>Valor:</strong> R$ {r.valor}</div>
                          <div><strong>Data:</strong> {r.data}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="w-full bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Gastos do Cliente no Processo</h4>
                  {gastos.length === 0 ? <div className="text-muted-foreground">Nenhum gasto registrado.</div> : (
                    <ul className="space-y-2">
                      {gastos.map(g => (
                        <li key={g.id} className="border p-2 rounded bg-white">
                          <div><strong>Descrição:</strong> {g.descricao}</div>
                          <div><strong>Valor:</strong> R$ {g.valor}</div>
                          <div><strong>Data:</strong> {g.data}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* Botões de ação no final */}
              <div className="flex gap-4 mt-2">
                <Button>+ Adicionar Receita</Button>
                <Button>+ Adicionar Gasto</Button>
              </div>
            </div>
          )}
          {aba === 4 && (
            <div>
              {/* Documentos */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Documentos</h3>
                <Button>+ Adicionar Documentos</Button>
              </div>
              {documentos.length === 0 ? (
                <div>Nenhum documento cadastrado.</div>
              ) : (
                <ul className="space-y-2">
                  {documentos.map(doc => (
                    <li key={doc.id} className="border p-2 rounded flex justify-between items-center">
                      <span>{doc.nome}</span>
                      <Button variant="outline" onClick={() => {/* lógica de download */}}>Download</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcessoDetalhesModal;
