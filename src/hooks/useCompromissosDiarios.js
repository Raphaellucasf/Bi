import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { isToday, isPast } from 'date-fns';

export const useCompromissosDiarios = () => {
  const [count, setCount] = useState(0);

  const fetchCompromissos = async () => {
    try {
      const { data, error } = await supabase
        .from('andamentos')
        .select('*')
        .eq('concluido', false);

      if (error) throw error;

      // Filtra apenas os compromissos de hoje que ainda não passaram
      const compromissosHoje = data.filter(compromisso => {
        const dataCompromisso = new Date(compromisso.data_andamento);
        return isToday(dataCompromisso) && !isPast(dataCompromisso);
      });

      setCount(compromissosHoje.length);
    } catch (error) {
      console.error('Erro ao buscar compromissos:', error);
    }
  };

  useEffect(() => {
    fetchCompromissos();
    const interval = setInterval(fetchCompromissos, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  return count;
};