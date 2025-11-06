import React from "react";
import Icon from "../../../components/AppIcon";

/**
 * Modal de ações para um processo
 * Permite editar ou ver detalhes do processo
 */
function ProcessActionModal({ process, onClose, onEdit, onViewDetails }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div 
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-2 right-2 text-muted-foreground text-3xl hover:text-black transition" 
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground mb-2">Ações do Processo</h3>
          <div className="text-sm text-muted-foreground">
            <div className="font-medium">{process.titulo}</div>
            <div className="text-xs">Nº {process.numero_processo}</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group"
            onClick={() => {
              onEdit(process);
              onClose();
            }}
          >
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition">
              <Icon name="Edit2" size={24} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-foreground">Editar Processo</div>
              <div className="text-sm text-muted-foreground">Modificar informações do processo</div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </button>

          <button
            className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition group"
            onClick={() => {
              onViewDetails(process);
              onClose();
            }}
          >
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition">
              <Icon name="Eye" size={24} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-foreground">Ver Detalhes</div>
              <div className="text-sm text-muted-foreground">Visualizar todas as informações</div>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </button>
        </div>

        <button
          className="w-full mt-4 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition text-muted-foreground"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ProcessActionModal;
