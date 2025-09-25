import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

const fetchCnpjData = async (cnpj) => {
const fetchCpfData = async (cpf) => {
  // Exemplo de API pública: https://www.receitaws.com.br/v1/cpf/{cpf}
  try {
    const res = await fetch(`https://www.receitaws.com.br/v1/cpf/${cpf}`);
    const data = await res.json();
    return data;
  } catch {
    return { nome: 'Erro ao consultar' };
  }
};

const fetchPlacaData = async (placa) => {
  // Não há API pública nacional, mas pode simular consulta
  // Exemplo: https://placafipe.com/api-placa/{placa}
  try {
    // Simulação de resposta
    return { proprietario: 'Simulação', placa };
  } catch {
    return { proprietario: 'Erro ao consultar' };
  }
};

const fetchProcessoData = async (cpfCnpj) => {
  // Não há API pública nacional, simulação
  try {
    return { processos: [`Processo simulado para ${cpfCnpj}`] };
  } catch {
    return { processos: ['Erro ao consultar'] };
  }
};
  // Consulta Sócio não tem API oficial, mas existe endpoint público para scraping
  // Exemplo: https://www.consultasocio.com/cnpj/00000000000191
  // Aqui, apenas simulação de fetch (pois CORS pode bloquear em produção)
  try {
    const res = await fetch(`https://www.consultasocio.com/cnpj/${cnpj}`);
    const html = await res.text();
    // Simples extração de nome empresarial (exemplo, para demo)
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/);
    return match ? { nome: match[1] } : { nome: 'Não encontrado' };
  } catch {
    return { nome: 'Erro ao consultar' };
  }
};
const features = [
  {
    title: "Grupo Econômico de CNPJ",
    desc: "Identifique relações entre empresas de um mesmo grupo econômico, seja pelo mesmo endereço, quadro societário, entre outros.",
    api: "https://www.consultasocio.com/" // Exemplo de API pública
  },
  {
    title: "Situação cadastral de CPF",
    desc: "Situação cadastral de um CPF conforme registros da Receita Federal, incluindo a verificação do dígito do titular.",
    api: "https://www.receitaws.com.br/v1/cpf/" // Exemplo de API gratuita
  },
  {
    title: "Dados Profissionais",
    desc: "Histórico profissional e informações atualizadas sobre emprego atual da pessoa física na Receita Federal e na RAIS.",
    api: null
  },
  {
    title: "Marcas e Patentes",
    desc: "Marcas e patentes vinculadas a um CPF ou CNPJ, com detalhes sobre status, titularidade e histórico na base de Propriedade Industrial.",
    api: null
  },
  {
    title: "Buscador processual",
    desc: "Localize processos por CPF/CNPJ de forma fácil e rápida.",
    api: "https://www.tjrn.jus.br/consultaprocessual/" // Exemplo de consulta pública
  },
  {
    title: "Localização",
    desc: "Consulta que retorna dados, como: Nome, endereço(s), telefone(s) e e-mail(s) do CPF indicado.",
    api: null
  },
  {
    title: "Relacionamentos",
    desc: "Consulta que retorna dados sobre os relacionamentos de uma pessoa física ou jurídica.",
    api: null
  },
  {
    title: "Veículos",
    desc: "Consulta em toda base nacional do DETRAN que verifica a existência de veículos no CPF/CNPJ indicado.",
    api: "https://placafipe.com/" // Exemplo de consulta pública
  },
  {
    title: "Dados do veículo",
    desc: "Consulta que retorna dados como o nome do proprietário de um determinado veículo, pela placa.",
    api: "https://placafipe.com/" // Exemplo de consulta pública
  },
  {
    title: "Sociedades",
    desc: "Consulta que retorna todas participações societárias de um CPF.",
    api: null
  },
  {
    title: "Empresa completo",
    desc: "Consulta que retorna dados completos de um CNPJ, como o quadro societário etc.",
    api: "https://www.consultasocio.com/" // Exemplo de API pública
  },
  {
    title: "Restrição de crédito",
    desc: "Consulta que retorna a incidência de alguma restrição/negativação de uma pessoa ou empresa em órgãos de instituição de crédito.",
    api: null
  }
];


const Detetive = () => {
  const navigate = useNavigate();
  const [cnpj, setCnpj] = useState("");
  const [cnpjResult, setCnpjResult] = useState(null);
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const [cpf, setCpf] = useState("");
  const [cpfResult, setCpfResult] = useState(null);
  const [loadingCpf, setLoadingCpf] = useState(false);

  const [placa, setPlaca] = useState("");
  const [placaResult, setPlacaResult] = useState(null);
  const [loadingPlaca, setLoadingPlaca] = useState(false);

  const [proc, setProc] = useState("");
  const [procResult, setProcResult] = useState(null);
  const [loadingProc, setLoadingProc] = useState(false);

  const handleCnpjSubmit = async (e) => {
    e.preventDefault();
    setLoadingCnpj(true);
    setCnpjResult(null);
    const data = await fetchCnpjData(cnpj.replace(/\D/g, ""));
    setCnpjResult(data);
    setLoadingCnpj(false);
  };

  const handleCpfSubmit = async (e) => {
    e.preventDefault();
    setLoadingCpf(true);
    setCpfResult(null);
    const data = await fetchCpfData(cpf.replace(/\D/g, ""));
    setCpfResult(data);
    setLoadingCpf(false);
  };

  const handlePlacaSubmit = async (e) => {
    e.preventDefault();
    setLoadingPlaca(true);
    setPlacaResult(null);
    const data = await fetchPlacaData(placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase());
    setPlacaResult(data);
    setLoadingPlaca(false);
  };

  const handleProcSubmit = async (e) => {
    e.preventDefault();
    setLoadingProc(true);
    setProcResult(null);
    const data = await fetchProcessoData(proc.replace(/\D/g, ""));
    setProcResult(data);
    setLoadingProc(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">Voltar</Button>
        <h1 className="text-2xl font-bold">Detetive</h1>
      </div>

      {/* Consulta CNPJ */}
      <div className="mb-8 bg-card border border-border rounded-lg p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Consulta de CNPJ</h2>
        <form onSubmit={handleCnpjSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Digite o CNPJ (somente números)"
            value={cnpj}
            onChange={e => setCnpj(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            required
            pattern="\d{14}"
            maxLength={18}
          />
          <Button type="submit" variant="default" disabled={loadingCnpj}>
            {loadingCnpj ? "Consultando..." : "Consultar"}
          </Button>
        </form>
        {cnpjResult && (
          <div className="mt-2 text-sm">
            <strong>Nome empresarial:</strong> {cnpjResult.nome}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">Fonte: consultasocio.com (pública, pode ser instável)</div>
      </div>

      {/* Consulta CPF */}
      <div className="mb-8 bg-card border border-border rounded-lg p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Consulta de CPF</h2>
        <form onSubmit={handleCpfSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Digite o CPF (somente números)"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            required
            pattern="\d{11}"
            maxLength={14}
          />
          <Button type="submit" variant="default" disabled={loadingCpf}>
            {loadingCpf ? "Consultando..." : "Consultar"}
          </Button>
        </form>
        {cpfResult && (
          <div className="mt-2 text-sm">
            <strong>Nome:</strong> {cpfResult.nome || cpfResult.message || 'Não encontrado'}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">Fonte: receitaws.com.br (pública, pode ser instável)</div>
      </div>

      {/* Consulta Placa de Veículo */}
      <div className="mb-8 bg-card border border-border rounded-lg p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Consulta de Placa de Veículo</h2>
        <form onSubmit={handlePlacaSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Digite a placa (ex: ABC1234)"
            value={placa}
            onChange={e => setPlaca(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            required
            pattern="[A-Za-z]{3}\d{4}"
            maxLength={7}
          />
          <Button type="submit" variant="default" disabled={loadingPlaca}>
            {loadingPlaca ? "Consultando..." : "Consultar"}
          </Button>
        </form>
        {placaResult && (
          <div className="mt-2 text-sm">
            <strong>Proprietário:</strong> {placaResult.proprietario}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">Fonte: simulação (não há API pública nacional)</div>
      </div>

      {/* Consulta Processual por CPF/CNPJ */}
      <div className="mb-8 bg-card border border-border rounded-lg p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Consulta Processual (CPF/CNPJ)</h2>
        <form onSubmit={handleProcSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Digite o CPF ou CNPJ"
            value={proc}
            onChange={e => setProc(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            required
            pattern="\d{11,14}"
            maxLength={18}
          />
          <Button type="submit" variant="default" disabled={loadingProc}>
            {loadingProc ? "Consultando..." : "Consultar"}
          </Button>
        </form>
        {procResult && (
          <div className="mt-2 text-sm">
            <strong>Processos:</strong> {procResult.processos && procResult.processos.join(', ')}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2">Fonte: simulação (não há API pública nacional)</div>
      </div>

      {/* Cards das demais funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">{f.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
            </div>
            {f.api ? (
              <Button as="a" href={f.api} target="_blank" rel="noopener noreferrer" variant="default" className="mt-auto w-full">Acessar site</Button>
            ) : (
              <Button variant="outline" className="mt-auto w-full" disabled>Em breve</Button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 text-xs text-gray-500">* Algumas consultas utilizam integrações públicas gratuitas e podem ter limitações.</div>
    </div>
  );
};

export default Detetive;
