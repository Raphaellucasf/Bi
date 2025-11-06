// Hook personalizado para sincronização automática com Google Calendar
// Uso: const { createEvent, updateEvent, deleteEvent } = useSyncGoogleCalendar();

import { useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  syncEventToGoogle, 
  syncEventUpdateToGoogle, 
  syncEventDeleteToGoogle 
} from '../services/googleCalendarService';

export const useSyncGoogleCalendar = () => {
  // Criar evento no app E no Google Calendar
  const createEvent = useCallback(async (eventData) => {
    try {
      // 1. Criar evento no Supabase
      const { data, error } = await supabase
        .from('andamentos')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      // 2. Sincronizar com Google Calendar (se conectado)
      const googleEventId = await syncEventToGoogle(data);

      console.log('✅ Evento criado no app:', data.id);
      if (googleEventId) {
        console.log('✅ Evento sincronizado no Google Calendar:', googleEventId);
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }, []);

  // Atualizar evento no app E no Google Calendar
  const updateEvent = useCallback(async (eventId, updates) => {
    try {
      // 1. Buscar evento atual para obter google_calendar_event_id
      const { data: currentEvent } = await supabase
        .from('andamentos')
        .select('google_calendar_event_id')
        .eq('id', eventId)
        .single();

      // 2. Atualizar no Supabase
      const { data, error } = await supabase
        .from('andamentos')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // 3. Sincronizar atualização com Google Calendar (se existir)
      if (currentEvent?.google_calendar_event_id) {
        await syncEventUpdateToGoogle({
          ...data,
          google_calendar_event_id: currentEvent.google_calendar_event_id
        });
        console.log('✅ Evento atualizado no Google Calendar');
      }

      console.log('✅ Evento atualizado no app:', eventId);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }, []);

  // Excluir evento do app E do Google Calendar
  const deleteEvent = useCallback(async (eventId) => {
    try {
      // 1. Buscar google_calendar_event_id antes de excluir
      const { data: event } = await supabase
        .from('andamentos')
        .select('google_calendar_event_id')
        .eq('id', eventId)
        .single();

      // 2. Excluir do Supabase
      const { error } = await supabase
        .from('andamentos')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // 3. Excluir do Google Calendar (se existir)
      if (event?.google_calendar_event_id) {
        await syncEventDeleteToGoogle(event.google_calendar_event_id);
        console.log('✅ Evento excluído do Google Calendar');
      }

      console.log('✅ Evento excluído do app:', eventId);
      return true;
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      throw error;
    }
  }, []);

  // Marcar evento como concluído (atualiza descrição no Google)
  const completeEvent = useCallback(async (eventId) => {
    try {
      const { data: event } = await supabase
        .from('andamentos')
        .select('*')
        .eq('id', eventId)
        .single();

      const updates = {
        concluido: true,
        descricao: (event.descricao || '') + '\n\n✅ CONCLUÍDO'
      };

      return await updateEvent(eventId, updates);
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      throw error;
    }
  }, [updateEvent]);

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    completeEvent
  };
};
