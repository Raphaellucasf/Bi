# 🔄 CONFIGURAR SINCRONIZAÇÃO GOOGLE CALENDAR

## 📋 Passo 1: Execute este SQL no Supabase

Acesse: https://supabase.com/dashboard → Seu Projeto → SQL Editor

Cole e execute o seguinte SQL:

```sql
-- Adicionar colunas para sincronização com Google Calendar
ALTER TABLE andamentos ADD COLUMN IF NOT EXISTS google_calendar_color VARCHAR(10);
ALTER TABLE andamentos ADD COLUMN IF NOT EXISTS origem VARCHAR(50) DEFAULT 'app';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_andamentos_google_event 
ON andamentos(google_calendar_event_id) 
WHERE google_calendar_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_andamentos_origem 
ON andamentos(origem);

-- Comentários
COMMENT ON COLUMN andamentos.google_calendar_color IS 'Cor do evento no Google Calendar (colorId)';
COMMENT ON COLUMN andamentos.origem IS 'Origem do evento: app (Meritus) ou google_calendar';
```

## ✅ Passo 2: Verificar a Sincronização

1. **Conecte-se ao Google Calendar** (botão no header do app)
2. **Clique em "Sincronizar Agora"** para importar eventos existentes
3. **Crie um evento no Meritus** - ele será enviado ao Google Calendar automaticamente
4. **Crie um evento no Google Calendar** - clique em "Sincronizar Agora" para importar

## 🎨 Como Funciona

### Eventos do Meritus → Google Calendar
- ✅ Cor definida pelo tipo (Audiência=Verde, Prazo=Vermelho, Reunião=Azul)
- ✅ Notificações: 1 dia antes (email) + 30 min antes (popup)
- ✅ Descrição com detalhes do processo/cliente

### Eventos do Google Calendar → Meritus
- ✅ Mantém a cor original do Google Calendar
- ✅ Badge "Google Calendar" no evento
- ✅ Tipo detectado automaticamente pelo título
- ✅ Não pode ser editado no Meritus (mantenha no Google)

## 🔄 Sincronização Automática

- ✅ A cada **5 minutos** eventos são sincronizados automaticamente
- ✅ Ao criar/editar/excluir no Meritus, sincroniza **imediatamente**
- ✅ Botão "Sincronizar Agora" para forçar sincronização manual

## 📧 Formato do Email no Google Calendar

Quando você criar um evento no Meritus, ele aparecerá no Google Calendar assim:

**Título:** Nome do evento
**Descrição:**
```
Tipo: Audiência/Prazo/Reunião

[Sua descrição aqui]

Processo: 0001234-69.2012.5.02.0025
Cliente: JONAS OLIMPIO DA SILVA
```

**Notificações:**
- 📧 Email: 1 dia antes às 23:30
- 🔔 Popup: 30 minutos antes

## 🎨 Cores no Google Calendar

| Tipo no Meritus | Cor no Google | ColorId |
|-----------------|---------------|---------|
| Audiência       | Verde (Manjericão) | 10 |
| Prazo           | Vermelho (Tomate) | 11 |
| Reunião         | Azul (Mirtilo) | 9 |

## ⚠️ Importante

1. **Não edite eventos do Google no Meritus** - edite diretamente no Google Calendar e sincronize
2. **Token expira em 1 hora** - reconecte se necessário
3. **Primeira sincronização** importa eventos dos últimos 30 dias e próximos 365 dias
4. **Eventos sem processo/cliente** são permitidos

## 🐛 Troubleshooting

**Eventos não aparecem?**
- Clique em "Sincronizar Agora"
- Verifique se está conectado (badge verde "Conectado")
- Verifique o console do navegador (F12) para erros

**Token expirado?**
- Desconecte e reconecte no botão do Google Calendar
- Token é válido por 1 hora

**Eventos duplicados?**
- Não crie o mesmo evento nos dois lugares
- O sistema detecta eventos já sincronizados pelo ID
