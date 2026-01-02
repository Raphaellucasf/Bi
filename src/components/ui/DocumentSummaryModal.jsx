import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

/**
 * Modal para exibir resumo do documento gerado pela IA
 */
const DocumentSummaryModal = ({ isOpen, onClose, resumo, documento }) => {
  if (!isOpen) return null;

  const formatarResumo = (texto) => {
    if (!texto) return null;
    
    // Divide em seções baseado em marcadores
    const secoes = texto.split(/\n\n+/);
    
    return secoes.map((secao, index) => {
      // Detecta títulos (linhas com ** ou ###)
      const isTitulo = secao.match(/^(\*\*|###)\s*(.+?)\s*(\*\*)?$/);
      
      if (isTitulo) {
        return (
          <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-purple-800">
            {isTitulo[2]}
          </h3>
        );
      }
      
      // Detecta listas
      const isLista = secao.match(/^[-•]\s/m);
      if (isLista) {
        const itens = secao.split('\n').filter(l => l.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4">
            {itens.map((item, i) => (
              <li key={i} className="text-gray-700">
                {item.replace(/^[-•]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      
      // Parágrafo normal
      return (
        <p key={index} className="text-gray-700 mb-3 leading-relaxed">
          {secao}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Brain" size={24} />
                <h2 className="text-2xl font-bold">Resumo Inteligente</h2>
              </div>
              <p className="text-purple-100 text-sm">
                Análise gerada por Julia AI
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              aria-label="Fechar"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Info do Documento */}
        {documento && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-gray-500" />
                <span className="font-medium text-gray-700">
                  {documento.titulo || 'Documento sem título'}
                </span>
              </div>
              {documento.tamanhoDocumento && (
                <span className="text-gray-500">
                  {(documento.tamanhoDocumento / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo do Resumo */}
        <div className="flex-1 overflow-y-auto p-6">
          {resumo ? (
            <div className="prose max-w-none">
              {formatarResumo(resumo)}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Icon name="FileQuestion" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum resumo disponível</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            💡 Dica: Use a Julia no chat para fazer perguntas sobre este documento
          </div>
          <Button onClick={onClose} variant="default">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummaryModal;
