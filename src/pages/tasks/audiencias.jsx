
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import { supabase } from "../../services/supabaseClient";

const Audiencias = () => {
  const [andamentos, setAndamentos] = useState([]);
  const [form, setForm] = useState({
    processo_id: '',
    titulo: '',
    descricao: '',
    tipo: 'Audiência',
    data_andamento: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAndamentos = async () => {
    const { data } = await supabase
      .from("andamentos")
      .select("*")
      .eq("tipo", "Audiência")
      .order("data_andamento", { ascending: true });
    setAndamentos(data || []);
  };

  useEffect(() => {
    fetchAndamentos();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
    const andamentoToSave = {
      ...form,
      data_andamento: form.data_andamento ? new Date(form.data_andamento).toISOString() : null,
      created_at: new Date().toISOString(),
    };
    const { error: supaError } = await supabase.from('andamentos').insert([andamentoToSave]);
    if (supaError) {
      setError('Erro ao salvar andamento: ' + JSON.stringify(supaError));
      setLoading(false);
      return;
    }
    setForm({ processo_id: '', titulo: '', descricao: '', tipo: 'Audiência', data_andamento: '' });
    setLoading(false);
    fetchAndamentos();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Audiências</h1>
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-bold mb-2">Nova Audiência</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Processo *</label>
              <input type="text" name="processo_id" value={form.processo_id} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
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
            <div className="text-muted-foreground">Nenhuma audiência cadastrada.</div>
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

export default Audiencias;
