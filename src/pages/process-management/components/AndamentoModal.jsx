import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import MaskedDateInput from "../../../components/ui/MaskedDateInput";

const tipoOptions = [
  { value: "Audiência", label: "Audiência" },
  { value: "Prazo", label: "Prazo" },
  { value: "Reunião", label: "Reunião" },
  { value: "Andamento Geral", label: "Andamento Geral" }
];

export default function AndamentoModal({ open, onClose, processoId, onSave }) {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "",
    data_final: "",
    adicionar_google_agenda: false
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto my-8 p-8 relative">
        <button className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-black" onClick={onClose} aria-label="Fechar">×</button>
        <h2 className="text-2xl font-bold mb-6">Novo Andamento / Tarefa</h2>
        <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSave({ ...form, processo_id: processoId }); }}>
          <div>
            <label className="font-semibold text-sm">Título</label>
            <input className="input input-bordered w-full" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
          </div>
          <div>
            <label className="font-semibold text-sm">Descrição</label>
            <textarea className="input input-bordered w-full" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} required />
          </div>
          <div>
            <label className="font-semibold text-sm">Tipo</label>
            <select className="input input-bordered w-full" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} required>
              <option value="">Selecione...</option>
              {tipoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="font-semibold text-sm">Data Final</label>
            <MaskedDateInput value={form.data_final} onChange={e => setForm(f => ({ ...f, data_final: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.adicionar_google_agenda} onChange={e => setForm(f => ({ ...f, adicionar_google_agenda: e.target.checked }))} />
            <span className="text-sm">Adicionar ao Google Agenda</span>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 text-white">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
