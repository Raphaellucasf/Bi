export function formatCPF(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4")
    .slice(0, 14);
}

export function formatCNPJ(value) {
  return value
  .replace(/\D/g, "")
  .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5")
    .slice(0, 18);
}

// Formata automaticamente como CPF ou CNPJ dependendo do tamanho
export function formatCPF_CNPJ(value) {
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 11) {
    // É CPF (11 dígitos)
    return formatCPF(numbers);
  } else {
    // É CNPJ (14 dígitos)
    return formatCNPJ(numbers);
  }
}

export function formatTelefone(value) {
  return value
  .replace(/\D/g, "")
  .replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3")
    .slice(0, 15);
}

/**
 * Formata nomes próprios com primeira letra maiúscula e resto minúsculo
 * Preserva siglas comuns (LTDA, ME, EPP, S/A, etc.)
 * @param {string} text - Texto a ser formatado
 * @returns {string} - Texto formatado
 */
export function formatProperName(text) {
  if (!text) return '';
  
  // Lista de siglas e palavras que devem permanecer em maiúsculo
  const siglas = ['LTDA', 'ME', 'EPP', 'S/A', 'SA', 'EIRELI', 'CIA', 'SS'];
  
  // Lista de preposições e conectores que devem ficar em minúsculo
  const minusculas = ['da', 'de', 'do', 'das', 'dos', 'e', 'a', 'o', 'x'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Remove pontuação do final da palavra para verificação
      const cleanWord = word.replace(/[.,;:!?]$/, '');
      const punctuation = word.match(/[.,;:!?]$/)?.[0] || '';
      
      // Preserva siglas em maiúsculo
      if (siglas.includes(cleanWord.toUpperCase())) {
        return cleanWord.toUpperCase() + punctuation;
      }
      
      // Mantém preposições e conectores em minúsculo (exceto se for a primeira palavra)
      if (index > 0 && minusculas.includes(cleanWord.toLowerCase())) {
        return cleanWord.toLowerCase() + punctuation;
      }
      
      // Capitaliza primeira letra de cada palavra
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1) + punctuation;
    })
    .join(' ');
}

/**
 * Formata valor em centavos para moeda brasileira (R$)
 * @param {number|string} valueInCents - Valor em centavos (ex: 47902993 = R$ 479.029,93)
 * @returns {string} - Valor formatado (ex: "R$ 479.029,93")
 */
export function formatCurrency(valueInCents) {
  if (!valueInCents || valueInCents === 0) return 'R$ 0,00';
  
  // Converte para número se for string
  const numValue = typeof valueInCents === 'string' ? parseFloat(valueInCents) : valueInCents;
  
  // Divide por 100 para converter centavos em reais
  const valueInReais = numValue / 100;
  
  // Formata usando Intl.NumberFormat
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valueInReais);
}
