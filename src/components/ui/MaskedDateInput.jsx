import React from "react";
import { IMaskInput } from "react-imask";

export default function MaskedDateInput({ value, onChange, ...props }) {
  return (
    <IMaskInput
      mask="00/00/0000"
      value={value}
      onAccept={val => onChange({ target: { value: val } })}
      {...props}
      className={props.className || "input input-bordered w-full"}
      placeholder="dd/mm/aaaa"
    />
  );
}
