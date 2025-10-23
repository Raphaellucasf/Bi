import React from "react";
import Icon from "../../../components/AppIcon";
import { supabase } from '../../../services/supabaseClient';
import { formatProperName } from '../../../utils/formatters';

function ClientDetailsModal({ client, onClose }) {
  const getFirstNames = nome => nome?.split(' ').slice(0,2).join(' ');
  const [processos, setProcessos] = React.useState([]);
  const [comentarios, setComentarios] = React.useState([]);
  const [showAddComment, setShowAddComment] = React.useState(false);
  const [novoComentario, setNovoComentario] = React.useState({ tipo: 'Nota', texto: '' });
  const tipoOptions = ['Nota', 'Reunião', 'Ligação', 'Email'];

  React.useEffect(() => {
    async function fetchProcessos() {
      if (!client?.id) return;
      const { data } = await supabase.from('processos').select('*').eq('cliente_id', client.id);
      setProcessos(data || []);
    }
    async function fetchComentarios() {
      if (!client?.id) return;
      const { data } = await supabase.from('comentarios').select('*').eq('cliente_id', client.id);
      setComentarios(data || []);
    }
    fetchProcessos();
    fetchComentarios();
  }, [client]);

  async function handleSalvarComentario() {
    if (!novoComentario.texto.trim()) return;
    const { error } = await supabase.from('comentarios').insert({
      cliente_id: client.id,
      tipo: novoComentario.tipo,
      texto: novoComentario.texto,
      data: new Date().toISOString()
    });
    if (!error) {
      setShowAddComment(false);
      setNovoComentario({ tipo: 'Nota', texto: '' });
      // Recarregar comentários
      const { data } = await supabase.from('comentarios').select('*').eq('cliente_id', client.id);
      setComentarios(data || []);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-muted-foreground text-3xl hover:text-black" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold mb-4">{formatProperName(client.nome_completo)}</h2>
        <div className="flex gap-6 mb-4">
          <div className="flex-1 bg-gray-50 rounded p-4">
            <div className="font-semibold mb-2">Informações Pessoais</div>
            <div className="mb-1"><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="font-medium">{client.cpf_cnpj || 'Não informado'}</span></div>
            <div className="mb-1"><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{client.telefone_celular || 'Não informado'}</span></div>
            <div className="mb-1"><span className="text-muted-foreground">Email:</span> <span className="font-medium">{client.email || 'Não informado'}</span></div>
          </div>
          <div className="flex-1 bg-gray-50 rounded p-4">
            <div className="font-semibold mb-2">Processos ({processos.length})</div>
            {processos.length === 0 ? <div className="text-muted-foreground text-sm">Nenhum processo vinculado</div> : (
              <ul className="space-y-2">
                {processos.map(proc => (
                  <li key={proc.id} className="bg-blue-100 rounded p-3 flex justify-between items-center cursor-pointer hover:bg-blue-200 transition" onClick={() => alert('Abrir processo ' + proc.id)}>
                    <div>
                      <div className="font-semibold text-sm">{formatProperName(proc.titulo)}</div>
                      <div className="text-xs text-muted-foreground">Nº {proc.numero_processo} - {proc.status}</div>
                    </div>
                    <Icon name="Eye" size={18} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="font-semibold mb-2 flex items-center justify-between">
            <span>Comentários ({comentarios.length})</span>
            <button className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1" onClick={() => setShowAddComment(true)}><Icon name="Plus" size={16} /> Adicionar</button>
          </div>
          {showAddComment && (
            <div className="bg-gray-50 p-4 rounded mb-4">
              <select className="mb-2 px-2 py-1 rounded border w-full" value={novoComentario.tipo} onChange={e => setNovoComentario(nc => ({ ...nc, tipo: e.target.value }))}>
                {tipoOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <textarea className="w-full mb-2 px-2 py-1 rounded border" rows={3} placeholder="Digite seu comentário..." value={novoComentario.texto} onChange={e => setNovoComentario(nc => ({ ...nc, texto: e.target.value }))} />
              <div className="flex gap-2 justify-end">
                <button className="px-3 py-1 rounded bg-gray-200" type="button" onClick={() => setShowAddComment(false)}>Cancelar</button>
                <button className="px-3 py-1 rounded bg-blue-600 text-white" type="button" onClick={handleSalvarComentario}>Salvar Comentário</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {comentarios.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-4">Nenhum comentário ainda</div>
            ) : (
              comentarios.map((c, i) => (
                <div key={i} className="border rounded p-2 flex items-center gap-3 bg-white">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${c.tipo === 'Ligação' ? 'bg-yellow-100 text-yellow-700' : c.tipo === 'Reunião' ? 'bg-green-100 text-green-700' : c.tipo === 'Nota' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{c.tipo}</span>
                  <span className="flex-1">{c.texto}</span>
                  <span className="text-xs text-muted-foreground">{c.data ? new Date(c.data).toLocaleString('pt-BR') : ''}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDetailsModal;
