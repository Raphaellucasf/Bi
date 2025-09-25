
import React, { useState } from "react";

const TABS = [
  { label: "Detalhes" },
  { label: "Andamentos" },
  { label: "Partes Contrárias" },
  { label: "Financeiro" },
  { label: "Documentos" },
];

const ProcessDetailsModal = ({ isOpen, onClose, process }) => {
  const [tab, setTab] = useState(0);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto my-8 p-8 relative">
        <button
          className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-black"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-4">{process?.title}</h2>
        {/* Tabs */}
        <div className="flex mb-4 border-b">
          {TABS.map((t, idx) => (
            <button
              key={t.label}
              className={`px-6 py-2 font-medium text-sm border-b-2 transition-colors ${tab === idx ? 'border-black bg-white' : 'border-transparent bg-gray-50 text-muted-foreground'}`}
              onClick={() => setTab(idx)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Tags */}
        {tab === 0 && (
          <div className="flex gap-2 mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Ativo</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">Média</span>
            <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium">Outro</span>
          </div>
        )}
        {/* Tab Content */}
        {tab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#f8fafd] rounded-lg p-6">
              <div className="font-semibold mb-2 flex items-center gap-2">&#128100; Informações do Cliente</div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-medium">{process?.client}</div>
            </div>
            <div className="bg-[#f8fafd] rounded-lg p-6">
              <div className="font-semibold mb-2 flex items-center gap-2">&#128188; Detalhes do Processo</div>
              <div className="text-sm text-muted-foreground">Nº Processo</div>
              <div className="font-medium">{process?.numero || '0000000-00.0000.0.00.0000'}</div>
            </div>
          </div>
        )}
        {tab === 1 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg">Andamentos do Processo</div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"><span>+</span> Novo Andamento</button>
            </div>
            <div className="bg-[#f8fafd] rounded-lg p-8 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">&#128196;</div>
              <div className="font-medium mb-2">Nenhum andamento cadastrado</div>
              <button className="bg-black text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 mt-2"><span>+</span> Adicionar Primeiro Andamento</button>
            </div>
          </div>
        )}
        {tab === 2 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-lg">Partes Contrárias</div>
              <button className="bg-black text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"><span>+</span> Adicionar</button>
            </div>
            <div className="text-muted-foreground">Nenhuma parte contrária cadastrada.</div>
          </div>
        )}
        {tab === 3 && (
          <div>
            <div className="font-semibold text-lg mb-4">Resumo Financeiro do Processo</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Receitas</div>
                <div className="text-2xl font-bold text-green-700">R$ 0.00</div>
              </div>
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Gastos</div>
                <div className="text-2xl font-bold text-red-700">R$ 0.00</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">Resultado Líquido</div>
                <div className="text-2xl font-bold text-blue-700">R$ 0.00</div>
              </div>
            </div>
            <div className="mb-4 font-semibold">Receitas (Honorários, Acordos, etc)</div>
            <div className="bg-[#f8fafd] rounded-lg p-4 mb-6 text-muted-foreground">Nenhuma receita registrada.</div>
            <div className="mb-4 font-semibold">Gastos do Cliente no Processo</div>
            <div className="bg-[#f8fafd] rounded-lg p-4 text-muted-foreground">Nenhum gasto registrado.</div>
            <div className="flex gap-2 mt-4">
              <button className="bg-black text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"><span>+</span> Adicionar Receita</button>
              <button className="bg-black text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"><span>+</span> Adicionar Gasto</button>
            </div>
          </div>
        )}
        {tab === 4 && (
          <div>
            <div className="font-semibold text-lg mb-4">Documentos</div>
            <div className="text-muted-foreground">Nenhum documento cadastrado.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessDetailsModal;
