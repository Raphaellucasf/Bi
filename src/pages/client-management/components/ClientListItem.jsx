import React from 'react';
import { formatProperName } from '../../../utils/formatters';

/**
 * Componente otimizado para itens da lista de clientes (tab "Todos")
 * Usa React.memo para evitar re-renders desnecessários
 */
const ClientListItem = React.memo(({ cliente }) => {
  return (
    <div className="flex flex-row items-center justify-between py-2 border-b last:border-b-0">
      <span className="font-medium text-foreground">
        {formatProperName(cliente.nome_completo)}
      </span>
      <span className="text-muted-foreground">
        {cliente.cpf_cnpj}
      </span>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada - só re-renderiza se o cliente mudou
  return (
    prevProps.cliente.id === nextProps.cliente.id &&
    prevProps.cliente.nome_completo === nextProps.cliente.nome_completo &&
    prevProps.cliente.cpf_cnpj === nextProps.cliente.cpf_cnpj
  );
});

ClientListItem.displayName = 'ClientListItem';

export default ClientListItem;
