import React from 'react';

/**
 * Badge que indica conteúdo novo sincronizado pelo robô
 * @param {string} fonte - Origem do conteúdo ('pje', 'bot', 'manual')
 * @param {boolean} visualizado - Se já foi visualizado
 * @param {Date|string} sincronizadoEm - Data de sincronização
 * @param {string} className - Classes CSS adicionais
 */
const NewContentBadge = ({ fonte, visualizado = false, sincronizadoEm, className = '' }) => {
  // Não mostra badge se for manual ou já foi visualizado
  if (fonte === 'manual' || visualizado) {
    return null;
  }

  // Define cor e texto baseado na fonte
  const getBadgeStyle = () => {
    switch (fonte) {
      case 'pje':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-300',
          label: '🤖 NOVO - PJe'
        };
      case 'bot':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-300',
          label: '🤖 NOVO - Bot'
        };
      default:
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-300',
          label: '🆕 NOVO'
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${style.bg} ${style.text} ${style.border} ${className} animate-pulse`}
      title={sincronizadoEm ? `Sincronizado em: ${new Date(sincronizadoEm).toLocaleString('pt-BR')}` : 'Conteúdo novo'}
    >
      {style.label}
    </span>
  );
};

export default NewContentBadge;
