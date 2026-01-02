# 🤖 Sistema de Análise de Documentos com IA

## ✅ Funcionalidades Implementadas

Sistema completo para a Julia AI ler e resumir documentos salvos localmente.

## 📋 Arquivos Criados

### 1. **Serviço de Análise** 
`src/services/documentAnalysisService.js`
- Lê PDFs, Word e TXT do caminho local
- Extrai texto dos documentos
- Envia para Julia analisar
- Salva resumo no banco

### 2. **Botão de Análise**
`src/components/ui/DocumentAnalysisButton.jsx`
- Botão "Resumir com IA" para cada documento
- Mostra status de carregamento
- Indica erros

### 3. **Modal de Resumo**
`src/components/ui/DocumentSummaryModal.jsx`
- Exibe resumo formatado
- Layout bonito com seções
- Info do documento

### 4. **SQL de Suporte**
`ADD_DOCUMENT_AI_ANALYSIS.sql`
- Adiciona colunas necessárias
- `resumo_ia` - Resumo gerado
- `analisado_em` - Data da análise
- `caminho_local_documento` - Path do arquivo

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install pdf-parse mammoth
```

### 2. Executar SQL no Supabase

Execute `ADD_DOCUMENT_AI_ANALYSIS.sql` no SQL Editor.

### 3. Atualizar electron.js (se usar Electron)

Adicione API para ler arquivos:

```javascript
// No electron.js
const { ipcMain } = require('electron');
const fs = require('fs').promises;

// Expor API de leitura de arquivos
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    throw error;
  }
});

// No preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  fs: {
    readFile: (path, encoding) => ipcRenderer.invoke('read-file', path, encoding)
  }
});
```

### 4. Usar nos Componentes

```jsx
import DocumentAnalysisButton from '../components/ui/DocumentAnalysisButton';
import DocumentSummaryModal from '../components/ui/DocumentSummaryModal';

// No componente de documentos
const [resumoModal, setResumoModal] = useState({ open: false, resumo: null });

<DocumentAnalysisButton
  documentoId={doc.id}
  caminhoLocal={doc.caminho_local_documento}
  onAnaliseCompleta={(resultado) => {
    setResumoModal({
      open: true,
      resumo: resultado.resumo,
      documento: resultado.documento
    });
  }}
/>

<DocumentSummaryModal
  isOpen={resumoModal.open}
  onClose={() => setResumoModal({ open: false, resumo: null })}
  resumo={resumoModal.resumo}
  documento={resumoModal.documento}
/>
```

## 📊 O Que a Julia Analisa

Quando você clica em "Resumir com IA", a Julia fornece:

1. **Resumo Executivo** (2-3 parágrafos)
2. **Pontos-Chave** (principais informações)
3. **Prazos Identificados** (se houver)
4. **Ações Requeridas** (o que fazer)
5. **Classificação** (tipo: petição, sentença, etc.)

## 🔄 Fluxo de Funcionamento

```
1. Usuário clica "Resumir com IA"
   ↓
2. Sistema lê arquivo do caminho local (C:\Users\...)
   ↓
3. Extrai texto (PDF → texto, Word → texto)
   ↓
4. Envia para Julia com contexto do processo
   ↓
5. Julia analisa e gera resumo estruturado
   ↓
6. Salva no banco (documentos.resumo_ia)
   ↓
7. Exibe modal com resumo formatado
```

## 📝 Exemplo de Resumo Gerado

```
**Resumo Executivo**
Este documento trata de uma petição inicial de reclamação trabalhista movida por João da Silva contra Empresa XYZ. O autor pleiteia verbas rescisórias não pagas no valor de R$ 15.000,00...

**Pontos-Chave**
- Pedido de verbas rescisórias
- Valor da causa: R$ 15.000,00
- Vínculo empregatício de 2020 a 2023
- Demissão sem justa causa

**Prazos Identificados**
- Resposta da empresa: 15 dias após citação

**Ações Requeridas**
- Aguardar citação da parte contrária
- Preparar documentação complementar
```

## 💡 Dicas

- **Análise em Lote**: Use `analisarDocumentosEmLote()` para vários documentos
- **Documentos Grandes**: Limita análise a primeiros 15k caracteres
- **Formatos Suportados**: PDF, DOCX, DOC, TXT
- **Caminho Windows**: Salve como `C:\Users\qbex\Desktop\robo\downloads\doc.pdf`

## ⚠️ Requisitos

- ✅ Electron (para acesso ao sistema de arquivos)
- ✅ Documentos salvos localmente
- ✅ Coluna `caminho_local_documento` preenchida
- ✅ Julia AI configurada e funcionando

## 🎯 Próximos Passos

- [ ] Análise automática ao baixar documento
- [ ] Chat sobre documento específico
- [ ] Comparar múltiplos documentos
- [ ] Exportar resumos em PDF
