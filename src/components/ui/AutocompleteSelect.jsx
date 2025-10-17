import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';

const AutocompleteSelect = ({
  value,
  onChange,
  onSearch,
  options,
  placeholder = 'Selecione uma opção',
  className = '',
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Controla a busca
  useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(() => {
      // Sempre chama onSearch, mesmo com string vazia
      onSearch(searchTerm || '');
    }, 200); // Debounce menor

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Encontra a opção selecionada
  const selectedOption = options?.find(option => option.value === value);

  // Manipula seleção de item
  const handleSelect = (option) => {
    if (onChange) {
      onChange(option.value);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // Manipula abertura do dropdown
  const handleOpen = () => {
    setIsOpen(true);
    // Foca no input de busca quando abrir
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Inicia a busca ao abrir
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Campo de busca/seleção */}
      {isOpen ? (
        <div className="relative">
          <div className={`flex items-center border rounded-md ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}`}>
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => {
                // Pequeno delay para permitir que o clique no item seja processado
                setTimeout(() => setIsOpen(false), 200);
              }}
              placeholder="Digite para buscar..."
              className="w-full pl-8 pr-8 py-2 bg-transparent focus:outline-none"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`flex items-center justify-between p-2 border rounded-md cursor-pointer hover:border-blue-500 transition-colors ${
            isOpen ? 'border-blue-500' : 'border-gray-300'
          }`}
          onClick={handleOpen}
        >
          <div className="flex-1 truncate">
            {selectedOption ? (
              <span className="text-gray-900">{selectedOption.label}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Buscando...</span>
            </div>
          ) : options?.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  option.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhuma opção disponível'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;
