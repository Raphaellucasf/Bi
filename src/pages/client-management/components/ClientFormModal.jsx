import React from "react";

const ClientFormModal = ({ isOpen, onClose, client, onSave }) => (
  isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-2">Formulário de Cliente (placeholder)</h2>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>Fechar</button>
      </div>
    </div>
  ) : null
);

export default ClientFormModal;
