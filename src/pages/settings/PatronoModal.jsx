import React, { useState } from "react";
import Button from "../../components/ui/Button";
import { formatCPF_CNPJ, formatTelefone } from "../../utils/formatters";

// Campos da tabela patrono
// id (uuid, gerado automaticamente)
// escritorio_id (uuid, obrigatório)
// created_at (timestamp, gerado automaticamente)
// razao_social (text, obrigatório)
// cnpj (text, pode ser CPF ou CNPJ, obrigatório)
// telefone (text, opcional)
// email (text, opcional)
// nome_fantasia (text, opcional)
// advogado (text, obrigatório)
// oab (text, obrigatório)

const PatronoModal = ({ open, onClose, onSave, escritorioId }) => {
  const [form, setForm] = useState({
    razao_social: "",
    cnpj: "",
    telefone: "",
    email: "",
    nome_fantasia: "",
    advogado: "",
    oab: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleBlur = (field) => {
    if (field === "cnpj") {
      setForm(f => ({ ...f, cnpj: formatCPF_CNPJ(f.cnpj) }));
    }
    if (field === "telefone") {
      setForm(f => ({ ...f, telefone: formatTelefone(f.telefone) }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.razao_social || !form.cnpj || !form.advogado || !form.oab) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);
    await onSave({ ...form, escritorio_id: escritorioId });
    setLoading(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Fechar">×</button>
        <h2 className="text-xl font-bold mb-4">Adicionar Patrono</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Razão Social *</label>
            <input className="w-full border rounded px-3 py-2" value={form.razao_social} onChange={e => handleChange("razao_social", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CPF/CNPJ *</label>
            <input 
              className="w-full border rounded px-3 py-2" 
              value={form.cnpj} 
              onChange={e => handleChange("cnpj", e.target.value)} 
              onBlur={() => handleBlur("cnpj")} 
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input className="w-full border rounded px-3 py-2" value={form.telefone} onChange={e => handleChange("telefone", e.target.value)} onBlur={() => handleBlur("telefone") } />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input className="w-full border rounded px-3 py-2" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome Fantasia</label>
            <input className="w-full border rounded px-3 py-2" value={form.nome_fantasia} onChange={e => handleChange("nome_fantasia", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Advogado *</label>
            <input className="w-full border rounded px-3 py-2" value={form.advogado} onChange={e => handleChange("advogado", e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">OAB *</label>
            <input className="w-full border rounded px-3 py-2" value={form.oab} onChange={e => handleChange("oab", e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="default" type="submit" loading={loading}>Salvar Patrono</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatronoModal;
