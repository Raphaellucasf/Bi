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
  console.log('🟢 syncEventToGoogle chamada com:', andamento);
  
  const token = localStorage.getItem('google_calendar_token');
  if (!token) {
    console.log('❌ Token não encontrado');
    return null;
  }

  try {
    // Buscar dados do processo e cliente se houver processo_id
    let processoInfo = null;
    let clienteInfo = null;
    
    if (andamento.processo_id) {
      const { data: processo } = await supabase
        .from('processos')
        .select('numero_processo, cliente_id, clientes(nome_completo)')
        .eq('id', andamento.processo_id)
        .single();
      
      if (processo) {
        processoInfo = processo.numero_processo;
        clienteInfo = processo.clientes?.nome_completo;
      }
    }

    console.log('📋 Dados adicionais:', { processo: processoInfo, cliente: clienteInfo });

    // Calcular data de fim (1 hora depois se não especificada)
    let endDateTime = andamento.data_fim;
    if (!endDateTime) {
      const startDate = new Date(andamento.data_andamento);
      startDate.setHours(startDate.getHours() + 1);
      endDateTime = startDate.toISOString();
    }

    console.log('📅 Datas:', {
      inicio: andamento.data_andamento,
      fim: endDateTime
    });

    // Formatar descrição no padrão do Google Calendar
    let descriptionParts = [];
    descriptionParts.push(`🔹 Tipo: ${andamento.tipo}`);
    
    if (processoInfo) {
      descriptionParts.push(`\n⚖️ Processo: ${processoInfo}`);
    }
    
    if (clienteInfo) {
      descriptionParts.push(`\n👤 Cliente: ${clienteInfo}`);
    }
    
    if (andamento.descricao) {
      descriptionParts.push(`\n\n📝 Observações:\n${andamento.descricao}`);
    }
    
    descriptionParts.push(`\n\n✨ Criado por Meritus`);

    const googleEvent = {
      summary: `Meritus - ${andamento.tipo}: ${andamento.titulo}`,
      description: descriptionParts.join('\n'),
      start: {
        dateTime: andamento.data_andamento,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime,
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

    console.log('📤 Enviando para Google Calendar:', googleEvent);

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

    console.log('✅ Resposta do Google:', response.data);

    // Salvar o ID do evento do Google no banco
    const { error } = await supabase
      .from('andamentos')
      .update({ google_calendar_event_id: response.data.id })
      .eq('id', andamento.id);

    if (error) {
      console.error('❌ Erro ao salvar Google Event ID:', error);
    } else {
      console.log('✅ Google Event ID salvo no banco:', response.data.id);
    }

    return response.data.id;
  } catch (error) {
    console.error('❌ ERRO ao sincronizar com Google Calendar:', error);
    console.error('❌ Detalhes:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
    return null;
  }
};

// Sincronizar atualização de evento
export const syncEventUpdateToGoogle = async (andamento) => {
  const token = localStorage.getItem('google_calendar_token');
  if (!token || !andamento.google_calendar_event_id) return;

  try {
    // Buscar dados do processo e cliente se houver processo_id
    let processoInfo = null;
    let clienteInfo = null;
    
    if (andamento.processo_id) {
      const { data: processo } = await supabase
        .from('processos')
        .select('numero_processo, cliente_id, clientes(nome_completo)')
        .eq('id', andamento.processo_id)
        .single();
      
      if (processo) {
        processoInfo = processo.numero_processo;
        clienteInfo = processo.clientes?.nome_completo;
      }
    }

    // Calcular data de fim (1 hora depois se não especificada)
    let endDateTime = andamento.data_fim;
    if (!endDateTime) {
      const startDate = new Date(andamento.data_andamento);
      startDate.setHours(startDate.getHours() + 1);
      endDateTime = startDate.toISOString();
    }

    // Formatar descrição no padrão do Google Calendar
    let descriptionParts = [];
    descriptionParts.push(`🔹 Tipo: ${andamento.tipo}`);
    
    if (processoInfo) {
      descriptionParts.push(`\n⚖️ Processo: ${processoInfo}`);
    }
    
    if (clienteInfo) {
      descriptionParts.push(`\n👤 Cliente: ${clienteInfo}`);
    }
    
    if (andamento.descricao) {
      descriptionParts.push(`\n\n📝 Observações:\n${andamento.descricao}`);
    }
    
    descriptionParts.push(`\n\n✨ Criado por Meritus`);

    const googleEvent = {
      summary: `Meritus - ${andamento.tipo}: ${andamento.titulo}`,
      description: descriptionParts.join('\n'),
      start: {
        dateTime: andamento.data_andamento,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime,
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

// ============================================
// SINCRONIZAÇÃO BIDIRECIONAL
// ============================================

/**
 * Buscar eventos do Google Calendar e importar para o app
 * Sincronização: Google Calendar -> Meritus
 */
export const importEventsFromGoogle = async () => {
  const token = localStorage.getItem('google_calendar_token');
  if (!token) {
    console.warn('Token do Google Calendar não encontrado');
    return [];
  }

  try {
    // Buscar eventos dos últimos 30 dias e próximos 365 dias
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 30);
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 365);

    const response = await axios.get(
      `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        },
      }
    );

    const googleEvents = response.data.items || [];
    console.log(`📥 ${googleEvents.length} eventos encontrados no Google Calendar`);

    // Buscar eventos já sincronizados no Supabase
    const { data: existingEvents } = await supabase
      .from('andamentos')
      .select('google_calendar_event_id')
      .not('google_calendar_event_id', 'is', null);

    const existingGoogleIds = new Set(
      existingEvents?.map(e => e.google_calendar_event_id) || []
    );

    // Importar apenas eventos novos
    const eventsToImport = googleEvents.filter(
      event => !existingGoogleIds.has(event.id) && event.start
    );

    console.log(`🆕 ${eventsToImport.length} novos eventos para importar`);

    for (const googleEvent of eventsToImport) {
      await importSingleEventFromGoogle(googleEvent);
    }

    return eventsToImport;
  } catch (error) {
    console.error('Erro ao importar eventos do Google Calendar:', error);
    if (error.response?.status === 401) {
      console.error('Token expirado. Reconecte sua conta Google.');
    }
    return [];
  }
};

/**
 * Importar um único evento do Google Calendar
 */
const importSingleEventFromGoogle = async (googleEvent) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    // Extrair informações do evento
    const eventData = {
      titulo: googleEvent.summary || '(Sem título)',
      descricao: googleEvent.description || '',
      data_andamento: googleEvent.start.dateTime || googleEvent.start.date,
      data_fim: googleEvent.end?.dateTime || googleEvent.end?.date || googleEvent.start.dateTime,
      tipo: detectEventType(googleEvent),
      concluido: false,
      google_calendar_event_id: googleEvent.id,
      google_calendar_color: googleEvent.colorId || null,
      origem: 'google_calendar', // Marcar que veio do Google
    };

    // Inserir no Supabase
    const { error } = await supabase
      .from('andamentos')
      .insert([eventData]);

    if (error) {
      console.error('Erro ao importar evento:', error);
    } else {
      console.log(`✅ Evento importado: ${eventData.titulo}`);
    }
  } catch (error) {
    console.error('Erro ao importar evento individual:', error);
  }
};

/**
 * Detectar tipo de evento baseado no título/descrição
 */
const detectEventType = (googleEvent) => {
  const text = `${googleEvent.summary} ${googleEvent.description}`.toLowerCase();
  
  if (text.includes('audiência') || text.includes('audiencia')) {
    return 'Audiência';
  }
  if (text.includes('prazo')) {
    return 'Prazo';
  }
  if (text.includes('reunião') || text.includes('reuniao') || text.includes('meeting')) {
    return 'Reunião';
  }
  
  return 'Reunião'; // Padrão
};

/**
 * Sincronização automática periódica
 * Chame esta função a cada X minutos para manter sincronizado
 */
export const startAutoSync = (intervalMinutes = 5) => {
  // Importar eventos imediatamente
  importEventsFromGoogle();
  
  // Configurar sincronização periódica
  const intervalMs = intervalMinutes * 60 * 1000;
  const intervalId = setInterval(() => {
    importEventsFromGoogle();
  }, intervalMs);
  
  console.log(`🔄 Auto-sync iniciado (a cada ${intervalMinutes} minutos)`);
  
  // Retornar função para parar o auto-sync
  return () => {
    clearInterval(intervalId);
    console.log('🛑 Auto-sync parado');
  };
};

