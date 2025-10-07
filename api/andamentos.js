// Endpoint REST para buscar andamentos dos processos do escritório
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DATAJUS_API_KEY = process.env.DATAJUS_API_KEY;

module.exports = async function (req, res) {
  try {
    console.log('Query recebida:', req.query);
    const { escritorio_id, numero_processo, page = 1 } = req.query;
    const PAGE_SIZE = 15;
    let processos = [];
    // Busca por número de processo (prioritário)
    if (numero_processo) {
      const { data, error } = await supabase
        .from('processos')
        .select('id, numero_processo, titulo, status')
        .eq('numero_processo', numero_processo)
        .limit(1);
      console.log('Busca por numero_processo:', numero_processo, 'Resultado:', data, 'Erro:', error);
      if (error) throw error;
      processos = data;
    } else if (escritorio_id) {
      // Busca todos os processos ativos do escritório
      const { data, error } = await supabase
        .from('processos')
        .select('id, numero_processo, titulo, status')
          if (processos.length === 0) {
            return res.status(404).json({ error: 'Processo não encontrado no banco.' });
          }
          const processo = processos[0];
        .eq('escritorio_id', escritorio_id)
        .eq('status', 'ativo');
      if (error) throw error;
      processos = data;
    } else {
      return res.status(400).json({ error: 'escritorio_id ou numero_processo obrigatório' });
    }

    const processoIds = processos.map(p => p.id);
    if (processoIds.length === 0) {
      console.log('Nenhum processo encontrado para os parâmetros:', req.query);
      return res.json([]);
    }

    // Excluir andamentos de processos concluídos
    const processosConcluidos = processos.filter(p => p.status === 'concluido').map(p => p.id);
    if (processosConcluidos.length > 0) {
      await supabase.from('andamentos').delete().in('processo_id', processosConcluidos);
    }

    // Busca andamentos dos últimos 7 dias
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: andamentos, error: andError } = await supabase
      .from('andamentos')
      .select('id, processo_id, titulo, descricao, data_andamento, lido')
      .in('processo_id', processoIds)
      .gte('data_andamento', sevenDaysAgo)
      .order('data_andamento', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (andError) {
      console.log('Erro ao buscar andamentos:', andError);
      throw andError;
    }

    // Excluir andamentos antigos (mais de 7 dias)
    await supabase
      .from('andamentos')
      .delete()
      .in('processo_id', processoIds)
      .lt('data_andamento', sevenDaysAgo);

    // Junta dados do processo ao andamento
    const processosMap = Object.fromEntries(processos.map(p => [p.id, p]));
    const feed = andamentos.map(a => ({
      ...a,
      numero_processo: processosMap[a.processo_id]?.numero_processo,
      titulo_processo: processosMap[a.processo_id]?.titulo
    }));

  console.log('Feed retornado:', feed);
  res.json(feed);
  } catch (err) {
  console.error('Erro geral:', err);
  res.status(500).json({ error: err.message || err });
  }
};
