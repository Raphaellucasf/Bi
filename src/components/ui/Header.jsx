import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import NotificationBell from './NotificationBell';
import UnreadCountBadge from './UnreadCountBadge';
import Button from './Button';

const Header = ({ sidebarCollapsed = false }) => {
  const [userId, setUserId] = useState(null);
  const [escritorioId, setEscritorioId] = useState(null);
  
  useEffect(() => {
    async function fetchUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Buscar escritorio_id
        const { data: perfis } = await supabase
          .from('perfis')
          .select('escritorio_id')
          .eq('user_id', user.id)
          .limit(1);
        if (perfis && perfis[0]) {
          setEscritorioId(perfis[0].escritorio_id);
        }
      }
    }
    fetchUserId();
  }, []);
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const [perfil, setPerfil] = useState(null);
  // ...existing code...
  // Buscar perfil do usuário logado
  useEffect(() => {
    let ignore = false;
    async function fetchPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: perfis } = await supabase.from('perfis').select('*').eq('user_id', user.id).limit(1);
      if (!ignore && perfis && perfis[0]) setPerfil(perfis[0]);
    }
    fetchPerfil();
    // Escuta mudanças no perfil
    const channel = supabase.channel('perfil-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis' }, fetchPerfil)
      .subscribe();
    return () => { ignore = true; channel.unsubscribe(); };
  }, []);
  const userMenuRef = useRef(null);
  

  const primaryNavItems = [
    {
      label: 'Resumo Executivo',
      path: '/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      label: 'Processos',
      path: '/process-management',
      icon: 'FileText'
    },
    {
      label: 'Clientes',
      path: '/client-management',
      icon: 'Users'
    },
    {
      label: 'Tarefas',
      path: '/tasks',
      icon: 'CheckSquare'
    },
    {
      label: 'Documentos',
      path: '/document-management',
      icon: 'FolderOpen'
    },
    {
      label: 'Publicações',
      path: '/publications',
      icon: 'Search'
    },
    {
      label: 'Faturamento',
      path: '/faturamento-tracking',
      icon: 'DollarSign'
    }
  ];

  const getPageTitle = () => {
    const currentPath = location?.pathname;
    const navItem = primaryNavItems?.find(item => item?.path === currentPath);
    
    if (navItem) return navItem?.label;
    
    switch (currentPath) {
      case '/user-profile-settings':
        return 'Configurações do Perfil';
      case '/client-portal':
        return 'Portal do Cliente';
      default:
        return 'Meritus';
    }
  };

  const getPageActions = () => {
    const currentPath = location?.pathname;
    
    switch (currentPath) {
      case '/process-management':
        return null;
      case '/client-management':
        return null;
      case '/tasks':
        return null;
      case '/document-management':
        return (
          <Button variant="default" iconName="Upload" iconPosition="left">
            Upload Documento
          </Button>
        );
      case '/faturamento-tracking':
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  

  return (
    <header
      className={`
        fixed top-0 right-0 h-16 bg-card border-b border-border z-50 transition-all duration-300
        ${sidebarCollapsed ? 'left-16' : 'left-60'}
        md:${sidebarCollapsed ? 'left-16' : 'left-60'} left-0
      `}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Page Title and Actions */}
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-foreground">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {getPageActions()}
            <UnreadCountBadge escritorioId={escritorioId} />
            <NotificationBell userId={userId} />

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={handleUserMenuToggle}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors duration-200"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {perfil?.nome_completo ? perfil.nome_completo.split(' ')[0][0].toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {perfil?.nome_completo ? perfil.nome_completo.split(' ')[0] : 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {perfil?.oab ? `OAB: ${perfil.oab}` : ''}
                  </p>
                </div>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-200">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-popover-foreground">
                        {perfil?.nome_completo ? perfil.nome_completo.split(' ')[0] : 'Usuário'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {perfil?.oab ? `OAB: ${perfil.oab}` : ''}
                      </p>
                    </div>
                    
                    <Link
                      to="/user-profile-settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                    >
                      <Icon name="User" size={16} className="mr-3" />
                      Meu Perfil
                    </Link>
                    
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                    >
                      <Icon name="Settings" size={16} className="mr-3" />
                      Configurações
                    </Link>
                    
                    <Link
                      to="/support"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                    >
                      <Icon name="HelpCircle" size={16} className="mr-3" />
                      Ajuda & Suporte
                    </Link>
                    
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-error hover:bg-muted transition-colors duration-200"
                      >
                        <Icon name="LogOut" size={16} className="mr-3" />
                        Sair
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;