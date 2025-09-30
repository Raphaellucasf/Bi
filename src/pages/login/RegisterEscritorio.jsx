import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { supabase } from '../../services/supabaseClient';

export default function RegisterEscritorio({ onCancel, onSuccess }) {
  const [form, setForm] = useState({ nome: '', cnpj: '', endereco: '', email_contato: '', telefone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.cnpj || !form.endereco || !form.email_contato || !form.telefone) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('escritorios').insert([{ ...form }]).select();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data && data[0]) {
      onSuccess && onSuccess(data[0]);
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Cadastrar novo escritório</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input name="nome" label="Nome do escritório *" value={form.nome} onChange={handleChange} required />
        <Input name="cnpj" label="CNPJ *" value={form.cnpj} onChange={handleChange} required />
        <Input name="endereco" label="Endereço *" value={form.endereco} onChange={handleChange} required />
        <Input name="email_contato" label="E-mail de contato *" value={form.email_contato} onChange={handleChange} required />
        <Input name="telefone" label="Telefone *" value={form.telefone} onChange={handleChange} required />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <div className="flex gap-2 mt-4 justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Button>
        </div>
      </form>
    </div>
  );
}
