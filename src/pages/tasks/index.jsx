import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import TaskCard from './components/TaskCard';
import NewTaskModal from './components/NewTaskModal';
import TaskFilters from './components/TaskFilters';
import Icon from '../../components/AppIcon';

const Tasks = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
    type: ''
  });

  // Mock tasks data with post-it style
  const mockTasks = [
    {
      id: 1,
      title: 'Audiência - Processo Maria Silva',
      description: 'Audiência UNA PRESENCIAL - Processo PROC-2024-0001',
      type: 'audiencia',
      priority: 'alta',
      status: 'pendente',
      dueDate: '2024-02-15T14:00:00Z',
      processNumber: 'PROC-2024-0001',
      clientName: 'Maria Silva Santos',
      details: {
        tipo: 'UNA PRESENCIAL',
        local: 'Fórum Central - Sala 203',
        testemunhas: 'João Santos, Maria Oliveira'
      },
      createdDate: '2024-01-20T10:00:00Z',
      color: 'yellow'
    },
    {
      id: 2,
      title: 'Prazo para Contestação',
      description: 'Prazo para apresentar contestação no processo trabalhista',
      type: 'prazo',
      priority: 'alta',
      status: 'pendente',
      dueDate: '2024-02-10T23:59:00Z',
      processNumber: 'PROC-2024-0002',
      clientName: 'Carlos Eduardo Oliveira',
      createdDate: '2024-01-25T09:00:00Z',
      color: 'red'
    },
    {
      id: 3,
      title: 'Reunião com Cliente',
      description: 'Reunião para discussão de estratégia processual',
      type: 'reuniao',
      priority: 'média',
      status: 'pendente',
      dueDate: '2024-02-12T15:30:00Z',
      processNumber: 'PROC-2024-0003',
      clientName: 'Ana Paula Costa',
      createdDate: '2024-01-22T14:00:00Z',
      color: 'blue'
    },
    {
      id: 4,
      title: 'Julgamento - TRT 2ª Região',
      description: 'Publicação via DEJT esperada',
      type: 'julgamento',
      priority: 'alta',
      status: 'aguardando',
      dueDate: '2024-02-20T08:00:00Z',
      processNumber: 'PROC-2024-0004',
      clientName: 'Roberto Ferreira Lima',
      details: {
        tipo: 'PUBLICAÇÃO VIA DEJT / DJE',
        turmaJulgadora: '1ª Turma do TRT 2ª Região'
      },
      createdDate: '2024-01-18T11:00:00Z',
      color: 'green'
    },
    {
      id: 5,
      title: 'Elaborar Petição Inicial',
      description: 'Processo de indenização por danos morais',
      type: 'documento',
      priority: 'média',
      status: 'em_andamento',
      dueDate: '2024-02-18T17:00:00Z',
      processNumber: null,
      clientName: 'Novo Cliente',
      createdDate: '2024-01-28T16:00:00Z',
      color: 'purple'
    }
  ];

  useEffect(() => {
    setTasks(mockTasks);
    
    // Setup notification system
    const checkNotifications = () => {
      const now = new Date();
      tasks?.forEach(task => {
        if (task?.status === 'pendente' && task?.dueDate) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate - now;
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));
          
          // Show notification 30 minutes before
          if (minutesDiff === 30) {
            showNotification(task);
          }
          
          // Show notification 1 day before for hearings
          if (task?.type === 'audiencia' && minutesDiff === 1440) {
            showNotification(task, 'Lembrete: Audiência amanhã');
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const showNotification = (task, customTitle = null) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(customTitle || `Tarefa: ${task.title}`, {
        body: `${task.description} - Vence em 30 minutos`,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission()?.then(permission => {
        if (permission === 'granted') {
          showNotification(task, customTitle);
        }
      });
    }
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = !filters?.search || 
      task?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      task?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      task?.clientName?.toLowerCase()?.includes(filters?.search?.toLowerCase());
    
    const matchesPriority = !filters?.priority || task?.priority === filters?.priority;
    const matchesStatus = !filters?.status || task?.status === filters?.status;
    const matchesType = !filters?.type || task?.type === filters?.type;

    return matchesSearch && matchesPriority && matchesStatus && matchesType;
  });

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNewTask = () => {
    setShowNewTaskModal(true);
  };

  const handleSaveTask = (newTask) => {
    const task = {
      ...newTask,
      id: Date.now(),
      createdDate: new Date()?.toISOString(),
      color: ['yellow', 'red', 'blue', 'green', 'purple', 'orange']?.[Math.floor(Math.random() * 6)]
    };
    setTasks(prev => [task, ...prev]);
  };

  const handleUpdateTask = (taskId, updates) => {
    setTasks(prev => prev?.map(task => 
      task?.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev?.filter(task => task?.id !== taskId));
  };

  const groupedTasks = {
    urgent: filteredTasks?.filter(task => {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const diffHours = (dueDate - now) / (1000 * 60 * 60);
      return diffHours <= 24 && task?.status === 'pendente';
    }),
    today: filteredTasks?.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      return dueDate?.toDateString() === today?.toDateString() && task?.status !== 'concluida';
    }),
    upcoming: filteredTasks?.filter(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
      return diffDays > 1 && diffDays <= 7 && task?.status !== 'concluida';
    }),
    completed: filteredTasks?.filter(task => task?.status === 'concluida')
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle} 
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main 
        className={`
          transition-all duration-300 pt-16
          ${sidebarCollapsed ? 'ml-16' : 'ml-60'}
          md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0
        `}
      >
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Tarefas
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas tarefas e compromissos
              </p>
            </div>
            <Button
              variant="default"
              onClick={handleNewTask}
              iconName="Plus"
              iconPosition="left"
            >
              Nova Tarefa
            </Button>
          </div>

          {/* Filters */}
          <TaskFilters
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredTasks?.length}
          />

          {/* Task Groups */}
          <div className="space-y-8">
            {/* Urgent Tasks */}
            {groupedTasks?.urgent?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="AlertTriangle" size={20} className="text-error" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Urgente (próximas 24h)
                  </h2>
                  <span className="bg-error text-error-foreground text-xs px-2 py-1 rounded-full">
                    {groupedTasks?.urgent?.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedTasks?.urgent?.map(task => (
                    <TaskCard
                      key={task?.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today's Tasks */}
            {groupedTasks?.today?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Calendar" size={20} className="text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Hoje
                  </h2>
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {groupedTasks?.today?.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedTasks?.today?.map(task => (
                    <TaskCard
                      key={task?.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tasks */}
            {groupedTasks?.upcoming?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Clock" size={20} className="text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Próximas
                  </h2>
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                    {groupedTasks?.upcoming?.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedTasks?.upcoming?.map(task => (
                    <TaskCard
                      key={task?.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {groupedTasks?.completed?.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="CheckCircle" size={20} className="text-success" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Concluídas
                  </h2>
                  <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                    {groupedTasks?.completed?.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedTasks?.completed?.map(task => (
                    <TaskCard
                      key={task?.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTasks?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="CheckSquare" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhuma tarefa encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira tarefa ou ajuste os filtros de busca.
                </p>
                <Button variant="default" onClick={handleNewTask}>
                  Nova Tarefa
                </Button>
              </div>
            )}
          </div>

          {/* New Task Modal */}
          <NewTaskModal
            isOpen={showNewTaskModal}
            onClose={() => setShowNewTaskModal(false)}
            onSave={handleSaveTask}
          />
        </div>
      </main>
    </div>
  );
};

export default Tasks;