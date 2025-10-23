import React, { useState, useEffect, useRef } from "react";

export default function SimpleAutocomplete({ label, options, value, onChange, placeholder = "Digite para buscar...", disabled = false, required = false, className = "" }) {
  const [inputValue, setInputValue] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue.length > 0) {
      const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
      const busca = normalize(inputValue);
      setFiltered(
        options
          .filter(opt => normalize(opt.label).includes(busca))
          .slice(0, 10)
      );
    } else {
      setFiltered([]);
    }
  }, [inputValue, options]);

  useEffect(() => {
    if (value) {
      const selected = options.find(opt => opt.value === value);
      if (selected) setInputValue(selected.label);
    }
  }, [value, options]);

  return (
    <div className={`w-full flex flex-col gap-2 relative ${className}`}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        ref={inputRef}
        className="w-full rounded-lg border border-border bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          setShowOptions(true);
        }}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 150)}
        disabled={disabled}
        required={required}
        autoComplete="off"
        onKeyDown={e => {
          if (e.key === 'Enter' && filtered.length > 0) {
            setInputValue(filtered[0].label);
            setShowOptions(false);
            console.log('DEBUG [Autocomplete] selecionado via Enter:', filtered[0].value);
            onChange(filtered[0].value);
            inputRef.current.blur();
          }
        }}
      />
      {showOptions && filtered.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {filtered.map(opt => (
            <div
              key={opt.value}
              className={`px-3 py-2 cursor-pointer hover:bg-primary/10 text-sm ${value === opt.value ? 'bg-primary/10 font-semibold' : ''}`}
              onMouseDown={() => {
                setInputValue(opt.label);
                setShowOptions(false);
                console.log('DEBUG [Autocomplete] selecionado via clique:', opt.value);
                onChange(opt.value);
                inputRef.current.blur();
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
