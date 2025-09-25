import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
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
import LoginPage from './pages/login';
import Detetive from './pages/detetive';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Main application routes */}
        <Route path="/" element={<ProcessManagement />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/process-management" element={<ProcessManagement />} />
        <Route path="/client-management" element={<ClientManagement />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/document-management" element={<DocumentManagement />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/financial-tracking" element={<FinancialTracking />} />
        <Route path="/client-portal" element={<ClientPortal />} />
  <Route path="/user-profile-settings" element={<UserProfileSettings />} />
  <Route path="/detetive" element={<Detetive />} />
  {/* Legacy route redirect */}
  <Route path="/case-management" element={<ProcessManagement />} />
  <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;