import React, { useState } from 'react';
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
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
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <header className="bg-card border-b border-border mb-8">
            <div className="px-6 py-4">
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
                    Portal do Cliente - Meritus
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe o andamento do seu processo
                  </p>
                </div>
              </div>
            </div>
          </header>
          {/* ...existing code... */}
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;