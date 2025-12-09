import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { supabase } from "../../services/supabaseClient";
import PatronoModal from "./PatronoModal";
import { formatCNPJ, formatTelefone } from "../../utils/formatters";
import { useNavigate } from "react-router-dom";
import { externalSyncService } from "../../services/externalSupabaseSync";


const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfis } = await supabase.from('perfis').select('escritorio_id').eq('user_id', user.id).limit(1);
  return perfis && perfis[0]?.escritorio_id;
};

const Settings = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined" && window.localStorage.getItem("theme")) {
      return window.localStorage.getItem("theme");
    }
    return "light";
  });
  const [language, setLanguage] = useState("pt-BR");
  const [notifications, setNotifications] = useState(true);
  const [patronos, setPatronos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [escritorioId, setEscritorioId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStats, setSyncStats] = useState(externalSyncService.getStats());
  const navigate = useNavigate();

  // Atualizar estatísticas de sync a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStats(externalSyncService.getStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      const eid = await getEscritorioId();
      setEscritorioId(eid);
      if (!eid) { setPatronos([]); setLoading(false); return; }
      const { data } = await supabase.from('patrono').select('*').eq('escritorio_id', eid);
      if (!ignore) setPatronos(data || []);
      setLoading(false);
    })();
    return () => { ignore = true; };
  }, [modalOpen]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const handleAddPatrono = async (patrono) => {
    setLoading(true);
    const { error } = await supabase.from('patrono').insert([patrono]);
    if (error) {
      alert('Erro ao salvar patrono: ' + error.message);
      console.error('Supabase patrono insert error:', error);
    } else {
      setModalOpen(false);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
        <h2 className="text-3xl font-bold">Configurações</h2>
      </div>
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Aparência</div>
        <div className={`rounded-xl shadow p-4 flex items-center gap-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
          <span className="text-xl">{theme === 'dark' ? '🌙' : '🌞'}</span>
          <div className="flex-1">
            <div className="font-medium">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</div>
            <div className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</div>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={e => setTheme(e.target.checked ? 'dark' : 'light')}
              className="sr-only"
            />
            <span className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-4' : ''}`}></span>
            </span>
          </label>
        </div>
      </div>
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Patronos</div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Pesquisar patrono..."
              disabled
            />
            <Button variant="default" onClick={() => setModalOpen(true)}>
              + Adicionar Patrono
            </Button>
          </div>
          <div className="mb-2 font-medium">Patronos cadastrados:</div>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <span className="text-muted-foreground">Carregando...</span>
            ) : patronos.length === 0 ? (
              <span className="text-muted-foreground">Nenhum patrono cadastrado.</span>
            ) : (
              patronos.map(p => (
                <span key={p.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {p.razao_social} {p.nome_fantasia ? `(${p.nome_fantasia})` : ""} <br />
                  <span className="text-xs text-gray-500">CNPJ: {formatCNPJ(p.cnpj)}{p.telefone ? ` | Tel: ${formatTelefone(p.telefone)}` : ""}</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Sincronização Automática</div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{syncStats.isRunning ? '🔄' : '⏸️'}</span>
            <div className="flex-1">
              <div className="font-medium">
                {syncStats.isRunning ? 'Sincronização Ativa' : 'Sincronização Pausada'}
              </div>
              <div className="text-sm text-muted-foreground">
                Monitora Supabase externo a cada 60 segundos
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${syncStats.isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {syncStats.isRunning ? 'Online' : 'Offline'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{syncStats.syncCount}</div>
              <div className="text-xs text-gray-600">Sincronizações</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{syncStats.errorCount}</div>
              <div className="text-xs text-gray-600">Erros</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleTimeString('pt-BR') : '--:--'}
              </div>
              <div className="text-xs text-gray-600">Último Sync</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="default" 
              onClick={() => {
                externalSyncService.syncNow();
                setTimeout(() => setSyncStats(externalSyncService.getStats()), 500);
              }}
              disabled={!syncStats.isRunning}
            >
              🔄 Sincronizar Agora
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (syncStats.isRunning) {
                  externalSyncService.stop();
                } else {
                  externalSyncService.start();
                }
                setSyncStats(externalSyncService.getStats());
              }}
            >
              {syncStats.isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                externalSyncService.resetStats();
                setSyncStats(externalSyncService.getStats());
              }}
            >
              🗑️ Resetar
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>ℹ️ Info:</strong> A sincronização busca novos andamentos no banco externo e cria automaticamente Clientes → Processos → Tarefas.
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Informações do Sistema</div>
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="font-medium">Versão</div>
            <div className="text-muted-foreground">2.0.0</div>
          </div>
          <div>
            <div className="font-medium">Última atualização</div>
            <div className="text-muted-foreground">Novembro 2024</div>
          </div>
        </div>
      </div>
      <PatronoModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddPatrono} escritorioId={escritorioId} />
    </div>
  );
};

export default Settings;
