import React from "react";
import { IMaskInput } from "react-imask";

export default function MaskedCurrencyInput({ value = '', onChange, ...props }) {
  // Função para formatar valor numérico para exibição (ex: 47902993 -> "R$ 479.029,93")
  const formatValueForDisplay = (val) => {
    if (!val || val === '' || val === '0') return '';
    
    // Remove tudo que não é número
    const numericValue = String(val).replace(/\D/g, '');
    
    if (!numericValue || numericValue === '0') return '';
    
    // Divide por 100 para ter centavos
    const numberValue = parseFloat(numericValue) / 100;
    
    // Formata com separador de milhares e decimais brasileiros
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <IMaskInput
      mask="R$ num"
      blocks={{
        num: {
          mask: Number,
          scale: 2,
          thousandsSeparator: ".",
          radix: ",",
          mapToRadix: [","],
          padFractionalZeros: false,
          normalizeZeros: true,
          min: 0,
          max: 999999999999999.99
        }
      }}
      value={formatValueForDisplay(value)}
      onAccept={(maskedValue, mask) => {
        // Extrai apenas os números (remove R$, pontos e vírgula)
        const numbersOnly = maskedValue.replace(/\D/g, '');
        
        // Retorna o valor numérico puro (em centavos) como string
        // Ex: "R$ 479.029,93" -> "47902993"
        onChange({ target: { value: numbersOnly || '0' } });
      }}
      {...props}
      unmask={false}
      className={props.className || "input input-bordered w-full"}
      inputMode="decimal"
      overwrite={false}
    />
  );
}
