
import React from "react";
import Button from "../../../components/ui/Button";

const PublicationCard = ({ publication, onProcess, onMarkAsRead }) => {
  if (!publication) return null;
  const { title, summary, content, status, publicationDate, isProcessed, id } = publication;

  return (
    <div className="p-4 border rounded bg-white mb-2">
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-2">{new Date(publicationDate).toLocaleString()}</p>
      <p className="text-gray-700 text-sm mb-2">{summary || content}</p>
      <div className="flex gap-2 mt-2">
        {!isProcessed && (
          <Button variant="default" size="sm" onClick={() => onProcess(publication)}>
            Processar
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onMarkAsRead(id)}>
          Marcar como lida
        </Button>
        <span className={`ml-auto text-xs px-2 py-1 rounded ${status === 'nova' ? 'bg-yellow-100 text-yellow-800' : status === 'processada' ? 'bg-green-100 text-green-800' : status === 'lida' ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-800'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default PublicationCard;
