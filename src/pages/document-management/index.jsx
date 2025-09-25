import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import CategoryTree from './components/CategoryTree';
import DocumentFilters from './components/DocumentFilters';
import DocumentCard from './components/DocumentCard';
import DocumentList from './components/DocumentList';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import UploadModal from './components/UploadModal';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const DocumentManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categoryCollapsed, setCategoryCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCase, setSelectedCase] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const mockDocuments = [
    {
      id: 'doc-001',
      name: 'Contrato de Trabalho - Silva.pdf',
      type: 'pdf',
      size: 2048576,
      caseName: 'Silva vs. Construtora ABC - Trabalhista',
      uploadDate: '2024-01-15T10:30:00',
      uploadedBy: 'João Silva',
      version: 3,
      isConfidential: true,
      tags: ['contrato', 'trabalhista', 'urgente']
    },
    {
      id: 'doc-002',
      name: 'Petição Inicial - Divórcio Santos.docx',
      type: 'docx',
      size: 1536000,
      caseName: 'Divórcio - Maria Santos',
      uploadDate: '2024-01-14T14:20:00',
      uploadedBy: 'Maria Santos',
      version: 2,
      isConfidential: false,
      tags: ['petição', 'divórcio', 'família']
    },
    {
      id: 'doc-003',
      name: 'Relatório Pericial - Empresa XYZ.pdf',
      type: 'pdf',
      size: 5242880,
      caseName: 'Empresa XYZ - Tributário',
      uploadDate: '2024-01-13T09:15:00',
      uploadedBy: 'Carlos Pereira',
      version: 1,
      isConfidential: true,
      tags: ['perícia', 'tributário', 'relatório']
    },
    {
      id: 'doc-004',
      name: 'Certidão de Óbito - Inventário Oliveira.pdf',
      type: 'pdf',
      size: 512000,
      caseName: 'Inventário - Família Oliveira',
      uploadDate: '2024-01-12T16:45:00',
      uploadedBy: 'Ana Oliveira',
      version: 1,
      isConfidential: false,
      tags: ['certidão', 'inventário', 'sucessões']
    },
    {
      id: 'doc-005',
      name: 'Planilha de Cálculos - Cobrança.xlsx',
      type: 'xlsx',
      size: 1024000,
      caseName: 'Ação de Cobrança - Cliente Premium',
      uploadDate: '2024-01-11T11:30:00',
      uploadedBy: 'Roberto Lima',
      version: 4,
      isConfidential: false,
      tags: ['cálculos', 'cobrança', 'financeiro']
    },
    {
      id: 'doc-006',
      name: 'Foto do Local - Acidente.jpg',
      type: 'jpg',
      size: 3145728,
      caseName: 'Silva vs. Construtora ABC - Trabalhista',
      uploadDate: '2024-01-10T08:20:00',
      uploadedBy: 'João Silva',
      version: 1,
      isConfidential: true,
      tags: ['evidência', 'foto', 'acidente']
    }
  ];

  const mockCategories = [
    {
      id: 'all',
      name: 'Todos os Documentos',
      icon: 'FolderOpen',
      count: mockDocuments?.length
    },
    {
      id: 'cases',
      name: 'Por Casos',
      icon: 'Briefcase',
      children: [
        { id: 'case-001', name: 'Silva vs. Construtora ABC', icon: 'FileText', count: 2 },
        { id: 'case-002', name: 'Divórcio - Maria Santos', icon: 'FileText', count: 1 },
        { id: 'case-003', name: 'Empresa XYZ - Tributário', icon: 'FileText', count: 1 },
        { id: 'case-004', name: 'Inventário - Família Oliveira', icon: 'FileText', count: 1 },
        { id: 'case-005', name: 'Ação de Cobrança', icon: 'FileText', count: 1 }
      ]
    },
    {
      id: 'types',
      name: 'Por Tipo',
      icon: 'Filter',
      children: [
        { id: 'contracts', name: 'Contratos', icon: 'FileText', count: 1 },
        { id: 'petitions', name: 'Petições', icon: 'FileText', count: 1 },
        { id: 'evidence', name: 'Provas', icon: 'Camera', count: 1 },
        { id: 'certificates', name: 'Certidões', icon: 'Award', count: 1 },
        { id: 'reports', name: 'Relatórios', icon: 'BarChart3', count: 1 },
        { id: 'calculations', name: 'Cálculos', icon: 'Calculator', count: 1 }
      ]
    },
    {
      id: 'confidential',
      name: 'Confidenciais',
      icon: 'Lock',
      count: mockDocuments?.filter(doc => doc?.isConfidential)?.length
    },
    {
      id: 'recent',
      name: 'Recentes',
      icon: 'Clock',
      count: 5
    }
  ];

  const filteredDocuments = mockDocuments?.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      doc?.caseName?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      doc?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
    
    const matchesType = selectedType === 'all' || doc?.type === selectedType;
    const matchesCase = selectedCase === 'all' || doc?.caseName?.includes(selectedCase);
    
    const matchesDateRange = (!dateRange?.start || new Date(doc.uploadDate) >= new Date(dateRange.start)) &&
                            (!dateRange?.end || new Date(doc.uploadDate) <= new Date(dateRange.end));
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'confidential' && doc?.isConfidential) ||
                           (selectedCategory === 'recent' && 
                            new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesType && matchesCase && matchesDateRange && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCase('all');
    setDateRange({ start: '', end: '' });
    setSelectedCategory('all');
  };

  const handlePreview = (document) => {
    setPreviewDocument(document);
    setShowPreviewModal(true);
  };

  const handleDownload = (document) => {
    console.log('Downloading document:', document?.name);
    // Simulate download
  };

  const handleShare = (document) => {
    console.log('Sharing document:', document?.name);
    // Implement share functionality
  };

  const handleEdit = (document) => {
    console.log('Editing document:', document?.name);
    // Implement edit functionality
  };

  const handleUpload = (uploadData) => {
    console.log('Uploading documents:', uploadData);
    // Implement upload functionality
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
        setCategoryCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main 
        className={`
          transition-all duration-300 pt-16
          ${sidebarCollapsed ? 'ml-16' : 'ml-60'}
          md:${sidebarCollapsed ? 'ml-16' : 'ml-60'} ml-0
        `}
      >
        <div className="flex h-[calc(100vh-64px)]">
          {/* Category Sidebar */}
          <CategoryTree
            categories={mockCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isCollapsed={categoryCollapsed}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCategoryCollapsed(!categoryCollapsed)}
                    className="lg:hidden"
                  >
                    <Icon name="Menu" size={20} />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Gerenciamento de Documentos
                    </h1>
                    <p className="text-muted-foreground">
                      {filteredDocuments?.length} documento(s) encontrado(s)
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="default"
                  onClick={() => setShowUploadModal(true)}
                  iconName="Upload"
                  iconPosition="left"
                >
                  Upload Documento
                </Button>
              </div>

              {/* Filters */}
              <DocumentFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedCase={selectedCase}
                onCaseChange={setSelectedCase}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onClearFilters={handleClearFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {/* Documents Display */}
              <div className="flex-1 overflow-hidden">
                {filteredDocuments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Icon name="FileX" size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum documento encontrado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Tente ajustar os filtros ou fazer upload de novos documentos
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowUploadModal(true)}
                      iconName="Upload"
                      iconPosition="left"
                    >
                      Upload Documento
                    </Button>
                  </div>
                ) : (
                  <>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-400px)]">
                        {filteredDocuments?.map((document) => (
                          <DocumentCard
                            key={document?.id}
                            document={document}
                            onPreview={handlePreview}
                            onDownload={handleDownload}
                            onShare={handleShare}
                            onEdit={handleEdit}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-y-auto max-h-[calc(100vh-400px)]">
                        <DocumentList
                          documents={filteredDocuments}
                          onPreview={handlePreview}
                          onDownload={handleDownload}
                          onShare={handleShare}
                          onEdit={handleEdit}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Modals */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewDocument(null);
        }}
        onDownload={handleDownload}
        onShare={handleShare}
      />
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default DocumentManagement;