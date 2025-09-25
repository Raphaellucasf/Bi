
import React, { useState } from "react";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const ESCRITORIOS = [
  { value: "Nelson", label: "Nelson" },
  { value: "Gaspar", label: "Gaspar" },
  { value: "MF Advocacia", label: "MF Advocacia" },
];
const AREAS = [
  { value: "Cível", label: "Cível" },
  { value: "Criminal", label: "Criminal" },
  { value: "Trabalhista", label: "Trabalhista" },
  { value: "Família", label: "Família" },
  { value: "Empresarial", label: "Empresarial" },
  { value: "Tributário", label: "Tributário" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Outro", label: "Outro" },
];
const PRIORIDADES = [
  { value: "Baixa", label: "Baixa" },
  { value: "Média", label: "Média" },
  { value: "Alta", label: "Alta" },
  { value: "Urgente", label: "Urgente" },
];
const STATUS = [
  { value: "Ativo", label: "Ativo" },
  { value: "Pendente", label: "Pendente" },
  { value: "Encerrado", label: "Encerrado" },
  { value: "Em Recurso", label: "Em Recurso" },
];

const NewProcessModal = ({ isOpen = true, onClose, onSave, isEdit = false, process = null }) => {
  const initialForm = isEdit && process ? {
    titulo: process.title || "",
    cliente: process.client || "",
    escritorio: process.office || ESCRITORIOS[0].value,
    area: process.area || AREAS[AREAS.length - 1].value,
    numero: process.numero || "",
    tribunal: process.tribunal || "",
    prioridade: process.priority || PRIORIDADES[1].value,
    status: process.status || STATUS[0].value,
    valor: process.value?.toString() || "0.00",
    honorarios: process.honorarios?.toString() || "0.00",
    dataInicio: process.dataInicio || "",
    proximaAudiencia: process.proximaAudiencia || "",
    juiz: process.juiz || "",
    descricao: process.descricao || "",
  } : {
    titulo: "",
    cliente: "",
    escritorio: ESCRITORIOS[0].value,
    area: AREAS[AREAS.length - 1].value,
    numero: "",
    tribunal: "",
    prioridade: PRIORIDADES[1].value,
    status: STATUS[0].value,
    valor: "0.00",
    honorarios: "0.00",
    dataInicio: "",
    proximaAudiencia: "",
    juiz: "",
    descricao: "",
  };

  const [form, setForm] = useState(initialForm);

  React.useEffect(() => {
    if (isEdit && process) {
      setForm(initialForm);
    }
    // eslint-disable-next-line
  }, [isEdit, process]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
  <h2 className="text-2xl font-semibold mb-6">{isEdit ? 'Editar Processo' : 'Novo Processo'}</h2>
        <form className="space-y-4">
          <Input
            label="Título do Processo *"
            required
            placeholder="Ex: Ação de Indenização contra..."
            value={form.titulo}
            onChange={e => handleChange("titulo", e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cliente *"
              required
              placeholder="Selecione o cliente"
              value={form.cliente}
              onChange={e => handleChange("cliente", e.target.value)}
            />
            <Select
              label="Escritório *"
              required
              options={ESCRITORIOS}
              value={form.escritorio}
              onChange={v => handleChange("escritorio", v)}
              searchable
              placeholder="Selecione o escritório"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Área do Direito *"
              required
              options={AREAS}
              value={form.area}
              onChange={v => handleChange("area", v)}
              searchable
              placeholder="Selecione a área"
            />
            <Input
              label="Número do Processo"
              placeholder="Ex: 0000000-00.0000.0.00.0000"
              value={form.numero}
              onChange={e => handleChange("numero", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tribunal/Vara"
              placeholder="Ex: 1ª Vara Cível de São Paulo"
              value={form.tribunal}
              onChange={e => handleChange("tribunal", e.target.value)}
            />
            <Select
              label="Prioridade"
              options={PRIORIDADES}
              value={form.prioridade}
              onChange={v => handleChange("prioridade", v)}
              searchable
              placeholder="Selecione a prioridade"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              options={STATUS}
              value={form.status}
              onChange={v => handleChange("status", v)}
              searchable
              placeholder="Selecione o status"
            />
            <Input
              label="Valor da Causa (R$)"
              type="number"
              value={form.valor}
              onChange={e => handleChange("valor", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Honorários (R$)"
              type="number"
              value={form.honorarios}
              onChange={e => handleChange("honorarios", e.target.value)}
            />
            <Input
              label="Data de Início"
              type="date"
              value={form.dataInicio}
              onChange={e => handleChange("dataInicio", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Próxima Audiência"
              type="datetime-local"
              value={form.proximaAudiencia}
              onChange={e => handleChange("proximaAudiencia", e.target.value)}
            />
            <Input
              label="Juiz(a)"
              value={form.juiz}
              onChange={e => handleChange("juiz", e.target.value)}
              placeholder="Nome do juiz responsável"
            />
          </div>
          <Input
            label="Descrição do Caso"
            as="textarea"
            value={form.descricao}
            onChange={e => handleChange("descricao", e.target.value)}
            placeholder="Descreva os detalhes do processo..."
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
            <Button variant="default" type="submit">Salvar Processo</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProcessModal;
