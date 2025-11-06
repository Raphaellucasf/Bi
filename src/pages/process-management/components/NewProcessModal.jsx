
import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabaseClient";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import MaskedCurrencyInput from "../../../components/ui/MaskedCurrencyInput";
import MaskedProcessNumberInput from "../../../components/ui/MaskedProcessNumberInput";
import MaskedDateInput from "../../../components/ui/MaskedDateInput";
import InputMask from "react-input-mask";
import SimpleAutocomplete from "../../../components/ui/SimpleAutocomplete";
import { ShadcnSelect } from "../../../components/ui/ShadcnSelect";
import { buscarCPF } from "../../../services/cpfHubService";
import Icon from "../../../components/AppIcon";

// Função para buscar empresa no Supabase
async function buscarEmpresaSupabase(cnpjRaw) {
  const cnpjMasked = (cnpjRaw || '').trim();
  const cnpjDigits = cnpjMasked.replace(/\D/g, '');
  // Tenta por igualdade exata (formato mascarado)
  let { data, error } = await supabase.from("empresas").select("*").eq("cnpj", cnpjMasked).limit(1).maybeSingle();
  if (data) return data;
  // Se não encontrou, tenta uma busca aproximada contendo os 8 primeiros dígitos
  if (!data && cnpjDigits.length >= 8) {
    const prefix = cnpjDigits.slice(0, 8);
    const likePattern = `%${prefix}%`;
    const res = await supabase
      .from("empresas")
      .select("*")
      .ilike("cnpj", likePattern)
      .limit(1);
    if (res.data && res.data.length > 0) return res.data[0];
  }
  return null;
}

// Função para buscar empresa na BrasilAPI
async function buscarEmpresaBrasilAPI(cnpj) {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj.replace(/\D/g,"")}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.cnpj) {
      return {
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        cnpj: cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
        endereco_rfb: `${data.descricao_tipo_de_logradouro} ${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}, CEP: ${data.cep}`,
        endereco_trabalho: '',
        advogado: '',
        oab: '',
        telefone: '',
        email: '',
        observacoes: ''
      };
    }
  } catch (e) {}
  return null;
}

// Função para cadastrar empresa manualmente no Supabase
async function cadastrarEmpresaSupabase(empresa) {
  const empresaData = {
    cnpj: empresa.cnpj,
    razao_social: empresa.razao_social || empresa.razaoSocial,
    nome_fantasia: empresa.nome_fantasia || empresa.nomeFantasia,
    endereco_rfb: empresa.endereco_rfb || empresa.enderecoRfb,
    endereco_trabalho: empresa.endereco_trabalho || empresa.enderecoTrabalho,
    advogado: empresa.advogado,
    oab: empresa.oab,
    telefone: empresa.telefone,
    email: empresa.email,
    observacoes: empresa.observacoes
  };
  
  const { error } = await supabase.from("empresas").insert([empresaData]);
  if (error) {
    console.error('ERRO ao cadastrar empresa:', error);
    throw error;
  }
}

// Função para buscar pessoa física no Supabase
async function buscarPessoaFisicaSupabase(cpfRaw) {
  const cpfMasked = (cpfRaw || '').trim();
  const cpfDigits = cpfMasked.replace(/\D/g, '');
  
  // Tenta por igualdade exata (formato mascarado)
  let { data, error } = await supabase
    .from("pessoas_fisicas")
    .select("*")
    .eq("cpf", cpfMasked)
    .limit(1)
    .maybeSingle();
  
  if (data) return data;
  
  // Se não encontrou, tenta busca por CPF sem máscara
  if (!data && cpfDigits.length === 11) {
    const res = await supabase
      .from("pessoas_fisicas")
      .select("*")
      .ilike("cpf", `%${cpfDigits}%`)
      .limit(1);
    if (res.data && res.data.length > 0) return res.data[0];
  }
  
  return null;
}

// Função para cadastrar pessoa física no Supabase
async function cadastrarPessoaFisicaSupabase(pessoa) {
  const pessoaData = {
    cpf: pessoa.cpf,
    nome_completo: pessoa.nome_completo || pessoa.nomeCompleto,
    endereco_rfb: pessoa.endereco_rfb || pessoa.enderecoRfb,
    endereco_trabalho: pessoa.endereco_trabalho || pessoa.enderecoTrabalho,
    advogado: pessoa.advogado,
    oab: pessoa.oab,
    telefone: pessoa.telefone,
    email: pessoa.email,
    observacoes: pessoa.observacoes
  };
  
  const { error } = await supabase.from("pessoas_fisicas").insert([pessoaData]);
  if (error) {
    console.error('ERRO ao cadastrar pessoa física:', error);
    throw error;
  }
}


function NewProcessModal({ isOpen, onClose, onSave, process, isEdit, loading }) {
  const [editError, setEditError] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    titulo: "",
    numero: "",
    area: "",
    cliente: "",
    patrono: "",
    tribunal: "",
    competencia: "",
    situacao: "",
    valor_causa: "",
    honorarios: "",
    data_inicio: "",
    proxima_audiencia: "",
    juiz: "",
    descricao: "",
    empresas: []
  });
  // EDIÇÃO: buscar dados do processo
  useEffect(() => {
    if (isEdit && process && process.id) {
      (async () => {
        try {
          const { data, error } = await supabase.from('processos').select('*').eq('id', process.id).single();
          if (error || !data) {
            setEditError(error?.message || "Processo não encontrado ou erro na consulta.");
            return;
          }
          setForm({
            titulo: data.titulo || "",
            numero: data.numero_processo || "",
            area: data.area_direito || "",
            situacao: data.status || "",
            valor_causa: data.valor_causa || "",
            descricao: data.descricao || "",
            data_inicio: data.data_inicio || "",
            tribunal: data.tribunal || "",
            prioridade: data.prioridade || "",
            honorarios: data.honorarios || "",
            juiz: data.juiz || "",
            proxima_audiencia: data.proxima_audiencia || "",
            patrono: data.patrono_id ? String(data.patrono_id) : "",
            cliente: data.cliente_id ? String(data.cliente_id) : "",
            escritorio: data.escritorio_id || "",
            competencia: data.competencia_vara || "",
            ativo: data.ativo || "",
            empresas: []
          });
          
          // Buscar partes contrárias vinculadas ao processo
          const { data: processosEmpresas } = await supabase
            .from('processos_empresas')
            .select('empresa_id, empresa:empresas!empresa_id(*)')
            .eq('processo_id', process.id);
          
          if (processosEmpresas && processosEmpresas.length > 0) {
            const partes = processosEmpresas.map(pe => ({
              razaoSocial: pe.empresa?.razao_social || "",
              nomeFantasia: pe.empresa?.nome_fantasia || "",
              cnpj: pe.empresa?.cnpj || "",
              enderecoRfb: pe.empresa?.endereco_rfb || "",
              enderecoTrabalho: pe.empresa?.endereco_trabalho || "",
              advogado: pe.empresa?.advogado || "",
              oab: pe.empresa?.oab || "",
              telefone: pe.empresa?.telefone || "",
              email: pe.empresa?.email || "",
              observacoes: pe.empresa?.observacoes || ""
            }));
            setPartesContrarias(partes);
          }
          
          setEditError("");
        } catch (err) {
          setEditError(err.message || "Erro inesperado ao buscar processo.");
        }
      })();
    }
  }, [isEdit, process]);
  const [partesContrarias, setPartesContrarias] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState("cnpj"); // 'cnpj' ou 'cpf'
  const [parteForm, setParteForm] = useState({
    tipo: "cnpj", // 'cnpj' ou 'cpf'
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    cpf: "",
    enderecoRfb: "",
    enderecoTrabalho: "",
    advogado: "",
    oab: "",
    telefone: "",
    email: "",
    observacoes: ""
  });
  const [clientes, setClientes] = useState([]);
  const [patronos, setPatronos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState([]);
  const [error, setError] = useState(null);
  const [cnpjLookupTick, setCnpjLookupTick] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: clientesData } = await supabase.from("clientes").select("id, nome_completo");
        const { data: patronosData } = await supabase.from("patrono").select("id, nome_fantasia");
        const { data: empresasData } = await supabase.from("empresas").select("id, nome_fantasia");
        setClientes(clientesData || []);
        setPatronos(patronosData || []);
      } catch (err) {
        setError(err.message || "Erro ao buscar dados");
        setClientes([]);
        setPatronos([]);
        setEmpresas([]);
        window.patronosValidos = [];
      }
    }
    fetchData();
  }, []);

  // Busca automática quando CNPJ atingir 14 dígitos
  useEffect(() => {
    const cnpjDigits = (parteForm.cnpj || '').replace(/\D/g, '');
    if (cnpjDigits.length !== 14) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        console.log('DEBUG auto-lookup CNPJ:', parteForm.cnpj);
        let empresa = await buscarEmpresaSupabase(parteForm.cnpj);
        console.log('DEBUG auto buscarEmpresaSupabase:', empresa);
        if (!empresa) {
          empresa = await buscarEmpresaBrasilAPI(parteForm.cnpj);
          console.log('DEBUG auto buscarEmpresaBrasilAPI:', empresa);
          if (empresa) {
            const mapped = {
              razaoSocial: empresa.razao_social || empresa.razaoSocial || "",
              nomeFantasia: empresa.nome_fantasia || empresa.nomeFantasia || "",
              cnpj: empresa.cnpj || parteForm.cnpj,
              enderecoRfb: empresa.endereco_rfb || empresa.enderecoRfb || "",
              enderecoTrabalho: empresa.endereco_trabalho || empresa.enderecoTrabalho || "",
              advogado: empresa.advogado || "",
              oab: empresa.oab || "",
              telefone: empresa.telefone || "",
              email: empresa.email || "",
              observacoes: empresa.observacoes || ""
            };
            setParteForm(f => ({ ...f, ...mapped }));
            try {
              await cadastrarEmpresaSupabase({ cnpj: mapped.cnpj, razao_social: mapped.razaoSocial, nome_fantasia: mapped.nomeFantasia, endereco_rfb: mapped.enderecoRfb, endereco_trabalho: mapped.enderecoTrabalho, advogado: mapped.advogado, oab: mapped.oab, telefone: mapped.telefone, email: mapped.email, observacoes: mapped.observacoes });
            } catch (err) {
              console.warn('DEBUG cadastrarEmpresaSupabase erro (não fatal):', err.message || err);
            }
          }
        } else {
          const mapped = {
            razaoSocial: empresa.razao_social || empresa.razaoSocial || "",
            nomeFantasia: empresa.nome_fantasia || empresa.nomeFantasia || "",
            cnpj: empresa.cnpj || parteForm.cnpj,
            enderecoRfb: empresa.endereco_rfb || empresa.enderecoRfb || "",
            enderecoTrabalho: empresa.endereco_trabalho || empresa.enderecoTrabalho || "",
            advogado: empresa.advogado || "",
            oab: empresa.oab || "",
            telefone: empresa.telefone || "",
            email: empresa.email || "",
            observacoes: empresa.observacoes || ""
          };
          setParteForm(f => ({ ...f, ...mapped }));
        }
      } catch (e) {
        console.warn('DEBUG auto-lookup error:', e);
      }
    }, 350); // debounce
    return () => { clearTimeout(t); controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parteForm.cnpj, cnpjLookupTick]);

  // Busca automática quando CPF atingir 11 dígitos
  useEffect(() => {
    // Só executa se o tipo for CPF
    if (tipoDocumento !== 'cpf') return;
    
    const cpfDigits = (parteForm.cpf || '').replace(/\D/g, '');
    if (cpfDigits.length !== 11) return;
    
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        console.log('🔍 DEBUG auto-lookup CPF:', parteForm.cpf);
        
        // Primeiro busca no Supabase
        let pessoaFisica = await buscarPessoaFisicaSupabase(parteForm.cpf);
        console.log('💾 DEBUG buscarPessoaFisicaSupabase:', pessoaFisica);
        
        if (!pessoaFisica) {
          // Se não encontrou no Supabase, busca no CPFHub
          const dadosCpf = await buscarCPF(parteForm.cpf);
          console.log('🌐 DEBUG buscarCPF (CPFHub):', dadosCpf);
          
          if (dadosCpf) {
            const enderecoCompleto = dadosCpf.endereco ? 
              `${dadosCpf.endereco.logradouro}, ${dadosCpf.endereco.numero} - ${dadosCpf.endereco.bairro}, ${dadosCpf.endereco.cidade}/${dadosCpf.endereco.uf}` : '';
            
            const mapped = {
              tipo: "cpf",
              nomeCompleto: dadosCpf.nome_completo || "",
              cpf: dadosCpf.cpf || parteForm.cpf,
              enderecoRfb: enderecoCompleto,
              enderecoTrabalho: "",
              advogado: "",
              oab: "",
              telefone: dadosCpf.telefones && dadosCpf.telefones.length > 0 ? dadosCpf.telefones[0] : "",
              email: dadosCpf.emails && dadosCpf.emails.length > 0 ? dadosCpf.emails[0] : "",
              observacoes: dadosCpf.mae ? `Mãe: ${dadosCpf.mae}` : ""
            };
            console.log('✅ DEBUG mapped form (CPFHub):', mapped);
            setParteForm(f => ({ ...f, ...mapped }));
            
            // Cadastra no Supabase para futuras consultas
            try {
              await cadastrarPessoaFisicaSupabase({
                cpf: mapped.cpf,
                nome_completo: mapped.nomeCompleto,
                endereco_rfb: mapped.enderecoRfb,
                endereco_trabalho: mapped.enderecoTrabalho,
                advogado: mapped.advogado,
                oab: mapped.oab,
                telefone: mapped.telefone,
                email: mapped.email,
                observacoes: mapped.observacoes
              });
            } catch (err) {
              console.warn('⚠️ DEBUG cadastrarPessoaFisicaSupabase erro (não fatal):', err.message || err);
            }
          }
        } else {
          // Encontrou no Supabase
          const mapped = {
            tipo: "cpf",
            nomeCompleto: pessoaFisica.nome_completo || "",
            cpf: pessoaFisica.cpf || parteForm.cpf,
            enderecoRfb: pessoaFisica.endereco_rfb || "",
            enderecoTrabalho: pessoaFisica.endereco_trabalho || "",
            advogado: pessoaFisica.advogado || "",
            oab: pessoaFisica.oab || "",
            telefone: pessoaFisica.telefone || "",
            email: pessoaFisica.email || "",
            observacoes: pessoaFisica.observacoes || ""
          };
          console.log('✅ DEBUG mapped form (Supabase):', mapped);
          setParteForm(f => ({ ...f, ...mapped }));
        }
      } catch (e) {
        console.warn('❌ DEBUG auto-lookup CPF error:', e);
      }
    }, 350); // debounce
    
    return () => { clearTimeout(t); controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parteForm.cpf, tipoDocumento]);

  // Função para salvar processo
  const handleSave = () => {
    console.log('DEBUG [Modal] cliente selecionado:', form.cliente, typeof form.cliente);
    console.log('DEBUG [Modal] clientes disponíveis:', clientes);
    // Garante que o id do cliente é passado
    onSave({
      ...form,
      cliente: form.cliente,
      partesContrarias: partesContrarias.map(parte => ({
        tipo: parte.tipo || "cnpj",
        cnpj: parte.cnpj,
        cpf: parte.cpf,
        razaoSocial: parte.razaoSocial,
        nomeCompleto: parte.nomeCompleto,
        nomeFantasia: parte.nomeFantasia,
        enderecoRfb: parte.enderecoRfb,
        enderecoTrabalho: parte.enderecoTrabalho,
        advogado: parte.advogado,
        oab: parte.oab,
        telefone: parte.telefone,
        email: parte.email,
        observacoes: parte.observacoes
      }))
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 overflow-y-auto">
      {editError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg z-[60] max-w-[90vw] text-center">
          Erro ao carregar processo: {editError}
        </div>
      )}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto my-auto p-4 sm:p-6 md:p-8 relative max-h-[95vh] overflow-y-auto">
        <button className="absolute top-3 right-3 sm:top-4 sm:right-4 text-2xl sm:text-xl text-muted-foreground hover:text-black z-10" onClick={onClose} aria-label="Fechar">×</button>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 md:mb-8 pr-8">Novo Processo</h2>
        {step === 1 && (
          <form className="w-full space-y-4 sm:space-y-6" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="font-semibold text-base sm:text-lg block mb-2">Título do Processo *</label>
              <Input required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Cliente *</label>
                <SimpleAutocomplete
                  options={clientes.map(c => ({ value: String(c.id), label: c.nome_completo }))}
                  value={form.cliente ? String(form.cliente) : ''}
                  onChange={v => setForm(f => ({ ...f, cliente: String(v) }))}
                  required
                  placeholder="Selecione o cliente..."
                  className={(!form.cliente ? 'border-red-500' : '')}
                />
                {!form.cliente && (
                  <div className="text-xs text-red-500 mt-1">Selecione um cliente válido.</div>
                )}
                {form.cliente && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Cliente selecionado: {clientes.find(c => String(c.id) === String(form.cliente))?.nome_completo || "(id inválido)"}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Patrono (opcional)</label>
                <ShadcnSelect
                  options={patronos.map(p => ({ value: String(p.id), label: p.nome_fantasia }))}
                  value={form.patrono}
                  onChange={v => setForm(f => ({ ...f, patrono: v }))}
                  placeholder="Selecione..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Tipo de Área</label>
                <ShadcnSelect
                  options={[
                    { value: "Trabalhista", label: "Trabalhista" },
                    { value: "Cível", label: "Cível" },
                    { value: "Criminal", label: "Criminal" },
                    { value: "Previdenciário", label: "Previdenciário" },
                    { value: "Tributário", label: "Tributário" },
                    { value: "Família", label: "Família" },
                    { value: "Outros", label: "Outros" }
                  ]}
                  value={form.area}
                  onChange={v => setForm(f => ({ ...f, area: v }))}
                  placeholder="Selecione..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Número do Processo</label>
                <MaskedProcessNumberInput
                  value={form.numero}
                  onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                  placeholder="0000000-00.0000.0.00.0000"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Tribunal/Vara</label>
                <Input value={form.tribunal} onChange={e => setForm(f => ({ ...f, tribunal: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Competência</label>
                <Input placeholder="Ex: Cível, Criminal, etc." value={form.competencia} onChange={e => setForm(f => ({ ...f, competencia: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Prioridade</label>
                <ShadcnSelect
                  options={[{ value: "Média", label: "Média" }, { value: "Alta", label: "Alta" }, { value: "Baixa", label: "Baixa" }]}
                  value={form.media}
                  onChange={v => setForm(f => ({ ...f, media: v }))}
                  placeholder="Selecione..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Situação</label>
                <ShadcnSelect
                  options={[{ value: "Ativo", label: "Ativo" }, { value: "Arquivado", label: "Arquivado" }, { value: "Suspenso", label: "Suspenso" }]}
                  value={form.situacao}
                  onChange={v => setForm(f => ({ ...f, situacao: v }))}
                  placeholder="Selecione..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Valor da Causa (R$)</label>
                <MaskedCurrencyInput
                  value={form.valor_causa}
                  onChange={e => setForm(f => ({ ...f, valor_causa: e.target.value }))}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Honorários (R$)</label>
                <MaskedCurrencyInput
                  value={form.honorarios}
                  onChange={e => setForm(f => ({ ...f, honorarios: e.target.value }))}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Data de Início</label>
                <MaskedDateInput
                  value={form.data_inicio}
                  onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Próxima Audiência</label>
                <MaskedDateInput
                  value={form.proxima_audiencia}
                  onChange={e => setForm(f => ({ ...f, proxima_audiencia: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Juiz(a)</label>
                <Input value={form.juiz} onChange={e => setForm(f => ({ ...f, juiz: e.target.value }))} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-4">
              <label className="font-semibold text-sm">Descrição do Caso</label>
              <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} multiline />
            </div>
            {/* Campo 'Empresas associadas' removido conforme solicitado */}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 mt-6 sm:mt-8">
              <Button type="button" className="sm:mr-2 w-full sm:w-auto" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="button" className="bg-blue-600 text-white w-full sm:w-auto" onClick={() => setStep(2)}>Avançar para Parte Contrária</Button>
              <Button type="button" className="bg-green-600 text-white sm:ml-2 w-full sm:w-auto" onClick={handleSave} disabled={!form.cliente}>Salvar Processo</Button>
            </div>
          </form>
        )}
        {step === 2 && (
          <form className="w-full space-y-4 sm:space-y-6" onSubmit={e => e.preventDefault()}>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 md:mb-8">Adicionar Parte Contrária</h2>
            {/* Chips de partes já adicionadas */}
            {partesContrarias.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Partes adicionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {partesContrarias.map((parte, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 rounded-full text-sm border border-blue-200 flex items-center gap-2">
                      <span>
                        {parte.razaoSocial || parte.nomeCompleto} ({parte.cnpj || parte.cpf})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPartesContrarias(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-red-500 hover:text-red-700 font-bold"
                        aria-label="Remover parte"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Seletor de tipo de documento */}
            <div>
              <label className="font-semibold text-sm block mb-2">Tipo de Parte Contrária</label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoDocumento"
                    value="cnpj"
                    checked={tipoDocumento === "cnpj"}
                    onChange={(e) => {
                      setTipoDocumento(e.target.value);
                      setParteForm({
                        tipo: "cnpj",
                        razaoSocial: "",
                        nomeFantasia: "",
                        cnpj: "",
                        cpf: "",
                        enderecoRfb: "",
                        enderecoTrabalho: "",
                        advogado: "",
                        oab: "",
                        telefone: "",
                        email: "",
                        observacoes: ""
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pessoa Jurídica (CNPJ)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoDocumento"
                    value="cpf"
                    checked={tipoDocumento === "cpf"}
                    onChange={(e) => {
                      setTipoDocumento(e.target.value);
                      setParteForm({
                        tipo: "cpf",
                        razaoSocial: "",
                        nomeCompleto: "",
                        nomeFantasia: "",
                        cnpj: "",
                        cpf: "",
                        enderecoRfb: "",
                        enderecoTrabalho: "",
                        advogado: "",
                        oab: "",
                        telefone: "",
                        email: "",
                        observacoes: ""
                      });
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Pessoa Física (CPF)</span>
                </label>
              </div>
            </div>

            {tipoDocumento === "cnpj" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="font-semibold text-sm">CNPJ *</label>
                    <InputMask
                      mask="99.999.999/9999-99"
                  value={parteForm.cnpj}
                  onChange={e => setParteForm(f => ({ ...f, cnpj: e.target.value }))}
                  onBlur={async e => {
                    const cnpj = e.target.value;
                    console.log('DEBUG onBlur CNPJ:', cnpj);
                    if (cnpj.replace(/\D/g,"").length === 14) {
                      let empresa = await buscarEmpresaSupabase(cnpj);
                      console.log('DEBUG buscarEmpresaSupabase:', empresa);
                      if (!empresa) {
                        empresa = await buscarEmpresaBrasilAPI(cnpj);
                        console.log('DEBUG buscarEmpresaBrasilAPI:', empresa);
                        if (empresa) {
                          const mapped = {
                            razaoSocial: empresa.razao_social || empresa.razaoSocial || "",
                            nomeFantasia: empresa.nome_fantasia || empresa.nomeFantasia || "",
                            cnpj: empresa.cnpj || cnpj,
                            enderecoRfb: empresa.endereco_rfb || empresa.enderecoRfb || "",
                            enderecoTrabalho: empresa.endereco_trabalho || empresa.enderecoTrabalho || "",
                            advogado: empresa.advogado || "",
                            oab: empresa.oab || "",
                            telefone: empresa.telefone || "",
                            email: empresa.email || "",
                            observacoes: empresa.observacoes || ""
                          };
                          console.log('DEBUG onBlur mapped form (BrasilAPI):', mapped);
                          setParteForm(mapped);
                          try {
                            await cadastrarEmpresaSupabase({ cnpj: mapped.cnpj, razao_social: mapped.razaoSocial, nome_fantasia: mapped.nomeFantasia, endereco_rfb: mapped.enderecoRfb, endereco_trabalho: mapped.enderecoTrabalho, advogado: mapped.advogado, oab: mapped.oab, telefone: mapped.telefone, email: mapped.email, observacoes: mapped.observacoes });
                          } catch (err) {
                            console.warn('DEBUG cadastrarEmpresaSupabase erro (não fatal):', err.message || err);
                          }
                        }
                      } else {
                        const mapped = {
                          razaoSocial: empresa.razao_social || empresa.razaoSocial || "",
                          nomeFantasia: empresa.nome_fantasia || empresa.nomeFantasia || "",
                          cnpj: empresa.cnpj || cnpj,
                          enderecoRfb: empresa.endereco_rfb || empresa.enderecoRfb || "",
                          enderecoTrabalho: empresa.endereco_trabalho || empresa.enderecoTrabalho || "",
                          advogado: empresa.advogado || "",
                          oab: empresa.oab || "",
                          telefone: empresa.telefone || "",
                          email: empresa.email || "",
                          observacoes: empresa.observacoes || ""
                        };
                        console.log('DEBUG onBlur mapped form (Supabase):', mapped);
                        setParteForm(mapped);
                      }
                    } else {
                      console.log('DEBUG CNPJ inválido para busca:', cnpj);
                    }
                  }}
                  className="input input-bordered w-full"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Razão Social *</label>
                <Input required value={parteForm.razaoSocial} onChange={e => setParteForm(f => ({ ...f, razaoSocial: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Nome Fantasia</label>
                <Input value={parteForm.nomeFantasia} onChange={e => setParteForm(f => ({ ...f, nomeFantasia: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Endereço (RFB)</label>
                <Input value={parteForm.enderecoRfb} onChange={e => setParteForm(f => ({ ...f, enderecoRfb: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Endereço (Posto de Trabalho)</label>
                <Input value={parteForm.enderecoTrabalho} onChange={e => setParteForm(f => ({ ...f, enderecoTrabalho: e.target.value }))} />
              </div>
            </div>
            <hr className="my-4" />
            <h3 className="font-semibold text-lg mb-2">Informações do Patrono</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Nome do Advogado</label>
                <Input value={parteForm.advogado} onChange={e => setParteForm(f => ({ ...f, advogado: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">OAB</label>
                <Input value={parteForm.oab} onChange={e => setParteForm(f => ({ ...f, oab: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Telefone</label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={parteForm.telefone}
                  onChange={e => setParteForm(f => ({ ...f, telefone: e.target.value }))}
                  placeholder="(DDD) 00000-0000"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm">Email</label>
                <Input value={parteForm.email} onChange={e => setParteForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="mb-4">
              <label className="font-semibold text-sm">Observações</label>
              <Input value={parteForm.observacoes} onChange={e => setParteForm(f => ({ ...f, observacoes: e.target.value }))} multiline={"true"} />
            </div>
              </>
            ) : (
              <>
                {/* Formulário para CPF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="font-semibold text-sm">CPF *</label>
                    <InputMask
                      mask="999.999.999-99"
                      value={parteForm.cpf}
                      onChange={e => setParteForm(f => ({ ...f, cpf: e.target.value }))}
                      onBlur={async e => {
                        const cpf = e.target.value;
                        console.log('DEBUG onBlur CPF:', cpf);
                        if (cpf.replace(/\D/g,"").length === 11) {
                          try {
                            // Primeiro busca no Supabase
                            let pessoaFisica = await buscarPessoaFisicaSupabase(cpf);
                            console.log('DEBUG buscarPessoaFisicaSupabase:', pessoaFisica);
                            
                            if (!pessoaFisica) {
                              // Se não encontrou no Supabase, busca no CPFHub
                              const dadosCpf = await buscarCPF(cpf);
                              console.log('DEBUG buscarCPF (CPFHub):', dadosCpf);
                              
                              if (dadosCpf) {
                                const enderecoCompleto = dadosCpf.endereco ? 
                                  `${dadosCpf.endereco.logradouro}, ${dadosCpf.endereco.numero} - ${dadosCpf.endereco.bairro}, ${dadosCpf.endereco.cidade}/${dadosCpf.endereco.uf}` : '';
                                
                                const mapped = {
                                  tipo: "cpf",
                                  nomeCompleto: dadosCpf.nome_completo || "",
                                  cpf: dadosCpf.cpf || cpf,
                                  enderecoRfb: enderecoCompleto,
                                  enderecoTrabalho: "",
                                  advogado: "",
                                  oab: "",
                                  telefone: dadosCpf.telefones && dadosCpf.telefones.length > 0 ? dadosCpf.telefones[0] : "",
                                  email: dadosCpf.emails && dadosCpf.emails.length > 0 ? dadosCpf.emails[0] : "",
                                  observacoes: dadosCpf.mae ? `Mãe: ${dadosCpf.mae}` : ""
                                };
                                console.log('DEBUG onBlur mapped form (CPFHub):', mapped);
                                setParteForm(mapped);
                                
                                // Cadastra no Supabase para futuras consultas
                                try {
                                  await cadastrarPessoaFisicaSupabase({
                                    cpf: mapped.cpf,
                                    nome_completo: mapped.nomeCompleto,
                                    endereco_rfb: mapped.enderecoRfb,
                                    endereco_trabalho: mapped.enderecoTrabalho,
                                    advogado: mapped.advogado,
                                    oab: mapped.oab,
                                    telefone: mapped.telefone,
                                    email: mapped.email,
                                    observacoes: mapped.observacoes
                                  });
                                } catch (err) {
                                  console.warn('DEBUG cadastrarPessoaFisicaSupabase erro (não fatal):', err.message || err);
                                }
                              }
                            } else {
                              // Encontrou no Supabase, usa os dados salvos
                              const mapped = {
                                tipo: "cpf",
                                nomeCompleto: pessoaFisica.nome_completo || "",
                                cpf: pessoaFisica.cpf || cpf,
                                enderecoRfb: pessoaFisica.endereco_rfb || "",
                                enderecoTrabalho: pessoaFisica.endereco_trabalho || "",
                                advogado: pessoaFisica.advogado || "",
                                oab: pessoaFisica.oab || "",
                                telefone: pessoaFisica.telefone || "",
                                email: pessoaFisica.email || "",
                                observacoes: pessoaFisica.observacoes || ""
                              };
                              console.log('DEBUG onBlur mapped form (Supabase):', mapped);
                              setParteForm(mapped);
                            }
                          } catch (err) {
                            console.warn('DEBUG buscarCPF erro:', err.message || err);
                          }
                        } else {
                          console.log('DEBUG CPF inválido para busca:', cpf);
                        }
                      }}
                      className="input input-bordered w-full"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="font-semibold text-sm">Nome Completo *</label>
                    <Input required value={parteForm.nomeCompleto} onChange={e => setParteForm(f => ({ ...f, nomeCompleto: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Endereço</label>
                    <Input value={parteForm.enderecoRfb} onChange={e => setParteForm(f => ({ ...f, enderecoRfb: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Endereço (Posto de Trabalho)</label>
                    <Input value={parteForm.enderecoTrabalho} onChange={e => setParteForm(f => ({ ...f, enderecoTrabalho: e.target.value }))} />
                  </div>
                </div>
                <hr className="my-4" />
                <h3 className="font-semibold text-lg mb-2">Informações do Patrono</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Nome do Advogado</label>
                    <Input value={parteForm.advogado} onChange={e => setParteForm(f => ({ ...f, advogado: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">OAB</label>
                    <Input value={parteForm.oab} onChange={e => setParteForm(f => ({ ...f, oab: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Telefone</label>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={parteForm.telefone}
                      onChange={e => setParteForm(f => ({ ...f, telefone: e.target.value }))}
                      placeholder="(DDD) 00000-0000"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm">Email</label>
                    <Input value={parteForm.email} onChange={e => setParteForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="font-semibold text-sm">Observações</label>
                  <Input value={parteForm.observacoes} onChange={e => setParteForm(f => ({ ...f, observacoes: e.target.value }))} multiline={"true"} />
                </div>
              </>
            )}
            
            <div className="flex gap-2 mb-8">
              <Button type="button" variant="outline" onClick={() => {
                setPartesContrarias(prev => [...prev, parteForm]);
                setParteForm({
                  tipo: tipoDocumento,
                  razaoSocial: "",
                  nomeCompleto: "",
                  nomeFantasia: "",
                  cnpj: "",
                  cpf: "",
                  enderecoRfb: "",
                  enderecoTrabalho: "",
                  advogado: "",
                  oab: "",
                  telefone: "",
                  email: "",
                  observacoes: ""
                });
              }}>Adicionar esta Parte</Button>
              {partesContrarias.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => setParteForm({
                  tipo: tipoDocumento,
                  razaoSocial: "",
                  nomeCompleto: "",
                  nomeFantasia: "",
                  cnpj: "",
                  cpf: "",
                  enderecoRfb: "",
                  enderecoTrabalho: "",
                  advogado: "",
                  oab: "",
                  telefone: "",
                  email: "",
                  observacoes: ""
                })}>Adicionar mais partes contrárias ao processo</Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-6 sm:mt-8">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-full sm:w-auto">Voltar</Button>
              <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
                <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">Cancelar</Button>
                <Button type="button" className="bg-blue-600 text-white w-full sm:w-auto" onClick={handleSave}>Salvar</Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default NewProcessModal;
