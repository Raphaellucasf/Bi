# ⚠️ Erro 403: App Não Verificado

## 🔍 O Problema

O Google está bloqueando porque o app está em **"Fase de Testes"** e você não está na lista de usuários de teste.

**Erro:** `access_denied` - "O app legalflow não concluiu o processo de verificação do Google"

---

## ✅ Solução Rápida (3 minutos)

### **Adicionar seu email como Usuário de Teste**

---

### 📍 **Passo 1: Acessar Tela de Consentimento**

**Link direto:** https://console.cloud.google.com/apis/credentials/consent

Você verá uma tela assim:

```
┌──────────────────────────────────────────────────────────┐
│ Tela de consentimento OAuth                              │
├──────────────────────────────────────────────────────────┤
│ Nome do app: legalflow                                   │
│ Tipo de usuário: Externa                                 │
│ Status de publicação: Em teste                           │
│                                                           │
│ [Editar app]                                             │
└──────────────────────────────────────────────────────────┘
```

---

### 📍 **Passo 2: Editar o App**

1. Clique no botão **"Editar app"** (ou no nome "legalflow")
2. Role a página até encontrar a seção **"Usuários de teste"**

---

### 📍 **Passo 3: Adicionar Usuários de Teste**

Na seção "Usuários de teste":

```
┌──────────────────────────────────────────────────────────┐
│ Usuários de teste                                        │
│                                                           │
│ Adicione usuários de teste para permitir que eles       │
│ acessem seu app durante o desenvolvimento                │
│                                                           │
│ [+ ADD USERS] ou [+ Adicionar usuários]                 │
│                                                           │
│ Usuários:                                                │
│ (vazio)                                                  │
└──────────────────────────────────────────────────────────┘
```

1. Clique em **"+ ADD USERS"** ou **"+ Adicionar usuários"**
2. Um popup aparecerá

---

### 📍 **Passo 4: Digitar seu Email**

No popup:

```
┌──────────────────────────────────────────────┐
│ Adicionar usuários de teste                 │
├──────────────────────────────────────────────┤
│                                              │
│ Endereços de e-mail:                         │
│ ┌──────────────────────────────────────┐    │
│ │ lucasraphael.LR@gmail.com            │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ Adicione até 100 endereços de e-mail        │
│                                              │
│                      [Cancelar]  [Adicionar]│
└──────────────────────────────────────────────┘
```

1. Digite: **`lucasraphael.LR@gmail.com`**
2. Clique em **"Adicionar"**

---

### 📍 **Passo 5: Salvar**

1. Role até o final da página
2. Clique em **"Salvar"** ou **"Save"**

---

### 📍 **Passo 6: Testar Novamente**

1. Volte ao seu app
2. Vá em: **Configurações** → **Perfil** → **Notificações**
3. Clique em **"Conectar Google Calendar"**
4. ✅ **Agora vai funcionar!**

---

## 🎯 Alternativa: Publicar o App

Se quiser que **qualquer pessoa** possa usar (não apenas você):

### **Publicar App**

1. Na tela de consentimento OAuth
2. Clique em **"Publicar app"** (botão no topo)
3. Confirme a publicação
4. Status mudará de "Em teste" → "Em produção"

⚠️ **NOTA:** Para uso pessoal/testes, adicionar como usuário de teste é suficiente!

---

## 📊 Comparação

| Opção | Usuários de Teste | Publicar App |
|-------|-------------------|--------------|
| **Tempo** | 2 minutos | 2 minutos |
| **Quem pode usar** | Só emails cadastrados | Qualquer pessoa |
| **Verificação Google** | Não precisa | Não precisa (para < 100 usuários) |
| **Recomendado para** | Uso pessoal/equipe | App público |

---

## ✅ Checklist

Antes de testar novamente, confirme:

- [ ] Acessei: https://console.cloud.google.com/apis/credentials/consent
- [ ] Cliquei em "Editar app"
- [ ] Encontrei "Usuários de teste"
- [ ] Adicionei: `lucasraphael.LR@gmail.com`
- [ ] Cliquei em "Salvar"
- [ ] Voltei ao app para testar

---

## 🐛 Troubleshooting

**"Não encontro 'Usuários de teste'"**
- Role a página para baixo, está quase no final

**"Não aparece botão 'Adicionar usuários'"**
- Clique primeiro em "Editar app"

**"Diz que o email é inválido"**
- Use o mesmo email da conta Google que você vai usar no app
- Formato: `seuemail@gmail.com`

---

**Depois de adicionar como usuário de teste, vai funcionar perfeitamente!** ✅
