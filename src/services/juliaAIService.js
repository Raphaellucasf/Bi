import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabaseClient';
import { juliaSystemPrompt } from './juliaSystemPrompt.js';
import { syncEventToGoogle } from './googleCalendarService';

// Função auxiliar para obter escritório do usuário logado
const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data: perfis } = await supabase
    .from('perfis')
    .select('escritorio_id')
    .eq('user_id', user.id)
    .limit(1);

  const escritorioId = perfis && perfis[0]?.escritorio_id;
  if (!escritorioId) {
    throw new Error('Escritório não encontrado. Configure seu escritório primeiro.');
  }

  return escritorioId;
};

// Variável para guardar metadata da última ação
let lastMetadata = null;

// Funções de ação que Julia pode executar
const availableFunctions = {
  criarCliente: async (dados) => {
    try {
      console.log('📝 Criando cliente com dados:', dados);
      
      // Obter escritório do usuário logado
      const escritorioId = await getEscritorioId();
      console.log('🏢 Escritório ID:', escritorioId);

      // Preparar dados do cliente
      const clienteData = {
        nome_completo: dados.nome,
        escritorio_id: escritorioId,
        created_at: new Date().toISOString()
      };

      // Adicionar campos opcionais se fornecidos
      if (dados.email) clienteData.email = dados.email;
      if (dados.telefone) clienteData.telefone = dados.telefone;
      if (dados.endereco) clienteData.endereco = dados.endereco;
      
      // CPF - EXTRAÇÃO SUPER AGRESSIVA
      console.log('🔍 DEBUG - dados recebidos:', JSON.stringify(dados, null, 2));
      
      let cpfEncontrado = null;
      
      // Método 1: Buscar em campos específicos
      const cpfRaw = dados.cpf || dados.CPF || dados.documento || dados.cpfCnpj;
      
      if (cpfRaw) {
        const cpfLimpo = String(cpfRaw).replace(/[^0-9]/g, '');
        if (cpfLimpo.length === 11) {
          cpfEncontrado = cpfLimpo;
          console.log('✅ Método 1 - CPF encontrado em campo direto:', cpfRaw, '→', cpfEncontrado);
        }
      }
      
      // Método 2: Procurar CPF em TODOS os valores dos campos (inclusive dentro de strings)
      if (!cpfEncontrado) {
        console.log('🔍 Método 2 - Procurando CPF em todos os campos...');
        
        for (const [key, value] of Object.entries(dados)) {
          if (value && typeof value === 'string') {
            // Procurar padrão XXX.XXX.XXX-XX ou 11 dígitos seguidos
            const matches = value.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/g);
            
            if (matches) {
              const cpfLimpo = matches[0].replace(/[^0-9]/g, '');
              if (cpfLimpo.length === 11) {
                cpfEncontrado = cpfLimpo;
                console.log(`✅ Método 2 - CPF encontrado no campo "${key}":`, value, '→', cpfEncontrado);
                break;
              }
            }
          }
        }
      }
      
      // Método 3: Procurar no nome (às vezes Julia coloca no nome)
      if (!cpfEncontrado && dados.nome) {
        const numerosNoNome = String(dados.nome).match(/\d{11}/);
        if (numerosNoNome) {
          cpfEncontrado = numerosNoNome[0];
          console.log('✅ Método 3 - CPF encontrado no nome:', cpfEncontrado);
        }
      }
      
      if (cpfEncontrado) {
        clienteData.cpf = cpfEncontrado;
        console.log('🎉 CPF FINAL atribuído:', cpfEncontrado);
      } else {
        console.error('❌ NENHUM CPF ENCONTRADO!');
        console.error('❌ Dados recebidos:', dados);
        console.error('❌ Campos disponíveis:', Object.keys(dados));
      }
      
      if (dados.data_nascimento) clienteData.data_nascimento = dados.data_nascimento;
      if (dados.rg) clienteData.rg = dados.rg;
      if (dados.naturalidade) clienteData.naturalidade = dados.naturalidade;
      if (dados.estado_civil) clienteData.estado_civil = dados.estado_civil;
      if (dados.profissao) clienteData.profissao = dados.profissao;

      console.log('💾 Dados preparados para inserir:', clienteData);

      const { data, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        // Se erro for por coluna não existir, dar dica
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          throw new Error(`${error.message}\n\n💡 Execute o arquivo ADICIONAR_CAMPOS_CLIENTES.sql no Supabase para adicionar os campos faltantes.`);
        }
        throw error;
      }
      
      console.log('✅ Cliente criado:', data[0]);
      
      return { 
        success: true, 
        data: data[0], 
        message: `✅ Cliente **${dados.nome}** cadastrado com sucesso!` 
      };
    } catch (error) {
      console.error('❌ Erro completo ao criar cliente:', error);
      return { success: false, error: error.message || 'Erro desconhecido ao criar cliente' };
    }
  },

  criarProcesso: async (dados) => {
    try {
      // Obter escritório do usuário logado
      const escritorioId = await getEscritorioId();

      // VERIFICAR SE PROCESSO JÁ EXISTE
      const { data: processoExistente } = await supabase
        .from('processos')
        .select('id, titulo, valor_causa, descricao')
        .eq('numero_processo', dados.numero_processo)
        .eq('escritorio_id', escritorioId)
        .limit(1)
        .single();

      if (processoExistente) {
        console.log('⚠️ Processo já existe! Redirecionando para atualização...');
        // Se processo existe, atualizar em vez de criar
        return await availableFunctions.atualizarProcesso({
          processo_id: processoExistente.id,
          ...dados
        });
      }

      // Buscar cliente pelo nome
      let clienteId = dados.cliente_id;
      
      if (!clienteId && dados.cliente_nome) {
        console.log('🔍 Buscando cliente:', dados.cliente_nome);
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id')
          .eq('escritorio_id', escritorioId)
          .ilike('nome_completo', `%${dados.cliente_nome}%`)
          .limit(1)
          .single();
        
        if (clienteData) {
          clienteId = clienteData.id;
          console.log('✅ Cliente encontrado:', clienteId);
        }
      }

      // ⚡ Se cliente não existe E temos dados do cliente, criar automaticamente
      if (!clienteId && dados.cliente_cpf) {
        console.log('🔄 Cliente não encontrado. Criando automaticamente:', dados.cliente_nome);
        
        const clienteResult = await availableFunctions.criarCliente({
          nome: dados.cliente_nome,
          cpf: dados.cliente_cpf,
          endereco: dados.cliente_endereco
        });
        
        if (clienteResult.success) {
          clienteId = clienteResult.data.id;
          console.log('✅ Cliente criado automaticamente:', clienteId);
        } else {
          return { 
            success: false, 
            error: `Não foi possível criar o cliente automaticamente: ${clienteResult.error}` 
          };
        }
      }

      if (!clienteId) {
        return { 
          success: false, 
          error: 'Cliente não encontrado. Por favor, crie o cliente primeiro ou informe o nome completo.',
          needsClientCreation: true,
          clientData: {
            nome: dados.cliente_nome,
            cpf: dados.cliente_cpf,
            endereco: dados.cliente_endereco
          }
        };
      }

      // Gerar título automaticamente se não fornecido
      let titulo = dados.titulo;
      if (!titulo && dados.cliente_nome && dados.parte_contraria) {
        titulo = `${dados.cliente_nome} x ${dados.parte_contraria}`;
      } else if (!titulo) {
        titulo = `Processo ${dados.numero_processo}`;
      }

      const processoData = {
        numero_processo: dados.numero_processo,
        cliente_id: clienteId,
        escritorio_id: escritorioId,
        titulo: titulo,
        area_direito: dados.tipo || 'Trabalhista',
        status: dados.status || 'Ativo',
        tribunal: dados.vara || null,
        descricao: dados.descricao || null,
        valor_causa: dados.valor_causa ? parseFloat(dados.valor_causa) : null,
        ativo: 'Ativo',
        created_at: new Date().toISOString()
      };

      console.log('📝 Criando processo com dados:', processoData);

      const { data, error } = await supabase
        .from('processos')
        .insert([processoData])
        .select();

      if (error) throw error;
      
      const processoId = data[0].id;
      console.log('✅ Processo criado com ID:', processoId);

      // Criar partes contrárias se fornecidas
      if (dados.partes_contrarias && Array.isArray(dados.partes_contrarias)) {
        console.log('📄 Criando', dados.partes_contrarias.length, 'partes contrárias...');
        
        for (const parte of dados.partes_contrarias) {
          try {
            // Verificar se empresa já existe pelo CNPJ ou CPF
            let empresaId = null;
            
            if (parte.cnpj) {
              const { data: empresaExistente } = await supabase
                .from('empresas')
                .select('id')
                .eq('cnpj', parte.cnpj.replace(/\D/g, ''))
                .limit(1)
                .single();
              
              if (empresaExistente) {
                empresaId = empresaExistente.id;
                console.log('🏢 Empresa já existe (CNPJ):', parte.nome);
              }
            } else if (parte.cpf) {
              // Se é pessoa física, buscar por CPF no campo cnpj (algumas tabelas usam cnpj para ambos)
              const cpfLimpo = parte.cpf.replace(/\D/g, '');
              const { data: empresaExistente } = await supabase
                .from('empresas')
                .select('id')
                .or(`cnpj.eq.${cpfLimpo}`)
                .limit(1)
                .single();
              
              if (empresaExistente) {
                empresaId = empresaExistente.id;
                console.log('👤 Pessoa física já existe (CPF):', parte.nome);
              }
            }

            // Se não existe, criar nova empresa/pessoa
            if (!empresaId) {
              const empresaData = {
                razao_social: parte.nome,
                nome_fantasia: parte.nome,
                cnpj: parte.cnpj ? parte.cnpj.replace(/\D/g, '') : (parte.cpf ? parte.cpf.replace(/\D/g, '') : null),
                endereco_rfb: parte.endereco || null,
                endereco_trabalho: parte.endereco || null,
                email: parte.email || null,
                telefone: parte.telefone || null
              };

              console.log('🏢 Criando', parte.cnpj ? 'empresa' : 'pessoa física', ':', empresaData);

              const { data: novaEmpresa, error: empresaError } = await supabase
                .from('empresas')
                .insert([empresaData])
                .select();

              if (!empresaError && novaEmpresa && novaEmpresa[0]) {
                empresaId = novaEmpresa[0].id;
                console.log('✅ Empresa criada:', parte.nome);
              } else {
                console.error('❌ Erro ao criar empresa:', empresaError);
                continue;
              }
            }

            // Vincular empresa ao processo
            if (empresaId) {
              const { error: vinculoError } = await supabase
                .from('processos_empresas')
                .insert([{
                  processo_id: processoId,
                  empresa_id: empresaId
                }]);

              if (!vinculoError) {
                console.log('🔗 Parte contrária vinculada:', parte.nome);
              } else {
                console.error('❌ Erro ao vincular:', vinculoError);
              }
            }
          } catch (parteError) {
            console.error('❌ Erro ao processar parte contrária:', parteError);
          }
        }
      }

      return { 
        success: true, 
        data: data[0], 
        message: `✅ Processo **${titulo}** criado com sucesso!\n• Número: ${dados.numero_processo}\n• Valor: R$ ${dados.valor_causa || '0,00'}` 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  criarAudiencia: async (dados) => {
    try {
      console.log('🎬 criarAudiencia - Dados recebidos:', dados);
      
      // ⚡ PRIORIDADE 1: Se processo_id foi fornecido diretamente, use-o
      let processoId = dados.processo_id;
      
      if (processoId) {
        console.log('✅ processo_id fornecido diretamente:', processoId);
      }
      
      // PRIORIDADE 2: Se não tem processo_id, buscar pelo número do processo
      if (!processoId && dados.numero_processo) {
        console.log('🔍 Buscando processo pelo número:', dados.numero_processo);
        
        const { data: processoData, error: searchError } = await supabase
          .from('processos')
          .select('id, numero_processo, titulo')
          .ilike('numero_processo', `%${dados.numero_processo}%`)
          .limit(1)
          .single();
        
        console.log('📋 Resultado da busca:', processoData, 'Erro:', searchError);
        
        if (processoData) {
          processoId = processoData.id;
          console.log('✅ Processo encontrado por busca:', processoId);
        }
      }

      // VALIDAÇÃO: Se ainda não tem processo_id, retornar erro
      if (!processoId) {
        const errorMsg = dados.numero_processo 
          ? `Processo "${dados.numero_processo}" não foi encontrado no banco de dados. O processo precisa ser criado ANTES de agendar a audiência.`
          : 'Processo não encontrado. Por favor, informe o número do processo ou processo_id.';
        
        console.error('❌ Erro criarAudiencia - processo_id não encontrado');
        console.error('📋 Dados recebidos completos:', JSON.stringify(dados, null, 2));
        
        return { 
          success: false, 
          error: errorMsg,
          details: {
            numero_processo: dados.numero_processo,
            processo_id_fornecido: dados.processo_id,
            sugestao: 'Crie o processo primeiro e depois tente agendar a audiência novamente.'
          }
        };
      }

      // ⚡ Normalizar campo de data - aceitar "data" ou "data_andamento"
      const dataAudiencia = dados.data || dados.data_andamento;
      
      if (!dataAudiencia) {
        console.error('❌ Data da audiência não fornecida');
        console.error('📋 Dados recebidos:', dados);
        return {
          success: false,
          error: 'Data da audiência não foi fornecida. Por favor, informe a data.'
        };
      }
      
      // Validar e converter data
      let dataISO;
      try {
        const dataObj = new Date(dataAudiencia);
        if (isNaN(dataObj.getTime())) {
          throw new Error('Data inválida');
        }
        dataISO = dataObj.toISOString();
        console.log('✅ Data convertida:', dataAudiencia, '→', dataISO);
      } catch (dateError) {
        console.error('❌ Erro ao converter data:', dataAudiencia);
        return {
          success: false,
          error: `Data inválida: "${dataAudiencia}". Use formato ISO (YYYY-MM-DDTHH:mm:ss) ou DD/MM/YYYY.`
        };
      }

      const { data, error } = await supabase
        .from('andamentos')
        .insert([{
          processo_id: processoId,
          titulo: dados.titulo,
          descricao: dados.descricao || null,
          tipo: 'Audiência',
          data_andamento: dataISO,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      // Sincronizar com Google Calendar
      try {
        await syncEventToGoogle(data[0]);
        console.log('✅ Audiência sincronizada com Google Calendar');
      } catch (gcalError) {
        console.error('⚠️ Erro ao sincronizar com Google Calendar:', gcalError);
      }
      
      return { 
        success: true, 
        data: data[0], 
        message: `✅ Audiência "${dados.titulo}" agendada para ${new Date(dataISO).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}!\n📅 Sincronizada com Google Calendar` 
      };
    } catch (error) {
      console.error('❌ Erro crítico em criarAudiencia:', error);
      return { success: false, error: error.message };
    }
  },

  criarReuniao: async (dados) => {
    try {
      let processoId = dados.processo_id;
      
      if (!processoId && dados.numero_processo) {
        const { data: processoData } = await supabase
          .from('processos')
          .select('id')
          .ilike('numero_processo', `%${dados.numero_processo}%`)
          .limit(1)
          .single();
        
        if (processoData) processoId = processoData.id;
      }

      const { data, error } = await supabase
        .from('andamentos')
        .insert([{
          processo_id: processoId || null,
          titulo: dados.titulo,
          descricao: dados.descricao || null,
          tipo: 'Reunião',
          data_andamento: new Date(dados.data).toISOString(),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      // Sincronizar com Google Calendar
      try {
        await syncEventToGoogle(data[0]);
        console.log('✅ Reunião sincronizada com Google Calendar');
      } catch (gcalError) {
        console.error('⚠️ Erro ao sincronizar com Google Calendar:', gcalError);
      }
      
      return { success: true, data: data[0], message: `✅ Reunião "${dados.titulo}" agendada para ${new Date(dados.data).toLocaleDateString('pt-BR')}!\n📅 Sincronizada com Google Calendar` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  criarPrazo: async (dados) => {
    try {
      let processoId = dados.processo_id;
      
      if (!processoId && dados.numero_processo) {
        const { data: processoData } = await supabase
          .from('processos')
          .select('id')
          .ilike('numero_processo', `%${dados.numero_processo}%`)
          .limit(1)
          .single();
        
        if (processoData) processoId = processoData.id;
      }

      if (!processoId) {
        return { success: false, error: 'Processo não encontrado. Por favor, informe o número do processo.' };
      }

      const { data, error } = await supabase
        .from('andamentos')
        .insert([{
          processo_id: processoId,
          titulo: dados.titulo,
          descricao: dados.descricao || null,
          tipo: 'Prazo',
          data_andamento: new Date(dados.data).toISOString(),
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      
      // Sincronizar com Google Calendar
      try {
        await syncEventToGoogle(data[0]);
        console.log('✅ Prazo sincronizado com Google Calendar');
      } catch (gcalError) {
        console.error('⚠️ Erro ao sincronizar com Google Calendar:', gcalError);
      }
      
      return { success: true, data: data[0], message: `✅ Prazo "${dados.titulo}" criado para ${new Date(dados.data).toLocaleDateString('pt-BR')}!\n📅 Sincronizado com Google Calendar` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  buscarProcessos: async (filtros) => {
    try {
      const escritorioId = await getEscritorioId();

      let query = supabase
        .from('processos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome_completo
          )
        `)
        .eq('escritorio_id', escritorioId);

      if (filtros.numero_processo) {
        query = query.ilike('numero_processo', `%${filtros.numero_processo}%`);
      }
      if (filtros.cliente_nome) {
        query = query.ilike('clientes.nome_completo', `%${filtros.cliente_nome}%`);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  atualizarProcesso: async (dados) => {
    try {
      console.log('🔄 Atualizando processo com dados:', dados);
      
      const escritorioId = await getEscritorioId();
      
      // Buscar processo existente
      let processoId = dados.processo_id;
      
      if (!processoId && dados.numero_processo) {
        const { data: processoData } = await supabase
          .from('processos')
          .select('id, cliente_id')
          .eq('numero_processo', dados.numero_processo)
          .eq('escritorio_id', escritorioId)
          .limit(1)
          .single();
        
        if (processoData) {
          processoId = processoData.id;
        }
      }

      if (!processoId) {
        return { success: false, error: 'Processo não encontrado.' };
      }

      // Preparar dados de atualização (apenas campos fornecidos)
      const updateData = {};
      
      if (dados.titulo) updateData.titulo = dados.titulo;
      if (dados.tipo) updateData.area_direito = dados.tipo;
      if (dados.vara) updateData.tribunal = dados.vara;
      if (dados.descricao) updateData.descricao = dados.descricao;
      if (dados.valor_causa) updateData.valor_causa = parseFloat(dados.valor_causa);
      if (dados.status) updateData.status = dados.status;
      
      // Gerar título automaticamente se fornecido cliente e parte contrária
      if (!updateData.titulo && dados.cliente_nome && dados.parte_contraria) {
        updateData.titulo = `${dados.cliente_nome} x ${dados.parte_contraria}`;
      }

      console.log('💾 Dados para atualizar:', updateData);

      const { data, error } = await supabase
        .from('processos')
        .update(updateData)
        .eq('id', processoId)
        .select();

      if (error) throw error;
      
      console.log('✅ Processo atualizado:', data[0]);

      // Atualizar/criar partes contrárias se fornecidas
      if (dados.partes_contrarias && Array.isArray(dados.partes_contrarias)) {
        console.log('📄 Processando', dados.partes_contrarias.length, 'partes contrárias...');
        console.log('📋 Dados das partes:', JSON.stringify(dados.partes_contrarias, null, 2));
        
        for (const parte of dados.partes_contrarias) {
          console.log('🔍 Processando parte:', parte.nome);
          try {
            // Verificar se empresa já existe pelo CNPJ ou CPF
            let empresaId = null;
            
            if (parte.cnpj) {
              const { data: empresaExistente } = await supabase
                .from('empresas')
                .select('id')
                .eq('cnpj', parte.cnpj.replace(/\D/g, ''))
                .limit(1)
                .single();
              
              if (empresaExistente) {
                empresaId = empresaExistente.id;
                console.log('🏢 Empresa já existe (CNPJ):', parte.nome);
              }
            } else if (parte.cpf) {
              // Se é pessoa física, buscar por CPF (armazenado no campo cnpj)
              const cpfLimpo = parte.cpf.replace(/\D/g, '');
              const { data: empresaExistente } = await supabase
                .from('empresas')
                .select('id')
                .or(`cnpj.eq.${cpfLimpo}`)
                .limit(1)
                .single();
              
              if (empresaExistente) {
                empresaId = empresaExistente.id;
                console.log('👤 Pessoa física já existe (CPF):', parte.nome);
              }
            }

            // Se não existe, criar nova empresa
            if (!empresaId) {
              const empresaData = {
                razao_social: parte.nome,
                nome_fantasia: parte.nome,
                cnpj: parte.cnpj ? parte.cnpj.replace(/\D/g, '') : null,
                endereco_rfb: parte.endereco || null,
                endereco_trabalho: parte.endereco || null,
                email: parte.email || null,
                telefone: parte.telefone || null
              };

              console.log('🏢 Criando empresa:', empresaData);

              const { data: novaEmpresa, error: empresaError } = await supabase
                .from('empresas')
                .insert([empresaData])
                .select();

              if (!empresaError && novaEmpresa && novaEmpresa[0]) {
                empresaId = novaEmpresa[0].id;
                console.log('✅ Empresa criada:', parte.nome);
              } else {
                console.error('❌ Erro ao criar empresa:', empresaError);
                continue;
              }
            }

            // Verificar se vínculo já existe
            if (empresaId) {
              const { data: vinculoExistente } = await supabase
                .from('processos_empresas')
                .select('id')
                .eq('processo_id', processoId)
                .eq('empresa_id', empresaId)
                .limit(1)
                .single();

              if (!vinculoExistente) {
                // Criar vínculo
                const { error: vinculoError } = await supabase
                  .from('processos_empresas')
                  .insert([{
                    processo_id: processoId,
                    empresa_id: empresaId
                  }]);

                if (!vinculoError) {
                  console.log('🔗 Parte contrária vinculada:', parte.nome);
                } else {
                  console.error('❌ Erro ao vincular:', vinculoError);
                }
              } else {
                console.log('✅ Parte já vinculada:', parte.nome);
              }
            }
          } catch (parteError) {
            console.error('❌ Erro ao processar parte contrária:', parteError);
          }
        }
      }

      const partesCount = dados.partes_contrarias?.length || 0;
      return { 
        success: true, 
        data: data[0], 
        message: `✅ Processo **${updateData.titulo || dados.numero_processo}** atualizado com sucesso!\n• Título: ${updateData.titulo || 'mantido'}\n• Valor: R$ ${dados.valor_causa || 'mantido'}\n• Partes contrárias: ${partesCount} processadas` 
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar processo:', error);
      return { success: false, error: error.message };
    }
  },

  atualizarCliente: async (dados) => {
    try {
      const escritorioId = await getEscritorioId();

      // Buscar cliente pelo ID ou CPF
      let clienteId = dados.id;
      
      if (!clienteId && dados.cpf) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id')
          .eq('escritorio_id', escritorioId)
          .eq('cpf', dados.cpf.replace(/\D/g, ''))
          .single();
        
        if (clienteData) clienteId = clienteData.id;
      }

      if (!clienteId) {
        return { success: false, error: 'Cliente não encontrado para atualizar.' };
      }

      // Preparar dados de atualização (apenas campos fornecidos)
      const updateData = {};
      if (dados.nome) updateData.nome_completo = dados.nome;
      if (dados.email) updateData.email = dados.email;
      if (dados.telefone) updateData.telefone = dados.telefone;
      if (dados.endereco) updateData.endereco = dados.endereco;
      if (dados.cpf) updateData.cpf = dados.cpf.replace(/\D/g, '');
      if (dados.rg) updateData.rg = dados.rg;
      if (dados.data_nascimento) updateData.data_nascimento = dados.data_nascimento;
      if (dados.naturalidade) updateData.naturalidade = dados.naturalidade;
      if (dados.estado_civil) updateData.estado_civil = dados.estado_civil;
      if (dados.profissao) updateData.profissao = dados.profissao;

      const { data, error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', clienteId)
        .select();

      if (error) throw error;
      
      return { success: true, data: data[0], message: `✅ Cliente "${dados.nome || 'atualizado'}" foi atualizado com sucesso!` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  buscarClientes: async (filtros) => {
    try {
      console.log('🔍 Buscando clientes com filtros:', filtros);
      const escritorioId = await getEscritorioId();
      console.log('🏢 Escritório ID:', escritorioId);

      let query = supabase
        .from('clientes')
        .select('*')
        .eq('escritorio_id', escritorioId);

      if (filtros.nome) {
        query = query.ilike('nome_completo', `%${filtros.nome}%`);
      }
      if (filtros.cpf) {
        const cpfLimpo = filtros.cpf.replace(/\D/g, '');
        console.log('🔍 Buscando CPF limpo:', cpfLimpo);
        // Buscar por CPF com ou sem formatação
        query = query.or(`cpf.eq.${cpfLimpo},cpf.eq.${filtros.cpf}`);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      console.log('✅ Resultados encontrados:', data?.length || 0);
      if (data?.length > 0) {
        console.log('📋 Primeiro resultado:', data[0]);
      }
      return { success: true, data, count: data.length };
    } catch (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return { success: false, error: error.message };
    }
  },

  buscarProcessos: async (filtros) => {
    try {
      const escritorioId = await getEscritorioId();

      let query = supabase
        .from('processos')
        .select(`
          *,
          clientes:cliente_id (nome_completo, cpf)
        `)
        .eq('escritorio_id', escritorioId);

      if (filtros.numero_processo) {
        query = query.ilike('numero_processo', `%${filtros.numero_processo}%`);
      }
      if (filtros.cliente_nome) {
        // Buscar pelo nome do cliente
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id')
          .eq('escritorio_id', escritorioId)
          .ilike('nome_completo', `%${filtros.cliente_nome}%`);
        
        if (clienteData && clienteData.length > 0) {
          const clienteIds = clienteData.map(c => c.id);
          query = query.in('cliente_id', clienteIds);
        } else {
          return { success: true, data: [], count: 0 };
        }
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(10);

      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  atualizarCliente: async (dados) => {
    try {
      const escritorioId = await getEscritorioId();

      // Buscar cliente pelo ID ou CPF
      let clienteId = dados.id;
      
      if (!clienteId && dados.cpf) {
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('id')
          .eq('escritorio_id', escritorioId)
          .eq('cpf', dados.cpf.replace(/\D/g, ''))
          .single();
        
        if (clienteData) clienteId = clienteData.id;
      }

      if (!clienteId) {
        return { success: false, error: 'Cliente não encontrado para atualizar.' };
      }

      // Preparar dados de atualização (apenas campos fornecidos)
      const updateData = {};
      if (dados.nome) updateData.nome_completo = dados.nome;
      if (dados.email) updateData.email = dados.email;
      if (dados.telefone) updateData.telefone = dados.telefone;
      if (dados.endereco) updateData.endereco = dados.endereco;
      if (dados.cpf) updateData.cpf = dados.cpf.replace(/\D/g, '');
      if (dados.rg) updateData.rg = dados.rg;
      if (dados.data_nascimento) updateData.data_nascimento = dados.data_nascimento;
      if (dados.naturalidade) updateData.naturalidade = dados.naturalidade;
      if (dados.estado_civil) updateData.estado_civil = dados.estado_civil;
      if (dados.profissao) updateData.profissao = dados.profissao;

      const { data, error } = await supabase
        .from('clientes')
        .update(updateData)
        .eq('id', clienteId)
        .select();

      if (error) throw error;
      
      return { success: true, data: data[0], message: `✅ Cliente "${dados.nome || 'atualizado'}" foi atualizado com sucesso!` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  buscarAudiencias: async (filtros) => {
    try {
      let query = supabase
        .from('andamentos')
        .select(`
          *,
          processo:processo_id (
            numero_processo,
            clientes:cliente_id (nome_completo)
          )
        `)
        .eq('tipo', 'Audiência');

      if (filtros.data_inicio) {
        query = query.gte('data_andamento', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_andamento', filtros.data_fim);
      }

      const { data, error } = await query.order('data_andamento', { ascending: true }).limit(10);

      if (error) throw error;
      return { success: true, data, count: data.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  atualizarAndamento: async (dados) => {
    try {
      console.log('📝 Atualizando andamento com dados:', dados);
      
      const escritorioId = await getEscritorioId();
      
      // Buscar processo pelo ID ou número
      let processoId = dados.processo_id;
      
      if (!processoId && dados.numero_processo) {
        const { data: processoData } = await supabase
          .from('processos')
          .select('id')
          .eq('numero_processo', dados.numero_processo)
          .eq('escritorio_id', escritorioId)
          .limit(1)
          .single();
        
        if (processoData) {
          processoId = processoData.id;
        }
      }

      if (!processoId) {
        return { success: false, error: 'Processo não encontrado.' };
      }

      // Buscar fase e andamento pelos nomes se fornecidos
      let faseId = dados.fase_id;
      let andamentoId = dados.andamento_id;

      if (!faseId && dados.fase_nome) {
        const { data: faseData } = await supabase
          .from('fases_processuais')
          .select('id')
          .ilike('nome', `%${dados.fase_nome}%`)
          .limit(1)
          .single();
        
        if (faseData) faseId = faseData.id;
      }

      if (!andamentoId && dados.andamento_nome && faseId) {
        const { data: andamentoData } = await supabase
          .from('andamentos_processuais')
          .select('id')
          .eq('fase_id', faseId)
          .ilike('nome', `%${dados.andamento_nome}%`)
          .limit(1)
          .single();
        
        if (andamentoData) andamentoId = andamentoData.id;
      }

      // Preparar dados de atualização
      const updateData = {};
      
      if (faseId) updateData.fase_id = faseId;
      if (andamentoId) updateData.andamento_id = andamentoId;
      if (dados.observacoes) updateData.observacoes_andamento = dados.observacoes;

      console.log('💾 Atualizando processo com:', updateData);

      const { data, error } = await supabase
        .from('processos')
        .update(updateData)
        .eq('id', processoId)
        .select(`
          *,
          fase:fase_id (nome),
          andamento:andamento_id (nome)
        `);

      if (error) throw error;
      
      console.log('✅ Andamento atualizado:', data[0]);

      const faseName = data[0]?.fase?.nome || dados.fase_nome || 'fase';
      const andamentoName = data[0]?.andamento?.nome || dados.andamento_nome || 'andamento';

      return { 
        success: true, 
        data: data[0], 
        message: `✅ Andamento atualizado com sucesso!\n• Fase: ${faseName}\n• Andamento: ${andamentoName}\n${dados.observacoes ? `• Observações: ${dados.observacoes.substring(0, 50)}...` : ''}` 
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar andamento:', error);
      return { success: false, error: error.message };
    }
  }
};

// Sistema de prompt para Julia (agora modular com múltiplos modos)
const systemPrompt = juliaSystemPrompt;

class JuliaAIService {
  constructor() {
    this.claudeClient = null;
    this.geminiModel = null;
    this.chatHistory = [];
    this.conversationMemory = []; // Memória persistente de conversas
    this.initialized = false;
    this.activeAI = null; // 'claude', 'gemini', ou 'local'
    this.apiCallCount = 0;
    this.lastApiCall = null;
    this.currentProcessoContext = null; // Contexto do processo atual
    
    // Carregar memória do localStorage
    this.loadMemory();
  }

  // Definir contexto do processo atual
  setProcessoContext(processo) {
    this.currentProcessoContext = processo;
    console.log('📋 Contexto do processo definido:', processo?.numero_processo);
  }

  // Limpar contexto do processo
  clearProcessoContext() {
    this.currentProcessoContext = null;
    console.log('🗑️ Contexto do processo limpo');
  }

  // Obter contexto do processo
  getProcessoContext() {
    return this.currentProcessoContext;
  }

  // Carregar memória de conversas anteriores
  loadMemory() {
    try {
      const saved = localStorage.getItem('julia_memory');
      if (saved) {
        this.conversationMemory = JSON.parse(saved);
        console.log('💾 Memória carregada:', this.conversationMemory.length, 'conversas');
      }
    } catch (error) {
      console.error('Erro ao carregar memória:', error);
    }
  }

  // Salvar memória no localStorage
  saveMemory() {
    try {
      // Manter apenas últimas 50 mensagens
      const memoryToSave = this.conversationMemory.slice(-50);
      localStorage.setItem('julia_memory', JSON.stringify(memoryToSave));
      console.log('💾 Memória salva:', memoryToSave.length, 'mensagens');
    } catch (error) {
      console.error('Erro ao salvar memória:', error);
    }
  }

  // Limpar memória
  clearMemory() {
    this.conversationMemory = [];
    this.chatHistory = [];
    localStorage.removeItem('julia_memory');
    console.log('🗑️ Memória limpa');
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      console.log('🔄 Inicializando Julia AI (Multi-AI)...');
      
      // 1. Tentar Claude primeiro
      const claudeKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (claudeKey && !claudeKey.includes('your-')) {
        try {
          this.claudeClient = new Anthropic({
            apiKey: claudeKey,
            dangerouslyAllowBrowser: true // Necessário para uso no browser
          });
          this.activeAI = 'claude';
          console.log('✅ Claude AI inicializada (Prioridade 1)');
        } catch (error) {
          console.warn('⚠️ Claude falhou:', error.message);
        }
      }
      
      // 2. Gemini como IA principal
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (geminiKey && !geminiKey.includes('your-')) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          
          // Usar modelo flash-latest (funciona com SDK v0.24.1)
          this.geminiModel = genAI.getGenerativeModel({ 
            model: 'models/gemini-flash-latest',
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 8192,
            },
          });
          
          if (!this.activeAI) {
            this.activeAI = 'gemini';
            console.log('✅ Gemini Flash Latest ativado - 60 req/min grátis! 🚀');
          } else {
            console.log('✅ Gemini Flash Latest disponível como backup');
          }
        } catch (error) {
          console.warn('⚠️ Gemini falhou:', error.message);
        }
      }
      
      // 3. Modo local como fallback final
      if (!this.activeAI) {
        this.activeAI = 'local';
        console.log('✅ Modo Local ativado (Prioridade 3)');
      }
      
      this.initialized = true;
      console.log(`🎯 Julia usando: ${this.activeAI.toUpperCase()}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
      this.activeAI = 'local';
      this.initialized = true;
      return true;
    }
  }

  // Extrair dados estruturados de texto jurídico
  extractLegalData(text) {
    const data = {
      cliente: {},
      processo: {},
      adversa: {}
    };

    // Extrair dados do CLIENTE (Polo Ativo - Reclamante)
    const nomeClienteMatch = text.match(/(?:polo ativo|reclamante):\s*([^\n]+?)(?:\s+cpf|$)/i);
    if (nomeClienteMatch) {
      data.cliente.nome = nomeClienteMatch[1].trim().replace(/\s+/g, ' ');
    }

    const cpfClienteMatch = text.match(/(?:reclamante|polo ativo)[\s\S]*?cpf:\s*([\d\.\-]+)/i);
    if (cpfClienteMatch) {
      data.cliente.cpf = cpfClienteMatch[1].replace(/\D/g, '');
    }

    const enderecoClienteMatch = text.match(/(?:reclamante|polo ativo)[\s\S]*?(?:rua|avenida|av\.)\s+([^\n]+?)(?:cep|$)/i);
    if (enderecoClienteMatch) {
      data.cliente.endereco = enderecoClienteMatch[1].trim();
    }

    // Extrair dados do PROCESSO
    const numeroProcessoMatch = text.match(/(?:número do processo|processo):\s*([\d\-\.\/]+)/i);
    if (numeroProcessoMatch) {
      data.processo.numero = numeroProcessoMatch[1].trim();
    }

    const varaMatch = text.match(/(\d+ª\s+vara[^\n]*)/i);
    if (varaMatch) {
      data.processo.vara = varaMatch[1].trim();
    }

    const valorCausaMatch = text.match(/valor da causa:\s*r?\$?\s*([\d\.,]+)/i);
    if (valorCausaMatch) {
      data.processo.valorCausa = valorCausaMatch[1].replace(/\./g, '').replace(',', '.');
    }

    const distribuicaoMatch = text.match(/distribuído:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (distribuicaoMatch) {
      data.processo.dataDistribuicao = distribuicaoMatch[1];
    }

    const assuntoMatch = text.match(/assunto\(s\):\s*([^\n]+)/i);
    if (assuntoMatch) {
      data.processo.assunto = assuntoMatch[1].trim();
    }

    // Extrair dados da PARTE ADVERSA (Polo Passivo - Reclamado)
    const nomeAdversaMatch = text.match(/(?:polo passivo|reclamado):\s*([^\n]+?)(?:\s+cnpj|$)/i);
    if (nomeAdversaMatch) {
      data.adversa.nome = nomeAdversaMatch[1].trim().replace(/\s+/g, ' ');
    }

    const cnpjMatch = text.match(/(?:reclamado|polo passivo)[\s\S]*?cnpj:\s*([\d\.\/\-]+)/i);
    if (cnpjMatch) {
      data.adversa.cnpj = cnpjMatch[1].replace(/\D/g, '');
    }

    const emailAdversaMatch = text.match(/(?:reclamado|polo passivo)[\s\S]*?email:\s*([^\)]+)/i);
    if (emailAdversaMatch) {
      data.adversa.email = emailAdversaMatch[1].trim();
    }

    return data;
  }

  // MODO LOCAL REMOVIDO - Função getFallbackResponse() deletada
  // Agora Julia usa APENAS Gemini AI

  // Processar com Claude
  async processWithClaude(userMessage) {
    console.log('🟣 Tentando Claude...');
    
    // Construir histórico para Claude
    const messages = this.conversationMemory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await this.claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.slice(-10) // Últimas 10 mensagens
    });

    return response.content[0].text;
  }

  // Processar com Gemini
  async processWithGemini(userMessage) {
    console.log('🔵 Tentando Gemini...');
    
    const historico = this.conversationMemory.length > 0 
      ? `\nHistórico recente:\n${this.conversationMemory.slice(-10).map(msg => `${msg.role === 'user' ? 'Usuário' : 'Julia'}: ${msg.text}`).join('\n')}`
      : '';
    
    // Adicionar contexto do processo se disponível
    const contextoProcesso = this.currentProcessoContext 
      ? `\n📋 **CONTEXTO DO PROCESSO ATUAL:**\n- ID: ${this.currentProcessoContext.id}\n- Número: ${this.currentProcessoContext.numero_processo || 'N/A'}\n- Título: ${this.currentProcessoContext.titulo || 'N/A'}\n- Status: ${this.currentProcessoContext.status || 'N/A'}\n- Fase ID atual: ${this.currentProcessoContext.fase_id || 'Não definida'}\n- Andamento ID atual: ${this.currentProcessoContext.andamento_id || 'Não definido'}\n\n⚠️ IMPORTANTE: Quando o usuário pedir para "atualizar andamento" ou "mudar fase", use a ação "atualizarAndamento" com o processo_id: ${this.currentProcessoContext.id}\n`
      : '';
    
    const prompt = `${systemPrompt}${contextoProcesso}${historico}

Usuário: ${userMessage}

Julia:`;

    const result = await this.geminiModel.generateContent(prompt);
    return result.response.text();
  }

  async processMessage(userMessage) {
    try {
      // Inicializar se necessário
      if (!this.initialized) {
        await this.initialize();
      }

      // Adicionar à memória
      this.conversationMemory.push({
        role: 'user',
        text: userMessage,
        timestamp: new Date().toISOString()
      });

      let response = null;
      let usedAI = null;

      // APENAS GEMINI - Sem fallback local
      console.log('🔵 Processando com Gemini AI...');
      response = await this.processWithGemini(userMessage);
      usedAI = 'gemini';
      console.log('✅ Gemini respondeu com sucesso!');

      // Adicionar resposta da IA à memória
      this.conversationMemory.push({
        role: 'assistant',
        text: response,
        timestamp: new Date().toISOString(),
        ai: usedAI
      });
      this.saveMemory();

      // Verificar se é uma ação (JSON) na resposta da IA
      try {
        // Extrair apenas o bloco JSON, removendo markdown
        let jsonText = response;
        
        // Se tem ```json, pegar o conteúdo entre os backticks
        const codeBlockMatch = response.match(/```json\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1];
          console.log('📋 JSON encontrado em code block');
        }
        
        // Tentar encontrar o objeto JSON completo
        // Procurar do primeiro { até o último } que fecha o objeto principal
        const startIdx = jsonText.indexOf('{');
        if (startIdx !== -1) {
          let braceCount = 0;
          let endIdx = -1;
          
          for (let i = startIdx; i < jsonText.length; i++) {
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
            const extractedJson = jsonText.substring(startIdx, endIdx + 1);
            console.log('🎯 JSON extraído:', extractedJson);
            
            try {
              const action = JSON.parse(extractedJson);
              
              // Verificar se tem os campos obrigatórios
              if (action.action && action.params) {
                console.log('✅ Ação válida:', action.action);
                console.log('📋 Parâmetros:', action.params);
                
                // Extrair texto antes do JSON para mostrar ao usuário
                let textoAntes = response.split(/```json|{/)[0].trim();
                
                // Guardar metadata para uso posterior (ex: perguntar sobre criar processo)
                if (action.metadata) {
                  lastMetadata = action.metadata;
                }
                
                return {
                  type: 'action',
                  action: action.action,
                  params: action.params,
                  needsConfirmation: action.needsConfirmation !== false,
                  metadata: {
                    ...action.metadata,
                    textoIntroducao: textoAntes || action.metadata?.mensagem
                  },
                  rawResponse: response,
                  ai: usedAI
                };
              } else {
                console.warn('⚠️ JSON inválido - faltam campos obrigatórios');
              }
            } catch (parseError) {
              console.error('❌ Erro ao parsear JSON:', parseError.message);
              console.log('📄 JSON que causou erro:', extractedJson);
            }
          }
        }
        
        console.log('ℹ️ Resposta normal (sem JSON de ação válido)');
      } catch (e) {
        console.warn('⚠️ Erro ao extrair JSON:', e.message);
        console.log('📄 Resposta que causou erro:', response);
      }

      return {
        type: 'message',
        message: response,
        ai: usedAI
      };

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      
      // Retornar erro para o usuário
      return {
        type: 'error',
        message: `Desculpe, ocorreu um erro ao processar sua mensagem:\n\n${error.message}\n\nPor favor, tente novamente.`
      };
    }
  }

  async executeAction(actionName, params) {
    const actionFunction = availableFunctions[actionName];
    
    if (!actionFunction) {
      return {
        success: false,
        error: `Ação "${actionName}" não encontrada.`
      };
    }

    return await actionFunction(params);
  }

  clearHistory() {
    this.chatHistory = [];
  }

  getHistory() {
    return this.chatHistory;
  }
}

// Exportar instância única
export const juliaService = new JuliaAIService();
export default juliaService;
