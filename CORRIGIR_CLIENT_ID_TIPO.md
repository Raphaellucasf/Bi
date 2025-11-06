# 🚨 ERRO: Client ID Tipo Incorreto

## ❌ Problema

O Client ID atual é do tipo **"Desktop/Computador"** (NATIVE_DESKTOP).

Para aplicações web, precisa ser do tipo **"Aplicativo da Web"**.

---

## ✅ Solução Rápida

### 📍 **Passo 1: Acessar Google Cloud Console**

Link direto: https://console.cloud.google.com/apis/credentials

### 📍 **Passo 2: Criar Novo Client ID**

1. Clique no botão: **"+ Criar credenciais"**
2. Selecione: **"ID do cliente OAuth"**

### 📍 **Passo 3: ESCOLHER TIPO CORRETO** ⚠️

Na tela "Criar ID do cliente OAuth":

```
┌─────────────────────────────────────────────┐
│ Tipo de aplicativo:                         │
│                                             │
│ ⭕ Aplicativo da Web        ← ESCOLHA ESTE │
│ ○  Aplicativo Android                       │
│ ○  Aplicativo iOS                           │
│ ○  Computador                ← NÃO ESTE!    │
│ ○  TVs e dispositivos de entrada limitada   │
└─────────────────────────────────────────────┘
```

### 📍 **Passo 4: Configurar URIs**

**Nome:** (qualquer nome, ex: "BiMaster Web Client")

#### **Origens JavaScript autorizadas:**
Clique em "+ Adicionar URI" e adicione:
```
http://localhost:5173
```

E adicione outra:
```
http://localhost:3000
```

#### **URIs de redirecionamento autorizados:**
Clique em "+ Adicionar URI" e adicione:
```
http://localhost:5173
```

E adicione outra:
```
http://localhost:3000
```

### 📍 **Passo 5: Criar e Copiar**

1. Clique no botão **"Criar"** (azul, canto inferior)
2. Popup aparecerá com o **Client ID**
3. **COPIE** o Client ID completo
4. Cole aqui no chat!

---

## 📸 Exemplo Visual

A tela deve parecer assim:

```
┌──────────────────────────────────────────────────────────────┐
│ Criar ID do cliente OAuth                                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Tipo de aplicativo: [Aplicativo da Web ▼]                   │
│                                                               │
│ Nome                                                          │
│ [BiMaster Web Client_____________________]                   │
│                                                               │
│ Origens JavaScript autorizadas                                │
│ [http://localhost:5173___________________] [🗑️]             │
│ [http://localhost:3000___________________] [🗑️]             │
│ [+ Adicionar URI]                                             │
│                                                               │
│ URIs de redirecionamento autorizados                          │
│ [http://localhost:5173___________________] [🗑️]             │
│ [http://localhost:3000___________________] [🗑️]             │
│ [+ Adicionar URI]                                             │
│                                                               │
│                                    [Cancelar] [Criar]         │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚡ Depois de Criar

Quando tiver o **NOVO** Client ID:

1. Cole aqui no chat
2. Vou atualizar automaticamente o arquivo `.env`
3. Reinicie o servidor
4. ✅ Funcionará!

---

## 🆘 Dúvidas Comuns

**P: Posso usar o Client ID antigo?**  
R: ❌ Não. Precisa criar um novo do tipo "Aplicativo da Web".

**P: Preciso deletar o antigo?**  
R: Não é obrigatório, mas pode manter organizado.

**P: Quantas URIs preciso adicionar?**  
R: Mínimo 1 em cada seção. Recomendo adicionar localhost:5173 e localhost:3000.

---

**⏱️ Tempo estimado: 3 minutos**
