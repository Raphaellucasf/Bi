
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import { supabase } from '../../services/supabaseClient';
import EventDetailsModal from './components/EventDetailsModal';
import { useSyncGoogleCalendar } from '../../hooks/useSyncGoogleCalendar';
import Icon from '../../components/AppIcon';


const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Hook de sincronização com Google Calendar
  const { completeEvent, deleteEvent } = useSyncGoogleCalendar();
  
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
      await completeEvent(eventId);
      await fetchAndamentos();
      handleCloseModal();
      alert('✅ Evento marcado como concluído e sincronizado com Google Calendar!');
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error);
      alert('Erro ao marcar como concluído: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Ele também será removido do Google Calendar.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      await fetchAndamentos();
      handleCloseModal();
      alert('✅ Evento excluído do app e do Google Calendar!');
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro ao excluir evento: ' + error.message);
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
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0`}>
        <div className="p-8">
          {/* Header com informação de sincronização */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
              <p className="text-muted-foreground mt-1">Gerencie seus compromissos e eventos</p>
            </div>
            {localStorage.getItem('google_calendar_token') && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Sincronizado com Google Calendar
                </span>
              </div>
            )}
          </div>

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
