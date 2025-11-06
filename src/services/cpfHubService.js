/**
 * Serviço para integração com API CPFHub
 * API: https://cpfhub.io/
 * Plano: 50 buscas gratuitas mensais
 */

const CPFHUB_API_KEY = '616dba7bb9ba1ad271f17ab8ddbbfe99fa3e5a7b24a99ddea86cbe69e1451ba6';
const CPFHUB_BASE_URL = 'https://api.cpfhub.io';

/**
 * Busca dados de uma pessoa física pelo CPF
 * @param {string} cpf - CPF para busca (com ou sem máscara)
 * @returns {Promise<Object|null>} Dados da pessoa ou null se não encontrado
 */
export async function buscarCPF(cpf) {
  try {
    // Remove formatação do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Valida se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }

    console.log('🔍 Buscando CPF no CPFHub:', cpfLimpo);

    const response = await fetch(`${CPFHUB_BASE_URL}/cpf/${cpfLimpo}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': CPFHUB_API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ CPF não encontrado no CPFHub');
        return null;
      }
      if (response.status === 429) {
        throw new Error('Limite de consultas CPF atingido (50/mês)');
      }
      const errorText = await response.text();
      console.error('❌ Erro na API CPFHub:', response.status, errorText);
      throw new Error(`Erro na API CPFHub: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Resposta completa do CPFHub:', result);
    
    // A API retorna { success: true, data: {...} }
    if (!result.success || !result.data) {
      console.log('ℹ️ CPF não encontrado ou resposta inválida');
      return null;
    }

    const data = result.data;

    // Mapeia os dados para o formato esperado pelo sistema
    return {
      cpf: formatarCPF(cpfLimpo),
      nome_completo: data.name || data.nome || '',
      data_nascimento: data.birthDate || data.nascimento || null,
      situacao_cpf: data.status || data.situacao || null,
      mae: data.motherName || data.nome_mae || '',
      endereco: data.address ? {
        cep: data.address.cep || '',
        logradouro: data.address.street || data.address.logradouro || '',
        numero: data.address.number || data.address.numero || '',
        complemento: data.address.complement || data.address.complemento || '',
        bairro: data.address.neighborhood || data.address.bairro || '',
        cidade: data.address.city || data.address.cidade || '',
        uf: data.address.state || data.address.uf || ''
      } : null,
      telefones: data.phones || data.telefones || [],
      emails: data.emails || [],
      // Metadados
      fonte: 'CPFHub',
      data_consulta: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erro ao buscar CPF no CPFHub:', error);
    throw error;
  }
}

/**
 * Formata CPF com máscara
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado (000.000.000-00)
 */
function formatarCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida se CPF é válido (algoritmo de verificação)
 * @param {string} cpf - CPF para validar
 * @returns {boolean} True se válido
 */
export function validarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto < 2 ? 0 : resto;
  
  if (parseInt(cpfLimpo.charAt(9)) !== digito1) return false;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto < 2 ? 0 : resto;
  
  return parseInt(cpfLimpo.charAt(10)) === digito2;
}

/**
 * Retorna informações sobre o plano de uso da API
 * @returns {Object} Informações do plano
 */
export function getPlanoInfo() {
  return {
    plano: 'Gratuito',
    limite_mensal: 50,
    consultas_restantes: 'Consulte o dashboard CPFHub',
    renovacao: 'Mensal',
    url_dashboard: 'https://cpfhub.io/dashboard'
  };
}