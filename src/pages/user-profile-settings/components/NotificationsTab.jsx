import React from "react";
import GoogleCalendarButton from '../../../components/ui/GoogleCalendarButton';

const NotificationsTab = () => (
  <div className="p-4 bg-white border rounded mb-2">
    <h2 className="text-lg font-semibold mb-2">Integração com Google Calendar</h2>
    <p className="mb-4 text-sm text-muted-foreground">Conecte sua conta Google para sincronizar eventos e notificações do sistema com seu calendário pessoal.</p>
    <div className="mb-4">
      {/* Botão de login Google Calendar */}
      <GoogleCalendarButton />
    </div>
    {/* Outras preferências de notificação podem ser adicionadas aqui */}
  </div>
);

export default NotificationsTab;
