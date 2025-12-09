# Julia - Assistente IA do Meritus

## 🤖 Sobre a Julia

Julia é uma assistente de IA integrada ao Meritus, desenvolvida com o Google Gemini AI. Ela foi criada para auxiliar advogados e profissionais jurídicos a gerenciar tarefas do sistema através de conversas naturais.

## ✨ Características

- **Interface Conversacional**: Chat intuitivo em português brasileiro
- **Execução de Ações**: Julia pode executar ações no sistema mediante confirmação
- **Inteligência Contextual**: Entende comandos em linguagem natural
- **Botão Flutuante**: Sempre acessível em qualquer tela do sistema
- **Histórico de Conversas**: Mantém contexto durante a sessão

## 🎯 Capacidades da Julia

### 1. Gestão de Clientes
- ✅ **Criar novo cliente**
  - Exemplo: *"Julia, crie um cliente chamado João Silva com email joao@email.com"*
  
- ✅ **Buscar clientes**
  - Exemplo: *"Busque o cliente João Silva"*
  - Exemplo: *"Procure clientes com CPF 123.456.789-00"*

### 2. Gestão de Processos
- ✅ **Criar novo processo**
  - Exemplo: *"Crie um processo número 1234567-89.2025 para o cliente Maria Santos"*
  
- ✅ **Buscar processos**
  - Exemplo: *"Busque processos do cliente João"*
  - Exemplo: *"Mostre processos ativos"*

### 3. Agendamento de Tarefas
- ✅ **Agendar audiências**
  - Exemplo: *"Agende uma audiência de instrução para o processo 1234567-89.2025 no dia 20/12/2025 às 14h"*
  
- ✅ **Criar reuniões**
  - Exemplo: *"Marque uma reunião com cliente João amanhã às 10h"*
  
- ✅ **Definir prazos**
  - Exemplo: *"Crie um prazo de contestação para o processo 1234567-89.2025 em 15 dias"*

### 4. Consultas
- ✅ **Buscar audiências**
  - Exemplo: *"Quais são as audiências desta semana?"*
  - Exemplo: *"Mostre audiências de novembro"*

## 🚀 Como Usar

### Acessando a Julia

1. Clique no **botão flutuante roxo** com ícone de estrela no canto inferior direito
2. O chat será aberto imediatamente
3. Digite sua solicitação e pressione Enter ou clique no botão Enviar

### Exemplos de Comandos

#### Criar Cliente
```
Você: Julia, preciso cadastrar um novo cliente
Julia: Claro! Qual é o nome completo do cliente?
Você: Maria da Silva Santos
Julia: E qual o email e telefone?
Você: maria@email.com e (11) 98765-4321
Julia: Perfeito! Vou criar o cliente com esses dados. Posso prosseguir?
[Botões: Confirmar | Cancelar]
```

#### Agendar Audiência
```
Você: Preciso marcar uma audiência de instrução
Julia: Para qual processo?
Você: Processo 0001234-56.2025.8.26.0100
Julia: Qual a data e horário da audiência?
Você: 15 de dezembro às 14h30
Julia: Qual o título da audiência?
Você: Audiência de Instrução e Julgamento
Julia: Vou agendar a audiência com esses dados. Posso prosseguir?
[Botões: Confirmar | Cancelar]
```

#### Buscar Informações
```
Você: Mostre os processos do cliente João Silva
Julia: [Exibe lista de processos encontrados]
```

## 🔧 Configuração Técnica

### Arquitetura

```
src/
├── services/
│   └── juliaAIService.js      # Serviço principal da IA
└── components/
    └── ui/
        └── JuliaAssistant.jsx  # Interface do chat
```

### Dependências

- `@google/generative-ai` - SDK do Google Gemini
- `@supabase/supabase-js` - Banco de dados
- `lucide-react` - Ícones

### Variável de Ambiente

A chave da API do Gemini está configurada em `.env`:
```
VITE_GEMINI_API_KEY=AIzaSyDVzz0lCxj_BRva0kyIVkdD8dscDfLxs5I
```

## 🛡️ Segurança

- ✅ Todas as ações requerem **confirmação do usuário**
- ✅ Validação de dados antes de executar ações
- ✅ Mensagens de erro claras e amigáveis
- ✅ Integração segura com Supabase

## 🎨 Interface

### Design
- **Gradiente roxo/índigo** - Identidade visual moderna
- **Botão flutuante** - Sempre visível mas não intrusivo
- **Chat responsivo** - 396px de largura, 600px de altura
- **Mensagens diferenciadas** - Cores diferentes para usuário, Julia, erros e sucessos

### Ícones
- 🌟 `Sparkles` - Representa IA e inteligência
- ✉️ `Send` - Enviar mensagem
- ❌ `X` - Fechar chat
- ⏳ `Loader2` - Carregamento
- ✅ `CheckCircle` - Sucesso
- ❌ `XCircle` - Erro

## 📝 Funcionalidades Futuras (Roadmap)

- [ ] **Reconhecimento de voz** - Comandos por áudio
- [ ] **Notificações proativas** - Julia avisa sobre prazos próximos
- [ ] **Análise de documentos** - Upload de petições para análise
- [ ] **Sugestões inteligentes** - Julia sugere ações com base no contexto
- [ ] **Integração com calendário** - Sincronização automática de eventos
- [ ] **Relatórios personalizados** - "Julia, gere um relatório mensal"
- [ ] **Aprendizado personalizado** - Adapta-se ao estilo do usuário

## 🐛 Troubleshooting

### Julia não responde
- Verifique se a chave API do Gemini está configurada corretamente no `.env`
- Verifique conexão com internet
- Abra o console do navegador (F12) e verifique erros

### Ação não é executada
- Certifique-se de clicar em "Confirmar" quando Julia solicitar
- Verifique se os dados fornecidos estão corretos (ex: processo existe)
- Confirme que você tem permissões no Supabase

### Chat não abre
- Recarregue a página (F5)
- Verifique se não há erros no console
- Confirme que o componente está importado em `App.jsx`

## 📞 Suporte

Para questões sobre a Julia, verifique:
1. Este README
2. Console do navegador (F12) para erros
3. Logs do Supabase para problemas de banco de dados

## 🎉 Dicas de Uso

1. **Seja específico**: Quanto mais detalhes você fornecer, melhor Julia entenderá
2. **Use linguagem natural**: Não precisa usar comandos técnicos
3. **Confirme dados**: Sempre revise antes de confirmar ações
4. **Explore**: Teste diferentes formas de pedir a mesma coisa
5. **Feedback**: Julia aprende com o contexto da conversa

---

**Desenvolvido para Meritus - Sistema Jurídico** 🏛️
