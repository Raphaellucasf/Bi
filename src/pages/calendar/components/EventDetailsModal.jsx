import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventDetailsModal = ({ event, onClose, onComplete, onDelete }) => {
  const navigate = useNavigate();
  const { extendedProps } = event;

  const formattedDate = format(new Date(event.start), "EEEE, d 'de' MMMM 'às' HH:mm", {
    locale: ptBR
  });

  const navigateToProcess = () => {
    if (extendedProps?.processo?.id) {
      navigate(`/process-management?id=${extendedProps.processo.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <Icon name="X" size={20} />
        </button>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${extendedProps.tipo === 'Audiência' ? 'bg-green-100 text-green-800' : ''}
                ${extendedProps.tipo === 'Prazo' ? 'bg-red-100 text-red-800' : ''}
                ${extendedProps.tipo === 'Reunião' ? 'bg-blue-100 text-blue-800' : ''}
              `}>
                {extendedProps.tipo}
              </span>
              {extendedProps.concluido && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Concluído
                </span>
              )}
            </div>
          </div>

          {extendedProps.processo && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Processo:</p>
              <button
                onClick={navigateToProcess}
                className="text-primary hover:underline font-medium"
              >
                {extendedProps.processo.numero_processo}
              </button>
              <p className="mt-1">
                <span className="text-muted-foreground">Cliente: </span>
                {extendedProps.processo.clientes?.nome_completo || 'N/A'}
              </p>
            </div>
          )}

          {extendedProps.descricao && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Descrição:</p>
              <p>{extendedProps.descricao}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {!extendedProps.concluido && (
              <button
                onClick={() => onComplete(event.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
              >
                <Icon name="CheckCircle" size={16} />
                Marcar como concluído
              </button>
            )}
            <button
              onClick={() => onDelete(event.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Icon name="Trash2" size={16} />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;