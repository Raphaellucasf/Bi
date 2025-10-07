import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Button from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Tentando login:', { email, password });
    const { data, error, ...rest } = await supabase.auth.signInWithPassword({ email, password });
    const user = data?.user;
    console.log('Resultado do login:', { error, user, data, rest });
    if (error) {
      setLoading(false);
      setError(error.message + ' | Detalhe: ' + JSON.stringify(error));
      return;
    }
    if (!user) {
      setLoading(false);
      setError('Não foi possível fazer login. Verifique seu e-mail, senha e se sua conta está confirmada.');
      return;
    }
    // Apenas autentica e redireciona
    onLogin && onLogin(user);
    setLoading(false);
  navigate('/process-management', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div>
        <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{' '}
          <Link to="/login/register" className="text-blue-600 hover:underline">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
