import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ProcessStatusBadge from '../process-management/components/ProcessStatusBadge';
import Icon from '../../components/AppIcon';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClientPortal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock client data
  const mockProcessData = {
    processNumber: 'PROC-2024-0001',
    clientName: 'Maria Silva Santos',
    processType: 'Civil',
    status: 'ativo',
    assignedAttorney: 'João Silva',
    office: 'Nelson',
    createdDate: '2024-01-15T10:00:00Z',
    nextDeadline: '2024-02-15T14:00:00Z',
    processValue: 50000,
    description: 'Ação de cobrança referente a contrato de prestação de serviços não cumprido.',
    progress: 65,
    stages: [
      {
        id: 1,
        stage: 'Petição Inicial',
        date: '2024-01-15T10:00:00Z',
        status: 'concluído',
        description: 'Petição inicial protocolada com sucesso'
      },
      {
        id: 2,
        stage: 'Citação da Parte Contrária',
        date: '2024-01-22T14:30:00Z',
        status: 'concluído',
        description: 'Parte contrária devidamente citada'
      },
      {
        id: 3,
        stage: 'Prazo para Contestação',
        date: '2024-02-05T23:59:00Z',
        status: 'em_andamento',
        description: 'Aguardando apresentação de contestação'
      },
      {
        id: 4,
        stage: 'Audiência de Conciliação',
        date: '2024-02-15T14:00:00Z',
        status: 'pendente',
        description: 'Audiência agendada para tentativa de acordo'
      }
    ],
    updates: [
      {
        id: 1,
        title: 'Processo Iniciado',
        description: 'Sua ação foi protocolada com sucesso no Tribunal competente.',
        date: '2024-01-15T10:00:00Z',
        type: 'info'
      },
      {
        id: 2,
        title: 'Citação Realizada',
        description: 'A parte contrária foi notificada sobre o processo.',
        date: '2024-01-22T14:30:00Z',
        type: 'success'
      },
      {
        id: 3,
        title: 'Audiência Agendada',
        description: 'Foi marcada audiência de conciliação para 15/02/2024 às 14:00h.',
        date: '2024-02-01T09:00:00Z',
        type: 'warning'
      }
    ]
  };

  const handleSearch = async () => {
    if (!searchQuery?.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if search query matches mock data
    if (searchQuery?.toLowerCase()?.includes('proc-2024-0001') || 
        searchQuery?.toLowerCase()?.includes('maria silva')) {
      setSearchResult(mockProcessData);
    } else {
      setSearchResult(null);
    }
    
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })?.format(value);
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'warning': return 'AlertCircle';
      case 'error': return 'XCircle';
      default: return 'Info';
    }
  };

  const getUpdateColor = (type) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-primary';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'FileText' },
    { id: 'progress', label: 'Andamento', icon: 'TrendingUp' },
    { id: 'updates', label: 'Atualizações', icon: 'Bell' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <rect width="32" height="32" rx="6" fill="currentColor" />
                <path
                  d="M8 8h16v3H8V8zm0 5h16v3H8v-3zm0 5h16v3H8v-3zm0 5h10v3H8v-3z"
                  fill="white"
                />
                <path
                  d="M22 6l2 2-2 2-2-2z"
                  fill="var(--color-accent)"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Portal do Cliente - Torá Legal
              </h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe o andamento do seu processo
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="text-center mb-6">
            <Icon name="Search" size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Consulte seu Processo
            </h2>
            <p className="text-muted-foreground">
              Digite o número do processo ou seu nome completo para acompanhar o andamento
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Ex: PROC-2024-0001 ou Maria Silva"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              variant="default"
              onClick={handleSearch}
              disabled={isLoading || !searchQuery?.trim()}
              iconName={isLoading ? "Loader" : "Search"}
              iconPosition="left"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Process Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {searchResult?.processNumber}
                  </h3>
                  <p className="text-muted-foreground mb-2">{searchResult?.clientName}</p>
                  <div className="flex items-center space-x-4">
                    <ProcessStatusBadge status={searchResult?.status} />
                    <span className="text-sm text-muted-foreground">
                      {searchResult?.processType}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Escritório: {searchResult?.office}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(searchResult?.processValue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Valor da causa
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progresso do processo</span>
                  <span className="text-sm font-medium text-foreground">{searchResult?.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${searchResult?.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
              <nav className="flex">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
                      ${activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Informações do Processo</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Advogado Responsável</label>
                          <p className="text-foreground">{searchResult?.assignedAttorney}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Data de Início</label>
                          <p className="text-foreground">{formatDate(searchResult?.createdDate)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Próximo Prazo</label>
                          <p className="text-foreground">{formatDate(searchResult?.nextDeadline)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-3">Descrição</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {searchResult?.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div>
                  <h4 className="font-medium text-foreground mb-4">Etapas do Processo</h4>
                  <div className="space-y-4">
                    {searchResult?.stages?.map((stage, index) => (
                      <div key={stage?.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                            ${stage?.status === 'concluído' ? 'bg-success text-success-foreground' :
                              stage?.status === 'em_andamento' ? 'bg-warning text-warning-foreground' :
                              'bg-muted text-muted-foreground'}
                          `}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h5 className="font-medium text-foreground">{stage?.stage}</h5>
                            <ProcessStatusBadge status={stage?.status} />
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {stage?.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(stage?.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Updates Tab */}
              {activeTab === 'updates' && (
                <div>
                  <h4 className="font-medium text-foreground mb-4">Atualizações Recentes</h4>
                  <div className="space-y-4">
                    {searchResult?.updates?.map((update) => (
                      <div key={update?.id} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                        <Icon 
                          name={getUpdateIcon(update?.type)} 
                          size={20} 
                          className={`flex-shrink-0 mt-0.5 ${getUpdateColor(update?.type)}`}
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground mb-1">{update?.title}</h5>
                          <p className="text-sm text-muted-foreground mb-2">
                            {update?.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(update?.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && !searchResult && !isLoading && (
          <div className="text-center py-12">
            <Icon name="FileSearch" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Processo não encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Verifique se o número do processo ou nome estão corretos e tente novamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Para mais informações, entre em contato com nosso escritório.
            </p>
          </div>
        )}

        {/* Contact Information */}
        <div className="mt-12 bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Precisa de Ajuda?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Icon name="Phone" size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">(11) 3333-4444</p>
                <p className="text-xs text-muted-foreground">Segunda à Sexta: 8h às 18h</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">contato@toralegal.com</p>
                <p className="text-xs text-muted-foreground">Resposta em até 24h</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Icon name="MapPin" size={20} className="text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Rua dos Advogados, 123</p>
                <p className="text-xs text-muted-foreground">São Paulo - SP</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;