import React from "react";
import { IMaskInput } from "react-imask";

export default function MaskedCurrencyInput({ value, onChange, ...props }) {
  return (
    <IMaskInput
      mask={Number}
      scale={2}
      signed={false}
      thousandsSeparator="."
      radix="," // separador decimal
      mapToRadix={["."]}
      normalizeZeros={true}
      padFractionalZeros={true}
      value={value}
      onAccept={val => onChange({ target: { value: val } })}
      {...props}
      unmask={false}
      prefix="R$ "
      className={props.className || "input input-bordered w-full"}
    />
  );
}
