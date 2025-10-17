import React from "react";
import { IMaskInput } from "react-imask";

export default function MaskedProcessNumberInput({ value, onChange, ...props }) {
  return (
    <IMaskInput
      mask="0000000-00.0000.0.00.0000"
      value={value}
      onAccept={val => onChange({ target: { value: val } })}
      {...props}
      className={props.className || "input input-bordered w-full"}
    />
  );
}
