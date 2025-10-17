import React, { useState } from "react";
import Button from "../../../components/ui/Button";

const CommentModal = ({ isOpen, onClose, process }) => {
  const [comment, setComment] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto my-8 p-8 relative">
        <button
          className="absolute top-4 right-4 text-xl text-muted-foreground hover:text-black"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">Adicionar Comentário</h2>
        <div className="mb-4 text-muted-foreground text-sm">
          Processo: <b>{process?.title}</b>
        </div>
        <textarea
          className="w-full border border-border rounded-lg p-2 mb-4 min-h-[80px]"
          placeholder="Descreva o contato, ligação, mensagem, etc..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="default" type="button" onClick={onClose} disabled={!comment.trim()}>Salvar Comentário</Button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
