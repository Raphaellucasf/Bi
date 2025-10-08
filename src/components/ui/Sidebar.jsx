import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Grouped navigation structure
  const navigationSections = [
    {
      title: 'NAVEGAÇÃO PRINCIPAL',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', tooltip: 'Visão geral da prática' },
        { label: 'Processos', path: '/process-management', icon: 'FileText', tooltip: 'Gerenciamento de processos' },
        { label: 'Clientes', path: '/client-management', icon: 'Users', tooltip: 'Gerenciamento de clientes' },
  { label: 'Financeiro', path: '/financial-tracking', icon: 'DollarSign', tooltip: 'Controle financeiro' },
      ]
    },
    {
      title: 'TAREFAS',
      items: [
        { label: 'Audiências', path: '/tasks/audiencias', icon: 'Calendar', tooltip: 'Audiências' },
        { label: 'Prazos', path: '/tasks/prazos', icon: 'Clock', tooltip: 'Prazos' },
        { label: 'Reuniões', path: '/tasks/reunioes', icon: 'Users', tooltip: 'Reuniões' },
        { label: 'Calendário', path: '/calendar', icon: 'CalendarDays', tooltip: 'Calendário de tarefas' },
      ]
    },
    {
      title: 'AUTOMAÇÃO & IA',
      items: [
        { label: 'Detetive', path: '/detetive', icon: 'Search', tooltip: 'Busca de bens e informações' },
        { label: 'Acompanhamento', path: '/monitoring', icon: 'Globe', tooltip: 'Acompanhamento processual' },
      ]
    },
    {
      title: 'DOCUMENTOS & ARQUIVO',
      items: [
        { label: 'Portal Cliente', path: '/client-portal', icon: 'User', tooltip: 'Acesso do cliente' },
        { label: 'Documentos', path: '/document-management', icon: 'FileText', tooltip: 'Gerenciamento de documentos' },
      ]
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const isActiveRoute = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card shadow-md border border-border"
        aria-label="Toggle navigation menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={20} />
      </button>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-100 transition-transform duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-60'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
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
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground">
                  Torá
                </span>
                <span className="text-xs text-muted-foreground">Legal</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation with Sections */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-2">
              {!isCollapsed && (
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                        ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                      title={isCollapsed ? item.tooltip : undefined}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        className={`flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle (Desktop Only) */}
        {onToggle && (
          <div className="hidden md:block p-2 border-t border-border">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon
                name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
                size={16}
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;