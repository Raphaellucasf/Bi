import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatProperName } from '../../../utils/formatters';

/**
 * Componente de Card de Cliente Otimizado com React.memo
 * Evita re-renders desnecessários quando as props não mudam
 */
const ClientCard = React.memo(({ 
  cliente, 
  onEdit, 
  onShowDetails, 
  onDelete,
  isDeleting 
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-foreground">
            {formatProperName(cliente.nome_completo)}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="FileText" size={16} /> 
              {cliente.tipo_pessoa === 'Pessoa Jurídica' ? 'CNPJ' : 'CPF'}: {cliente.cpf_cnpj}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="hover:text-primary" 
            onClick={() => onEdit(cliente)}
            title="Editar cliente"
          >
            <Icon name="Edit2" size={18} />
          </button>
          <button 
            className="hover:text-primary" 
            onClick={() => onShowDetails(cliente)}
            title="Ver detalhes"
          >
            <Icon name="Eye" size={18} />
          </button>
          <button
            className={`hover:text-red-600 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => onDelete(cliente.id)}
            disabled={isDeleting}
            title="Excluir cliente"
          >
            <Icon name="Trash2" size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          {cliente.status || 'Ativo'}
        </span>
        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
          {cliente.tipo_pessoa || 'Pessoa Física'}
        </span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function para otimização adicional
  // Retorna true se as props são iguais (não precisa re-render)
  return (
    prevProps.cliente.id === nextProps.cliente.id &&
    prevProps.cliente.updated_at === nextProps.cliente.updated_at &&
    prevProps.isDeleting === nextProps.isDeleting
  );
});

ClientCard.displayName = 'ClientCard';

export default ClientCard;
