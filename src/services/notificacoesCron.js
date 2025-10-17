// Supabase Edge Function (Node.js) - Notificações de Tarefas Próximas
// Executa diariamente, busca tarefas com data_final em até 2 dias e insere notificações

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function gerarNotificacoes() {
  const hoje = new Date();
  const doisDias = new Date();
  doisDias.setDate(hoje.getDate() + 2);
  const hojeStr = hoje.toISOString().slice(0, 10);
  const doisDiasStr = doisDias.toISOString().slice(0, 10);

  // Buscar tarefas próximas do vencimento
  const { data: tarefas } = await supabase
    .from('andamentos')
    .select('id, user_id, titulo, tipo, data_final, concluido')
    .lte('data_final', doisDiasStr)
    .gte('data_final', hojeStr)
    .eq('concluido', false);

  if (!tarefas || tarefas.length === 0) return;

  for (const tarefa of tarefas) {
    await supabase.from('notificacoes').insert({
      user_id: tarefa.user_id,
      andamento_id: tarefa.id,
      mensagem: `Tarefa "${tarefa.titulo}" (${tarefa.tipo}) vence em breve!`,
      lida: false
    });
  }
}

// Para rodar como cron job ou edge function
if (require.main === module) {
  gerarNotificacoes().then(() => console.log('Notificações geradas')).catch(console.error);
}

module.exports = gerarNotificacoes;
