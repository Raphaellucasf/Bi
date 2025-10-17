require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const DATAJUS_API_KEY = process.env.DATAJUS_API_KEY;

async function fetchProcessos() {
  const { data, error } = await supabase
    .from('processos')
    .select('id, numero_processo, tribunal')
    .eq('ativo', true);
  if (error) throw error;
  return data;
}

// Remove pontuação do número do processo
function cleanProcessNumber(num) {
  return String(num).replace(/[^0-9]/g, '');
}

// Mapeia tribunal para endpoint
function getTRTEndpoint(tribunal) {
  const code = String(tribunal).toUpperCase().replace(/[^0-9]/g, '');
  if (!code) return null;
  return `https://api-publica.datajud.cnj.jus.br/api_publica_trt${code}/_search`;
}

async function fetchAndamentos(numero_processo, tribunal) {
  const endpoint = getTRTEndpoint(tribunal);
  if (!endpoint) return [];
  const numCrus = cleanProcessNumber(numero_processo);
  try {
    const { data } = await axios.post(endpoint, {
      query: {
        bool: {
          must: [
            { match: { "numeroProcesso.keyword": numCrus } }
          ]
        }
      }
    });
    // Retorna lista de andamentos (ajuste conforme resposta da API)
    return data.hits?.hits?.map(hit => hit._source) || [];
  } catch (err) {
    console.error('Erro ao buscar andamentos TRT:', err);
    return [];
  }
}

async function saveAndamento(processo_id, andamento) {
  const { data: existentes } = await supabase
    .from('andamentos')
    .select('id')
    .eq('processo_id', processo_id)
    .eq('descricao', andamento.descricao)
    .eq('data_andamento', andamento.data_andamento);

  if (existentes && existentes.length > 0) return;

  await supabase.from('andamentos').insert([{
    processo_id,
    titulo: andamento.titulo || '',
    descricao: andamento.descricao,
    data_andamento: andamento.data_andamento,
    lido: false
  }]);
}

async function syncDatajus() {
  try {
    const processos = await fetchProcessos();
    for (const proc of processos) {
      const andamentos = await fetchAndamentos(proc.numero_processo, proc.tribunal);
      for (const andamento of andamentos) {
        await saveAndamento(proc.id, andamento);
      }
    }
    console.log('Sincronização Datajus concluída!');
  } catch (err) {
    console.error('Erro na sincronização Datajus:', err);
  }
}

syncDatajus();
