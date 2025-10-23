export function formatCNPJ(value) {
  return value
  .replace(/\D/g, "")
  .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3-$4.$5")
    .slice(0, 18);
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
