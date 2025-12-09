import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, CheckCircle, XCircle, Trash2, FileEdit } from 'lucide-react';
import { juliaService } from '../../services/juliaAIService';
import PeticaoEditor from '../PeticaoEditor';

const JuliaAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'julia',
      text: 'Olá! 👋 Sou Julia, sua assistente jurídica inteligente.\n\n🤖 **100% Powered by Google Gemini AI**\n\n✨ **O que posso fazer:**\n• 📝 Redigir petições jurídicas (modo duplo agente)\n• 📋 Extrair dados de processos automaticamente\n• 👤 Criar clientes e processos de forma inteligente\n• 📅 Agendar audiências, reuniões e prazos\n• 💬 Entender linguagem natural e lembrar de tudo\n\n🎯 **Experimente:**\n• "Redigir petição de cumprimento de sentença"\n• Cole texto de processo judicial\n• "Criar audiência para processo X"\n\nSou MUITO inteligente e vou entender! 🚀\n\nComo posso ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [initError, setInitError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(''); // Guardar última mensagem para extrair CPF
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Inicializar Julia ao abrir o chat
  useEffect(() => {
    if (isOpen && !initError) {
      juliaService.initialize().catch(error => {
        console.error('Erro ao inicializar Julia:', error);
        setInitError(error.message);
        addMessage('julia', 
          'Desculpe, ocorreu um erro ao me inicializar. Por favor, verifique se a API Key do Gemini está configurada corretamente no arquivo .env',
          'error'
        );
      });
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addMessage = (sender, text, type = 'text') => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    
    // ⚡ DETECÇÃO DE CONFIRMAÇÃO - Se há ação pendente e usuário diz "sim"
    if (pendingAction && /^(sim|s|confirma|confirmo|pode|ok|yes|prosseguir|continue)$/i.test(userMessage)) {
      console.log('✅ Confirmação detectada com ação pendente:', pendingAction.action);
      setInputValue('');
      handleConfirmAction();
      return;
    }
    
    // ⚡ DETECÇÃO DE CANCELAMENTO - Se há ação pendente e usuário diz "não"
    if (pendingAction && /^(não|nao|n|cancelar|cancela|negativo|not|no)$/i.test(userMessage)) {
      console.log('❌ Cancelamento detectado');
      setInputValue('');
      addMessage('user', userMessage);
      addMessage('julia', '✅ Ação cancelada. Como posso ajudar?');
      setPendingAction(null);
      return;
    }
    
    setInputValue('');
    setLastUserMessage(userMessage); // Salvar para extração de CPF posterior
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await juliaService.processMessage(userMessage);

      if (!response) {
        throw new Error('Resposta vazia da IA');
      }

      // Detectar qual IA foi usada
      if (response.ai) {
        console.log(`🤖 Resposta via ${response.ai.toUpperCase()}`);
      }

      // Se a resposta é texto mas contém JSON, tentar extrair
      if (response.type === 'text' && response.message && response.message.includes('"action"')) {
        console.log('🔍 Detectado JSON na resposta (fallback frontend), tentando extrair...');
        try {
          // Extrair JSON do markdown code block se existir
          let jsonText = response.message;
          let textoAnteDoJson = '';
          
          const jsonMatch = response.message.match(/```json\s*([\s\S]*?)```/);
          if (jsonMatch) {
            console.log('📋 JSON encontrado em code block');
            jsonText = jsonMatch[1];
            // Pegar apenas o texto ANTES do JSON
            textoAnteDoJson = response.message.split('```json')[0].trim();
          } else {
            // Tentar extrair JSON sem markdown
            const startIdx = jsonText.indexOf('{');
            if (startIdx !== -1) {
              textoAnteDoJson = jsonText.substring(0, startIdx).trim();
              jsonText = jsonText.substring(startIdx);
            }
          }
          
          // Extrair JSON completo balanceando chaves
          let braceCount = 0;
          let endIdx = -1;
          for (let i = 0; i < jsonText.length; i++) {
            if (jsonText[i] === '{') braceCount++;
            if (jsonText[i] === '}') {
              braceCount--;
              if (braceCount === 0) {
                endIdx = i;
                break;
              }
            }
          }
          
          if (endIdx !== -1) {
            jsonText = jsonText.substring(0, endIdx + 1);
          }
          
          const parsedJson = JSON.parse(jsonText.trim());
          console.log('✅ JSON parseado com sucesso (frontend):', parsedJson);
          
          if (parsedJson.action && parsedJson.params) {
            // Converter para formato esperado
            console.log('🔄 Convertendo para formato de ação:', parsedJson.action);
            response.type = 'action';
            response.action = parsedJson.action;
            response.params = parsedJson.params;
            response.needsConfirmation = parsedJson.needsConfirmation;
            response.metadata = parsedJson.metadata || {};
            
            // Se tinha texto antes do JSON e não tem mensagem no metadata, adicionar
            if (textoAnteDoJson && !response.metadata.mensagem && !response.metadata.textoIntroducao) {
              response.metadata.textoIntroducao = textoAnteDoJson;
            }
          }
        } catch (e) {
          console.error('❌ Erro ao parsear JSON da resposta (frontend):', e);
          // Se não conseguir parsear, mostrar pelo menos o texto antes do JSON
          const textoSemJson = response.message.split(/```json|{/)[0].trim();
          if (textoSemJson) {
            response.message = textoSemJson + '\n\n⚠️ (Houve um erro ao processar a ação. Por favor, reformule sua solicitação.)';
          }
        }
      }

      if (response.type === 'action') {
        // Julia quer executar uma ação
        
        // Ações de busca/consulta: executar automaticamente SEM confirmação
        const autoExecuteActions = ['buscarClientes', 'buscarProcessos', 'buscarAudiencias'];
        
        if (autoExecuteActions.includes(response.action)) {
          // EXECUTAR AUTOMATICAMENTE (sem mostrar a mensagem original com JSON)
          addMessage('julia', `🔍 Buscando... aguarde um momento.`);
          
          try {
            const result = await juliaService.executeAction(response.action, response.params);
            
            if (result.success) {
              // Formatar resultado da busca
              let resultMessage = '';
              
              if (response.action === 'buscarClientes') {
                if (result.data && result.data.length > 0) {
                  const cliente = result.data[0];
                  resultMessage = `✅ **Cliente já cadastrado!**\n\n`;
                  resultMessage += `📋 **${cliente.nome_completo}**\n`;
                  if (cliente.cpf) resultMessage += `• CPF: ${cliente.cpf}\n`;
                  if (cliente.email) resultMessage += `• Email: ${cliente.email}\n`;
                  if (cliente.telefone) resultMessage += `• Telefone: ${cliente.telefone}\n`;
                  if (cliente.endereco) resultMessage += `• Endereço: ${cliente.endereco}\n`;
                  resultMessage += '\n';
                  
                  // Se tem dados de processo para criar, oferecer criar automaticamente
                  if (response.metadata?.hasProcesso && response.metadata?.processoData) {
                    const proc = response.metadata.processoData;
                    resultMessage += `⚖️ **Processo detectado:**\n`;
                    resultMessage += `• Número: ${proc.numero}\n`;
                    resultMessage += `• Tipo: ${proc.tipo}\n`;
                    if (proc.valor) resultMessage += `• Valor: R$ ${proc.valor}\n`;
                    resultMessage += '\n';
                    resultMessage += `💡 Deseja criar este processo vinculado ao cliente **${cliente.nome_completo}**?`;
                    
                    // Preparar ação pendente para criar processo
                    setPendingAction({
                      action: 'criarProcesso',
                      params: {
                        cliente_id: cliente.id,
                        numero_processo: proc.numero,
                        tipo: proc.tipo,
                        vara: proc.vara,
                        descricao: proc.descricao,
                        valor_causa: proc.valor
                      },
                      metadata: response.metadata
                    });
                    
                    addMessage('julia', resultMessage, 'action');
                    return; // Não continuar para não adicionar mensagem duplicada
                  } else {
                    resultMessage += `💡 O que deseja fazer com este cliente?`;
                  }
                } else {
                  resultMessage = `❌ **Cliente não encontrado no sistema.**\n\n`;
                  if (response.metadata?.hasProcesso && response.metadata?.processoData) {
                    const proc = response.metadata.processoData;
                    resultMessage += `⚖️ **Dados extraídos do PJe:**\n`;
                    resultMessage += `• Cliente: ${proc.cliente_nome}\n`;
                    resultMessage += `• Processo: ${proc.numero}\n\n`;
                    resultMessage += `💡 Deseja criar o cliente e vincular o processo automaticamente?`;
                  } else if (response.params.cpf || response.params.nome) {
                    resultMessage += `💡 Deseja criar um novo cadastro com os dados fornecidos?`;
                  } else {
                    resultMessage += `Para criar um novo cliente, cole os dados do processo ou me informe os dados manualmente.`;
                  }
                }
              } else if (response.action === 'buscarProcessos') {
                if (result.data && result.data.length > 0) {
                  resultMessage = `✅ Encontrei ${result.data.length} processo(s):\n\n`;
                  result.data.forEach((processo, i) => {
                    resultMessage += `${i + 1}. **${processo.numero_processo}**\n`;
                    if (processo.tipo) resultMessage += `   Tipo: ${processo.tipo}\n`;
                    if (processo.status) resultMessage += `   Status: ${processo.status}\n`;
                    resultMessage += '\n';
                  });
                } else {
                  resultMessage = `❌ Nenhum processo encontrado.`;
                }
              } else {
                resultMessage = result.message || 'Busca concluída.';
              }
              
              addMessage('julia', resultMessage);
            } else {
              addMessage('julia', `❌ Erro na busca: ${result.error}`, 'error');
            }
          } catch (error) {
            addMessage('julia', `❌ Erro ao buscar: ${error.message}`, 'error');
          }
          
        } else {
          // Ações que precisam confirmação (criar, editar, deletar)
          setPendingAction(response);
          
          // Se tem mensagem customizada (dados extraídos), usar ela
          let confirmMessage;
          if (response.metadata?.mensagem) {
            confirmMessage = response.metadata.mensagem;
          } else if (response.metadata?.textoIntroducao) {
            // Usar texto que veio antes do JSON
            confirmMessage = response.metadata.textoIntroducao;
          } else {
            const paramsText = formatParams(response.params);
            confirmMessage = `Entendi! Vou ${getActionDescription(response.action)} com os seguintes dados:\n\n${paramsText}\n\nPosso prosseguir?`;
          }
          
          addMessage('julia', confirmMessage, 'action');
        }
      } else if (response.type === 'message') {
        console.log('💬 Tipo: message');
        // Não mostrar mensagem se contém JSON (já foi processado como action)
        if (response.message.includes('```json') || response.message.includes('"action"')) {
          console.log('⚠️ Mensagem contém JSON, extraindo apenas texto útil');
          const textoLimpo = response.message.split(/```json|{/)[0].trim();
          if (textoLimpo) {
            addMessage('julia', textoLimpo + '\n\n⚠️ (Processando ação...)');
          } else {
            addMessage('julia', '🔄 Processando sua solicitação...');
          }
        } else {
          addMessage('julia', response.message);
        }
      } else if (response.type === 'error') {
        console.log('❌ Tipo: error');
        addMessage('julia', response.message, 'error');
      } else {
        console.log('📝 Tipo: outro (petição ou resposta padrão)');
        // Detectar se é uma petição (começa com #)
        const isPeticao = response.message && response.message.trim().startsWith('#');
        
        if (isPeticao) {
          // É uma petição! Abrir o editor
          addMessage('julia', '📝 **Petição gerada com sucesso!**\n\nClique no botão abaixo para abrir o editor e fazer ajustes:');
          setEditorContent(response.message);
          // Não abre automaticamente, usuário decide quando abrir
        } else {
          addMessage('julia', response.message || 'Desculpe, não entendi. Pode reformular sua pergunta?');
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      addMessage('julia', `Desculpe, ocorreu um erro: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsLoading(true);
    addMessage('user', 'Sim, pode prosseguir!');

    try {
      // Se estiver criando cliente E não tiver CPF, GARANTIR extração de múltiplas fontes
      let params = { ...pendingAction.params };
      
      if (pendingAction.action === 'criarCliente') {
        console.log('🔧 Verificando CPF antes de criar cliente...');
        console.log('🔧 Params atuais:', params);
        console.log('🔧 Metadata:', pendingAction.metadata);
        
        // Tentar extrair CPF de VÁRIAS fontes (ordem de prioridade)
        if (!params.cpf || params.cpf.length !== 11) {
          let cpfEncontrado = null;
          
          // Fonte 1: metadata.processoData
          if (pendingAction.metadata?.processoData) {
            const processoData = pendingAction.metadata.processoData;
            
            if (processoData.cliente_cpf) {
              cpfEncontrado = processoData.cliente_cpf.replace(/\D/g, '');
              console.log('🔧 [Fonte 1] CPF do metadata.processoData.cliente_cpf:', cpfEncontrado);
            }
            
            // Procurar em TODOS os campos do processoData
            if (!cpfEncontrado) {
              for (const [key, value] of Object.entries(processoData)) {
                if (typeof value === 'string') {
                  const cpfMatch = value.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/);
                  if (cpfMatch) {
                    cpfEncontrado = cpfMatch[0].replace(/\D/g, '');
                    console.log(`🔧 [Fonte 2] CPF do metadata.processoData.${key}:`, cpfEncontrado);
                    break;
                  }
                }
              }
            }
          }
          
          // Fonte 3: Última mensagem do usuário (texto original)
          if (!cpfEncontrado && lastUserMessage) {
            const cpfMatch = lastUserMessage.match(/CPF[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i);
            if (cpfMatch) {
              cpfEncontrado = cpfMatch[1].replace(/\D/g, '');
              console.log('🔧 [Fonte 3] CPF da mensagem original:', cpfEncontrado);
            }
          }
          
          if (cpfEncontrado && cpfEncontrado.length === 11) {
            params.cpf = cpfEncontrado;
            console.log('✅ CPF FINAL garantido:', cpfEncontrado);
          } else {
            console.error('❌ NENHUM CPF VÁLIDO ENCONTRADO!');
          }
        }
        
        console.log('🔧 Params FINAIS para criarCliente:', params);
      }
      
      // 🔧 NORMALIZAÇÃO DE PARÂMETROS - Corrigir variações de nomes
      // A Julia às vezes envia "processo_numero" em vez de "numero_processo"
      if (params.processo_numero && !params.numero_processo) {
        params.numero_processo = params.processo_numero;
        delete params.processo_numero;
        console.log('🔧 Normalizado: processo_numero → numero_processo');
      }
      
      // Normalizar campo de data para audiências/reuniões/prazos
      // Julia pode enviar "data" ou "data_andamento" - manter ambos para compatibilidade
      if (params.data_andamento && !params.data) {
        params.data = params.data_andamento;
        console.log('🔧 Garantido: data_andamento → data também disponível');
      }
      if (params.data && !params.data_andamento) {
        params.data_andamento = params.data;
        console.log('🔧 Garantido: data → data_andamento também disponível');
      }
      
      console.log('🔧 Params FINAIS após normalização:', params);
      
      const result = await juliaService.executeAction(
        pendingAction.action,
        params
      );

      if (result.success) {
        // Mensagem de sucesso com mais contexto
        let successMessage = result.message || 'Ação executada com sucesso! ✅';
        
        // Log do resultado para debugging
        console.log('✅ Ação executada:', {
          action: pendingAction.action,
          params: params,
          result: result.data
        });
        
        addMessage('julia', successMessage, 'success');
        
        // Debug logs
        console.log('🔍 Verificando continuação automática...');
        console.log('Action:', pendingAction.action);
        console.log('Metadata:', pendingAction.metadata);
        console.log('Has Processo?', pendingAction.metadata?.hasProcesso);
        console.log('Has Audiencia?', pendingAction.metadata?.hasAudiencia);
        
        // 🔗 FLUXO 1: Se criou cliente E tem dados de processo, PERGUNTAR ao usuário
        if (pendingAction.action === 'criarCliente' && pendingAction.metadata?.hasProcesso) {
          console.log('✅ Cliente criado! Perguntando sobre processo...');
          const processoData = pendingAction.metadata.processoData;
          
          if (processoData?.numero) {
            // Aguardar 500ms antes de perguntar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Julia pergunta se deve criar o processo
            const mensagemProcesso = `🔄 Detectei que você tem dados do processo **${processoData.numero}**.\n\nDeseja que eu crie o processo agora?`;
            addMessage('julia', mensagemProcesso);
            
            // Guardar dados do processo para uso posterior
            setPendingAction({
              action: 'criarProcesso',
              params: {
                numero_processo: processoData.numero,
                cliente_id: result.data?.id,
                cliente_nome: processoData.cliente_nome,
                cliente_cpf: result.data?.cpf, // ⚡ Incluir CPF do cliente recém-criado
                cliente_endereco: result.data?.endereco,
                titulo: processoData.titulo,
                tipo: processoData.tipo || 'Trabalhista',
                vara: processoData.vara,
                descricao: processoData.descricao,
                valor_causa: processoData.valor,
                parte_contraria: processoData.parte_contraria,
                partes_contrarias: processoData.partes_contrarias
              },
              metadata: processoData
            });
            
            setIsLoading(false);
            return; // Parar aqui e esperar resposta do usuário
          }
        }
        
        // 🔗 FLUXO 2: Se criou processo E tem dados de audiência, PERGUNTAR ao usuário
        if (pendingAction.action === 'criarProcesso' && pendingAction.metadata?.hasAudiencia) {
          console.log('✅ Processo criado! Perguntando sobre audiência...');
          const audienciaData = pendingAction.metadata.audienciaData;
          
          if (audienciaData) {
            // Aguardar 500ms antes de perguntar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Julia pergunta se deve criar a audiência
            const mensagemAudiencia = `🔄 Detectei que você tem dados de uma audiência **${audienciaData.titulo || audienciaData.tipo || 'de Instrução'}** para ${audienciaData.data ? new Date(audienciaData.data).toLocaleDateString('pt-BR') : 'data a definir'}.\n\nDeseja que eu crie a audiência agora?`;
            addMessage('julia', mensagemAudiencia);
            
            // Guardar dados da audiência para uso posterior
            setPendingAction({
              action: 'criarAudiencia',
              params: {
                processo_id: result.data?.id, // ⚡ CRUCIAL: Passar o ID do processo recém-criado
                numero_processo: result.data?.numero_processo,
                titulo: audienciaData.titulo || audienciaData.tipo || 'Audiência de Instrução',
                descricao: audienciaData.descricao,
                data: audienciaData.data,
                tipo: audienciaData.tipo
              },
              metadata: audienciaData
            });
            
            setIsLoading(false);
            return; // Parar aqui e esperar resposta do usuário
          }
        }
      } else {
        // 🔍 DIAGNÓSTICO INTELIGENTE DE ERRO
        const diagnostico = diagnosticarErro(pendingAction.action, params, result.error);
        
        let errorMessage = `❌ **Erro ao executar ação:**\n\n`;
        errorMessage += `${result.error}\n\n`;
        errorMessage += `🔍 **Diagnóstico:**\n${diagnostico.diagnostico}\n\n`;
        
        if (diagnostico.solucao) {
          errorMessage += `💡 **Possível Solução:**\n${diagnostico.solucao}\n\n`;
        }
        
        if (diagnostico.detalhes) {
          errorMessage += `📋 **Detalhes Técnicos:**\n${diagnostico.detalhes}`;
        }
        
        // Log detalhado do erro
        console.error('❌ Erro na execução:', {
          action: pendingAction.action,
          params: params,
          error: result.error,
          diagnostico: diagnostico
        });
        
        addMessage('julia', errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Erro crítico ao executar ação:', error);
      
      const diagnostico = diagnosticarErro(pendingAction?.action || 'desconhecida', {}, error.message);
      
      let errorMessage = `❌ **Erro crítico:**\n\n`;
      errorMessage += `${error.message}\n\n`;
      errorMessage += `🔍 **Diagnóstico:**\n${diagnostico.diagnostico}`;
      
      addMessage('julia', errorMessage, 'error');
    } finally {
      setPendingAction(null);
      setIsLoading(false);
    }
  };

  // 🔍 FUNÇÃO DE DIAGNÓSTICO INTELIGENTE DE ERROS
  const diagnosticarErro = (action, params, errorMessage) => {
    const erro = String(errorMessage).toLowerCase();
    
    // Diagnóstico específico por tipo de ação
    const diagnosticos = {
      // AUDIÊNCIA - Processo não encontrado
      criarAudiencia: () => {
        if (erro.includes('processo não encontrado')) {
          return {
            diagnostico: 'Tentei criar a audiência mas o processo ainda não existe no banco de dados.',
            solucao: 'O processo precisa ser criado ANTES de criar a audiência. Vou criar o processo primeiro e depois a audiência automaticamente.',
            detalhes: `Número do processo tentado: ${params.numero_processo || params.processo_id || 'não informado'}\n\nEste erro geralmente ocorre quando:\n1. O processo foi mencionado mas ainda não foi cadastrado\n2. O número do processo está incorreto\n3. Houve erro na criação anterior do processo`
          };
        }
        if (erro.includes('invalid time') || erro.includes('data inválida')) {
          return {
            diagnostico: 'A data fornecida está em formato inválido ou não pode ser processada.',
            solucao: 'Fornecer a data no formato correto: DD/MM/YYYY HH:mm ou YYYY-MM-DDTHH:mm:ss',
            detalhes: `Data tentada: ${params.data || params.data_andamento || 'não informada'}\n\nFormatos aceitos:\n• ISO: "2026-01-26T14:30:00"\n• Brasileiro: "26/01/2026 14:30"\n• Timestamp: Date válido`
          };
        }
        return null;
      },
      
      // PROCESSO - Erros comuns
      criarProcesso: () => {
        if (erro.includes('cliente não encontrado')) {
          const hasCpf = params.cliente_cpf && params.cliente_cpf.length === 11;
          return {
            diagnostico: 'O cliente vinculado a este processo não existe no sistema.',
            solucao: hasCpf 
              ? '⚡ Como você forneceu o CPF, vou criar o cliente automaticamente e depois o processo. Cole os dados novamente para eu processar.' 
              : 'Forneça o CPF do cliente junto com os dados do processo para que eu possa criar o cliente automaticamente.',
            detalhes: `Cliente: ${params.cliente_nome || 'não informado'}\nCPF fornecido: ${hasCpf ? '✅ Sim' : '❌ Não (necessário para criação automática)'}`
          };
        }
        if (erro.includes('já existe')) {
          return {
            diagnostico: 'Este processo já está cadastrado no sistema.',
            solucao: 'Usar o comando "atualizar processo" em vez de "criar processo", ou buscar o processo existente.',
            detalhes: `Número do processo: ${params.numero_processo || 'não informado'}`
          };
        }
        return null;
      },
      
      // CLIENTE - Erros comuns
      criarCliente: () => {
        if (erro.includes('cpf') && erro.includes('já existe')) {
          return {
            diagnostico: 'Já existe um cliente com este CPF cadastrado.',
            solucao: 'Use "buscar cliente por CPF" para ver os dados existentes ou "atualizar cliente" para modificar.',
            detalhes: `CPF: ${params.cpf || 'não informado'}`
          };
        }
        if (erro.includes('cpf') && erro.includes('inválido')) {
          return {
            diagnostico: 'O CPF fornecido está em formato inválido.',
            solucao: 'Verifique se o CPF tem 11 dígitos e está correto.',
            detalhes: `CPF tentado: ${params.cpf || 'não informado'}`
          };
        }
        return null;
      },
      
      // ANDAMENTO
      atualizarAndamento: () => {
        if (erro.includes('processo não encontrado')) {
          return {
            diagnostico: 'O processo que você está tentando atualizar não foi encontrado.',
            solucao: 'Certifique-se de que está com o modal de detalhes do processo aberto, ou informe o número completo do processo.',
            detalhes: `Processo ID: ${params.processo_id || 'não informado'}\nNúmero: ${params.numero_processo || 'não informado'}`
          };
        }
        return null;
      }
    };
    
    // Tenta diagnóstico específico da ação
    const diagnosticoEspecifico = diagnosticos[action]?.();
    if (diagnosticoEspecifico) return diagnosticoEspecifico;
    
    // Diagnósticos genéricos
    if (erro.includes('não encontrado') || erro.includes('not found')) {
      return {
        diagnostico: 'O recurso que você está tentando acessar não existe no banco de dados.',
        solucao: 'Verifique se os dados fornecidos estão corretos (número do processo, ID do cliente, etc.) e se o registro foi criado anteriormente.',
        detalhes: `Ação: ${action}\nParâmetros: ${JSON.stringify(params, null, 2)}`
      };
    }
    
    if (erro.includes('permiss') || erro.includes('authorization') || erro.includes('rls')) {
      return {
        diagnostico: 'Você não tem permissão para executar esta ação.',
        solucao: 'Entre em contato com o administrador do sistema para verificar suas permissões de acesso.',
        detalhes: 'Este erro pode ocorrer por configurações de RLS (Row Level Security) no Supabase.'
      };
    }
    
    if (erro.includes('connection') || erro.includes('network') || erro.includes('timeout')) {
      return {
        diagnostico: 'Problema de conexão com o servidor.',
        solucao: 'Verifique sua conexão com a internet e tente novamente em alguns segundos.',
        detalhes: 'Se o problema persistir, o servidor pode estar temporariamente indisponível.'
      };
    }
    
    if (erro.includes('required') || erro.includes('obrigatório')) {
      return {
        diagnostico: 'Faltam dados obrigatórios para completar esta ação.',
        solucao: 'Forneça todos os dados necessários (nome, CPF, número do processo, etc.) e tente novamente.',
        detalhes: `Parâmetros recebidos: ${JSON.stringify(params, null, 2)}`
      };
    }
    
    // Diagnóstico padrão
    return {
      diagnostico: 'Ocorreu um erro inesperado durante a execução.',
      solucao: 'Tente novamente. Se o erro persistir, verifique se todos os dados estão corretos.',
      detalhes: `Ação: ${action}\nErro: ${errorMessage}`
    };
  };

  const handleCancelAction = () => {
    addMessage('user', 'Não, cancele.');
    addMessage('julia', 'Ok, ação cancelada. Como posso ajudá-lo de outra forma?');
    setPendingAction(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getActionDescription = (action) => {
    const descriptions = {
      criarCliente: 'criar um novo cliente',
      atualizarCliente: 'atualizar dados do cliente',
      criarProcesso: 'criar um novo processo',
      criarAudiencia: 'agendar uma audiência',
      criarReuniao: 'agendar uma reunião',
      criarPrazo: 'criar um prazo',
      buscarProcessos: 'buscar processos',
      buscarClientes: 'buscar clientes',
      buscarAudiencias: 'buscar audiências'
    };
    return descriptions[action] || 'executar esta ação';
  };

  const formatParams = (params) => {
    return Object.entries(params)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
          aria-label="Abrir assistente Julia"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute -top-10 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Julia - Assistente IA
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Julia</h3>
                  <p className="text-xs text-purple-100">
                    Powered by Gemini AI 🧠
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm('Deseja limpar toda a memória de conversas?')) {
                      juliaService.clearMemory();
                      setMessages([{
                        id: 1,
                        sender: 'julia',
                        text: 'Memória limpa! Como posso ajudar?',
                        timestamp: new Date()
                      }]);
                    }
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                  title="Limpar memória"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-300/30 rounded-lg px-3 py-2 text-xs flex items-center justify-between">
              <span>🤖 Google Gemini Pro • 60 req/min grátis</span>
              <span className="text-[10px] opacity-75">💾 {juliaService.conversationMemory.length} msgs</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : message.type === 'success'
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'julia' && message.type !== 'error' && (
                      <Sparkles className="w-4 h-4 mt-1 flex-shrink-0 text-purple-600" />
                    )}
                    {message.type === 'success' && (
                      <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-green-600" />
                    )}
                    {message.type === 'error' && (
                      <XCircle className="w-4 h-4 mt-1 flex-shrink-0 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <span className="text-xs opacity-60 mt-1 block">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            {pendingAction && !isLoading && (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleConfirmAction}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  ✓ Confirmar
                </button>
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  ✗ Cancelar
                </button>
              </div>
            )}

            {/* Botão Abrir Editor (quando há petição) */}
            {editorContent && !isLoading && (
              <div className="flex justify-center">
                <button
                  onClick={() => setEditorOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm font-medium"
                >
                  <FileEdit className="w-5 h-5" />
                  📝 Abrir Editor de Petições
                </button>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Julia está pensando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                disabled={isLoading}
                rows={3}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg px-4 py-2 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Julia pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      )}

      {/* Editor de Petições */}
      {editorOpen && (
        <PeticaoEditor
          initialContent={editorContent}
          onSave={(markdownContent, htmlContent) => {
            console.log('Petição salva:', markdownContent);
            addMessage('julia', '✅ Petição salva com sucesso! Você pode exportá-la para .docx quando quiser.');
            setEditorOpen(false);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
};

export default JuliaAssistant;
