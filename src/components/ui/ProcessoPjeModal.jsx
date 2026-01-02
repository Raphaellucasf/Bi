import React from 'react';
import Icon from '../AppIcon';

const ProcessoPjeModal = ({ processo, open, onClose }) => {
  if (!open || !processo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Icon name="FileText" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informações do PJe</h2>
              <p className="text-blue-100 text-sm">{processo.numero_processo || 'Sem número'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Badges de Status */}
          <div className="flex flex-wrap gap-3 mb-6">
            {processo.andamento_fonte && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
                <Icon name="Bot" size={16} />
                <span className="text-sm font-semibold">Sincronizado via {processo.andamento_fonte.toUpperCase()}</span>
              </div>
            )}
            {processo.tem_prazo && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                processo.criticidade_prazo === 'alta' 
                  ? 'bg-red-100 text-red-700 animate-pulse' 
                  : processo.criticidade_prazo === 'media'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                <Icon name="AlertCircle" size={16} />
                <span className="text-sm font-semibold">
                  {processo.criticidade_prazo === 'alta' ? 'PRAZO URGENTE' : 'Com Prazo'}
                </span>
              </div>
            )}
            {processo.processo_status && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <Icon name="CheckCircle" size={16} />
                <span className="text-sm font-semibold">{processo.processo_status}</span>
              </div>
            )}
          </div>

          {/* Informações Básicas do Processo */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="Scale" size={20} className="text-blue-600" />
              Dados do Processo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Número do Processo</p>
                <p className="text-sm font-semibold text-gray-900">{processo.numero_processo || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cliente</p>
                <p className="text-sm font-semibold text-gray-900">{processo.cliente_nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-900">{processo.processo_status || 'Ativo'}</p>
              </div>
              {processo.data_andamento && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data do Último Andamento</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(processo.data_andamento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {processo.andamento_sincronizado_em && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sincronizado em</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(processo.andamento_sincronizado_em).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Último Andamento */}
          {processo.andamento_descricao && (
            <div className="bg-blue-50 rounded-xl p-5 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-blue-600" />
                Último Andamento
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {processo.andamento_descricao}
              </p>
              {processo.info_prazo && (
                <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 rounded">
                  <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                    <Icon name="Clock" size={16} />
                    {processo.info_prazo.descricao}
                  </p>
                  {processo.info_prazo.tipo && (
                    <p className="text-xs text-red-600 mt-1">
                      Tipo: {processo.info_prazo.tipo}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resumo da Julia AI */}
          {processo.resumo_ia ? (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Brain" size={20} className="text-purple-600" />
                Análise da Julia AI
              </h3>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {processo.resumo_ia}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-600">
                <Icon name="Sparkles" size={14} />
                <span>Resumo gerado automaticamente por Inteligência Artificial</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Brain" size={20} className="text-gray-400" />
                Análise da Julia AI
              </h3>
              <div className="text-center py-6">
                <Icon name="FileQuestion" size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">Nenhum documento analisado ainda</p>
                <p className="text-xs text-gray-400 mt-1">A Julia irá analisar os documentos baixados automaticamente</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Icon name="Check" size={18} />
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessoPjeModal;
