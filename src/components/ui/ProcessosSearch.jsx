import React, { useState, useEffect } from 'react';
import SearchInput from './SearchInput';
import { supabase } from '../../services/supabaseClient';

const ProcessosSearch = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    const buscarProcessos = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('processos')
          .select(`
            id,
            numero_processo,
            titulo,
            cliente_id,
            clientes (
              id,
              nome
            )
          `)
          .eq('status', 'Ativo')
          .or(`numero_processo.ilike.%${searchTerm}%,clientes.nome.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        setResultados(data || []);
      } catch (error) {
        console.error('Erro ao buscar processos:', error);
        setResultados([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (searchTerm?.trim()) {
        buscarProcessos();
      } else {
        setResultados([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="relative">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Busque por número do processo ou nome do cliente"
        loading={isLoading}
      />

      {/* Lista de resultados */}
      {(resultados.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-600">
              Buscando processos...
            </div>
          ) : (
            resultados.map(processo => (
              <div
                key={processo.id}
                onClick={() => {
                  onSelect({
                    processo_id: processo.id,
                    processo_numero: processo.numero_processo,
                    processo_titulo: processo.titulo,
                    cliente_id: processo.cliente_id,
                    cliente_nome: processo.clientes?.nome
                  });
                  setSearchTerm(`${processo.numero_processo} (Cliente: ${processo.clientes?.nome})`);
                }}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="text-sm">
                  {processo.numero_processo} (Cliente: {processo.clientes?.nome})
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessosSearch;