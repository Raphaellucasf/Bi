
import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import { getIndicadores, addIndicador } from "../../../services/indicadoresService";

const initialState = {
  name: "",
  cpf: "",
  status: "Ativo",
  type: "Pessoa Física",
  indicado_por: "",
  email: "",
  rg: "",
  pis: "",
  telefone: "",
  telefone_contato: "",
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
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

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
    if (!form.name || !form.cpf) {
      setError("Nome e CPF são obrigatórios");
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
          <Input name="name" label="Nome Completo *" placeholder="Nome completo do cliente" value={form.name} onChange={handleChange} required />
          <Input name="nome_mae" label="Nome da Mãe" placeholder="Nome da mãe" value={form.nome_mae} onChange={handleChange} />
          <Input name="data_nascimento" label="Data de Nascimento" type="date" value={form.data_nascimento} onChange={handleChange} />
          <Input name="data_entrevista" label="Data da Entrevista Inicial" type="date" value={form.data_entrevista} onChange={handleChange} />
          <Input name="email" label="Email" placeholder="cliente@email.com" value={form.email} onChange={handleChange} />
          <Input name="naturalidade" label="Naturalidade" placeholder="Ex: Franco da Rocha - SP" value={form.naturalidade} onChange={handleChange} />
          <Input name="rg" label="RG" placeholder="00.000.000-0" value={form.rg} onChange={handleChange} />
          <Input name="cpf" label="CPF *" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} required />
          <Input name="pis" label="PIS" placeholder="000.00000.00-0" value={form.pis} onChange={handleChange} />
          <Input name="telefone" label="Telefone Celular" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} />
          <Input name="telefone_contato" label="Telefone para Contato" placeholder="(11) 3333-3333" value={form.telefone_contato} onChange={handleChange} />
          <Select
            name="type"
            label="Tipo de Cliente"
            options={typeOptions}
            value={form.type}
            onChange={v => handleSelectChange("type", v)}
            required
          />
          <Select
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
