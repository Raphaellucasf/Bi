import React from 'react';
import InputMask from 'react-input-mask';

export default function MaskedInput({ label, value, onChange, placeholder, ...props }) {
  return (
    <div className="w-full flex flex-col gap-2">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <InputMask
        mask="9999999-99.9999.9.99.9999"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
    </div>
  );
}
