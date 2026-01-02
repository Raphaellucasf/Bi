import React, { useState } from 'react';
import Icon from '../AppIcon';
import { analisarDocumento } from '../../services/documentAnalysisService';

/**
 * Botão para analisar documento com IA
 */
const DocumentAnalysisButton = ({ documentoId, caminhoLocal, onAnaliseCompleta }) => {
  const [analisando, setAnalisando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleAnalise = async () => {
    if (!caminhoLocal) {
      setErro('Caminho do documento não encontrado');
      return;
    }

    setAnalisando(true);
    setErro(null);

    try {
      const resultado = await analisarDocumento(documentoId, caminhoLocal);
      
      if (resultado.success) {
        if (onAnaliseCompleta) {
          onAnaliseCompleta(resultado);
        }
      } else {
        setErro(resultado.error || 'Erro ao analisar documento');
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setAnalisando(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAnalise}
        disabled={analisando || !caminhoLocal}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${analisando 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }
          ${!caminhoLocal ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={!caminhoLocal ? 'Documento não salvo localmente' : 'Analisar documento com IA'}
      >
        <Icon 
          name={analisando ? "Loader" : "Brain"} 
          size={16} 
          className={analisando ? "animate-spin" : ""}
        />
        {analisando ? 'Analisando...' : 'Resumir com IA'}
      </button>
      
      {erro && (
        <span className="text-xs text-red-600" title={erro}>
          ⚠️ Erro
        </span>
      )}
    </div>
  );
};

export default DocumentAnalysisButton;
