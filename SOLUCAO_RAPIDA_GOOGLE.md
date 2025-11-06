# ⚡ SOLUÇÃO RÁPIDA - Erro 400 Google Calendar

## 🚨 O Problema

O erro 400 acontece porque o **Google Client ID** não está configurado.

---

## ✅ Solução em 5 Passos

### 1️⃣ **Criar arquivo .env**

Na raiz do projeto (`Bi-master`), crie um arquivo chamado `.env`:

```env
VITE_GOOGLE_CLIENT_ID=
```

### 2️⃣ **Obter Client ID**

Acesse: https://console.cloud.google.com/apis/credentials

- Se não tiver projeto, clique em **"Criar Projeto"**
- Vá em **"+ Criar Credenciais"** → **"ID do cliente OAuth"**
- Tipo: **"Aplicativo da Web"**
- URIs autorizadas JavaScript: `http://localhost:5173`
- URIs de redirecionamento: `http://localhost:5173`
- Clique em **"Criar"**
- **COPIE** o Client ID gerado

### 3️⃣ **Ativar Google Calendar API**

Ainda no Google Cloud Console:

- Vá em **"Biblioteca"** (menu lateral)
- Busque: **"Google Calendar API"**
- Clique em **"Ativar"**

### 4️⃣ **Configurar .env**

Cole o Client ID no arquivo `.env`:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
```

**⚠️ IMPORTANTE:** Substitua pelo SEU Client ID real!

### 5️⃣ **Reiniciar Servidor**

No terminal:

```powershell
# Pare o servidor (Ctrl+C)
npm run dev
```

---

## ✅ Pronto!

Agora clique em **"Conectar Google Calendar"** novamente.

Deve abrir um popup do Google pedindo autorização.

---

## 🆘 Ainda com erro?

### **Erro: redirect_uri_mismatch**

Adicione exatamente a URL que aparece no erro nas URIs autorizadas:

1. Vá em: https://console.cloud.google.com/apis/credentials
2. Clique no seu Client ID
3. Adicione a URL exata em "URIs de redirecionamento autorizados"
4. Salve

### **Erro: access_denied**

Você negou a permissão. Tente novamente e clique em **"Permitir"**.

### **Sem popup?**

Desative bloqueador de popups para `localhost:5173`.

---

## 📞 Links Úteis

- **Obter Client ID:** https://console.cloud.google.com/apis/credentials
- **Documentação completa:** Veja `CONFIGURAR_GOOGLE_OAUTH.md`

---

**Tempo estimado: 5 minutos** ⏱️
