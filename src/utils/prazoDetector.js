/**
 * Utilitário para detectar e extrair prazos de textos jurídicos
 */

/**
 * Detecta se um texto contém menção a prazos ou ações com prazo
 * @param {string} texto - Texto a ser analisado
 * @returns {boolean} True se contém prazo
 */
export const detectarPrazo = (texto) => {
  if (!texto) return false;
  
  const textoLower = texto.toLowerCase();
  
  // Padrões de prazo
  const padroes = [
    // Datas específicas
    /\d{2}\/\d{2}\/\d{4}/,
    /\d{2}\.\d{2}\.\d{4}/,
    
    // "X dias/horas para..."
    /\d+\s*(dia|dias|hora|horas|h)\s*(para|até|prazo)/i,
    
    // "prazo de X dias"
    /(prazo|réplica|contestação|resposta|manifestação|impugnação)\s*(de|em|até)?\s*\d+\s*(dia|dias|hora|horas|h)/i,
    
    // Liberação de prazos
    /libere?-se\s*(a|o)\s*(contestação|resposta|réplica|manifestação|impugnação)/i,
    
    // Intimações
    /(intimação|intimar|intime?-se|intimado)\s*(para|ao|à|a|da|do)/i,
    
    // Ações com prazo implícito
    /conciliação\s*(rejeitada|aceita|designada|realizada)/i,
    /(audiência|sessão)\s*(designada|marcada|agendada)/i,
    
    // Expressões de urgência
    /(urgente|imediato|prazo\s*fatal|prazo\s*peremptório)/i,
    
    // Contagem de dias específica
    /\d+\s*(dias?\s*úteis|dias?\s*corridos)/i,
    
    // Prazo em horas
    /\d{1,2}h\d{0,2}\s*(para|até)/i, // "24h para", "48h para"
    
    // Termos de prazo processual
    /(cumpra-se|apresente|junte|manifeste-se)\s*(no\s*prazo|em\s*\d+)/i,
  ];
  
  return padroes.some(padrao => padrao.test(textoLower));
};

/**
 * Extrai informações detalhadas sobre o prazo
 * @param {string} texto - Texto a ser analisado
 * @returns {Object|null} Informações do prazo ou null
 */
export const extrairInfoPrazo = (texto) => {
  if (!texto) return null;
  
  const textoLower = texto.toLowerCase();
  const info = {
    temPrazo: false,
    tipo: null,
    quantidade: null,
    unidade: null,
    dataEspecifica: null,
    urgente: false,
    descricao: null
  };
  
  // Data específica
  const matchData = texto.match(/(\d{2})[\/\.](\d{2})[\/\.](\d{4})/);
  if (matchData) {
    info.temPrazo = true;
    info.tipo = 'data_especifica';
    info.dataEspecifica = matchData[0];
    info.descricao = `Prazo até ${matchData[0]}`;
  }
  
  // X dias/horas para algo
  const matchDias = textoLower.match(/(\d+)\s*(dia|dias|hora|horas|h)\s*(para|até|prazo)/i);
  if (matchDias) {
    info.temPrazo = true;
    info.tipo = 'prazo_relativo';
    info.quantidade = parseInt(matchDias[1]);
    info.unidade = matchDias[2].includes('dia') ? 'dias' : 'horas';
    info.descricao = `Prazo de ${info.quantidade} ${info.unidade}`;
  }
  
  // Libere-se a contestação
  if (/libere?-se\s*(a|o)\s*(contestação|resposta|réplica)/i.test(textoLower)) {
    info.temPrazo = true;
    info.tipo = 'liberacao_prazo';
    info.descricao = 'Prazo liberado para resposta';
  }
  
  // Intimação
  if (/(intimação|intimar|intime-se)/i.test(textoLower)) {
    info.temPrazo = true;
    info.tipo = 'intimacao';
    info.descricao = 'Intimação com prazo';
  }
  
  // Conciliação
  if (/conciliação\s*(rejeitada|aceita)/i.test(textoLower)) {
    info.temPrazo = true;
    info.tipo = 'conciliacao';
    info.descricao = 'Prazo de resposta após conciliação';
  }
  
  // Urgência
  if (/(urgente|imediato|prazo\s*fatal)/i.test(textoLower)) {
    info.urgente = true;
  }
  
  return info.temPrazo ? info : null;
};

/**
 * Calcula a criticidade do prazo (alta, média, baixa)
 * @param {string} texto - Texto do andamento
 * @returns {string} 'alta', 'media' ou 'baixa'
 */
export const calcularCriticidadePrazo = (texto) => {
  if (!texto) return 'baixa';
  
  const textoLower = texto.toLowerCase();
  const info = extrairInfoPrazo(texto);
  
  // Alta criticidade
  if (
    info?.urgente ||
    /urgente|imediato|fatal|peremptório/i.test(textoLower) ||
    (info?.unidade === 'horas') ||
    (info?.quantidade && info.quantidade <= 2)
  ) {
    return 'alta';
  }
  
  // Média criticidade
  if (
    /contestação|resposta|réplica|impugnação/i.test(textoLower) ||
    (info?.quantidade && info.quantidade <= 10)
  ) {
    return 'media';
  }
  
  return 'baixa';
};

export default {
  detectarPrazo,
  extrairInfoPrazo,
  calcularCriticidadePrazo
};
