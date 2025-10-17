import React from "react";
import Button from "../../../components/ui/Button";

// Placeholder TaskCard component
const TaskCard = ({ task, onComplete, onEdit }) => {
  if (!task) return null;
  const { title = "Tarefa", description = "Descrição da tarefa", status = "pendente", id } = task;

  return (
    <div className="p-4 border rounded bg-white mb-2">
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-700 text-sm mb-2">{description}</p>
      <div className="flex gap-2 mt-2">
        <Button variant="default" size="sm" onClick={() => onComplete && onComplete(id)}>
          Concluir
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit && onEdit(id)}>
          Editar
        </Button>
        <span className={`ml-auto text-xs px-2 py-1 rounded ${status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : status === 'concluída' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
