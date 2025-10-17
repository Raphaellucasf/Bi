import React, { useEffect, useState } from "react";
import { supabase } from '../../../services/supabaseClient';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProfileInformationTab = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ nome_completo: '', oab: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: perfis } = await supabase.from('perfis').select('*').eq('user_id', user.id).limit(1);
      if (perfis && perfis[0]) {
        setPerfil(perfis[0]);
        setForm({ nome_completo: perfis[0].nome_completo || '', oab: perfis[0].oab || '' });
      }
      setLoading(false);
    })();
  }, []);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('perfis').update({ nome_completo: form.nome_completo, oab: form.oab }).eq('user_id', user.id);
    if (!error) {
      setPerfil(p => ({ ...p, nome_completo: form.nome_completo, oab: form.oab }));
      setMsg('Dados atualizados!');
      setEdit(false);
    } else {
      setMsg('Erro ao salvar.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <div className="p-4 bg-white border rounded mb-2 max-w-lg">
      <h2 className="text-lg font-bold mb-4">Informações do Perfil</h2>
      {!edit ? (
        <>
          <div className="mb-2"><b>Nome:</b> {perfil?.nome_completo || <span className="text-muted-foreground">Não informado</span>}</div>
          <div className="mb-2"><b>OAB:</b> {perfil?.oab ? perfil.oab : <span className="text-muted-foreground">Não informado</span>}</div>
          <Button onClick={() => setEdit(true)} variant="secondary">Editar</Button>
        </>
      ) : (
        <>
          <Input name="nome_completo" label="Nome completo *" value={form.nome_completo} onChange={handleChange} required />
          <Input name="oab" label="OAB" value={form.oab} onChange={handleChange} placeholder="Opcional" />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleSave} disabled={saving}>Salvar</Button>
            <Button onClick={() => setEdit(false)} variant="secondary">Cancelar</Button>
          </div>
          {msg && <div className="text-green-600 text-sm mt-2">{msg}</div>}
        </>
      )}
    </div>
  );
};

export default ProfileInformationTab;
