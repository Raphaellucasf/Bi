# 🔧 PRÓXIMOS PASSOS - Implementação Técnica

## Fase 2: Finalizar Recursos Avançados

---

## 1️⃣ EXPORTAÇÃO .DOCX REAL (Alta Prioridade)

### **Status Atual:**
⚠️ Implementação básica que exporta como .txt

### **O que falta:**
Substituir por conversão real HTML → .docx com formatação completa

### **Passo a Passo:**

#### **1. Instalar Dependências**
```bash
npm install docx file-saver
```

#### **2. Atualizar `PeticaoEditor.jsx`**

Adicionar imports no topo:
```javascript
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
```

Substituir função `handleExportDocx` (linha ~88):
```javascript
const handleExportDocx = async () => {
  try {
    const htmlContent = editorRef.current.innerHTML;
    
    // Converter HTML para estrutura do docx
    const sections = convertHTMLToDocxSections(htmlContent);
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: sections,
      }],
    });

    // Gerar blob e fazer download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `peticao_${new Date().getTime()}.docx`);
    
    alert('✅ Petição exportada com sucesso para .docx!');
  } catch (error) {
    console.error('Erro ao exportar:', error);
    alert('❌ Erro ao exportar documento: ' + error.message);
  }
};

// Função auxiliar para converter HTML → Docx
const convertHTMLToDocxSections = (html) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const sections = [];
  
  tempDiv.childNodes.forEach((node) => {
    if (node.nodeName === 'H1') {
      sections.push(
        new Paragraph({
          text: node.textContent,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
    } else if (node.nodeName === 'H2') {
      sections.push(
        new Paragraph({
          text: node.textContent,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.LEFT,
        })
      );
    } else if (node.nodeName === 'H3') {
      sections.push(
        new Paragraph({
          text: node.textContent,
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.LEFT,
        })
      );
    } else if (node.nodeName === 'P' || node.nodeName === 'DIV') {
      const textRuns = [];
      
      node.childNodes.forEach((child) => {
        if (child.nodeName === 'STRONG') {
          textRuns.push(new TextRun({ text: child.textContent, bold: true }));
        } else if (child.nodeName === 'EM') {
          textRuns.push(new TextRun({ text: child.textContent, italics: true }));
        } else {
          textRuns.push(new TextRun(child.textContent || ''));
        }
      });
      
      sections.push(
        new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun(node.textContent || '')],
          alignment: node.style.textAlign === 'center' ? AlignmentType.CENTER :
                     node.style.textAlign === 'right' ? AlignmentType.RIGHT :
                     AlignmentType.JUSTIFIED,
        })
      );
    } else if (node.nodeName === 'UL') {
      node.querySelectorAll('li').forEach((li) => {
        sections.push(
          new Paragraph({
            text: li.textContent,
            bullet: { level: 0 },
          })
        );
      });
    } else if (node.nodeName === 'BR') {
      sections.push(new Paragraph({ text: '' }));
    }
  });
  
  return sections;
};
```

#### **3. Testar**
1. Abrir Julia
2. Gerar petição
3. Abrir editor
4. Clicar em "Exportar .docx"
5. Verificar se arquivo é criado corretamente
6. Abrir no Word e verificar formatação

---

## 2️⃣ SINCRONIZAÇÃO COM SUPABASE EXTERNO (Alta Prioridade)

### **Status Atual:**
❌ Não implementado

### **O que criar:**
Serviço que monitora banco de dados externo e sincroniza automaticamente

### **Passo a Passo:**

#### **1. Criar arquivo `externalSupabaseSync.js`**

```javascript
// src/services/externalSupabaseSync.js
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient'; // Supabase local

// Supabase EXTERNO (fornecido pelo usuário)
const EXTERNAL_SUPABASE_URL = 'https://zodfekamwsidlrjrujmr.supabase.co';
const EXTERNAL_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Chave fornecida

const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);

class ExternalSyncService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.lastSyncTimestamp = null;
  }

  // Iniciar monitoramento
  start() {
    if (this.isRunning) {
      console.log('⚠️ Sync já está rodando');
      return;
    }

    console.log('🔄 Iniciando sincronização automática...');
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

  // Executar sincronização
  async syncNow() {
    try {
      console.log('🔍 Verificando novos andamentos...');
      
      // Buscar andamentos novos no Supabase EXTERNO
      let query = externalSupabase
        .from('andamentos') // Nome da tabela no banco externo
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
        return;
      }

      if (!novosAndamentos || novosAndamentos.length === 0) {
        console.log('✅ Nenhum andamento novo');
        return;
      }

      console.log(`📥 ${novosAndamentos.length} novo(s) andamento(s) encontrado(s)`);

      // Processar cada andamento
      for (const andamento of novosAndamentos) {
        await this.processarAndamento(andamento);
      }

      // Atualizar timestamp
      this.lastSyncTimestamp = new Date().toISOString();
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  }

  // Processar um andamento
  async processarAndamento(andamento) {
    try {
      // 1. Verificar se cliente existe (por CPF)
      const cpf = andamento.cpf_cliente; // Ajustar conforme estrutura real
      
      let clienteId;
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('cpf', cpf)
        .single();

      if (clienteExistente) {
        clienteId = clienteExistente.id;
        console.log(`✅ Cliente já existe: ${clienteId}`);
      } else {
        // Criar cliente
        const { data: novoCliente } = await supabase
          .from('clientes')
          .insert([{
            nome_completo: andamento.nome_cliente,
            cpf: cpf,
            // ... outros campos
          }])
          .select()
          .single();
        
        clienteId = novoCliente.id;
        console.log(`➕ Cliente criado: ${clienteId}`);
      }

      // 2. Verificar se processo existe
      const numeroProcesso = andamento.numero_processo;
      
      let processoId;
      const { data: processoExistente } = await supabase
        .from('processos')
        .select('id')
        .eq('numero_processo', numeroProcesso)
        .single();

      if (processoExistente) {
        processoId = processoExistente.id;
        console.log(`✅ Processo já existe: ${processoId}`);
      } else {
        // Criar processo
        const { data: novoProcesso } = await supabase
          .from('processos')
          .insert([{
            numero_processo: numeroProcesso,
            cliente_id: clienteId,
            tipo: andamento.tipo_processo || 'Trabalhista',
            // ... outros campos
          }])
          .select()
          .single();
        
        processoId = novoProcesso.id;
        console.log(`➕ Processo criado: ${processoId}`);
      }

      // 3. Criar andamento/tarefa
      await supabase
        .from('andamentos')
        .insert([{
          processo_id: processoId,
          titulo: andamento.titulo || andamento.descricao,
          descricao: andamento.descricao,
          tipo: andamento.tipo || 'Andamento',
          data_andamento: andamento.data || new Date().toISOString(),
        }]);

      console.log(`✅ Andamento criado para processo ${numeroProcesso}`);

      // 4. TODO: Sincronizar com Google Calendar
      // await this.syncToGoogleCalendar(andamento);

    } catch (error) {
      console.error('❌ Erro ao processar andamento:', error);
    }
  }
}

export const externalSyncService = new ExternalSyncService();
```

#### **2. Integrar no `App.jsx`**

```javascript
import { externalSyncService } from './services/externalSupabaseSync';

useEffect(() => {
  // Iniciar sync automático ao carregar app
  externalSyncService.start();

  // Parar ao desmontar
  return () => {
    externalSyncService.stop();
  };
}, []);
```

#### **3. Criar Painel de Controle (Opcional)**

Adicionar em Settings:
```jsx
<button onClick={() => externalSyncService.syncNow()}>
  🔄 Sincronizar Agora
</button>
```

---

## 3️⃣ INTEGRAÇÃO GOOGLE CALENDAR (Média Prioridade)

### **Status Atual:**
❌ Não implementado

### **O que fazer:**

#### **1. Setup OAuth 2.0**
1. Ir para [Google Cloud Console](https://console.cloud.google.com)
2. Criar projeto "Meritus Calendar"
3. Ativar API: Google Calendar API
4. Criar credenciais OAuth 2.0
5. Adicionar URI de redirecionamento

#### **2. Instalar biblioteca**
```bash
npm install @react-oauth/google gapi-script
```

#### **3. Criar serviço `googleCalendarService.js`**

```javascript
// src/services/googleCalendarService.js
const CALENDAR_ID = 'primary';

class GoogleCalendarService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
  }

  async initialize(accessToken) {
    this.accessToken = accessToken;
    this.isInitialized = true;
  }

  async createEvent(eventData) {
    const event = {
      summary: eventData.titulo,
      description: eventData.descricao,
      start: {
        dateTime: eventData.data_andamento,
        timeZone: 'America/Maceio',
      },
      end: {
        dateTime: new Date(new Date(eventData.data_andamento).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'America/Maceio',
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    return await response.json();
  }
}

export const googleCalendarService = new GoogleCalendarService();
```

#### **4. Integrar com Julia**

No `juliaAIService.js`, após criar audiência:
```javascript
// Após criar audiência no Supabase
if (result.success) {
  await googleCalendarService.createEvent(dados);
}
```

---

## 4️⃣ OUTROS APRIMORAMENTOS

### **Templates de Petições**
- Criar tabela `templates_peticoes`
- Campos: nome, conteúdo_markdown, variáveis
- UI para gerenciar templates

### **Validação CNJ**
```javascript
const validarNumeroCNJ = (numero) => {
  const regex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
  return regex.test(numero);
};
```

### **Histórico de Petições**
```sql
CREATE TABLE peticoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  processo_id UUID REFERENCES processos(id),
  titulo TEXT NOT NULL,
  conteudo_markdown TEXT,
  conteudo_html TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 2A: Exportação .docx**
- [ ] Instalar `npm install docx file-saver`
- [ ] Atualizar `PeticaoEditor.jsx`
- [ ] Implementar `convertHTMLToDocxSections()`
- [ ] Testar exportação completa
- [ ] Validar formatação no Word

### **Fase 2B: Sync Externo**
- [ ] Criar `externalSupabaseSync.js`
- [ ] Integrar no `App.jsx`
- [ ] Testar polling automático
- [ ] Adicionar painel de controle

### **Fase 2C: Google Calendar**
- [ ] Setup OAuth 2.0
- [ ] Instalar dependências
- [ ] Criar `googleCalendarService.js`
- [ ] Integrar com Julia
- [ ] Testar sync bidirecional

---

## 🚀 ORDEM RECOMENDADA

1. **Exportação .docx** (2-3 horas) - Alta prioridade, usuário vai usar muito
2. **Sync Externo** (4-6 horas) - Automação importante
3. **Google Calendar** (6-8 horas) - Depende de setup OAuth

---

**Total estimado:** 12-17 horas de desenvolvimento

Boa sorte! 💪🚀
