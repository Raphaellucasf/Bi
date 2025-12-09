
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
import { importEventsFromGoogle } from '../../services/googleCalendarService';
import Icon from '../../components/AppIcon';
import './calendar-custom.css';


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

  const getEventColor = (andamento) => {
    // Se veio do Google Calendar, usar a cor do Google
    if (andamento.origem === 'google_calendar' && andamento.google_calendar_color) {
      const googleColors = {
        '1': '#7986CB', // Lavanda
        '2': '#33B679', // Sálvia
        '3': '#8E24AA', // Uva
        '4': '#E67C73', // Flamingo
        '5': '#F6BF26', // Banana
        '6': '#F4511E', // Tangerina
        '7': '#039BE5', // Pavão
        '8': '#616161', // Grafite
        '9': '#3F51B5', // Mirtilo
        '10': '#0B8043', // Manjericão
        '11': '#D50000', // Tomate
      };
      return googleColors[andamento.google_calendar_color] || '#9E9E9E';
    }
    
    // Cores padrão do Meritus
    const colors = {
      'Audiência': '#4CAF50', // Verde
      'Prazo': '#F44336',     // Vermelho
      'Reunião': '#2196F3'    // Azul
    };
    return colors[andamento.tipo] || '#9E9E9E';
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
        end: andamento.data_fim,
        backgroundColor: getEventColor(andamento),
        borderColor: getEventColor(andamento),
        extendedProps: {
          tipo: andamento.tipo,
          processo: andamento.processo,
          descricao: andamento.descricao,
          concluido: andamento.concluido,
          origem: andamento.origem,
          google_calendar_color: andamento.google_calendar_color
        }
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error('Erro ao buscar andamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para sincronizar eventos do Google
  const syncWithGoogle = async () => {
    if (localStorage.getItem('google_calendar_token')) {
      try {
        console.log('🔄 Iniciando sincronização com Google Calendar...');
        await importEventsFromGoogle();
        console.log('✅ Sincronização concluída');
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchAndamentos();
      await syncWithGoogle();
    };
    
    init();
    
    // Atualiza a cada 5 minutos para manter sincronizado
    const interval = setInterval(async () => {
      await fetchAndamentos();
      await syncWithGoogle();
    }, 300000);
    
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
            <div className="flex items-center gap-3">
              {localStorage.getItem('google_calendar_token') && (
                <>
                  <button
                    onClick={async () => {
                      console.log('🔵 Botão "Sincronizar Agora" clicado');
                      setLoading(true);
                      try {
                        await importEventsFromGoogle();
                        console.log('✅ Importação concluída, atualizando eventos...');
                        await fetchAndamentos();
                        console.log('✅ Eventos atualizados com sucesso');
                        alert('✅ Eventos sincronizados com sucesso!');
                      } catch (error) {
                        console.error('❌ Erro ao sincronizar:', error);
                        alert('❌ Erro ao sincronizar: ' + error.message);
                      }
                      setLoading(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Icon name="RefreshCw" size={18} className="text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Sincronizar Agora
                    </span>
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Icon name="CheckCircle" size={20} className="text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Conectado
                    </span>
                  </div>
                </>
              )}
            </div>
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
                contentHeight="auto"
                aspectRatio={1.5}
                handleWindowResize={true}
                windowResizeDelay={100}
                eventDisplay="block"
                dayMaxEvents={3}
                dayMaxEventRows={3}
                moreLinkText={(num) => `+${num} mais`}
                moreLinkClick="popover"
                eventOrder="start,-duration,allDay,title"
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
