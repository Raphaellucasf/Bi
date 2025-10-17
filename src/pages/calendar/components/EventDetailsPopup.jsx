import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const EventDetailsPopup = ({ event, onClose, onComplete, onDelete }) => {
  const navigate = useNavigate();
  const eventData = event.extendedProps;

  const formattedDate = new Date(event.start).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleNavigateToProcess = () => {
    navigate(`/process-management?id=${eventData.processo?.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fechar"
        >
          <Icon name="X" size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground capitalize mb-3">
              {formattedDate}
            </p>

            {eventData.processo && (
              <div className="text-sm mb-3">
                <strong>Processo:</strong>{' '}
                <span className="text-primary cursor-pointer hover:underline" onClick={handleNavigateToProcess}>
                  {eventData.processo.numero_processo}
                </span>
                <br />
                <strong>Cliente:</strong> {eventData.processo.clientes?.nome_completo || 'N/A'}
              </div>
            )}

            {eventData.descricao && (
              <div className="text-sm text-gray-600 mb-3">
                <strong>Descrição:</strong> {eventData.descricao}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {!eventData.concluido && (
                <button
                  onClick={() => onComplete(event.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-green-50 text-green-600 hover:bg-green-100"
                >
                  <Icon name="CheckCircle" size={16} />
                  Concluir
                </button>
              )}

              <button
                onClick={() => onDelete(event.id)}
                className="flex items-center gap-2 px-3 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Icon name="Trash2" size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPopup;