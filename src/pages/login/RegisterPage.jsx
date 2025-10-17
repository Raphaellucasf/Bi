import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) navigate('/', { replace: true });
    });
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Cadastro realizado! Verifique seu e-mail para confirmar.');
      onRegister && onRegister();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <form onSubmit={handleRegister} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-2 text-center">Cadastro</h1>
        <input
          type="email"
          placeholder="E-mail"
          className="border rounded px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="border rounded px-3 py-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </div>
  );
}
