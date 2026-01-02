/**
 * Serviço para análise de documentos com IA
 * Lê PDFs e documentos do caminho local e gera resumos
 */

import { supabase } from './supabaseClient';
import { juliaService } from './juliaAIService';

// Bibliotecas para leitura de documentos (precisam ser instaladas)
// npm install pdf-parse mammoth

/**
 * Lê conteúdo de um arquivo PDF local usando Electron
 * @param {string} filePath - Caminho completo do arquivo
 * @returns {Promise<string>} Texto extraído do PDF
 */
export const lerPDF = async (filePath) => {
  try {
    // Se estiver rodando no Electron
    if (window.electron && window.electron.fs) {
      const buffer = await window.electron.fs.readFile(filePath);
      const pdfParse = await import('pdf-parse/lib/pdf-parse');
      const data = await pdfParse.default(buffer);
      return data.text;
    }
    
    // Fallback: usar FileReader API
    const response = await fetch(`file:///${filePath}`);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const pdfParse = await import('pdf-parse/lib/pdf-parse');
    const data = await pdfParse.default(Buffer.from(arrayBuffer));
    return data.text;
  } catch (error) {
    console.error('Erro ao ler PDF:', error);
    throw new Error('Não foi possível ler o arquivo PDF');
  }
};

/**
 * Lê conteúdo de um arquivo Word (.docx) local
 * @param {string} filePath - Caminho completo do arquivo
 * @returns {Promise<string>} Texto extraído do documento
 */
export const lerWord = async (filePath) => {
  try {
    if (window.electron && window.electron.fs) {
      const buffer = await window.electron.fs.readFile(filePath);
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    
    throw new Error('Leitura de Word requer ambiente Electron');
  } catch (error) {
    console.error('Erro ao ler Word:', error);
    throw new Error('Não foi possível ler o arquivo Word');
  }
};

/**
 * Determina o tipo de arquivo e lê seu conteúdo
 * @param {string} filePath - Caminho completo do arquivo
 * @returns {Promise<string>} Texto extraído
 */
export const lerDocumento = async (filePath) => {
  const extensao = filePath.split('.').pop().toLowerCase();
  
  switch (extensao) {
    case 'pdf':
      return await lerPDF(filePath);
    case 'docx':
    case 'doc':
      return await lerWord(filePath);
    case 'txt':
      if (window.electron && window.electron.fs) {
        return await window.electron.fs.readFile(filePath, 'utf-8');
      }
      throw new Error('Leitura de TXT requer ambiente Electron');
    default:
      throw new Error(`Tipo de arquivo não suportado: .${extensao}`);
  }
};

/**
 * Gera resumo de um documento usando Julia AI
 * @param {string} documentoId - ID do documento no Supabase
 * @param {string} caminhoLocal - Caminho local do arquivo
 * @returns {Promise<Object>} Resumo e análise do documento
 */
export const analisarDocumento = async (documentoId, caminhoLocal) => {
  try {
    // 1. Ler conteúdo do documento
    const conteudo = await lerDocumento(caminhoLocal);
    
    if (!conteudo || conteudo.trim().length < 50) {
      throw new Error('Documento vazio ou muito curto para análise');
    }
    
    // 2. Buscar informações do documento no banco
    const { data: documento } = await supabase
      .from('documentos')
      .select('*, processos(numero_processo, titulo, cliente_id)')
      .eq('id', documentoId)
      .single();
    
    // 3. Preparar prompt para Julia
    const prompt = `
Analise o seguinte documento processual e forneça:

1. **Resumo Executivo** (2-3 parágrafos)
2. **Pontos-Chave** (lista com principais informações)
3. **Prazos Identificados** (se houver)
4. **Ações Requeridas** (o que precisa ser feito)
5. **Classificação** (tipo de documento: petição, sentença, despacho, etc.)

**Documento:** ${documento?.titulo || 'Sem título'}
**Processo:** ${documento?.processos?.numero_processo || 'N/A'}

**Conteúdo:**
${conteudo.substring(0, 15000)} ${conteudo.length > 15000 ? '...(conteúdo truncado)' : ''}

Forneça a análise em formato estruturado e objetivo.
`;

    // 4. Enviar para Julia analisar
    const analise = await juliaService.sendMessage(prompt);
    
    // 5. Salvar resumo no banco
    const resumoData = {
      documento_id: documentoId,
      resumo: analise,
      conteudo_extraido: conteudo.substring(0, 10000), // Primeiros 10k chars
      analisado_em: new Date().toISOString(),
      tamanho_original: conteudo.length
    };
    
    await supabase
      .from('documentos')
      .update({ 
        resumo_ia: analise,
        analisado_em: new Date().toISOString()
      })
      .eq('id', documentoId);
    
    return {
      success: true,
      resumo: analise,
      tamanhoDocumento: conteudo.length,
      documento: documento
    };
    
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Analisa múltiplos documentos em lote
 * @param {Array<{id: string, caminho: string}>} documentos
 * @returns {Promise<Array>} Resultados das análises
 */
export const analisarDocumentosEmLote = async (documentos) => {
  const resultados = [];
  
  for (const doc of documentos) {
    try {
      const resultado = await analisarDocumento(doc.id, doc.caminho);
      resultados.push({
        id: doc.id,
        ...resultado
      });
      
      // Aguardar 2 segundos entre análises para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      resultados.push({
        id: doc.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return resultados;
};

/**
 * Busca documentos que precisam de análise (ainda não analisados)
 * @param {string} processoId - ID do processo
 * @returns {Promise<Array>} Lista de documentos pendentes
 */
export const buscarDocumentosPendentes = async (processoId) => {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('processo_id', processoId)
    .is('resumo_ia', null)
    .not('caminho_local_documento', 'is', null);
  
  if (error) {
    console.error('Erro ao buscar documentos pendentes:', error);
    return [];
  }
  
  return data || [];
};

export default {
  lerDocumento,
  lerPDF,
  lerWord,
  analisarDocumento,
  analisarDocumentosEmLote,
  buscarDocumentosPendentes
};
