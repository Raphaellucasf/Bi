import Button from "../components/ui/Button";
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";
import NewContentBadge from "../components/ui/NewContentBadge";
import { supabase } from '../services/supabaseClient';
import React, { useEffect, useState } from "react";

const Monitoring = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      // 1. Pega usuário logado
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setFeed([]);
        setLoading(false);
        return;
      }
      // 2. Busca escritorio_id do perfil
      const { data: perfil, error } = await supabase
        .from('perfis')
        .select('escritorio_id')
        .eq('user_id', user.id)
        .single();
      if (error || !perfil?.escritorio_id) {
        setFeed([]);
        setLoading(false);
        return;
      }
      // 3. Busca andamentos do escritório
      const res = await fetch(`/api/andamentos?escritorio_id=${perfil.escritorio_id}`);
      const data = await res.json();
      setFeed(data);
      setLoading(false);
    }
    fetchFeed();
  }, []);

  // Teste: buscar andamentos de um processo específico
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  async function testFetchProcess() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/andamentos?numero_processo=1001658-73.2025.5.02.0070`);
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ error: 'Erro ao buscar processo.' });
    }
    setTestLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Acompanhamento Processual</h1>
          <Button onClick={() => window.location.reload()} className="mb-6">Atualizar Lista</Button>
          <Button onClick={testFetchProcess} variant="outline" className="mb-6 ml-2">Testar processo 1001658-73.2025.5.02.0070</Button>
          {testLoading && <div className="text-center py-2 text-muted-foreground">Buscando processo de teste...</div>}
          {testResult && (
            <div className="my-4 p-4 border rounded bg-white">
              <div className="font-bold mb-2">Resultado do teste:</div>
              {testResult.error ? (
                <div className="text-red-600">{testResult.error}</div>
              ) : Array.isArray(testResult) && testResult.length > 0 ? (
                <ul className="list-disc pl-4">
                  {testResult.map((a, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{a.numero_processo}</span> - {a.descricao}
                    </li>
                  ))}
                </ul>
              ) : (
                <div>Nenhum andamento encontrado para o processo.</div>
              )}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando andamentos...</div>
          ) : feed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum andamento encontrado.</div>
          ) : (
            <div className="space-y-6">
              {feed.map(a => (
                <div key={a.id} className="bg-white border border-border rounded-xl p-6 shadow flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{a.numero_processo}</span>
                      <span className="text-muted-foreground">{a.titulo_processo}</span>
                      <NewContentBadge 
                        fonte={a.fonte}
                        visualizado={a.visualizado}
                        sincronizadoEm={a.sincronizado_em}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(a.data_andamento).toLocaleDateString()}</span>
                  </div>
                  <div className="text-foreground mb-2">{a.descricao}</div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" href={`/process-management/${a.processo_id}`}>Ver detalhes</Button>
                    {a.sincronizado_em && (
                      <span className="text-xs text-muted-foreground">
                        🔄 Sincronizado: {new Date(a.sincronizado_em).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Monitoring;
