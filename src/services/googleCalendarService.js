// Serviço para integração com Google Calendar via OAuth2
// Este arquivo irá lidar com autenticação, obtenção de tokens e criação de eventos


import React from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export const useGoogleCalendar = () => {
  const [token, setToken] = React.useState(null);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onSuccess: (response) => setToken(response.access_token),
    onError: () => alert('Erro ao autenticar com Google'),
  });

  const createEvent = async (event) => {
    if (!token) throw new Error('Usuário não autenticado no Google');
    const res = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      event,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  };

  return { login, createEvent, token };
};
