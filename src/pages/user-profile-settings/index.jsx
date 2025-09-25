import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import ProfileInformationTab from './components/ProfileInformationTab';
import SecurityTab from './components/SecurityTab';
import PreferencesTab from './components/PreferencesTab';
import NotificationsTab from './components/NotificationsTab';
import DataExportTab from './components/DataExportTab';

const UserProfileSettings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    {
      id: 'profile',
      label: 'Informações do Perfil',
      icon: 'User',
      component: ProfileInformationTab
    },
    {
      id: 'security',
      label: 'Segurança',
      icon: 'Shield',
      component: SecurityTab
    },
    {
      id: 'preferences',
      label: 'Preferências',
      icon: 'Settings',
      component: PreferencesTab
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: 'Bell',
      component: NotificationsTab
    },
    {
      id: 'data',
      label: 'Dados & Privacidade',
      icon: 'Database',
      component: DataExportTab
    }
  ];

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const ActiveTabComponent = tabs?.find(tab => tab?.id === activeTab)?.component;

  return (
    <>
      <Helmet>
        <title>Configurações do Perfil - LegalFlow Pro</title>
        <meta name="description" content="Gerencie suas informações pessoais, configurações de segurança e preferências do sistema no LegalFlow Pro." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
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
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="Settings" size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Configurações do Perfil
                  </h1>
                  <p className="text-muted-foreground">
                    Gerencie suas informações pessoais e preferências do sistema
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-4">
                  <nav className="space-y-1">
                    {tabs?.map((tab) => (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                          ${activeTab === tab?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }
                        `}
                      >
                        <Icon name={tab?.icon} size={18} />
                        <span className="truncate">{tab?.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-lg border border-border p-4 mt-4">
                  <h3 className="font-medium text-foreground mb-3">Ações Rápidas</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors duration-200">
                      <Icon name="Download" size={16} />
                      <span>Exportar Dados</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors duration-200">
                      <Icon name="RefreshCw" size={16} />
                      <span>Sincronizar</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors duration-200">
                      <Icon name="HelpCircle" size={16} />
                      <span>Ajuda</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-lg border border-border">
                  {/* Tab Header */}
                  <div className="border-b border-border p-6">
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={tabs?.find(tab => tab?.id === activeTab)?.icon} 
                        size={24} 
                        className="text-primary" 
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {tabs?.find(tab => tab?.id === activeTab)?.label}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activeTab === 'profile' && 'Atualize suas informações pessoais e profissionais'}
                          {activeTab === 'security' && 'Configure opções de segurança e autenticação'}
                          {activeTab === 'preferences' && 'Personalize a experiência do sistema'}
                          {activeTab === 'notifications' && 'Gerencie suas preferências de notificação'}
                          {activeTab === 'data' && 'Controle seus dados e configurações de privacidade'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {ActiveTabComponent && <ActiveTabComponent />}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      flex-shrink-0 flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors duration-200
                      ${activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span className="text-xs font-medium">{tab?.label?.split(' ')?.[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UserProfileSettings;