import React, { useState } from "react";
import { supabase } from '../../../services/supabaseClient';
import { syncEventToGoogle } from '../../../services/googleCalendarService';

const initialState = {
  titulo: '',
  descricao: '',
  tipo: '',
  data_andamento: '',
  processo_id: '',
};

const NewTaskModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Validação simples
    if (!form.titulo || !form.tipo || !form.data_andamento || !form.processo_id) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Selecione...</option>
              <option value="Audiência">Audiência</option>
              <option value="Prazo">Prazo</option>
              <option value="Reunião">Reunião</option>
              <option value="Julgamento">Julgamento</option>
              <option value="Documento">Documento</option>
            </select>
          </div>
    // Salvar no Supabase
    const andamentoToSave = {
      ...form,
      data_andamento: form.data_andamento ? new Date(form.data_andamento).toISOString() : null,
      created_at: new Date()?.toISOString(),
    };
    const { data, error: supaError } = await supabase.from('andamentos').insert([andamentoToSave]).select();
    if (supaError) {
      setError('Erro ao salvar andamento: ' + JSON.stringify(supaError));
      console.error('Supabase insert error:', supaError, andamentoToSave);
      setLoading(false);
      return;
    }
    if (!data || !data[0]) {
      setError('Nenhum dado retornado do Supabase.');
      console.error('Supabase insert: nenhum dado retornado', data, andamentoToSave);
      setLoading(false);
      return;
    }
    
    // Sincronizar com Google Calendar se conectado
    const createdEvent = data[0];
    const googleToken = localStorage.getItem('google_calendar_token');
    console.log('🔍 Token do Google:', googleToken ? 'Existe' : 'Não existe');
    
    if (googleToken) {
      try {
        console.log('🔄 Sincronizando evento com Google Calendar...');
        console.log('📦 Dados do evento:', createdEvent);
        const googleEventId = await syncEventToGoogle(createdEvent);
        console.log('✅ Evento sincronizado! ID no Google:', googleEventId);
      } catch (error) {
        console.error('⚠️ Erro ao sincronizar com Google Calendar:', error);
        console.error('⚠️ Detalhes do erro:', error.response?.data || error.message);
        // Não bloqueia a criação do evento se falhar a sincronização
      }
    } else {
      console.log('⚠️ Google Calendar não conectado - evento não foi sincronizado');
    }
    
    setLoading(false);
    setForm(initialState);
    if (onSave) onSave(createdEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Novo Andamento / Tarefa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Selecione...</option>
              <option value="audiencia">Audiência</option>
              <option value="prazo">Prazo</option>
              <option value="reuniao">Reunião</option>
              <option value="julgamento">Julgamento</option>
              <option value="documento">Documento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data do Andamento *</label>
            <input
              type="datetime-local"
              name="data_andamento"
              value={form.data_andamento}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          <div>
            <label className="block text-sm font-medium mb-1">Processo *</label>
            <input
              type="text"
              name="processo_id"
              value={form.processo_id}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
