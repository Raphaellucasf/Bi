
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import { supabase } from '../../services/supabaseClient';


const CalendarPage = ({ refreshTrigger }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchTasks = async () => {
    const { data: tasks, error } = await supabase.from('tasks').select('*');
    if (error || !tasks) {
      setEvents([]);
      return;
    }
    const calendarEvents = tasks.map(task => ({
      id: String(task.id),
      title: task.title,
      start: task.dueDate,
      color: task.color || '#2563eb',
    }));
    setEvents(calendarEvents);
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'ml-16' : 'ml-60'} md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Calendário</h1>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            height="auto"
            eventClick={async (info) => {
              const eventId = info.event.id;
              if (window.confirm('Deseja excluir esta tarefa?')) {
                await supabase.from('tasks').delete().eq('id', eventId);
                fetchTasks();
              }
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
