import React from 'react';
import { useGoogleCalendar } from '../../services/googleCalendarService';
import Button from './Button';
import Icon from '../AppIcon';

const GoogleCalendarButton = () => {
  const { login, logout, isConnected, userEmail } = useGoogleCalendar();
  const [showError, setShowError] = React.useState(false);

  // Verificar se o Client ID está configurado
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = googleClientId && googleClientId !== '';

  const handleLogin = () => {
    if (!isConfigured) {
      setShowError(true);
      return;
    }
    login();
  };

  if (!isConfigured && showError) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="AlertTriangle" size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-900 mb-2">
              Google OAuth2 não configurado
            </h4>
            <p className="text-sm text-yellow-800 mb-3">
              Para conectar com o Google Calendar, você precisa configurar o Client ID do Google OAuth2.
            </p>
            <div className="bg-yellow-100 p-3 rounded text-xs text-yellow-900 font-mono mb-3">
              <p className="mb-1">1. Crie um arquivo <strong>.env</strong> na raiz do projeto</p>
              <p className="mb-1">2. Adicione: <strong>VITE_GOOGLE_CLIENT_ID=seu-client-id</strong></p>
              <p>3. Reinicie o servidor</p>
            </div>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Icon name="ExternalLink" size={16} />
              Obter Client ID no Google Cloud Console
            </a>
            <p className="text-xs text-yellow-700 mt-3">
              📖 Leia <strong>CONFIGURAR_GOOGLE_OAUTH.md</strong> para instruções completas
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Icon name="CheckCircle" size={24} className="text-green-600" />
          <div className="flex-1">
            <p className="font-semibold text-green-900">Google Calendar Conectado</p>
            {userEmail && (
              <p className="text-sm text-green-700">{userEmail}</p>
            )}
            <p className="text-xs text-green-600 mt-1">
              Seus eventos serão sincronizados automaticamente
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <Icon name="XCircle" size={18} className="mr-2" />
          Desconectar Google Calendar
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleLogin}
      className="bg-blue-600 hover:bg-blue-700 text-white"
      disabled={!isConfigured}
    >
      <Icon name="Calendar" size={18} className="mr-2" />
      Conectar Google Calendar
    </Button>
  );
};

export default GoogleCalendarButton;
