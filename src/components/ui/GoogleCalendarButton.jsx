import React from 'react';
import { useGoogleCalendar } from '../../services/googleCalendarService';
import Button from './Button';

const GoogleCalendarButton = () => {
  const { login, token } = useGoogleCalendar();

  return (
    <Button
      variant="default"
      iconName="Calendar"
      onClick={login}
      disabled={!!token}
    >
      {token ? 'Google conectado' : 'Conectar Google Calendar'}
    </Button>
  );
};

export default GoogleCalendarButton;
