import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Icon from '../AppIcon';

/**
 * Badge que mostra contador de andamentos/documentos novos não visualizados
 */
const UnreadCountBadge = ({ escritorioId }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!escritorioId) return;

    const fetchCount = async () => {
      try {
        // Buscar processos do escritório
        const { data: processos } = await supabase
          .from('processos')
          .select('id')
          .eq('escritorio_id', escritorioId);

        if (!processos || processos.length === 0) {
          setCount(0);
          setLoading(false);
          return;
        }

        const processoIds = processos.map(p => p.id);

        // Contar andamentos não visualizados do bot/pje
        const { count: andamentosCount } = await supabase
          .from('andamentos')
          .select('id', { count: 'exact', head: true })
          .in('processo_id', processoIds)
          .eq('visualizado', false)
          .in('fonte', ['pje', 'bot']);

        setCount(andamentosCount || 0);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar contagem de não lidos:', error);
        setLoading(false);
      }
    };

    fetchCount();

    // Configurar subscription para atualizar em tempo real
    const subscription = supabase
      .channel('andamentos_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'andamentos',
          filter: `fonte=in.(pje,bot)`
        },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [escritorioId]);

  if (loading || count === 0) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer group" title={`${count} novo${count > 1 ? 's' : ''} andamento${count > 1 ? 's' : ''}`}>
      <Icon name="Bell" size={18} className="text-blue-600" />
      <span className="text-sm font-semibold text-blue-700">{count}</span>
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
      </span>
      <span className="hidden group-hover:inline-block text-xs text-blue-600">
        {count > 1 ? 'novos andamentos' : 'novo andamento'}
      </span>
    </div>
  );
};

export default UnreadCountBadge;
