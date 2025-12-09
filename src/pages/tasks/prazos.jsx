
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import { supabase } from "../../services/supabaseClient";
import { syncEventToGoogle } from "../../services/googleCalendarService";
import Select from '../../components/ui/Select';

const Prazos = () => {
  const [andamentos, setAndamentos] = useState([]);
  const [form, setForm] = useState({
    processo_id: '',
    titulo: '',
    descricao: '',
    tipo: 'Prazo',
    data_andamento: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processos, setProcessos] = useState([]);
  const [processoSearch, setProcessoSearch] = useState('');

  const fetchAndamentos = async () => {
    const { data } = await supabase
      .from("andamentos")
      .select("*")
      .eq("tipo", "Prazo")
      .order("data_andamento", { ascending: true });
    setAndamentos(data || []);
  };

  const fetchProcessos = async (search = '') => {
    // Busca processos e clientes (join)
    let query = supabase.from('processos').select('id, numero_processo, clientes:cliente_id(nome_completo)');
    if (search) {
      query = query.ilike('numero_processo', `%${search}%`).or(`clientes.nome_completo.ilike.%${search}%`);
    }
    const { data } = await query;
    setProcessos(data || []);
  };

  useEffect(() => {
    fetchAndamentos();
    fetchProcessos();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Busca dinâmica: dispara fetchProcessos ao digitar no Select
  const handleProcessoSearch = val => {
    setProcessoSearch(val);
    fetchProcessos(val);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!form.processo_id || !form.titulo || !form.data_andamento) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
    // Restaurar campo 'tipo' pois agora existe na tabela
    // Remover 'resposavel_id' se não houver valor válido
    const { resposavel_id, ...formWithoutResp } = form;
    const andamentoToSave = {
      ...formWithoutResp,
      ...(resposavel_id ? { resposavel_id } : {}),
      data_andamento: form.data_andamento ? new Date(form.data_andamento).toISOString() : null,
      created_at: new Date().toISOString(),
    };
    const { data, error: supaError } = await supabase.from('andamentos').insert([andamentoToSave]).select();
    if (supaError) {
      setError('Erro ao salvar andamento: ' + JSON.stringify(supaError));
      setLoading(false);
      return;
    }
    
    // Sincronizar com Google Calendar se conectado
    if (data && data[0] && localStorage.getItem('google_calendar_token')) {
      try {
        console.log('🔄 Sincronizando prazo com Google Calendar...');
        const googleEventId = await syncEventToGoogle(data[0]);
        console.log('✅ Prazo sincronizado! ID no Google:', googleEventId);
      } catch (error) {
        console.error('⚠️ Erro ao sincronizar prazo:', error);
      }
    }
    
    setForm({ processo_id: '', titulo: '', descricao: '', tipo: 'Prazo', data_andamento: '' });
    setLoading(false);
    fetchAndamentos();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Prazos</h1>
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-bold mb-2">Novo Prazo</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Processo *</label>
              <Select
                name="processo_id"
                value={form.processo_id}
                onChange={val => setForm(prev => ({ ...prev, processo_id: val }))}
                options={processos.map(p => ({ value: p.id, label: `${p.numero_processo} (Cliente: ${p.clientes?.nome_completo || '-'})` }))}
                placeholder="Buscar por número ou nome do cliente"
                searchable
                required
                clearable
                loading={loading}
                onSearch={handleProcessoSearch}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input type="text" name="titulo" value={form.titulo} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <input type="datetime-local" name="data_andamento" value={form.data_andamento} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>Salvar</button>
          </form>
          {andamentos.length === 0 ? (
            <div className="text-muted-foreground">Nenhum prazo cadastrado.</div>
          ) : (
            <ul className="space-y-4">
              {andamentos.map(a => (
                <li key={a.id} className="border rounded-lg p-4 bg-white">
                  <div className="font-bold text-lg mb-1">{a.titulo}</div>
                  <div className="text-sm text-muted-foreground mb-2">{a.data_andamento}</div>
                  <div className="mb-2"><strong>Processo:</strong> {a.processo_id}</div>
                  <div><strong>Descrição:</strong> {a.descricao}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Prazos;
