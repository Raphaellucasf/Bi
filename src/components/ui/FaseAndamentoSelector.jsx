import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Select from './Select';
import Icon from '../AppIcon';

/**
 * Componente para seleção de Fase e Andamento de um processo
 * Com visualização do histórico de mudanças
 */
export const FaseAndamentoSelector = ({ 
  processoId, 
  faseAtual, 
  andamentoAtual,
  onFaseChange,
  onAndamentoChange,
  showHistory = false,
  compact = false 
}) => {
  const [fases, setFases] = useState([]);
  const [andamentos, setAndamentos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFase, setSelectedFase] = useState(faseAtual);
  const [selectedAndamento, setSelectedAndamento] = useState(andamentoAtual);

  // Carregar fases
  useEffect(() => {
    const fetchFases = async () => {
      const { data, error } = await supabase
        .from('fases_processuais')
        .select('*')
        .order('ordem');
      
      if (!error && data) {
        setFases(data);
      }
      setLoading(false);
    };
    
    fetchFases();
  }, []);

  // Carregar andamentos quando a fase mudar
  useEffect(() => {
    const fetchAndamentos = async () => {
      if (!selectedFase) {
        setAndamentos([]);
        return;
      }

      const { data, error } = await supabase
        .from('andamentos_processuais')
        .select('*')
        .eq('fase_id', selectedFase)
        .eq('ativo', true)
        .order('ordem_na_fase');
      
      if (!error && data) {
        setAndamentos(data);
      }
    };
    
    fetchAndamentos();
  }, [selectedFase]);

  // Carregar histórico se solicitado
  useEffect(() => {
    if (!showHistory || !processoId) return;

    const fetchHistorico = async () => {
      const { data, error } = await supabase
        .from('processos_historico_fases')
        .select(`
          *,
          fase:fases_processuais(nome, cor, icone),
          andamento:andamentos_processuais(nome)
        `)
        .eq('processo_id', processoId)
        .order('data_inicio', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setHistorico(data);
      }
    };
    
    fetchHistorico();
  }, [processoId, showHistory]);

  const handleFaseChange = (newFaseId) => {
    setSelectedFase(newFaseId);
    setSelectedAndamento(null); // Resetar andamento ao mudar fase
    if (onFaseChange) onFaseChange(newFaseId);
  };

  const handleAndamentoChange = (newAndamentoId) => {
    setSelectedAndamento(newAndamentoId);
    if (onAndamentoChange) onAndamentoChange(newAndamentoId);
  };

  // Opções para os selects
  const fasesOptions = fases.map(f => ({
    value: f.id,
    label: f.nome,
    icon: f.icone,
    color: f.cor
  }));

  const andamentosOptions = andamentos.map(a => ({
    value: a.id,
    label: a.nome,
    badge: a.gera_prazo ? `⏰ ${a.dias_prazo || '?'} dias` : null
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fase
          </label>
          <Select
            value={selectedFase}
            onChange={handleFaseChange}
            options={fasesOptions}
            placeholder="Selecione a fase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Andamento
          </label>
          <Select
            value={selectedAndamento}
            onChange={handleAndamentoChange}
            options={andamentosOptions}
            placeholder="Selecione o andamento"
            disabled={!selectedFase}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seleção de Fase */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fase Processual
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fases.map(fase => (
            <button
              key={fase.id}
              onClick={() => handleFaseChange(fase.id)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${selectedFase === fase.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: fase.cor }}
                >
                  <Icon name={fase.icone || 'Circle'} size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{fase.nome}</div>
                  <div className="text-xs text-gray-500">Fase {fase.ordem}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Andamento */}
      {selectedFase && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Andamento Atual
          </label>
          <div className="space-y-2">
            {andamentos.map(andamento => (
              <button
                key={andamento.id}
                onClick={() => handleAndamentoChange(andamento.id)}
                className={`
                  w-full p-3 rounded-lg border-2 transition-all text-left
                  ${selectedAndamento === andamento.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{andamento.nome}</span>
                  {andamento.gera_prazo && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      ⏰ {andamento.dias_prazo || '?'} dias
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      {showHistory && historico.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            📜 Histórico de Mudanças
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {historico.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-start gap-3 p-2 bg-gray-50 rounded"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"
                  style={{ backgroundColor: item.fase?.cor || '#6B7280' }}
                >
                  <Icon name={item.fase?.icone || 'Circle'} size={14} />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold">{item.fase?.nome}</div>
                  <div className="text-gray-600">{item.andamento?.nome}</div>
                  <div className="text-gray-400 mt-1">
                    {new Date(item.data_inicio).toLocaleDateString('pt-BR')}
                    {item.data_fim && ` até ${new Date(item.data_fim).toLocaleDateString('pt-BR')}`}
                  </div>
                  {item.observacoes && (
                    <div className="text-gray-500 italic mt-1">{item.observacoes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaseAndamentoSelector;
