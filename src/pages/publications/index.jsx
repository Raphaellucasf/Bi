import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import PublicationCard from './components/PublicationCard';
import PublicationFilters from './components/PublicationFilters';
import AutomationSettings from './components/AutomationSettings';
import { summarizePublication } from '../../services/geminiService';
import Icon from '../../components/AppIcon';

const Publications = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: ''
  });

  // Mock publications data
  const mockPublications = [
    {
      id: 1,
      title: 'Sentença - Processo 1234567-89.2024.5.02.0001',
      content: 'SENTENÇA\n\nVistos.\n\nMARIA SILVA SANTOS, qualificada nos autos, ajuizou ação de cobrança em face de EMPRESA XYZ LTDA, também qualificada, alegando que celebrou contrato de prestação de serviços com a ré em 15/01/2023, no valor de R$ 50.000,00, sendo que a requerida não cumpriu integralmente suas obrigações contratuais...',
      summary: '',
      source: 'DEJT - TRT 2ª Região',
      publicationDate: '2024-02-01T08:00:00Z',
      status: 'nova',
      relevantProcesses: ['PROC-2024-0001'],
      clients: ['Maria Silva Santos'],
      isProcessed: false
    },
    {
      id: 2,
      title: 'Acórdão - Recurso Ordinário 9876543-21.2023.5.02.0002',
      content: 'ACÓRDÃO\n\nEMENTA: RECURSO ORDINÁRIO. RESCISÃO INDIRETA. ASSÉDIO MORAL. CONFIGURAÇÃO. INDENIZAÇÃO POR DANOS MORAIS DEVIDA.\n\n1. Restou comprovado nos autos que o empregado foi submetido a situações vexatórias e humilhantes no ambiente de trabalho...',
      summary: 'Decisão favorável ao empregado em caso de rescisão indireta por assédio moral. Condenação da empresa ao pagamento de indenização por danos morais no valor de R$ 15.000,00.',
      source: 'DJE - TRT 2ª Região',
      publicationDate: '2024-01-30T10:30:00Z',
      status: 'processada',
      relevantProcesses: ['PROC-2024-0002'],
      clients: ['Carlos Eduardo Oliveira'],
      isProcessed: true
    },
    {
      id: 3,
      title: 'Despacho - Processo 5555555-55.2024.8.26.0001',
      content: 'DESPACHO\n\nVistos.\n\nDefiro o pedido de tutela de urgência formulado pela requerente ANA PAULA COSTA, para determinar que o requerido se abstenha de se aproximar da autora num raio de 200 metros...',
      summary: 'Deferida tutela de urgência em processo de medida protetiva. Determinado que o requerido mantenha distância mínima de 200 metros da requerente.',
      source: 'DJE - TJSP',
      publicationDate: '2024-01-28T14:15:00Z',
      status: 'processada',
      relevantProcesses: ['PROC-2024-0003'],
      clients: ['Ana Paula Costa'],
      isProcessed: true
    }
  ];

  useEffect(() => {
    setPublications(mockPublications);
    
    // Setup automation interval (every minute)
    let interval;
    if (automationEnabled) {
      interval = setInterval(fetchNewPublications, 60000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [automationEnabled]);

  const fetchNewPublications = async () => {
    // Simulate API call to fetch new publications
    setIsLoading(true);
    
    try {
      // In a real app, this would call an actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate finding new publications occasionally
      if (Math.random() > 0.7) {
        const newPublication = {
          id: Date.now(),
          title: `Nova Publicação - ${new Date()?.toLocaleDateString()}`,
          content: 'Conteúdo da nova publicação encontrada automaticamente pelo sistema...',
          summary: '',
          source: 'Sistema Automático',
          publicationDate: new Date()?.toISOString(),
          status: 'nova',
          relevantProcesses: [],
          clients: [],
          isProcessed: false
        };
        
        setPublications(prev => [newPublication, ...prev]);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPublication = async (publication) => {
    try {
      setPublications(prev => prev?.map(pub => 
        pub?.id === publication?.id 
          ? { ...pub, status: 'processando' }
          : pub
      ));

      const summary = await summarizePublication(publication?.content);
      
      setPublications(prev => prev?.map(pub => 
        pub?.id === publication?.id 
          ? { 
              ...pub, 
              summary,
              status: 'processada',
              isProcessed: true
            }
          : pub
      ));
    } catch (error) {
      console.error('Error processing publication:', error);
      setPublications(prev => prev?.map(pub => 
        pub?.id === publication?.id 
          ? { ...pub, status: 'erro' }
          : pub
      ));
    }
  };

  const handleMarkAsRead = (publicationId) => {
    setPublications(prev => prev?.map(pub => 
      pub?.id === publicationId 
        ? { ...pub, status: 'lida' }
        : pub
    ));
  };

  const filteredPublications = publications?.filter(pub => {
    const matchesSearch = !filters?.search || 
      pub?.title?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      pub?.content?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
      pub?.clients?.some(client => client?.toLowerCase()?.includes(filters?.search?.toLowerCase()));
    
    const matchesStatus = !filters?.status || pub?.status === filters?.status;
    
    // Date range filter would be implemented here
    
    return matchesSearch && matchesStatus;
  });

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const newPublicationsCount = publications?.filter(pub => pub?.status === 'nova')?.length;
  const processedCount = publications?.filter(pub => pub?.isProcessed)?.length;

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
                Automação de Publicações
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitore e processe publicações jurídicas automaticamente
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                iconName="Settings"
                iconPosition="left"
              >
                Configurações
              </Button>
              <Button
                variant="default"
                onClick={fetchNewPublications}
                disabled={isLoading}
                iconName={isLoading ? "Loader" : "Search"}
                iconPosition="left"
              >
                {isLoading ? 'Buscando...' : 'Buscar Agora'}
              </Button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novas</p>
                  <p className="text-2xl font-bold text-foreground">{newPublicationsCount}</p>
                </div>
                {/* Removido sino extra — manter apenas o NotificationBell no Header (sistema de tarefas). */}
                <Icon name="Inbox" size={24} className="text-warning" />
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processadas</p>
                  <p className="text-2xl font-bold text-foreground">{processedCount}</p>
                </div>
                <Icon name="CheckCircle" size={24} className="text-success" />
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{publications?.length}</p>
                </div>
                <Icon name="FileText" size={24} className="text-primary" />
              </div>
            </div>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Automação</p>
                  <p className="text-sm font-medium text-foreground">
                    {automationEnabled ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${automationEnabled ? 'bg-success' : 'bg-muted-foreground'}`} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <PublicationFilters
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredPublications?.length}
          />

          {/* Publications List */}
          <div className="space-y-4">
            {filteredPublications?.length > 0 ? (
              filteredPublications?.map(publication => (
                <PublicationCard
                  key={publication?.id}
                  publication={publication}
                  onProcess={handleProcessPublication}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={64} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhuma publicação encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ajuste os filtros ou aguarde novas publicações serem encontradas.
                </p>
                <Button 
                  variant="default" 
                  onClick={fetchNewPublications}
                  disabled={isLoading}
                >
                  Buscar Publicações
                </Button>
              </div>
            )}
          </div>

          {/* Settings Modal */}
          <AutomationSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            automationEnabled={automationEnabled}
            onToggleAutomation={setAutomationEnabled}
          />
        </div>
      </main>
    </div>
  );
};

export default Publications;