import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient'; // Supabase local
import { syncEventToGoogle } from './googleCalendarService';

// ========================================
// SERVIÇO DE SINCRONIZAÇÃO AUTOMÁTICA
// Monitora Supabase EXTERNO e sincroniza
// Cliente → Processo → Andamentos → Calendar
// ========================================

// Supabase EXTERNO (fornecido pelo usuário)
const EXTERNAL_SUPABASE_URL = 'https://zodfekamwsidlrjrujmr.supabase.co';
const EXTERNAL_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZGZla2Ftd3NpZGxyanJ1am1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4OTQ1MzYsImV4cCI6MjA0MzQ3MDUzNn0.JtCS2cB19z9HNb0tqDMJhVEe69EAbGmEOcOOPqSLqMQ';

const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);

// Função auxiliar para obter escritório do usuário logado
const getEscritorioId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfis } = await supabase
    .from('perfis')
    .select('escritorio_id')
    .eq('user_id', user.id)
    .limit(1);

  return perfis && perfis[0]?.escritorio_id;
};

class ExternalSyncService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.lastSyncTimestamp = null;
    this.syncCount = 0;
    this.errorCount = 0;
    
    // Carregar último timestamp do localStorage
    this.loadLastSync();
  }

  // Carregar último sync do localStorage
  loadLastSync() {
    try {
      const saved = localStorage.getItem('external_sync_timestamp');
      if (saved) {
        this.lastSyncTimestamp = saved;
        console.log('📅 Último sync carregado:', this.lastSyncTimestamp);
      }
    } catch (error) {
      console.error('Erro ao carregar timestamp:', error);
    }
  }

  // Salvar timestamp do sync
  saveLastSync() {
    try {
      localStorage.setItem('external_sync_timestamp', this.lastSyncTimestamp);
    } catch (error) {
      console.error('Erro ao salvar timestamp:', error);
    }
  }

  // Iniciar monitoramento automático
  start() {
    if (this.isRunning) {
      console.log('⚠️ Sync já está rodando');
      return;
    }

    console.log('🔄 Iniciando sincronização automática com Supabase externo...');
    this.isRunning = true;
    
    // Sync imediato
    this.syncNow();
    
    // Sync a cada 60 segundos
    this.intervalId = setInterval(() => {
      this.syncNow();
    }, 60000);
  }

  // Parar monitoramento
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Sincronização automática parada');
  }

  // Executar sincronização agora
  async syncNow() {
    if (!this.isRunning) return;

    try {
      console.log(`🔍 [Sync #${this.syncCount + 1}] Verificando novos andamentos...`);
      
      // Buscar andamentos novos no Supabase EXTERNO
      let query = externalSupabase
        .from('andamentos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Se já sincronizou antes, buscar apenas novos
      if (this.lastSyncTimestamp) {
        query = query.gt('created_at', this.lastSyncTimestamp);
      }

      const { data: novosAndamentos, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar andamentos:', error);
        this.errorCount++;
        return;
      }

      if (!novosAndamentos || novosAndamentos.length === 0) {
        console.log('✅ Nenhum andamento novo');
        this.syncCount++;
        return;
      }

      console.log(`📥 ${novosAndamentos.length} novo(s) andamento(s) encontrado(s)`);

      // Processar cada andamento
      let successCount = 0;
      for (const andamento of novosAndamentos) {
        const success = await this.processarAndamento(andamento);
        if (success) successCount++;
      }

      console.log(`✅ [Sync #${this.syncCount + 1}] ${successCount}/${novosAndamentos.length} andamentos processados com sucesso`);

      // Atualizar timestamp
      this.lastSyncTimestamp = new Date().toISOString();
      this.saveLastSync();
      this.syncCount++;
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.errorCount++;
    }
  }

  // Processar um andamento individual
  async processarAndamento(andamento) {
    try {
      console.log(`📝 Processando andamento: ${andamento.titulo || andamento.descricao}`);

      const escritorioId = await getEscritorioId();
      if (!escritorioId) {
        console.error('❌ Escritório não encontrado');
        return false;
      }

      // 1. BUSCAR/CRIAR CLIENTE
      let clienteId;
      
      // Tentar buscar por CPF primeiro
      if (andamento.cpf_cliente) {
        const cpfLimpo = andamento.cpf_cliente.replace(/\D/g, '');
        
        const { data: clienteExistente } = await supabase
          .from('clientes')
          .select('id, nome_completo')
          .eq('escritorio_id', escritorioId)
          .eq('cpf', cpfLimpo)
          .single();

        if (clienteExistente) {
          clienteId = clienteExistente.id;
          console.log(`✅ Cliente já existe: ${clienteExistente.nome_completo} (${clienteId})`);
        }
      }

      // Se não encontrou, buscar por nome
      if (!clienteId && andamento.nome_cliente) {
        const { data: clientePorNome } = await supabase
          .from('clientes')
          .select('id, nome_completo')
          .eq('escritorio_id', escritorioId)
          .ilike('nome_completo', `%${andamento.nome_cliente}%`)
          .single();

        if (clientePorNome) {
          clienteId = clientePorNome.id;
          console.log(`✅ Cliente encontrado por nome: ${clientePorNome.nome_completo} (${clienteId})`);
        }
      }

      // Criar cliente se não existe
      if (!clienteId) {
        const { data: novoCliente, error: clienteError } = await supabase
          .from('clientes')
          .insert([{
            nome_completo: andamento.nome_cliente || 'Cliente Sync Automático',
            cpf: andamento.cpf_cliente?.replace(/\D/g, '') || null,
            email: andamento.email_cliente || null,
            telefone: andamento.telefone_cliente || null,
            endereco: andamento.endereco_cliente || null,
            escritorio_id: escritorioId,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (clienteError) {
          console.error('❌ Erro ao criar cliente:', clienteError);
          return false;
        }

        clienteId = novoCliente.id;
        console.log(`➕ Cliente criado: ${novoCliente.nome_completo} (${clienteId})`);
      }

      // 2. BUSCAR/CRIAR PROCESSO
      let processoId;

      if (andamento.numero_processo) {
        const { data: processoExistente } = await supabase
          .from('processos')
          .select('id, numero_processo')
          .eq('escritorio_id', escritorioId)
          .eq('numero_processo', andamento.numero_processo)
          .single();

        if (processoExistente) {
          processoId = processoExistente.id;
          console.log(`✅ Processo já existe: ${processoExistente.numero_processo} (${processoId})`);
        } else {
          // Criar processo
          const { data: novoProcesso, error: processoError } = await supabase
            .from('processos')
            .insert([{
              numero_processo: andamento.numero_processo,
              cliente_id: clienteId,
              escritorio_id: escritorioId,
              tipo: andamento.tipo_processo || 'Cível',
              status: 'Ativo',
              vara: andamento.vara || null,
              comarca: andamento.comarca || null,
              descricao: andamento.descricao_processo || null,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (processoError) {
            console.error('❌ Erro ao criar processo:', processoError);
            return false;
          }

          processoId = novoProcesso.id;
          console.log(`➕ Processo criado: ${novoProcesso.numero_processo} (${processoId})`);
        }
      }

      // 3. CRIAR ANDAMENTO/TAREFA
      if (processoId) {
        const { data: novoAndamento, error: andamentoError } = await supabase
          .from('andamentos')
          .insert([{
            processo_id: processoId,
            titulo: andamento.titulo || andamento.descricao || 'Andamento sincronizado',
            descricao: andamento.descricao || null,
            tipo: andamento.tipo || 'Andamento',
            data_andamento: andamento.data_andamento || andamento.data || new Date().toISOString(),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (andamentoError) {
          console.error('❌ Erro ao criar andamento:', andamentoError);
          return false;
        }

        console.log(`✅ Andamento criado para processo ${andamento.numero_processo}`);

        // 4. SINCRONIZAR COM GOOGLE CALENDAR
        if (novoAndamento && ['Audiência', 'Reunião', 'Prazo'].includes(novoAndamento.tipo)) {
          try {
            await syncEventToGoogle(novoAndamento);
            console.log(`📅 Andamento sincronizado com Google Calendar`);
          } catch (gcalError) {
            console.error('⚠️ Erro ao sincronizar com Google Calendar:', gcalError);
            // Não falhar a operação se Google Calendar falhar
          }
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Erro ao processar andamento:', error);
      return false;
    }
  }

  // Obter estatísticas
  getStats() {
    return {
      isRunning: this.isRunning,
      syncCount: this.syncCount,
      errorCount: this.errorCount,
      lastSync: this.lastSyncTimestamp,
    };
  }

  // Resetar estatísticas
  resetStats() {
    this.syncCount = 0;
    this.errorCount = 0;
    console.log('📊 Estatísticas resetadas');
  }
}

// Exportar instância única
export const externalSyncService = new ExternalSyncService();
