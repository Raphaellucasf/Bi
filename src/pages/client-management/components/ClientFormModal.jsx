// Funções de formatação
function formatCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatRG(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1})$/, "$1-$2");
}

function formatPIS(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{5})(\d)/, "$1.$2")
    .replace(/(\d{2})(\d{1})$/, "$1-$2");
}

function formatTelefone(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{4})$/, "$1-$2");
}

function formatTelefoneContato(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d{4})$/, "$1-$2");
}

import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import { ShadcnSelect } from "../../../components/ui/ShadcnSelect";
import Input from "../../../components/ui/Input";
import { getIndicadores, addIndicador } from "../../../services/indicadoresService";

const initialState = {
  nome_completo: "",
  cpf_cnpj: "",
  status: "Ativo",
  tipo_pessoa: "Pessoa Física",
  indicado_por: "",
  email: "",
  rg: "",
  pis: "",
  telefone_celular: "",
  telefone_para_contato: "",
  endereco: "",
  naturalidade: "",
  nome_mae: "",
  data_nascimento: "",
  data_entrevista: ""
};


const statusOptions = [
  { value: "Ativo", label: "Ativo" },
  { value: "Possível Cliente", label: "Possível Cliente" },
  { value: "Inativo", label: "Inativo" },
];
const typeOptions = [
  { value: "Pessoa Física", label: "Pessoa Física" },
  { value: "Pessoa Jurídica", label: "Pessoa Jurídica" },
];

const ClientFormModal = ({ isOpen, onClose, client, onSave, loading, escritorioId }) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [indicadores, setIndicadores] = useState([]);
  const [indicadorInput, setIndicadorInput] = useState("");
  const [indicadorLoading, setIndicadorLoading] = useState(false);

  useEffect(() => {
    if (client) setForm(client);
    else setForm(initialState);
    setError("");
  }, [client, isOpen]);

  useEffect(() => {
    if (isOpen && escritorioId) {
      getIndicadores(escritorioId).then(setIndicadores);
    }
  }, [isOpen, escritorioId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cpf_cnpj") {
      formatted = form.tipo_pessoa === "Pessoa Jurídica" ? formatCNPJ(value) : formatCPF(value);
    }
    if (name === "rg") formatted = formatRG(value);
    if (name === "pis") formatted = formatPIS(value);
  if (name === "telefone_celular") formatted = formatTelefone(value);
  if (name === "telefone_para_contato") formatted = formatTelefoneContato(value);
    setForm(f => ({ ...f, [name]: formatted }));
  };
// Função para formatar CNPJ
function formatCNPJ(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

  const handleSelectChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleIndicadorChange = (value) => {
    setForm(f => ({ ...f, indicado_por: value }));
    setIndicadorInput(value);
  };

  const handleIndicadorBlur = async () => {
    if (
      indicadorInput &&
      !indicadores.some(i => i.nome.toLowerCase() === indicadorInput.toLowerCase()) &&
      escritorioId
    ) {
      setIndicadorLoading(true);
      const novo = await addIndicador(indicadorInput, escritorioId);
      if (novo) setIndicadores(prev => [...prev, novo]);
      setIndicadorLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome_completo || !form.cpf_cnpj) {
      setError(`Nome e ${form.type === "Pessoa Jurídica" ? "CNPJ" : "CPF"} são obrigatórios`);
      return;
    }
    setError("");
    onSave && onSave(form);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-4">{client ? "Editar Cliente" : "Novo Cliente"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="nome_completo" label="Nome Completo *" placeholder="Nome completo do cliente" value={form.nome_completo} onChange={handleChange} required />
          <Input name="nome_mae" label="Nome da Mãe" placeholder="Nome da mãe" value={form.nome_mae} onChange={handleChange} />
          <Input name="data_nascimento" label="Data de Nascimento" type="date" value={form.data_nascimento} onChange={handleChange} />
          <Input name="data_entrevista" label="Data da Entrevista Inicial" type="date" value={form.data_entrevista} onChange={handleChange} />
          <Input name="email" label="Email" placeholder="cliente@email.com" value={form.email} onChange={handleChange} />
          <Input name="naturalidade" label="Naturalidade" placeholder="Ex: Franco da Rocha - SP" value={form.naturalidade} onChange={handleChange} />
          <Input name="rg" label="RG" placeholder="00.000.000-0" value={form.rg} onChange={handleChange} />
          <Input
            name="cpf_cnpj"
            label={form.type === "Pessoa Jurídica" ? "CNPJ *" : "CPF *"}
            placeholder={form.type === "Pessoa Jurídica" ? "00.000.000/0000-00" : "000.000.000-00"}
            value={form.cpf_cnpj}
            onChange={handleChange}
            required
          />
          <Input name="pis" label="PIS" placeholder="000.00000.00-0" value={form.pis} onChange={handleChange} />
          <Input name="telefone_celular" label="Telefone Celular" placeholder="(11) 99999-9999" value={form.telefone_celular} onChange={handleChange} />
          <Input name="telefone_para_contato" label="Telefone para Contato" placeholder="(11) 3333-3333" value={form.telefone_para_contato} onChange={handleChange} />
          <ShadcnSelect
            name="tipo_pessoa"
            label="Tipo de Cliente"
            options={typeOptions}
            value={form.tipo_pessoa}
            onChange={v => handleSelectChange("tipo_pessoa", v)}
            required
          />
          <ShadcnSelect
            name="status"
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={v => handleSelectChange("status", v)}
            required
          />
          <div className="md:col-span-2">
            <Input name="endereco" label="Endereço Completo (com CEP e complemento)" placeholder="Rua, número, bairro, cidade - CEP, complemento" value={form.endereco} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium leading-none mb-1 block">Quem Indicou</label>
            <input
              className="border rounded px-3 py-2 w-full"
              list="indicadores-list"
              name="indicado_por"
              placeholder="Selecione ou digite novo"
              value={form.indicado_por || indicadorInput}
              onChange={e => handleIndicadorChange(e.target.value)}
              onBlur={handleIndicadorBlur}
              autoComplete="off"
              disabled={indicadorLoading}
            />
            <datalist id="indicadores-list">
              {indicadores.map(i => (
                <option key={i.id} value={i.nome} />
              ))}
            </datalist>
            <Input
              className="mt-2"
              placeholder="Ou digite um novo nome"
              value={indicadorInput}
              onChange={e => handleIndicadorChange(e.target.value)}
              onBlur={handleIndicadorBlur}
              disabled={indicadorLoading}
            />
          </div>
          {error && <div className="text-red-600 text-sm md:col-span-2">{error}</div>}
          <div className="flex justify-end gap-2 mt-4 md:col-span-2">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;
