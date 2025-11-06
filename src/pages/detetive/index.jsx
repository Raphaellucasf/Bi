import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";
import Icon from "../../components/AppIcon";
import { buscarCPF } from "../../services/cpfHubService";

// APIs Integradas - Melhores opções gratuitas
const apis = {
  // 1. ReceitaWS - API gratuita para CNPJ (muito confiável)
  async fetchCnpjReceitaWS(cnpj) {
    try {
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
      const data = await response.json();
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ inválido');
      }
      return {
        success: true,
        data: {
          cnpj: data.cnpj,
          razao_social: data.nome,
          nome_fantasia: data.fantasia,
          situacao: data.situacao,
          data_abertura: data.abertura,
          porte: data.porte,
          natureza_juridica: data.natureza_juridica,
          endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`,
          telefone: data.telefone,
          email: data.email,
          atividade_principal: data.atividade_principal?.[0]?.text,
          capital_social: data.capital_social,
          socios: data.qsa?.map(socio => ({
            nome: socio.nome,
            qualificacao: socio.qual
          })) || []
        },
        fonte: 'ReceitaWS'
      };
    } catch (error) {
      return { success: false, error: error.message, fonte: 'ReceitaWS' };
    }
  },

  // 2. BrasilAPI - API oficial brasileira para CNPJ (backup)
  async fetchCnpjBrasilAPI(cnpj) {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      const data = await response.json();
      return {
        success: true,
        data: {
          cnpj: data.cnpj,
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia,
          situacao: data.descricao_situacao_cadastral,
          data_abertura: data.data_inicio_atividade,
          porte: data.porte,
          natureza_juridica: data.natureza_juridica,
          endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`,
          telefone: data.ddd_telefone_1,
          email: data.email,
          atividade_principal: data.cnae_fiscal_descricao,
          capital_social: data.capital_social,
          socios: data.qsa?.map(socio => ({
            nome: socio.nome_socio,
            qualificacao: socio.qualificacao_socio
          })) || []
        },
        fonte: 'BrasilAPI'
      };
    } catch (error) {
      return { success: false, error: error.message, fonte: 'BrasilAPI' };
    }
  },

  // 3. CPFHub para CPF
  async fetchCpfData(cpf) {
    try {
      const data = await buscarCPF(cpf);
      
      if (!data) {
        throw new Error('CPF não encontrado');
      }

      return {
        success: true,
        data: {
          cpf: data.cpf,
          nome: data.nome_completo,
          situacao: data.situacao_cpf,
          data_nascimento: data.data_nascimento,
          mae: data.mae,
          endereco: data.endereco ? 
            `${data.endereco.logradouro}, ${data.endereco.numero} - ${data.endereco.bairro}, ${data.endereco.cidade}/${data.endereco.uf}` : '',
          telefones: data.telefones,
          emails: data.emails
        },
        fonte: 'CPFHub'
      };
    } catch (error) {
      return { success: false, error: error.message, fonte: 'CPFHub' };
    }
  },

  // 4. INPI para marcas e patentes
  async fetchMarcasPatentes(documento) {
    try {
      // Simulação da consulta INPI (API oficial requer autenticação)
      // Em produção, implementar integração com INPI oficial
      const response = await fetch(`https://gru.inpi.gov.br/pePI/servlet/PatenteServletController?Action=detail&CodPedido=${documento}`);
      return {
        success: true,
        data: {
          marcas: ['Simulação - Consulta INPI requer implementação específica'],
          patentes: []
        },
        fonte: 'INPI (simulação)'
      };
    } catch (error) {
      return { success: false, error: 'Consulta INPI indisponível', fonte: 'INPI' };
    }
  },

  // 5. Checktudo/Infosimples para veículos (simulação)
  async fetchVeiculosData(documento) {
    try {
      // Em produção, usar API do Checktudo/Infosimples
      return {
        success: true,
        data: {
          veiculos: [`Simulação - Consulta de veículos para ${documento}`],
          detalhes: 'API requer integração com Checktudo/Infosimples'
        },
        fonte: 'Checktudo (simulação)'
      };
    } catch (error) {
      return { success: false, error: error.message, fonte: 'Checktudo' };
    }
  },

  // 6. Consulta processual (simulação)
  async fetchProcessosData(documento) {
    try {
      // Em produção, integrar com APIs dos tribunais
      return {
        success: true,
        data: {
          processos: [`Processo simulado para ${documento}`],
          tribunais: ['TJ-SP', 'TJ-RJ', 'TST'],
          observacao: 'Consulta processual requer integração específica com cada tribunal'
        },
        fonte: 'Tribunais (simulação)'
      };
    } catch (error) {
      return { success: false, error: error.message, fonte: 'Tribunais' };
    }
  }
};

// Função principal para buscar CNPJ (tenta ReceitaWS primeiro, depois BrasilAPI)
const fetchCnpjData = async (cnpj) => {
  // Tenta ReceitaWS primeiro
  let result = await apis.fetchCnpjReceitaWS(cnpj);
  if (!result.success) {
    // Se falhar, tenta BrasilAPI como backup
    result = await apis.fetchCnpjBrasilAPI(cnpj);
  }
  return result;
};
// Seção de consultas disponíveis com as melhores APIs gratuitas
const consultasDisponiveis = [
  {
    id: 'cnpj',
    title: "Consulta de CNPJ",
    desc: "Dados completos da empresa: razão social, sócios, endereço, situação cadastral",
    apis: ['ReceitaWS', 'BrasilAPI'],
    icon: 'Building2',
    color: 'blue',
    disponivel: true
  },
  {
    id: 'cpf',
    title: "Consulta de CPF",
    desc: "Dados completos e atualizados do CPF: nome, situação, endereço e contatos",
    apis: ['CPFHub'],
    icon: 'User',
    color: 'green',
    disponivel: true
  },
  {
    id: 'veiculos',
    title: "Consulta de Veículos",
    desc: "Veículos registrados em nome do CPF/CNPJ consultado",
    apis: ['Checktudo', 'Infosimples'],
    icon: 'Car',
    color: 'orange',
    disponivel: false
  },
  {
    id: 'processos',
    title: "Consulta Processual",
    desc: "Processos judiciais por CPF/CNPJ nos principais tribunais",
    apis: ['TJ-SP', 'TJ-RJ', 'TST'],
    icon: 'FileText',
    color: 'purple',
    disponivel: false
  },
  {
    id: 'marcas',
    title: "Marcas e Patentes",
    desc: "Marcas e patentes registradas no INPI",
    apis: ['INPI'],
    icon: 'Award',
    color: 'yellow',
    disponivel: false
  },
  {
    id: 'placa',
    title: "Consulta de Placa",
    desc: "Dados do proprietário e informações do veículo pela placa",
    apis: ['Checktudo'],
    icon: 'Truck',
    color: 'red',
    disponivel: false
  }
];

const Detetive = () => {
  const navigate = useNavigate();
  
  // Estados para cada tipo de consulta
  const [consultaAtiva, setConsultaAtiva] = useState(null);
  const [documento, setDocumento] = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);

  // Função para executar consulta baseada no tipo
  const executarConsulta = async (tipo, doc) => {
    setLoading(true);
    setResultado(null);
    
    let result;
    const documentoLimpo = doc.replace(/\D/g, "");
    
    try {
      switch (tipo) {
        case 'cnpj':
          if (documentoLimpo.length !== 14) {
            throw new Error('CNPJ deve ter 14 dígitos');
          }
          result = await fetchCnpjData(documentoLimpo);
          break;
          
        case 'cpf':
          if (documentoLimpo.length !== 11) {
            throw new Error('CPF deve ter 11 dígitos');
          }
          result = await apis.fetchCpfData(documentoLimpo);
          break;
          
        case 'veiculos':
          result = await apis.fetchVeiculosData(documentoLimpo);
          break;
          
        case 'processos':
          result = await apis.fetchProcessosData(documentoLimpo);
          break;
          
        case 'marcas':
          result = await apis.fetchMarcasPatentes(documentoLimpo);
          break;
          
        case 'placa':
          result = await apis.fetchVeiculosData(doc.toUpperCase());
          break;
          
        default:
          throw new Error('Tipo de consulta não implementado');
      }
      
      // Adicionar ao histórico
      const novaConsulta = {
        id: Date.now(),
        tipo,
        documento: doc,
        resultado: result,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      setHistorico(prev => [novaConsulta, ...prev.slice(0, 9)]); // Mantém apenas os 10 mais recentes
      
    } catch (error) {
      result = { 
        success: false, 
        error: error.message,
        fonte: 'Sistema'
      };
    }
    
    setResultado(result);
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (consultaAtiva && documento.trim()) {
      executarConsulta(consultaAtiva, documento.trim());
    }
  };

  const formatarDocumento = (valor, tipo) => {
    const limpo = valor.replace(/\D/g, "");
    
    if (tipo === 'cnpj') {
      return limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
    } else if (tipo === 'cpf') {
      return limpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
    }
    return valor;
  };

  const renderResultado = () => {
    if (!resultado) return null;

    if (!resultado.success) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <Icon name="AlertCircle" size={16} />
            Erro na consulta
          </div>
          <p className="text-sm text-red-600 mt-1">{resultado.error}</p>
          <p className="text-xs text-red-500 mt-1">Fonte: {resultado.fonte}</p>
        </div>
      );
    }

    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
          <Icon name="CheckCircle" size={16} />
          Consulta realizada com sucesso
        </div>
        
        <div className="space-y-2 text-sm">
          {consultaAtiva === 'cnpj' && resultado.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>CNPJ:</strong> {resultado.data.cnpj}</p>
                <p><strong>Razão Social:</strong> {resultado.data.razao_social}</p>
                <p><strong>Nome Fantasia:</strong> {resultado.data.nome_fantasia || 'Não informado'}</p>
                <p><strong>Situação:</strong> {resultado.data.situacao}</p>
                <p><strong>Data de Abertura:</strong> {resultado.data.data_abertura}</p>
                <p><strong>Porte:</strong> {resultado.data.porte}</p>
              </div>
              <div>
                <p><strong>Endereço:</strong> {resultado.data.endereco}</p>
                <p><strong>Telefone:</strong> {resultado.data.telefone || 'Não informado'}</p>
                <p><strong>Email:</strong> {resultado.data.email || 'Não informado'}</p>
                <p><strong>Atividade Principal:</strong> {resultado.data.atividade_principal}</p>
                <p><strong>Capital Social:</strong> R$ {resultado.data.capital_social}</p>
              </div>
              {resultado.data.socios && resultado.data.socios.length > 0 && (
                <div className="md:col-span-2">
                  <strong>Sócios:</strong>
                  <ul className="mt-1 space-y-1">
                    {resultado.data.socios.map((socio, idx) => (
                      <li key={idx} className="pl-4 border-l-2 border-blue-200">
                        <strong>{socio.nome}</strong> - {socio.qualificacao}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {consultaAtiva === 'cpf' && resultado.data && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>CPF:</strong> {resultado.data.cpf}</p>
                  <p><strong>Nome:</strong> {resultado.data.nome}</p>
                  <p><strong>Situação:</strong> {resultado.data.situacao || 'Não informado'}</p>
                  <p><strong>Data de Nascimento:</strong> {resultado.data.data_nascimento || 'Não informado'}</p>
                  {resultado.data.mae && (
                    <p><strong>Nome da Mãe:</strong> {resultado.data.mae}</p>
                  )}
                </div>
                
                {resultado.data.endereco && (
                  <div>
                    <p><strong>Endereço:</strong> {resultado.data.endereco}</p>
                  </div>
                )}
              </div>
              
              {resultado.data.telefones && resultado.data.telefones.length > 0 && (
                <div>
                  <p><strong>Telefones:</strong></p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    {resultado.data.telefones.map((telefone, idx) => (
                      <li key={idx}>{telefone}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {resultado.data.emails && resultado.data.emails.length > 0 && (
                <div>
                  <p><strong>E-mails:</strong></p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    {resultado.data.emails.map((email, idx) => (
                      <li key={idx}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(consultaAtiva === 'veiculos' || consultaAtiva === 'processos' || consultaAtiva === 'marcas') && resultado.data && (
            <div>
              <p className="text-yellow-600 font-medium">⚠️ Consulta em desenvolvimento</p>
              <p>{JSON.stringify(resultado.data, null, 2)}</p>
            </div>
          )}
        </div>
        
        <p className="text-xs text-green-600 mt-3">Fonte: {resultado.fonte}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Header />
      <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Detetive</h1>
              <p className="text-muted-foreground">Consultas integradas com as melhores APIs gratuitas</p>
            </div>
          </div>

          {/* Cards de Consultas Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {consultasDisponiveis.map((consulta) => {
              const getColorClasses = (color) => {
                const colors = {
                  blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
                  green: 'border-green-200 bg-green-50 hover:bg-green-100',
                  orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
                  purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
                  yellow: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100',
                  red: 'border-red-200 bg-red-50 hover:bg-red-100'
                };
                return colors[color] || 'border-gray-200 bg-gray-50 hover:bg-gray-100';
              };

              const isActive = consultaAtiva === consulta.id;

              return (
                <div
                  key={consulta.id}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    isActive 
                      ? 'border-blue-500 bg-blue-100 shadow-lg' 
                      : `${getColorClasses(consulta.color)} ${!consulta.disponivel ? 'opacity-60' : ''}`
                  }`}
                  onClick={() => consulta.disponivel && setConsultaAtiva(consulta.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon 
                      name={consulta.icon} 
                      size={24} 
                      className={isActive ? 'text-blue-600' : 'text-gray-600'} 
                    />
                    <h3 className={`font-bold text-lg ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
                      {consulta.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{consulta.desc}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {consulta.apis.map((api, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white rounded-full border text-gray-600"
                      >
                        {api}
                      </span>
                    ))}
                  </div>
                  
                  {consulta.disponivel ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <Icon name="CheckCircle" size={16} />
                      Disponível
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                      <Icon name="Clock" size={16} />
                      Em desenvolvimento
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Formulário de Consulta */}
          {consultaAtiva && (
            <div className="bg-white rounded-lg border border-border p-6 mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Search" size={20} />
                {consultasDisponiveis.find(c => c.id === consultaAtiva)?.title}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {consultaAtiva === 'cnpj' && 'Digite o CNPJ (apenas números)'}
                    {consultaAtiva === 'cpf' && 'Digite o CPF (apenas números)'}
                    {consultaAtiva === 'placa' && 'Digite a placa do veículo'}
                    {['veiculos', 'processos', 'marcas'].includes(consultaAtiva) && 'Digite o CPF ou CNPJ'}
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={documento}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (consultaAtiva === 'cnpj' || consultaAtiva === 'cpf') {
                          setDocumento(formatarDocumento(valor, consultaAtiva));
                        } else {
                          setDocumento(valor);
                        }
                      }}
                      placeholder={
                        consultaAtiva === 'cnpj' ? '00.000.000/0000-00' :
                        consultaAtiva === 'cpf' ? '000.000.000-00' :
                        consultaAtiva === 'placa' ? 'ABC-1234' :
                        'Digite o documento'
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      maxLength={consultaAtiva === 'cnpj' ? 18 : consultaAtiva === 'cpf' ? 14 : 20}
                    />
                    <Button
                      type="submit"
                      disabled={loading || !documento.trim()}
                      className="px-6"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Icon name="Loader" size={16} className="animate-spin" />
                          Consultando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Icon name="Search" size={16} />
                          Consultar
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Exibição do Resultado */}
              {renderResultado()}
            </div>
          )}

          {/* Histórico de Consultas */}
          {historico.length > 0 && (
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="History" size={20} />
                Histórico de Consultas
              </h2>
              
              <div className="space-y-3">
                {historico.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setConsultaAtiva(item.tipo);
                      setDocumento(item.documento);
                      setResultado(item.resultado);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon 
                        name={consultasDisponiveis.find(c => c.id === item.tipo)?.icon || 'Search'} 
                        size={16} 
                        className="text-gray-600" 
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {consultasDisponiveis.find(c => c.id === item.tipo)?.title} - {item.documento}
                        </p>
                        <p className="text-xs text-gray-500">{item.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.resultado.success ? (
                        <Icon name="CheckCircle" size={16} className="text-green-600" />
                      ) : (
                        <Icon name="XCircle" size={16} className="text-red-600" />
                      )}
                      <span className="text-xs text-gray-500">{item.resultado.fonte}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações sobre as APIs */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
              <Icon name="Info" size={16} />
              Sobre as APIs Integradas
            </div>
            <div className="text-sm text-blue-600 space-y-1">
              <p>• <strong>CPFHub:</strong> API premium para consulta completa de CPF (50 consultas/mês gratuitas)</p>
              <p>• <strong>ReceitaWS:</strong> API gratuita oficial para consulta de CNPJ</p>
              <p>• <strong>BrasilAPI:</strong> API oficial do governo brasileiro (backup)</p>
              <p>• <strong>INPI:</strong> Instituto Nacional da Propriedade Industrial</p>
              <p>• <strong>Checktudo/Infosimples:</strong> APIs para consultas de veículos (requer contratação)</p>
              <p>• Algumas consultas são simuladas e requerem integração específica em produção</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Detetive;
