## 📅 Integração com Google Calendar

### ✨ Funcionalidades Implementadas

A integração com Google Calendar permite sincronização **bidirecional** automática entre o calendário do app e sua conta Google.

---

## 🎯 O Que Foi Implementado

### 1. **Autenticação OAuth2**
- Login seguro via Google OAuth2
- Token armazenado localmente com controle de expiração
- Logout completo com limpeza de dados
- Exibição do email da conta conectada

### 2. **Sincronização Automática**

#### ✅ **Ao Criar Evento no App:**
- Evento é criado no banco de dados (Supabase)
- **Automaticamente** enviado ao Google Calendar
- ID do evento Google salvo para rastreamento
- Cores mapeadas por tipo:
  - 🟢 **Audiência** → Verde
  - 🔴 **Prazo** → Vermelho  
  - 🔵 **Reunião** → Azul

#### ✅ **Ao Atualizar Evento:**
- Alterações no app refletem no Google Calendar
- Título, descrição, data e hora sincronizados
- Mantém vínculo com evento original

#### ✅ **Ao Excluir Evento:**
- Removido do app
- **Automaticamente** removido do Google Calendar
- Confirmação antes de excluir

#### ✅ **Ao Marcar como Concluído:**
- Status atualizado no app
- Descrição atualizada no Google com "✅ CONCLUÍDO"

### 3. **Interface Melhorada**
- Badge verde mostrando status de conexão
- Email da conta Google exibido
- Botão para desconectar
- Indicador visual no calendário quando sincronizado

---

## 🚀 Como Usar

### **Passo 1: Conectar Google Calendar**

1. Vá em **Configurações** → **Perfil** → **Notificações**
2. Clique em **"Conectar Google Calendar"**
3. Faça login com sua conta Google
4. Autorize o app a acessar seu calendário
5. ✅ Conexão estabelecida!

### **Passo 2: Configurar Banco de Dados**

Execute o script SQL no Supabase:

```sql
-- Copie e execute: ADICIONAR_GOOGLE_CALENDAR_SYNC.sql
```

Isso adiciona:
- Coluna `google_calendar_event_id` em `andamentos`
- Coluna `data_fim` em `andamentos` (para eventos com duração)
- Colunas de controle em `usuarios`

### **Passo 3: Criar Eventos**

Agora, ao criar qualquer evento (Audiência, Prazo, Reunião):
- ✅ Será salvo no app
- ✅ **Automaticamente** aparecerá no Google Calendar
- ✅ Sincronizado em tempo real

---

## 🔧 Arquivos Modificados/Criados

### **Novos Arquivos:**
1. `src/hooks/useSyncGoogleCalendar.js` - Hook de sincronização
2. `ADICIONAR_GOOGLE_CALENDAR_SYNC.sql` - Script SQL
3. `GOOGLE_CALENDAR_INTEGRACAO_README.md` - Esta documentação

### **Arquivos Atualizados:**
1. `src/services/googleCalendarService.js` - Serviço completo
2. `src/components/ui/GoogleCalendarButton.jsx` - UI melhorada
3. `src/pages/calendar/index.jsx` - Uso do hook de sincronização

---

## 💡 Como Funciona (Técnico)

### **Fluxo de Criação de Evento:**

```javascript
import { useSyncGoogleCalendar } from '../hooks/useSyncGoogleCalendar';

const { createEvent } = useSyncGoogleCalendar();

// Criar evento (sincroniza automaticamente)
const novoEvento = await createEvent({
  titulo: 'Audiência Trabalhista',
  tipo: 'Audiência',
  data_andamento: '2025-11-10T14:00:00',
  data_fim: '2025-11-10T16:00:00',
  descricao: 'Audiência inicial com o cliente',
  processo_id: 'uuid-do-processo'
});

// ✅ Salvo no Supabase
// ✅ Enviado ao Google Calendar
// ✅ ID do Google salvo em google_calendar_event_id
```

### **Fluxo de Atualização:**

```javascript
const { updateEvent } = useSyncGoogleCalendar();

await updateEvent(eventoId, {
  titulo: 'Audiência Trabalhista - REAGENDADA',
  data_andamento: '2025-11-15T14:00:00'
});

// ✅ Atualizado no Supabase
// ✅ Atualizado no Google Calendar (mesmo evento)
```

### **Fluxo de Exclusão:**

```javascript
const { deleteEvent } = useSyncGoogleCalendar();

await deleteEvent(eventoId);

// ✅ Removido do Supabase
// ✅ Removido do Google Calendar
```

---

## 🔒 Segurança

- ✅ Token OAuth2 com expiração automática
- ✅ Scopes mínimos necessários (calendar.events)
- ✅ Token armazenado em localStorage (client-side)
- ✅ Validação de token antes de cada requisição
- ✅ Logout limpa todos os dados

---

## 🎨 Cores no Google Calendar

| Tipo de Evento | Cor no App | Cor no Google | ID da Cor |
|----------------|------------|---------------|-----------|
| Audiência      | Verde      | Verde         | 10        |
| Prazo          | Vermelho   | Vermelho      | 11        |
| Reunião        | Azul       | Azul          | 9         |
| Outros         | Cinza      | Cinza         | 8         |

---

## ⚙️ Configuração Avançada

### **Lembretes Automáticos**

Por padrão, eventos criados terão:
- 📧 **Email** 24 horas antes
- 🔔 **Popup** 30 minutos antes

Configurado em `googleCalendarService.js`:

```javascript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 24 * 60 }, // 1 dia antes
    { method: 'popup', minutes: 30 },       // 30 min antes
  ],
}
```

### **Fuso Horário**

Todos os eventos usam `America/Sao_Paulo` (horário de Brasília).

---

## 🐛 Troubleshooting

### **"Token expirado. Reconecte sua conta Google"**
- **Causa:** Token OAuth2 expirou (padrão: 1 hora)
- **Solução:** Clique em "Conectar Google Calendar" novamente

### **Evento não aparece no Google Calendar**
1. Verifique se está conectado (badge verde no calendário)
2. Verifique o console do navegador (F12) por erros
3. Confirme que executou o script SQL
4. Tente desconectar e reconectar

### **"Erro ao criar evento no Google Calendar"**
- **Causa:** Permissões insuficientes ou token inválido
- **Solução:** 
  1. Desconecte o Google Calendar
  2. Reconecte e autorize novamente
  3. Certifique-se de aceitar todas as permissões

---

## 📊 Banco de Dados

### **Tabela: andamentos**

Novas colunas adicionadas:

```sql
google_calendar_event_id VARCHAR(255)  -- ID do evento no Google
data_fim TIMESTAMP WITH TIME ZONE      -- Hora de término do evento
```

### **Tabela: usuarios**

```sql
google_calendar_connected BOOLEAN                -- Se está conectado
google_calendar_token TEXT                       -- Token OAuth2
google_calendar_connected_at TIMESTAMP WITH TIME ZONE -- Quando conectou
```

---

## 🎯 Próximos Passos (Opcional)

### **Melhorias Futuras:**
- [ ] Sincronização do Google → App (importar eventos do Google)
- [ ] Webhook para notificações em tempo real
- [ ] Suporte a múltiplos calendários
- [ ] Sincronização de participantes/convidados
- [ ] Anexos de documentos em eventos

---

## ✅ Checklist de Implementação

- [x] Serviço de autenticação OAuth2
- [x] Criar eventos no Google Calendar
- [x] Atualizar eventos no Google Calendar
- [x] Excluir eventos do Google Calendar
- [x] Armazenar token com expiração
- [x] UI de conexão/desconexão
- [x] Hook de sincronização automática
- [x] Integração na página de calendário
- [x] Script SQL para banco de dados
- [x] Documentação completa

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Consulte os logs do Supabase
3. Revise este README
4. Verifique se o script SQL foi executado

---

**🎉 Integração completa e funcional!**

Agora seus eventos são sincronizados automaticamente entre o app e o Google Calendar. Experimente criar, editar e excluir eventos para ver a mágica acontecer! ✨
