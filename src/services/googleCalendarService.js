// Serviço para integração com Google Calendar via OAuth2
// Sincronização bidirecional entre compromissos do app e Google Calendar

import React from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { supabase } from './supabaseClient';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

// Hook para gerenciar autenticação e sincronização com Google Calendar
export const useGoogleCalendar = () => {
  const [token, setToken] = React.useState(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState(null);

  // Carregar token salvo do localStorage
  React.useEffect(() => {
    const savedToken = localStorage.getItem('google_calendar_token');
    const savedEmail = localStorage.getItem('google_calendar_email');
    const tokenExpiry = localStorage.getItem('google_calendar_token_expiry');

    if (savedToken && tokenExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(tokenExpiry)) {
        setToken(savedToken);
        setUserEmail(savedEmail);
        setIsConnected(true);
      } else {
        // Token expirado, limpar
        clearGoogleCalendarData();
      }
    }
  }, []);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
    onSuccess: async (response) => {
      const accessToken = response.access_token;
      const expiresIn = response.expires_in || 3600; // padrão 1 hora
      const expiryTime = new Date().getTime() + (expiresIn * 1000);

      // Salvar token
      localStorage.setItem('google_calendar_token', accessToken);
      localStorage.setItem('google_calendar_token_expiry', expiryTime.toString());

      // Obter email do usuário
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const email = userInfo.data.email;
        localStorage.setItem('google_calendar_email', email);
        setUserEmail(email);
      } catch (error) {
        console.error('Erro ao obter email do usuário:', error);
      }

      setToken(accessToken);
      setIsConnected(true);

      // Salvar no Supabase que o usuário conectou o Google Calendar
      await saveGoogleCalendarConnection(accessToken);
    },
    onError: (error) => {
      console.error('Erro ao autenticar com Google:', error);
      alert('Erro ao conectar com Google Calendar');
    },
  });

  const logout = () => {
    clearGoogleCalendarData();
    setToken(null);
    setIsConnected(false);
    setUserEmail(null);
    googleLogout();
  };

  const clearGoogleCalendarData = () => {
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_calendar_token_expiry');
    localStorage.removeItem('google_calendar_email');
  };

  // Salvar no Supabase que o usuário conectou
  const saveGoogleCalendarConnection = async (accessToken) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('usuarios')
        .update({
          google_calendar_connected: true,
          google_calendar_token: accessToken,
          google_calendar_connected_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) console.error('Erro ao salvar conexão no Supabase:', error);
    } catch (error) {
      console.error('Erro ao salvar conexão:', error);
    }
  };

  // Criar evento no Google Calendar
  const createGoogleEvent = async (eventData) => {
    if (!token) throw new Error('Usuário não autenticado no Google');

    try {
      const googleEvent = {
        summary: eventData.title || eventData.titulo,
        description: eventData.description || eventData.descricao || '',
        start: {
          dateTime: eventData.start || eventData.data_andamento,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.end || eventData.data_fim || eventData.data_andamento,
          timeZone: 'America/Sao_Paulo',
        },
        colorId: getColorId(eventData.tipo),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 dia antes
            { method: 'popup', minutes: 30 }, // 30 minutos antes
          ],
        },
      };

      const response = await axios.post(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
        googleEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento no Google Calendar:', error);
      if (error.response?.status === 401) {
        // Token expirado
        clearGoogleCalendarData();
        setToken(null);
        setIsConnected(false);
        throw new Error('Token expirado. Reconecte sua conta Google.');
      }
      throw error;
    }
  };

  // Atualizar evento no Google Calendar
  const updateGoogleEvent = async (googleEventId, eventData) => {
    if (!token) throw new Error('Usuário não autenticado no Google');

    try {
      const googleEvent = {
        summary: eventData.title || eventData.titulo,
        description: eventData.description || eventData.descricao || '',
        start: {
          dateTime: eventData.start || eventData.data_andamento,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: eventData.end || eventData.data_fim || eventData.data_andamento,
          timeZone: 'America/Sao_Paulo',
        },
        colorId: getColorId(eventData.tipo),
      };

      const response = await axios.put(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleEventId}`,
        googleEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar evento no Google Calendar:', error);
      throw error;
    }
  };

  // Excluir evento do Google Calendar
  const deleteGoogleEvent = async (googleEventId) => {
    if (!token) throw new Error('Usuário não autenticado no Google');

    try {
      await axios.delete(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleEventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Erro ao excluir evento do Google Calendar:', error);
      throw error;
    }
  };

  // Mapear tipo de evento para cor no Google Calendar
  const getColorId = (tipo) => {
    const colorMap = {
      'Audiência': '10', // Verde
      'Prazo': '11',     // Vermelho
      'Reunião': '9',    // Azul
    };
    return colorMap[tipo] || '8'; // Cinza como padrão
  };

  return {
    login,
    logout,
    createGoogleEvent,
    updateGoogleEvent,
    deleteGoogleEvent,
    token,
    isConnected,
    userEmail,
  };
};

// Funções auxiliares para sincronização automática

// Sincronizar evento ao criar no app
export const syncEventToGoogle = async (andamento) => {
  const token = localStorage.getItem('google_calendar_token');
  if (!token) return null;

  try {
    const googleEvent = {
      summary: andamento.titulo,
      description: `${andamento.tipo}\n\n${andamento.descricao || ''}`,
      start: {
        dateTime: andamento.data_andamento,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: andamento.data_fim || andamento.data_andamento,
        timeZone: 'America/Sao_Paulo',
      },
      colorId: getColorIdByType(andamento.tipo),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await axios.post(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
      googleEvent,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Salvar o ID do evento do Google no banco
    const { error } = await supabase
      .from('andamentos')
      .update({ google_calendar_event_id: response.data.id })
      .eq('id', andamento.id);

    if (error) console.error('Erro ao salvar Google Event ID:', error);

    return response.data.id;
  } catch (error) {
    console.error('Erro ao sincronizar com Google Calendar:', error);
    return null;
  }
};

// Sincronizar atualização de evento
export const syncEventUpdateToGoogle = async (andamento) => {
  const token = localStorage.getItem('google_calendar_token');
  if (!token || !andamento.google_calendar_event_id) return;

  try {
    const googleEvent = {
      summary: andamento.titulo,
      description: `${andamento.tipo}\n\n${andamento.descricao || ''}`,
      start: {
        dateTime: andamento.data_andamento,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: andamento.data_fim || andamento.data_andamento,
        timeZone: 'America/Sao_Paulo',
      },
      colorId: getColorIdByType(andamento.tipo),
    };

    await axios.put(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${andamento.google_calendar_event_id}`,
      googleEvent,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao atualizar evento no Google Calendar:', error);
  }
};

// Sincronizar exclusão de evento
export const syncEventDeleteToGoogle = async (googleEventId) => {
  const token = localStorage.getItem('google_calendar_token');
  if (!token || !googleEventId) return;

  try {
    await axios.delete(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleEventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Erro ao excluir evento do Google Calendar:', error);
  }
};

const getColorIdByType = (tipo) => {
  const colorMap = {
    'Audiência': '10', // Verde
    'Prazo': '11',     // Vermelho
    'Reunião': '9',    // Azul
  };
  return colorMap[tipo] || '8';
};

