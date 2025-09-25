import genAI from '../utils/geminiClient';

/**
 * Summarizes publication content using Gemini AI
 * @param {string} publicationText - The publication text to summarize
 * @returns {Promise<string>} The AI-generated summary
 */
export async function summarizePublication(publicationText) {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      Você é um assistente jurídico especializado em análise de publicações legais.
      Analise a seguinte publicação e forneça um resumo conciso e profissional:
      
      PUBLICAÇÃO:
      ${publicationText}
      
      INSTRUÇÕES:
      - Identifique os pontos principais da publicação
      - Destaque informações importantes para advogados
      - Use linguagem jurídica apropriada
      - Mantenha o resumo entre 100-200 palavras
      - Inclua datas e prazos relevantes se mencionados
      
      RESUMO:
    `;
    
    const result = await model?.generateContent(prompt);
    const response = await result?.response;
    return response?.text();
  } catch (error) {
    console.error('Error in publication summarization:', error);
    throw new Error('Erro ao gerar resumo da publicação. Tente novamente.');
  }
}

/**
 * Analyzes case progress and provides insights
 * @param {Object} processData - The process data to analyze
 * @returns {Promise<string>} The AI-generated analysis
 */
export async function analyzeProcessProgress(processData) {
  try {
    const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      Analise o progresso deste processo jurídico e forneça insights profissionais:
      
      DADOS DO PROCESSO:
      - Número: ${processData?.processNumber}
      - Cliente: ${processData?.clientName}
      - Tipo: ${processData?.processType}
      - Status: ${processData?.status}
      - Data de criação: ${processData?.createdDate}
      - Próximo prazo: ${processData?.nextDeadline}
      - Descrição: ${processData?.description}
      
      Forneça:
      1. Análise do status atual
      2. Próximos passos recomendados
      3. Alertas sobre prazos importantes
      4. Sugestões para otimização
    `;
    
    const result = await model?.generateContent(prompt);
    const response = await result?.response;
    return response?.text();
  } catch (error) {
    console.error('Error in process analysis:', error);
    throw new Error('Erro ao analisar progresso do processo. Tente novamente.');
  }
}