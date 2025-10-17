
import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../services/supabaseClient';

import { useNavigate } from 'react-router-dom';

export default function RegisterStep1({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.confirm) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
  const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data?.user) {
        onSuccess && onSuccess(data.user, form.email, form.password);
      } else {
        setError('Erro ao criar usuário.');
      }
    } catch (err) {
      setError('Erro inesperado: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Cadastro</h2>
      <Input name="email" label="E-mail" type="email" value={form.email} onChange={handleChange} required />
      <Input name="password" label="Senha" type="password" value={form.password} onChange={handleChange} required minLength={6} />
      <Input name="confirm" label="Confirmar Senha" type="password" value={form.confirm} onChange={handleChange} required minLength={6} />
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <Button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Avançar'}</Button>
      <button type="button" className="text-blue-600 text-sm mt-2" onClick={() => navigate('/login')}>Já tem conta? Entrar</button>
    </form>
  );
}