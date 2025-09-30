import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";

import Dashboard from './pages/dashboard';
import DocumentManagement from './pages/document-management';
import UserProfileSettings from './pages/user-profile-settings';
import ProcessManagement from './pages/process-management';
import FinancialTracking from './pages/financial-tracking';
import ClientManagement from './pages/client-management';
import Tasks from './pages/tasks';
import Publications from './pages/publications';
import ClientPortal from './pages/client-portal';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/login/Register';
import { supabase } from './services/supabaseClient';
import SelectEscritorioModal from './components/ui/SelectEscritorioModal';
import Detetive from './pages/detetive';



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
    !perfil.nome || !perfil.funcao || !perfil.telefone || !perfil.escritorio_id
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
        <RouterRoutes>
          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/register" element={<RegisterPage />} />
          {/* Protected routes */}
          <Route path="/" element={<RequireAuth><ProcessManagement /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/process-management" element={<RequireAuth><ProcessManagement /></RequireAuth>} />
          <Route path="/client-management" element={<RequireAuth><ClientManagement /></RequireAuth>} />
          <Route path="/tasks" element={<RequireAuth><Tasks /></RequireAuth>} />
          <Route path="/document-management" element={<RequireAuth><DocumentManagement /></RequireAuth>} />
          <Route path="/publications" element={<RequireAuth><Publications /></RequireAuth>} />
          <Route path="/financial-tracking" element={<RequireAuth><FinancialTracking /></RequireAuth>} />
          <Route path="/client-portal" element={<RequireAuth><ClientPortal /></RequireAuth>} />
          <Route path="/user-profile-settings" element={<RequireAuth><UserProfileSettings /></RequireAuth>} />
          <Route path="/detetive" element={<RequireAuth><Detetive /></RequireAuth>} />
          {/* Legacy route redirect */}
          <Route path="/case-management" element={<RequireAuth><ProcessManagement /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;