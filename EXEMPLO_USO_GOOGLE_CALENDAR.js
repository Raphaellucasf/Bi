// ========================================
// EXEMPLO: Como usar a sincronização Google Calendar
// ========================================

// EXEMPLO 1: Criar um novo andamento sincronizado
// ================================================

import { useSyncGoogleCalendar } from '../hooks/useSyncGoogleCalendar';

function NovoAndamentoModal() {
  const { createEvent } = useSyncGoogleCalendar();
  const [form, setForm] = useState({
    titulo: '',
    tipo: 'Audiência',
    data_andamento: '',
    data_fim: '',
    descricao: '',
    processo_id: null
  });

  const handleSalvar = async () => {
    try {
      // Criar evento - sincroniza automaticamente com Google Calendar
      const novoAndamento = await createEvent({
        titulo: form.titulo,
        tipo: form.tipo,
        data_andamento: form.data_andamento,
        data_fim: form.data_fim || form.data_andamento, // Se não tiver fim, usa mesma data
        descricao: form.descricao,
        processo_id: form.processo_id
      });

      console.log('✅ Andamento criado:', novoAndamento);
      alert('Andamento criado e sincronizado com Google Calendar!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar andamento: ' + error.message);
    }
  };

  return (
    <div>
      <input 
        value={form.titulo} 
        onChange={e => setForm({...form, titulo: e.target.value})}
        placeholder="Título do andamento"
      />
      {/* ... outros campos ... */}
      <button onClick={handleSalvar}>Salvar e Sincronizar</button>
    </div>
  );
}

// ================================================
// EXEMPLO 2: Atualizar um andamento existente
// ================================================

function EditarAndamentoModal({ andamentoId }) {
  const { updateEvent } = useSyncGoogleCalendar();

  const handleAtualizar = async (dados) => {
    try {
      // Atualizar evento - sincroniza com Google Calendar automaticamente
      await updateEvent(andamentoId, {
        titulo: dados.titulo,
        data_andamento: dados.data_andamento,
        descricao: dados.descricao
      });

      console.log('✅ Andamento atualizado no app e Google Calendar');
      alert('Andamento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar: ' + error.message);
    }
  };

  return <div>{/* UI de edição */}</div>;
}

// ================================================
// EXEMPLO 3: Excluir um andamento
// ================================================

function AndamentoCard({ andamento }) {
  const { deleteEvent } = useSyncGoogleCalendar();

  const handleExcluir = async () => {
    if (!confirm('Excluir este andamento? Será removido também do Google Calendar.')) {
      return;
    }

    try {
      // Excluir - remove do app e do Google Calendar
      await deleteEvent(andamento.id);
      console.log('✅ Andamento excluído de ambos os lugares');
      alert('Andamento excluído!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir: ' + error.message);
    }
  };

  return (
    <div>
      <h3>{andamento.titulo}</h3>
      <button onClick={handleExcluir}>🗑️ Excluir</button>
    </div>
  );
}

// ================================================
// EXEMPLO 4: Marcar como concluído
// ================================================

function AndamentoActions({ andamentoId }) {
  const { completeEvent } = useSyncGoogleCalendar();

  const handleConcluir = async () => {
    try {
      // Marca como concluído e atualiza descrição no Google
      await completeEvent(andamentoId);
      console.log('✅ Andamento concluído');
      alert('Andamento marcado como concluído!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao marcar como concluído: ' + error.message);
    }
  };

  return (
    <button onClick={handleConcluir}>
      ✅ Marcar como Concluído
    </button>
  );
}

// ================================================
// EXEMPLO 5: Verificar se Google Calendar está conectado
// ================================================

function CalendarioHeader() {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('google_calendar_token');
    const expiry = localStorage.getItem('google_calendar_token_expiry');
    
    if (token && expiry) {
      const now = new Date().getTime();
      setIsGoogleConnected(now < parseInt(expiry));
    }
  }, []);

  return (
    <div>
      {isGoogleConnected ? (
        <span>🟢 Sincronizado com Google Calendar</span>
      ) : (
        <span>⚪ Google Calendar não conectado</span>
      )}
    </div>
  );
}

// ================================================
// EXEMPLO 6: Uso direto do serviço (sem hook)
// ================================================

import { syncEventToGoogle, syncEventDeleteToGoogle } from '../services/googleCalendarService';
import { supabase } from '../services/supabaseClient';

async function criarAndamentoManual() {
  try {
    // 1. Criar no Supabase
    const { data: novoAndamento, error } = await supabase
      .from('andamentos')
      .insert([{
        titulo: 'Minha Audiência',
        tipo: 'Audiência',
        data_andamento: '2025-11-10T14:00:00',
        processo_id: 'uuid-do-processo'
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Sincronizar com Google (se conectado)
    const googleEventId = await syncEventToGoogle(novoAndamento);

    if (googleEventId) {
      console.log('✅ Evento criado no Google Calendar:', googleEventId);
    }

    return novoAndamento;
  } catch (error) {
    console.error('Erro:', error);
  }
}

// ================================================
// EXEMPLO 7: Criar evento com duração específica
// ================================================

async function criarAudienciaComDuracao() {
  const { createEvent } = useSyncGoogleCalendar();

  const audiencia = await createEvent({
    titulo: 'Audiência Trabalhista - Cliente João Silva',
    tipo: 'Audiência',
    data_andamento: '2025-11-15T09:00:00',  // Início: 9h
    data_fim: '2025-11-15T11:00:00',         // Fim: 11h (2 horas de duração)
    descricao: 'Audiência inicial com apresentação de provas',
    processo_id: 'uuid-do-processo'
  });

  // ✅ No Google Calendar aparecerá das 9h às 11h
  console.log('Audiência criada:', audiencia);
}

// ================================================
// DICAS E BOAS PRÁTICAS
// ================================================

/**
 * 1. SEMPRE use useSyncGoogleCalendar() ao invés de criar/deletar direto no Supabase
 *    ✅ Certo: const { createEvent } = useSyncGoogleCalendar(); await createEvent(...)
 *    ❌ Errado: await supabase.from('andamentos').insert(...)
 * 
 * 2. Inclua data_fim quando o evento tiver duração (audiências, reuniões)
 *    ✅ data_fim: '2025-11-15T11:00:00'
 * 
 * 3. Use tipos corretos para as cores certas no Google Calendar
 *    ✅ tipo: 'Audiência' | 'Prazo' | 'Reunião'
 * 
 * 4. Sempre trate erros com try/catch
 *    ✅ try { await createEvent(...) } catch (error) { console.error(error) }
 * 
 * 5. Dê feedback ao usuário após operações
 *    ✅ alert('Evento sincronizado com Google Calendar!')
 */
