import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock user credentials
  const mockUsers = [
    {
      email: 'joao.silva@toralegal.com',
      password: 'admin123',
      name: 'João Silva',
      role: 'Advogado Senior',
      office: 'Nelson'
    },
    {
      email: 'maria.santos@toralegal.com',
      password: 'adv123',
      name: 'Maria Santos',
      role: 'Advogada',
      office: 'Gaspar'
    },
    {
      email: 'carlos.oliveira@toralegal.com',
      password: 'lawyer123',
      name: 'Carlos Oliveira',
      role: 'Advogado Junior',
      office: 'MF Advocacia'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData?.password?.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check credentials
      const user = mockUsers?.find(u => 
        u?.email === formData?.email && u?.password === formData?.password
      );

      if (user) {
        // In a real app, you would store the auth token
        localStorage.setItem('toraLegalUser', JSON.stringify({
          email: user?.email,
          name: user?.name,
          role: user?.role,
          office: user?.office
        }));
        
        navigate('/dashboard');
      } else {
        setErrors({
          general: 'Email ou senha incorretos'
        });
      }
    } catch (error) {
      setErrors({
        general: 'Erro ao fazer login. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (userIndex) => {
    const user = mockUsers?.[userIndex];
    setFormData({
      email: user?.email,
      password: user?.password
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg
              width="48"
              height="48"
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
          <h1 className="text-2xl font-bold text-foreground">Torá Legal</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de Gestão Jurídica
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-lg border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Email"
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                placeholder="seu@email.com"
                error={errors?.email}
                iconName="Mail"
                iconPosition="left"
              />
            </div>

            <div>
              <Input
                label="Senha"
                type="password"
                value={formData?.password}
                onChange={(e) => handleInputChange('password', e?.target?.value)}
                placeholder="••••••••"
                error={errors?.password}
                iconName="Lock"
                iconPosition="left"
              />
            </div>

            {errors?.general && (
              <div className="flex items-center space-x-2 text-error text-sm">
                <Icon name="AlertCircle" size={16} />
                <span>{errors?.general}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
              iconName={isLoading ? "Loader" : "LogIn"}
              iconPosition="left"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Contas de demonstração:
            </p>
            <div className="space-y-2">
              {mockUsers?.map((user, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleDemoLogin(index)}
                >
                  <div className="text-left">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user?.role} - {user?.office}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <button className="text-sm text-primary hover:underline">
              Esqueceu sua senha?
            </button>
            <div className="text-xs text-muted-foreground">
              Precisa de ajuda? Entre em contato conosco
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          © 2024 Torá Legal. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;