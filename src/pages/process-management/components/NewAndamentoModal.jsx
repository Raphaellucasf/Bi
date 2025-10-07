import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import { ShadcnSelect } from "../../../components/ui/ShadcnSelect";

const tipoAndamentoOptions = [
  { label: "Petição Inicial", value: "peticao_inicial" },
  { label: "Audiência", value: "audiencia" },
  { label: "Prazo Fatal", value: "prazo_fatal" },
  { label: "Decisão Judicial", value: "decisao_judicial" },
  { label: "Recurso", value: "recurso" },
  { label: "Outro", value: "outro" },
];

const prioridadeOptions = [
  { label: "Baixa", value: "baixa" },
  { label: "Média", value: "media" },
  { label: "Alta", value: "alta" },
  { label: "Urgente", value: "urgente" },
];

export default function NewAndamentoModal({ open, onClose, onSave }) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState(tipoAndamentoOptions[0].value);
  const [prioridade, setPrioridade] = useState(prioridadeOptions[1].value);
  const [dataEvento, setDataEvento] = useState("");
  const [descricao, setDescricao] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">Novo Andamento</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Título do Andamento *</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ex: Audiência de Conciliação"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Andamento *</label>
            <ShadcnSelect
              options={tipoAndamentoOptions}
              value={tipo}
              onChange={setTipo}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prioridade</label>
            <ShadcnSelect
              options={prioridadeOptions}
              value={prioridade}
              onChange={setPrioridade}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              {tipo === "prazo_fatal" ? "Prazo Fatal" : "Data do Evento"}
            </label>
            <input
              type={tipo === "prazo_fatal" ? "date" : "datetime-local"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={dataEvento}
              onChange={e => setDataEvento(e.target.value)}
              placeholder={tipo === "prazo_fatal" ? "dd/mm/aaaa" : "dd/mm/aaaa --:--"}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[80px]"
              placeholder="Descreva os detalhes do andamento..."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave && onSave({ titulo, tipo, prioridade, dataEvento, descricao });
              onClose();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Salvar Andamento
          </Button>
        </div>
      </div>
    </div>
  );
}
