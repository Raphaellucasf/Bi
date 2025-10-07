import React, { useState } from "react";
import { supabase } from "../../../services/supabaseClient";
// Função para buscar empresa na BrasilAPI
async function fetchEmpresaBrasilAPI(cnpj) {
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const ParteContrariaModal = ({ isOpen, onClose, onSave, initialData = {} }) => {
  const [form, setForm] = useState({
    razaoSocial: initialData.razaoSocial || "",
    nomeFantasia: initialData.nomeFantasia || "",
    cnpj: initialData.cnpj || "",
    enderecoRfb: initialData.enderecoRfb || "",
    enderecoTrabalho: initialData.enderecoTrabalho || "",
    advogado: initialData.advogado || "",
    oab: initialData.oab || "",
    telefone: initialData.telefone || "",
    email: initialData.email || "",
    observacoes: initialData.observacoes || ""
  });

  // Busca inteligente ao digitar CNPJ
  const handleChange = async (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === "cnpj" && value.length === 14) {
      // Busca no Supabase
      const { data: empresas, error } = await supabase.from("empresas").select("*").eq("cnpj", value);
      if (empresas && empresas.length > 0) {
        const empresa = empresas[0];
        setForm(prev => ({
          ...prev,
          razaoSocial: empresa.razao_social || prev.razaoSocial,
          nomeFantasia: empresa.nome_fantasia || prev.nomeFantasia,
          enderecoRfb: empresa.endereco_rfb || prev.enderecoRfb,
          enderecoTrabalho: empresa.endereco_trabalho || prev.enderecoTrabalho,
          advogado: empresa.advogado || prev.advogado,
          oab: empresa.oab || prev.oab,
          telefone: empresa.telefone || prev.telefone,
          email: empresa.email || prev.email,
          observacoes: empresa.observacoes || prev.observacoes
        }));
        return;
      }
      // Busca na BrasilAPI
      const empresaApi = await fetchEmpresaBrasilAPI(value);
      if (empresaApi) {
        setForm(prev => ({
          ...prev,
          razaoSocial: empresaApi.razao_social || prev.razaoSocial,
          nomeFantasia: empresaApi.nome_fantasia || prev.nomeFantasia,
          enderecoRfb: empresaApi.descricao_situacao_cadastral || prev.enderecoRfb
        }));
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (onSave) onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto my-8 p-8 relative">
        <button
          className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-black"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-6">Adicionar Parte Contrária</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Razão Social *" required value={form.razaoSocial} onChange={e => handleChange("razaoSocial", e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome Fantasia" value={form.nomeFantasia} onChange={e => handleChange("nomeFantasia", e.target.value)} />
            <Input label="CNPJ" value={form.cnpj} onChange={e => handleChange("cnpj", e.target.value)} />
          </div>
          <Input label="Endereço (RFB)" value={form.enderecoRfb} onChange={e => handleChange("enderecoRfb", e.target.value)} />
          <Input label="Endereço (Posto de Trabalho)" value={form.enderecoTrabalho} onChange={e => handleChange("enderecoTrabalho", e.target.value)} />
          <hr className="my-4" />
          <h3 className="text-lg font-semibold mb-2">Informações do Patrono</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome do Advogado" value={form.advogado} onChange={e => handleChange("advogado", e.target.value)} />
            <Input label="OAB" value={form.oab} onChange={e => handleChange("oab", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Telefone" value={form.telefone} onChange={e => handleChange("telefone", e.target.value)} />
            <Input label="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          </div>
          <Input label="Observações" value={form.observacoes} onChange={e => handleChange("observacoes", e.target.value)} multiline />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParteContrariaModal;
