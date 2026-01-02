/**
 * Serviço para marcar andamentos e documentos como visualizados
 */
import { supabase } from './supabaseClient';

/**
 * Marca um andamento como visualizado
 * @param {string} andamentoId - ID do andamento
 * @returns {Promise<void>}
 */
export const marcarAndamentoComoVisualizado = async (andamentoId) => {
  if (!andamentoId) return;
  
  try {
    const { error } = await supabase
      .from('andamentos')
      .update({ visualizado: true })
      .eq('id', andamentoId);
    
    if (error) {
      console.error('Erro ao marcar andamento como visualizado:', error);
    }
  } catch (err) {
    console.error('Erro ao marcar andamento:', err);
  }
};

/**
 * Marca um documento como visualizado
 * @param {string} documentoId - ID do documento
 * @returns {Promise<void>}
 */
export const marcarDocumentoComoVisualizado = async (documentoId) => {
  if (!documentoId) return;
  
  try {
    const { error } = await supabase
      .from('documentos')
      .update({ visualizado: true })
      .eq('id', documentoId);
    
    if (error) {
      console.error('Erro ao marcar documento como visualizado:', error);
    }
  } catch (err) {
    console.error('Erro ao marcar documento:', err);
  }
};

/**
 * Marca todos os andamentos de um processo como visualizados
 * @param {string} processoId - ID do processo
 * @returns {Promise<void>}
 */
export const marcarTodosAndamentosComoVisualizados = async (processoId) => {
  if (!processoId) return;
  
  try {
    const { error } = await supabase
      .from('andamentos')
      .update({ visualizado: true })
      .eq('processo_id', processoId)
      .eq('visualizado', false);
    
    if (error) {
      console.error('Erro ao marcar andamentos como visualizados:', error);
    }
  } catch (err) {
    console.error('Erro ao marcar andamentos:', err);
  }
};

/**
 * Conta andamentos não visualizados de um processo
 * @param {string} processoId - ID do processo
 * @returns {Promise<number>}
 */
export const contarAndamentosNaoVisualizados = async (processoId) => {
  if (!processoId) return 0;
  
  try {
    const { count, error } = await supabase
      .from('andamentos')
      .select('id', { count: 'exact', head: true })
      .eq('processo_id', processoId)
      .eq('visualizado', false)
      .in('fonte', ['pje', 'bot']);
    
    if (error) {
      console.error('Erro ao contar andamentos não visualizados:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Erro ao contar andamentos:', err);
    return 0;
  }
};

/**
 * Conta total de andamentos não visualizados do escritório
 * @param {string} escritorioId - ID do escritório
 * @returns {Promise<number>}
 */
export const contarTotalAndamentosNaoVisualizados = async (escritorioId) => {
  if (!escritorioId) return 0;
  
  try {
    const { count, error } = await supabase
      .from('andamentos')
      .select('id', { count: 'exact', head: true })
      .eq('visualizado', false)
      .in('fonte', ['pje', 'bot'])
      .in('processo_id', 
        supabase.from('processos')
          .select('id')
          .eq('escritorio_id', escritorioId)
      );
    
    if (error) {
      console.error('Erro ao contar total de andamentos não visualizados:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Erro ao contar total:', err);
    return 0;
  }
};
