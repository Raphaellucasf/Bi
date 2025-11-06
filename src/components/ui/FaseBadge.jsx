import React from 'react';
import Icon from '../AppIcon';

/**
 * Badge visual para exibir a fase e andamento de um processo
 * Pode ser usado em cards, listas e detalhes
 */
export const FaseBadge = ({ 
  faseNome, 
  faseCor = '#6B7280', 
  faseIcone = 'Circle',
  andamentoNome,
  size = 'md', // 'sm', 'md', 'lg'
  showAndamento = true,
  diasNaFase = null,
  onClick = null
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div 
      className={`
        inline-flex flex-col gap-1 rounded-lg 
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
      `}
      onClick={onClick}
    >
      {/* Fase principal */}
      <div 
        className={`
          inline-flex items-center gap-2 rounded-lg font-semibold text-white
          ${sizeClasses[size]}
        `}
        style={{ backgroundColor: faseCor }}
      >
        <Icon name={faseIcone} size={iconSizes[size]} />
        <span>{faseNome}</span>
        {diasNaFase !== null && (
          <span className="opacity-75 text-xs ml-1">
            ({diasNaFase}d)
          </span>
        )}
      </div>

      {/* Andamento (se houver) */}
      {showAndamento && andamentoNome && (
        <div 
          className={`
            inline-flex items-center gap-1 rounded ${sizeClasses[size]}
            bg-gray-100 text-gray-700 border border-gray-300
          `}
        >
          <Icon name="ChevronRight" size={iconSizes[size] - 2} />
          <span className="font-medium">{andamentoNome}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Timeline horizontal mostrando o progresso entre as fases
 */
export const FaseTimeline = ({ faseAtualOrdem, totalFases = 6 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalFases }).map((_, index) => {
        const faseNum = index + 1;
        const isComplete = faseNum < faseAtualOrdem;
        const isCurrent = faseNum === faseAtualOrdem;
        
        return (
          <React.Fragment key={faseNum}>
            <div 
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${isComplete ? 'bg-green-500 text-white' : ''}
                ${isCurrent ? 'bg-blue-500 text-white ring-4 ring-blue-200' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {isComplete ? '✓' : faseNum}
            </div>
            {faseNum < totalFases && (
              <div 
                className={`
                  flex-1 h-1 
                  ${isComplete ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/**
 * Card compacto com fase e andamento
 */
export const FaseCard = ({ 
  faseNome, 
  faseCor, 
  faseIcone, 
  andamentoNome,
  dataUltimaMudanca,
  observacoes
}) => {
  const diasDesdeUltimaMudanca = dataUltimaMudanca 
    ? Math.floor((new Date() - new Date(dataUltimaMudanca)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: faseCor }}
        >
          <Icon name={faseIcone} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm">{faseNome}</h4>
          {andamentoNome && (
            <p className="text-sm text-gray-600 mt-1">{andamentoNome}</p>
          )}
          {diasDesdeUltimaMudanca !== null && (
            <p className="text-xs text-gray-400 mt-2">
              Há {diasDesdeUltimaMudanca} {diasDesdeUltimaMudanca === 1 ? 'dia' : 'dias'}
            </p>
          )}
          {observacoes && (
            <p className="text-xs text-gray-500 italic mt-2 border-l-2 border-gray-300 pl-2">
              {observacoes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaseBadge;
