import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";

// Lazy loading de páginas para melhor performance
const Dashboard = lazy(() => import('./pages/dashboard'));
const Settings = lazy(() => import('./pages/settings'));
const Support = lazy(() => import('./pages/support'));
const DocumentManagement = lazy(() => import('./pages/document-management'));
const UserProfileSettings = lazy(() => import('./pages/user-profile-settings'));
const ProcessManagement = lazy(() => import('./pages/process-management'));
const FaturamentoTracking = lazy(() => import('./pages/faturamento-tracking'));
const ClientManagement = lazy(() => import('./pages/client-management'));
const Tasks = lazy(() => import('./pages/tasks'));
const Audiencias = lazy(() => import('./pages/tasks/audiencias'));
const Prazos = lazy(() => import('./pages/tasks/prazos'));
const Reunioes = lazy(() => import('./pages/tasks/reunioes'));
const Publications = lazy(() => import('./pages/publications'));
const CalendarPage = lazy(() => import('./pages/calendar'));
const ClientPortal = lazy(() => import('./pages/client-portal'));
const Detetive = lazy(() => import('./pages/detetive'));
const Monitoring = lazy(() => import('./pages/monitoring'));

// Páginas de login carregadas imediatamente (critical path)
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/login/Register';

import { supabase } from './services/supabaseClient';
import SelectEscritorioModal from './components/ui/SelectEscritorioModal';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#f7f8fa]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);



function RequireAuth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [showEscritorioModal, setShowEscritorioModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (ignore) return;
      setUser(data?.user || null);
      if (data?.user) {
        // Garante perfil para o usuário autenticado
        const { data: perfis, error: perfilError } = await supabase
          .from('perfis')
          .select('*')
          .eq('user_id', data.user.id)
          .limit(1);
        let perfil = perfis && perfis[0];
        if (!perfilError && (!perfis || perfis.length === 0)) {
          const { data: novoPerfil } = await supabase.from('perfis').insert({ user_id: data.user.id, escritorio_id: null }).select().single();
          perfil = novoPerfil;
        }
        setPerfil(perfil);
        if (!perfil?.escritorio_id) setShowEscritorioModal(true);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => { ignore = true; listener?.subscription?.unsubscribe(); };
  }, []);

  const handleEscritorioSelected = (escritorio) => {
    setShowEscritorioModal(false);
    setPerfil((p) => ({ ...p, escritorio_id: escritorio.id }));
  };

  // Redireciona para conclusão do cadastro se perfil incompleto
  const perfilIncompleto = perfil && (
    !perfil.nome_completo || !perfil.funcao || !perfil.telefone || !perfil.escritorio_id
  );

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (perfilIncompleto && location.pathname !== '/login/register') {
    return <Navigate to="/login/register" replace state={{ from: location }} />;
  }
  if (showEscritorioModal && user)
    return <SelectEscritorioModal open={true} userId={user.id} onSelected={handleEscritorioSelected} onClose={() => {}} />;
  return children;
}

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes>
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/register" element={<RegisterPage />} />
            {/* Redirect root to process-management */}
            <Route path="/" element={<Navigate to="/process-management" replace />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/process-management" element={<RequireAuth><ProcessManagement /></RequireAuth>} />
            <Route path="/client-management" element={<RequireAuth><ClientManagement /></RequireAuth>} />
            <Route path="/tasks" element={<RequireAuth><Tasks /></RequireAuth>} />
            <Route path="/tasks/audiencias" element={<RequireAuth><Audiencias /></RequireAuth>} />
            <Route path="/tasks/prazos" element={<RequireAuth><Prazos /></RequireAuth>} />
            <Route path="/tasks/reunioes" element={<RequireAuth><Reunioes /></RequireAuth>} />
            <Route path="/document-management" element={<RequireAuth><DocumentManagement /></RequireAuth>} />
            <Route path="/publications" element={<RequireAuth><Publications /></RequireAuth>} />
            <Route path="/faturamento-tracking" element={<RequireAuth><FaturamentoTracking /></RequireAuth>} />
            <Route path="/client-portal" element={<RequireAuth><ClientPortal /></RequireAuth>} />
            <Route path="/user-profile-settings" element={<RequireAuth><UserProfileSettings /></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
            <Route path="/detetive" element={<RequireAuth><Detetive /></RequireAuth>} />
            <Route path="/monitoring" element={<RequireAuth><Monitoring /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />
            {/* Legacy route redirect */}
            <Route path="/case-management" element={<RequireAuth><ProcessManagement /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;