import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

const ProcessSearch = ({
  value,
  onChange,
  onSearch,
  options = [],
  isLoading = false,
  placeholder = 'Buscar por número ou nome do cliente',
  className = '' // Adicionando prop className com valor padrão vazio
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar a abertura da lista
  const wrapperRef = React.useRef(null);

  // Controla a busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Controla a busca
  useEffect(() => {
    if (!onSearch) return;

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  // Manipula seleção de item
  const handleSelect = (option) => {
    if (onChange) {
      onChange(option.value);
      setSearchTerm(option.label); // Mantém o texto selecionado no input
      setIsOpen(false);
    }
  };

  // Manipula input de busca
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
  };

  // Fecha a lista ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}> {/* Usando a prop className */}
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Lista de resultados */}
      {isOpen && (options?.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-600">Buscando processos...</span>
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                {option.dados && (
                  <div className="mt-1 text-xs text-gray-500">
                    {option.dados.processo.titulo}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {isOpen && !isLoading && options?.length === 0 && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-sm text-gray-500">
            Nenhum processo encontrado
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessSearch;