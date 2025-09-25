import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import CaseFilters from './components/CaseFilters';
import CaseTable from './components/CaseTable';
import CaseDetailsModal from './components/CaseDetailsModal';
import NewCaseModal from './components/NewCaseModal';
import BulkActionsBar from './components/BulkActionsBar';

const CaseManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCases, setSelectedCases] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdDate', direction: 'desc' });
  const [filters, setFilters] = useState({
    search: '',
    caseType: '',
    status: '',
    attorney: ''
  });

  // Mock data for cases
  const [cases, setCases] = useState([
    {
      id: 1,
      caseNumber: "CASO-2024-0001",
      clientName: "Maria Silva Santos",
      caseType: "Civil",
      status: "ativo",
      assignedAttorney: "João Silva",
      createdDate: "2024-01-15T10:00:00Z",
      nextDeadline: "2024-02-15T14:00:00Z",
      caseValue: 50000,
      description: `Ação de cobrança referente a contrato de prestação de serviços não cumprido. Cliente busca ressarcimento de valores pagos antecipadamente e não executados pela empresa contratada.`
    },
    {
      id: 2,
      caseNumber: "CASO-2024-0002",
      clientName: "Carlos Eduardo Oliveira",
      caseType: "Trabalhista",
      status: "pendente",
      assignedAttorney: "Maria Santos",
      createdDate: "2024-01-10T09:30:00Z",
      nextDeadline: "2024-02-20T16:00:00Z",
      caseValue: 25000,
      description: `Reclamação trabalhista por rescisão indireta do contrato de trabalho. Funcionário alega assédio moral e condições inadequadas de trabalho.`
    },
    {
      id: 3,
      caseNumber: "CASO-2024-0003",
      clientName: "Ana Paula Costa",
      caseType: "Família",
      status: "ativo",
      assignedAttorney: "Carlos Oliveira",
      createdDate: "2024-01-08T14:15:00Z",
      nextDeadline: "2024-02-10T10:00:00Z",
      caseValue: 0,
      description: `Processo de divórcio consensual com partilha de bens e definição de guarda dos filhos menores.`
    },
    {
      id: 4,
      caseNumber: "CASO-2024-0004",
      clientName: "Roberto Ferreira Lima",
      caseType: "Criminal",
      status: "suspenso",
      assignedAttorney: "Ana Costa",
      createdDate: "2024-01-05T11:45:00Z",
      nextDeadline: null,
      caseValue: 0,
      description: `Defesa criminal em processo por crime contra o patrimônio. Cliente acusado de apropriação indébita.`
    },
    {
      id: 5,
      caseNumber: "CASO-2024-0005",
      clientName: "Empresa ABC Ltda",
      caseType: "Empresarial",
      status: "ativo",
      assignedAttorney: "Pedro Almeida",
      createdDate: "2024-01-03T16:20:00Z",
      nextDeadline: "2024-02-25T09:00:00Z",
      caseValue: 150000,
      description: `Consultoria jurídica para reestruturação societária e adequação às novas regulamentações do setor.`
    },
    {
      id: 6,
      caseNumber: "CASO-2023-0156",
      clientName: "José Antonio Pereira",
      caseType: "Tributário",
      status: "concluído",
      assignedAttorney: "João Silva",
      createdDate: "2023-12-20T13:10:00Z",
      nextDeadline: null,
      caseValue: 80000,
      description: `Mandado de segurança contra cobrança indevida de ICMS. Caso concluído com êxito para o cliente.`
    },
    {
      id: 7,
      caseNumber: "CASO-2023-0157",
      clientName: "Luciana Rodrigues",
      caseType: "Civil",
      status: "arquivado",
      assignedAttorney: "Maria Santos",
      createdDate: "2023-12-18T08:30:00Z",
      nextDeadline: null,
      caseValue: 30000,
      description: `Ação de indenização por danos morais e materiais decorrentes de acidente de trânsito.`
    },
    {
      id: 8,
      caseNumber: "CASO-2024-0006",
      clientName: "Marcos Vinicius Silva",
      caseType: "Trabalhista",
      status: "ativo",
      assignedAttorney: "Carlos Oliveira",
      createdDate: "2024-01-12T15:45:00Z",
      nextDeadline: "2024-02-18T14:30:00Z",
      caseValue: 45000,
      description: `Ação de cobrança de horas extras e adicional noturno não pagos durante período de trabalho.`
    }
  ]);

  // Filter and sort cases
  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases?.filter(caseItem => {
      const matchesSearch = !filters?.search || 
        caseItem?.caseNumber?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        caseItem?.clientName?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        caseItem?.description?.toLowerCase()?.includes(filters?.search?.toLowerCase());
      
      const matchesType = !filters?.caseType || 
        caseItem?.caseType?.toLowerCase() === filters?.caseType?.toLowerCase();
      
      const matchesStatus = !filters?.status || 
        caseItem?.status?.toLowerCase() === filters?.status?.toLowerCase();
      
      const matchesAttorney = !filters?.attorney || 
        caseItem?.assignedAttorney?.toLowerCase()?.includes(filters?.attorney?.toLowerCase());

      return matchesSearch && matchesType && matchesStatus && matchesAttorney;
    });

    // Sort cases
    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      // Handle date sorting
      if (sortConfig?.key === 'createdDate' || sortConfig?.key === 'nextDeadline') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig?.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig?.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [cases, filters, sortConfig]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSelectCase = (caseId, isSelected) => {
    if (isSelected) {
      setSelectedCases(prev => [...prev, caseId]);
    } else {
      setSelectedCases(prev => prev?.filter(id => id !== caseId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedCases(filteredAndSortedCases?.map(c => c?.id));
    } else {
      setSelectedCases([]);
    }
  };

  const handleSort = (column) => {
    setSortConfig(prev => ({
      key: column,
      direction: prev?.key === column && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setSelectedCases([]); // Clear selection when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      caseType: '',
      status: '',
      attorney: ''
    });
  };

  const handleViewCase = (caseData) => {
    setSelectedCase(caseData);
    setShowDetailsModal(true);
  };

  const handleEditCase = (caseData) => {
    // In a real app, this would open an edit modal
    console.log('Edit case:', caseData);
  };

  const handleDocuments = (caseData) => {
    // In a real app, this would navigate to document management
    console.log('View documents for case:', caseData);
  };

  const handleNewCase = () => {
    setShowNewCaseModal(true);
  };

  const handleSaveNewCase = (newCase) => {
    setCases(prev => [newCase, ...prev]);
  };

  const handleBulkStatusUpdate = (newStatus) => {
    if (!newStatus || selectedCases?.length === 0) return;
    
    setCases(prev => prev?.map(caseItem => 
      selectedCases?.includes(caseItem?.id) 
        ? { ...caseItem, status: newStatus }
        : caseItem
    ));
    setSelectedCases([]);
  };

  const handleBulkExport = () => {
    // In a real app, this would export selected cases
    console.log('Export cases:', selectedCases);
  };

  const handleBulkDelete = () => {
    if (selectedCases?.length === 0) return;
    
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedCases?.length} caso${selectedCases?.length !== 1 ? 's' : ''}?`
    );
    
    if (confirmed) {
      setCases(prev => prev?.filter(caseItem => !selectedCases?.includes(caseItem?.id)));
      setSelectedCases([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedCases([]);
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
                Gerenciamento de Casos
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todos os casos jurídicos da sua prática
              </p>
            </div>
            <Button
              variant="default"
              onClick={handleNewCase}
              iconName="Plus"
              iconPosition="left"
            >
              Novo Caso
            </Button>
          </div>

          {/* Filters */}
          <CaseFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            resultCount={filteredAndSortedCases?.length}
          />

          {/* Bulk Actions */}
          <BulkActionsBar
            selectedCount={selectedCases?.length}
            onClearSelection={handleClearSelection}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
          />

          {/* Cases Table */}
          <CaseTable
            cases={filteredAndSortedCases}
            selectedCases={selectedCases}
            onSelectCase={handleSelectCase}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onEdit={handleEditCase}
            onView={handleViewCase}
            onDocuments={handleDocuments}
          />

          {/* Modals */}
          <CaseDetailsModal
            caseData={selectedCase}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedCase(null);
            }}
          />

          <NewCaseModal
            isOpen={showNewCaseModal}
            onClose={() => setShowNewCaseModal(false)}
            onSave={handleSaveNewCase}
          />
        </div>
      </main>
    </div>
  );
};

export default CaseManagement;