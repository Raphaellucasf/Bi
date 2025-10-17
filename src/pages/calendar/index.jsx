
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import { supabase } from '../../services/supabaseClient';
import EventDetailsModal from './components/EventDetailsModal';


const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowEventModal(false);
  };

  const handleCompleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('andamentos')
        .update({ concluido: true })
        .eq('id', eventId);

      if (error) throw error;

      await fetchAndamentos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('andamentos')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await fetchAndamentos();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  const getEventColor = (tipo) => {
    const colors = {
      'Audiência': '#4CAF50', // Verde
      'Prazo': '#F44336',     // Vermelho
      'Reunião': '#2196F3'    // Azul
    };
    return colors[tipo] || '#9E9E9E';
  };

  const fetchAndamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('andamentos')
        .select(`
          *,
          processo:processo_id (
            id,
            numero_processo,
            clientes:cliente_id (
              id,
              nome_completo
            )
          )
        `)
        .order('data_andamento', { ascending: true });

      if (error) throw error;

      const calendarEvents = data.map(andamento => ({
        id: andamento.id,
        title: andamento.titulo,
        start: andamento.data_andamento,
        backgroundColor: getEventColor(andamento.tipo),
        extendedProps: {
          tipo: andamento.tipo,
          processo: andamento.processo,
          descricao: andamento.descricao,
          concluido: andamento.concluido
        }
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Erro ao buscar andamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndamentos();
    // Atualiza a cada 5 minutos para manter sincronizado
    const interval = setInterval(fetchAndamentos, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-border p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale="pt-br"
                events={events}
                eventClick={handleEventClick}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }}
                height="auto"
                aspectRatio={1.8}
                eventDisplay="block"
                eventClassNames={event => [
                  event.extendedProps?.concluido ? 'opacity-50' : '',
                  'cursor-pointer'
                ]}
                eventDidMount={info => {
                  const tipo = info.event.extendedProps.tipo;
                  const concluido = info.event.extendedProps.concluido;
                  const title = `${info.event.title} (${tipo})${concluido ? ' - Concluído' : ''}`;
                  info.el.setAttribute('title', title);
                }}
              />
            )}
          </div>
        </div>
      </main>

      {showEventModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onComplete={handleCompleteEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default CalendarPage;
