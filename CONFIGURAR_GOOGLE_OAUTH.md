# 🔧 CONFIGURAR GOOGLE OAUTH2 - PASSO A PASSO

## ⚠️ Erro 400 - Solicitação Inválida

Este erro acontece porque o **Client ID do Google OAuth2** não está configurado.

---

## 📋 Solução Rápida

### **Passo 1: Criar Projeto no Google Cloud**

1. Acesse: https://console.cloud.google.com
2. Clique em **"Criar Projeto"** (ou selecione um existente)
3. Dê um nome (ex: "BiMaster App")
4. Clique em **"Criar"**

### **Passo 2: Ativar Google Calendar API**

1. No menu lateral, vá em: **APIs e Serviços** → **Biblioteca**
2. Busque por: **"Google Calendar API"**
3. Clique em **"Ativar"**

### **Passo 3: Criar Credenciais OAuth2**

1. No menu lateral: **APIs e Serviços** → **Credenciais**
2. Clique em **"+ Criar Credenciais"**
3. Selecione: **"ID do cliente OAuth"**
4. Tipo de aplicativo: **"Aplicativo da Web"**
5. Nome: "BiMaster Web Client"

### **Passo 4: Configurar URLs Autorizadas**

#### **Origens JavaScript autorizadas:**
```
http://localhost:5173
http://localhost:3000
https://seu-dominio-producao.com
```

#### **URIs de redirecionamento autorizados:**
```
http://localhost:5173
http://localhost:3000
https://seu-dominio-producao.com
```

6. Clique em **"Criar"**
7. **COPIE** o **Client ID** gerado (algo como: `123456789-abc123xyz.apps.googleusercontent.com`)

---

## 🔑 Passo 5: Configurar no Projeto

### **Opção A: Variável de Ambiente (RECOMENDADO)**

1. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
```

2. Atualize `src/index.jsx`:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

// Pegar Client ID da variável de ambiente
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
```

### **Opção B: Hardcoded (NÃO RECOMENDADO para produção)**

Edite `src/index.jsx` e substitua diretamente:

```jsx
root.render(
  <GoogleOAuthProvider clientId="SEU_CLIENT_ID_REAL_AQUI">
    <App />
  </GoogleOAuthProvider>
);
```

---

## 🔄 Passo 6: Reiniciar Aplicação

```powershell
# Pare o servidor (Ctrl+C)
# Reinicie
npm run dev
```

---

## ✅ Passo 7: Testar Conexão

1. Vá em **Configurações** → **Perfil** → **Notificações**
2. Clique em **"Conectar Google Calendar"**
3. Deve abrir popup do Google pedindo autorização
4. Autorize o app
5. ✅ Conectado!

---

## 🐛 Troubleshooting

### **Erro: "redirect_uri_mismatch"**
- **Causa:** A URL atual não está nas URIs autorizadas
- **Solução:** Adicione a URL exata no Google Cloud Console
- Exemplo: Se está rodando em `http://localhost:5173`, adicione exatamente isso

### **Erro: "invalid_client"**
- **Causa:** Client ID incorreto ou inválido
- **Solução:** Verifique se copiou o Client ID completo (sem espaços)

### **Erro: "access_denied"**
- **Causa:** Usuário negou permissão
- **Solução:** Tente novamente e clique em "Permitir"

### **Erro: "popup_closed_by_user"**
- **Causa:** Popup foi fechado antes de completar
- **Solução:** Desative bloqueador de popups e tente novamente

---

## 📝 Exemplo Completo de .env

```env
# Google OAuth2
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com

# Supabase (se ainda não tiver)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## 🔒 Segurança

### **Tela de Consentimento OAuth**

1. No Google Cloud Console: **APIs e Serviços** → **Tela de consentimento OAuth**
2. Tipo: **Externa** (para qualquer usuário) ou **Interna** (apenas sua organização)
3. Preencha:
   - Nome do app: "BiMaster"
   - Email de suporte: seu@email.com
   - Logotipo (opcional)
4. Escopos: Adicione `calendar.events`
5. Salve

---

## 📊 Verificação Final

Após configurar, verifique:

- [ ] Client ID copiado corretamente
- [ ] Arquivo .env criado (ou código atualizado)
- [ ] URLs autorizadas configuradas
- [ ] Google Calendar API ativada
- [ ] Servidor reiniciado
- [ ] Sem erros no console do navegador

---

## 🎯 URLs Importantes

- **Google Cloud Console:** https://console.cloud.google.com
- **Credenciais:** https://console.cloud.google.com/apis/credentials
- **Calendar API:** https://console.cloud.google.com/apis/library/calendar-json.googleapis.com

---

## 💡 Dica

Adicione `.env` ao `.gitignore` para não expor suas credenciais:

```gitignore
# .gitignore
.env
.env.local
.env.production
```

---

Siga estes passos e o erro 400 será resolvido! 🎉
