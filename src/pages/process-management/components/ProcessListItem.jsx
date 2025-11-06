import React from 'react';
import { FaseBadge } from '../../../components/ui/FaseBadge';
import { formatProperName } from '../../../utils/formatters';

/**
 * Componente otimizado para itens da lista de processos (tab "Todos")
 * Usa React.memo para evitar re-renders desnecessários
 */
const ProcessListItem = React.memo(({ processo }) => {
  return (
    <div className="flex flex-row items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1">
        <span className="font-medium text-foreground">
          {formatProperName(processo.titulo)}
        </span>
        <span className="text-muted-foreground text-sm ml-3">
          {processo.numero_processo || 'Sem número'}
        </span>
      </div>
      
      {/* Badge de Fase - versão compacta */}
      {processo.fase_nome && (
        <div className="ml-4">
          <FaseBadge
            faseNome={processo.fase_nome}
            faseCor={processo.fase_cor}
            faseIcone={processo.fase_icone}
            andamentoNome={processo.andamento_nome}
            diasNaFase={processo.dias_na_fase_atual}
            size="sm"
            showAndamento={false}
          />
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada - só re-renderiza se o processo mudou
  return (
    prevProps.processo.id === nextProps.processo.id &&
    prevProps.processo.titulo === nextProps.processo.titulo &&
    prevProps.processo.numero_processo === nextProps.processo.numero_processo &&
    prevProps.processo.fase_nome === nextProps.processo.fase_nome
  );
});

ProcessListItem.displayName = 'ProcessListItem';

export default ProcessListItem;
