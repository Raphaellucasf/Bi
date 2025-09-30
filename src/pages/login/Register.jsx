import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../services/supabaseClient';
import RegisterStep1 from './RegisterStep1';
import RegisterEscritorio from './RegisterEscritorio';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userAuth, setUserAuth] = useState({ email: '', password: '' });
  const [perfilForm, setPerfilForm] = useState({ nome_completo: '', funcao: '', oab: '', telefone: '' });
  // Escritório removido temporariamente para debug
  const escritorio = null;
  // const [escritorio, setEscritorio] = useState(null);
  // const [showEscritorioModal, setShowEscritorioModal] = useState(false);
  // const [showCadastroEscritorio, setShowCadastroEscritorio] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Etapa 1: Cadastro de usuário
  const handleStep1Success = (user, email, password) => {
    setUserId(user.id);
    setUserAuth({ email, password });
    setStep(2);
  };

  // Etapa 2: Dados do perfil e escritório
  const handlePerfilChange = (e) => {
    setPerfilForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  // Busca e seleção de escritório removidas temporariamente

  const handleSubmitPerfil = async (e) => {
    e.preventDefault();
    if (!perfilForm.nome_completo || !perfilForm.funcao || !perfilForm.telefone) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    // Cria perfil na tabela perfis
    console.log('Tentando criar perfil:', {
      user_id: userId,
      nome_completo: perfilForm.nome_completo,
      funcao: perfilForm.funcao,
      oab: perfilForm.oab,
      telefone: perfilForm.telefone,
      // escritorio_id removido
      email: userAuth.email
    });
    const { data: perfilData, error } = await supabase.from('perfis').insert({
      user_id: userId,
      nome_completo: perfilForm.nome_completo,
      funcao: perfilForm.funcao,
      oab: perfilForm.oab,
      telefone: perfilForm.telefone,
      // escritorio_id removido
      email: userAuth.email
    }).select();
    console.log('Resposta insert perfis:', { perfilData, error });
    if (error) {
      setLoading(false);
      setError('Erro ao salvar perfil: ' + error.message);
      return;
    }
    // Aguarda e faz refresh do perfil para garantir que está completo
    setTimeout(async () => {
      const { data: perfis } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .limit(1);
      const perfil = perfis && perfis[0];
      setLoading(false);
      if (perfil && perfil.nome_completo && perfil.funcao && perfil.telefone) {
        navigate('/');
      } else {
        setError('Não foi possível concluir o cadastro. Tente novamente.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      {step === 1 && (
        <RegisterStep1 onSuccess={handleStep1Success} />
      )}
      {step === 2 && (
        <form onSubmit={handleSubmitPerfil} className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2 text-center">Cadastro</h2>
          <Input name="nome_completo" label="Nome completo *" type="text" value={perfilForm.nome_completo} onChange={handlePerfilChange} required />
          <Input name="funcao" label="Função *" type="text" value={perfilForm.funcao} onChange={handlePerfilChange} required />
          <Input name="oab" label="OAB" type="text" value={perfilForm.oab} onChange={handlePerfilChange} placeholder="Opcional" />
          <Input name="telefone" label="Telefone *" type="text" value={perfilForm.telefone} onChange={handlePerfilChange} required />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Finalizar Cadastro'}</Button>
          <button type="button" className="text-blue-600 text-sm mt-2" onClick={() => navigate('/login')}>Já tem conta? Entrar</button>
        </form>
      )}
    </div>
  );
};

export default RegisterPage;
