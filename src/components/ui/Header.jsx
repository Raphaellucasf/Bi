import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import NotificationBell from './NotificationBell';
import Button from './Button';

const Header = ({ sidebarCollapsed = false }) => {
  // Notification system states
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    async function fetchUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
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
      label: 'Dashboard',
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
      label: 'Financeiro',
      path: '/financial-tracking',
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
        return 'Torá Legal';
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
      case '/financial-tracking':
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
      if (notificationsRef?.current && !notificationsRef?.current?.contains(event?.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    const willOpen = !notificationsOpen;
    setNotificationsOpen(willOpen);
    setUserMenuOpen(false);
    // Se for abrir, marcar todas como lidas
    if (!notificationsOpen) {
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    }
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
            <NotificationBell userId={userId} />
            
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={handleNotificationsToggle}
              >
                <Icon name="Bell" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-lg z-200">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <h3 className="text-sm font-medium text-popover-foreground">
                        Notificações
                      </h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {notifications?.map((notification) => (
                        <div
                          key={notification?.id}
                          className={`px-4 py-3 hover:bg-muted cursor-pointer border-l-4 ${
                            notification?.read 
                              ? 'border-l-transparent' :'border-l-primary bg-muted/30'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon 
                              name={
                                notification?.type === 'deadline' ? 'Clock' :
                                notification?.type === 'update' ? 'FileSearch' : 'CheckSquare'
                              }
                              size={16}
                              className="text-muted-foreground mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-popover-foreground">
                                {notification?.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification?.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification?.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="px-4 py-2 border-t border-border">
                      <button className="text-xs text-primary hover:underline">
                        Ver todas as notificações
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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