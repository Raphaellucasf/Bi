import React from 'react';
import Icon from '../../../components/AppIcon';
import { FaseBadge } from '../../../components/ui/FaseBadge';
import { formatProperName } from '../../../utils/formatters';

/**
 * Componente de Card de Processo Otimizado com React.memo
 * Evita re-renders desnecessários quando as props não mudam
 */
const ProcessCard = React.memo(({ 
  processo, 
  clientName, 
  onEdit, 
  onShowDetails, 
  onDelete,
  isDeleting 
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-lg font-semibold text-foreground">
            {formatProperName(processo.titulo)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="FileText" size={16} /> 
              Nº {processo.numero_processo || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="User" size={16} /> 
              {clientName ? (
                formatProperName(clientName)
              ) : (
                <span className="italic text-gray-400">Cliente não encontrado</span>
              )}
            </span>
          </div>
          
          {/* Badge de Fase e Andamento */}
          {processo.fase_nome && (
            <div className="mt-2">
              <FaseBadge
                faseNome={processo.fase_nome}
                faseCor={processo.fase_cor}
                faseIcone={processo.fase_icone}
                andamentoNome={processo.andamento_nome}
                diasNaFase={processo.dias_na_fase_atual}
                size="sm"
                showAndamento={true}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            className="hover:text-primary" 
            onClick={() => onEdit(processo)}
            title="Editar processo"
          >
            <Icon name="Edit2" size={18} />
          </button>
          <button 
            className="hover:text-primary" 
            onClick={() => onShowDetails(processo)}
            title="Ver detalhes"
          >
            <Icon name="Eye" size={18} />
          </button>
          <button
            className={`hover:text-red-600 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => onDelete(processo)}
            disabled={isDeleting}
            title="Excluir processo"
          >
            <Icon name="Trash2" size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          processo.status === 'Ativo' 
            ? 'bg-green-100 text-green-700' 
            : processo.status === 'Pendente' 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {processo.status || 'Ativo'}
        </span>
        
        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
          {processo.area_direito || 'Geral'}
        </span>
        
        {processo.prioridade && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            processo.prioridade === 'Alta' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {processo.prioridade}
          </span>
        )}
        
        {processo.processos_empresas && processo.processos_empresas.length > 0 && (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Icon name="Building2" size={14} /> 
            {processo.processos_empresas.length} parte{processo.processos_empresas.length > 1 ? 's' : ''} contrária{processo.processos_empresas.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function para otimização adicional
  // Retorna true se as props são iguais (não precisa re-render)
  return (
    prevProps.processo.id === nextProps.processo.id &&
    prevProps.processo.updated_at === nextProps.processo.updated_at &&
    prevProps.clientName === nextProps.clientName &&
    prevProps.isDeleting === nextProps.isDeleting
  );
});

ProcessCard.displayName = 'ProcessCard';

export default ProcessCard;
