// Função para formatar CNPJ
function formatCnpj(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5")
    .slice(0, 18);
}

// Função para formatar telefone
function formatTelefone(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\(\d{2}\) \d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Button from '../../components/ui/Button';

export default function SelectEscritorioModal({ open, onClose, userId, onSelected }) {
  const [userProfile, setUserProfile] = useState({ nome: '', email: '', oab: '' });
  const [form, setForm] = useState({ nome: '', cnpj: '', endereco: '', email_contato: '', telefone: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [escritorios, setEscritorios] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (open) {
      supabase.from('escritorios').select('*').then(({ data }) => {
        setEscritorios(data || []);
      });
      // Buscar dados do usuário para preencher perfil
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Buscar perfil já existente
          const { data: perfis } = await supabase.from('perfis').select('*').eq('user_id', user.id).limit(1);
          let nome = '', oab = '';
          if (perfis && perfis[0]) {
            nome = perfis[0].nome || '';
            oab = perfis[0].oab || '';
          }
          setUserProfile({ nome, email: user.email, oab });
        }
      })();
    }
  }, [open]);

  const handleSelect = (id) => {
    setSelectedId(id);
    setForm({ nome: '', cnpj: '', endereco: '', email_contato: '', telefone: '' });
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    const { nome, cnpj, endereco, email_contato, telefone } = form;
    if (!nome || !cnpj || !endereco || !email_contato || !telefone) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from('escritorios').insert([{ nome, cnpj, endereco, email_contato, telefone }]).select();
    setLoading(false);
    if (error) setError(error.message);
    else if (data && data[0]) {
      setSelectedId(data[0].id);
      setForm({ nome: '', cnpj: '', endereco: '', email_contato: '', telefone: '' });
      setShowForm(false);
      if (onSelected) onSelected(data[0]);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError('');
    // Atualiza ou cria perfil do usuário com dados do cadastro e escritório selecionado
    const { data: perfis, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    if (!perfilError && perfis && perfis.length > 0) {
      // Atualiza perfil existente
      await supabase.from('perfis').update({
        escritorio_id: selectedId,
        nome: userProfile.nome,
        oab: userProfile.oab,
        email: userProfile.email
      }).eq('user_id', userId);
    } else {
      // Cria novo perfil
      await supabase.from('perfis').insert({
        user_id: userId,
        escritorio_id: selectedId,
        nome: userProfile.nome,
        oab: userProfile.oab,
        email: userProfile.email
      });
    }
    setLoading(false);
    const escritorio = escritorios.find(e => e.id === selectedId);
    if (onSelected) onSelected(escritorio);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Fechar">×</button>
        <h2 className="text-lg font-semibold mb-4">Selecione ou cadastre o Escritório</h2>
        <div className="mb-4">
          <div className="mb-2 font-medium">Escritórios existentes:</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {escritorios.map(e => (
              <button
                key={e.id}
                className={`w-full text-left px-3 py-2 rounded border ${selectedId === e.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'} hover:bg-blue-50`}
                onClick={() => handleSelect(e.id)}
              >
                {e.nome}
              </button>
            ))}
            {escritorios.length === 0 && <div className="text-sm text-gray-400">Nenhum escritório cadastrado.</div>}
          </div>
        </div>
        <div className="mb-4">
          <div className="mb-2 font-medium">Cadastrar novo escritório:</div>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full">Cadastrar novo escritório</Button>
          ) : (
            <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Nome do escritório"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                disabled={loading}
                required
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="CNPJ"
                value={form.cnpj}
                onChange={e => setForm(f => ({ ...f, cnpj: formatCnpj(e.target.value) }))}
                disabled={loading}
                required
                maxLength={18}
                inputMode="numeric"
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Endereço"
                value={form.endereco}
                onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))}
                disabled={loading}
                required
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="E-mail de contato"
                value={form.email_contato}
                onChange={e => setForm(f => ({ ...f, email_contato: e.target.value }))}
                disabled={loading}
                required
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Telefone"
                value={form.telefone}
                onChange={e => setForm(f => ({ ...f, telefone: formatTelefone(e.target.value) }))}
                disabled={loading}
                required
                maxLength={15}
                inputMode="numeric"
              />
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} disabled={loading}>Cancelar</Button>
                <Button type="submit" disabled={loading}>Cadastrar</Button>
              </div>
            </form>
          )}
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={loading || !selectedId} className="bg-blue-600 text-white">Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
