import React from "react";
import { IMaskInput } from "react-imask";

export default function MaskedCurrencyInput({ value = '', onChange, ...props }) {
  return (
    <IMaskInput
      mask="R$ num"
      blocks={{
        num: {
          mask: Number,
          scale: 2, // reduz para 2 casas decimais
          radix: ",",
          thousandsSeparator: ".",
          mapToRadix: [",", "."], // garante que vírgula e ponto são aceitos
          padFractionalZeros: false, // não preenche zeros extras
          normalizeZeros: true,
          min: 0,
          max: 999999999999999.99 // até 15 dígitos e 2 casas decimais
        }
      }}
      value={value.toString()}
      onAccept={(unmaskedValue, mask) => {
        const rawValue = mask.unmaskedValue || '0';
        onChange({ target: { value: rawValue } });
      }}
      {...props}
      unmask={false}
      className={props.className || "input input-bordered w-full"}
      inputMode="decimal"
      // Permite digitar vírgula normalmente
      overwrite={true} // permite edição direta dos centavos
    />
  );
}
