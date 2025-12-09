# 🤖 Guia de Uso: Julia AI para Processos Jurídicos

## ✅ Fluxo Automático (Recomendado)

### 1. Cole o Texto Completo do Processo

Quando você recebe dados de um processo judicial (do PJe, DataJus, etc.), **cole o texto completo** na Julia:

```
Órgão julgador: 23ª Vara do Trabalho de São Paulo
Número do Processo: ATOrd 1001796-55.2023.5.02.0023
Distribuído: 30/11/2023 16:26
Valor da causa: R$ 82.639,67

Polo Ativo
reclamante: mayara arisa pereira dos santos
CPF: 350.248.778-29
RUA MANUEL RIBEIRO ROSA, 57
JARDIM CIDADE PIRITUBA - SAO PAULO - SP - CEP: 02940-000

Polo Passivo
reclamado: associacao beneficente santos amaral
CNPJ: 08.943.676/0001-20
```

### 2. Julia Extrai Automaticamente

A IA vai identificar e extrair:

✅ **Cliente (Polo Ativo):**
- Nome completo
- CPF
- Endereço completo

✅ **Processo:**
- Número do processo
- Vara/Tribunal
- Valor da causa
- Data de distribuição
- Assunto/Tipo

✅ **Parte Adversa (Polo Passivo):**
- Nome/Razão Social
- CNPJ
- Email

### 3. Julia Mostra o Resumo

```
📋 **Dados Extraídos:**

👤 **Cliente:**
• Nome: mayara arisa pereira dos santos
• CPF: 35024877829
• Endereço: RUA MANUEL RIBEIRO ROSA, 57 JARDIM CIDADE...

⚖️ **Após criar o cliente, vou criar o processo:**
• Número: ATOrd 1001796-55.2023.5.02.0023
• Vara: 23ª Vara do Trabalho de São Paulo
• Valor: R$ 82639.67

✅ Posso criar o cliente com esses dados?
```

### 4. Você Confirma

Digite: **"Sim, pode prosseguir!"** ou apenas **"Sim"**

### 5. Julia Cria TUDO Automaticamente

1. ✅ Cria o cliente com CPF e endereço
2. ⏳ Aguarda 1 segundo
3. 🔄 Mostra: "Agora vou criar o processo..."
4. ✅ Cria o processo vinculado ao cliente
5. 🎉 "Cliente e Processo criados com sucesso!"

---

## 🔍 Detecção Inteligente

Julia detecta automaticamente quando você cola:

✓ Textos com "Número do Processo"
✓ Textos com "Polo Ativo" ou "Reclamante"
✓ Textos com "CPF:" ou "CNPJ:"
✓ Textos com "Órgão Julgador"
✓ Textos longos (>200 caracteres) com estrutura jurídica

---

## 🛠️ Comandos Manuais (Se Preferir)

### Criar Cliente Manualmente
```
"Criar cliente João Silva com CPF 123.456.789-00"
```

### Criar Processo Manualmente
```
"Criar processo 1234567-89.2023 para cliente João Silva"
```

### Continuar Após Criar Cliente
Se Julia não criou o processo automaticamente, digite:
```
"Crie um processo também"
```

Julia vai usar os dados que já foram extraídos anteriormente!

---

## 🐛 Troubleshooting

### ❌ Julia não detectou os dados
**Motivo:** Texto muito curto ou sem palavras-chave

**Solução:** 
- Cole o texto completo (não apenas o nome)
- Inclua pelo menos "Número do Processo" ou "Polo Ativo"
- Verifique se tem mais de 200 caracteres

### ❌ Criou cliente mas não criou processo
**Motivo:** Processo já existe ou erro no banco

**Solução:**
1. Verifique o console do navegador (F12)
2. Digite: "crie um processo também"
3. Julia vai usar os dados salvos na memória

### ❌ CPF não foi salvo
**Motivo:** Campo CPF não existe na tabela

**Solução:**
Execute o arquivo `ADICIONAR_CAMPOS_CLIENTES.sql` no Supabase

---

## 💡 Dicas de Uso

### ✅ Boas Práticas

1. **Cole o texto original** do processo
2. **Não edite** os dados antes de colar
3. **Confirme sempre** quando Julia pedir
4. **Aguarde** a criação completa (cliente + processo)

### ⚡ Atalhos

- "Sim" = Confirmar ação
- "Não" ou "Cancele" = Cancelar
- "Ajuda" = Ver todos os comandos
- "crie um processo também" = Criar processo com dados salvos

---

## 📊 Exemplos Reais

### Exemplo 1: Processo Trabalhista Completo
```
[COLE AQUI O TEXTO DO PJE]
↓
Julia extrai tudo
↓
Você confirma
↓
Cliente + Processo criados! ✅
```

### Exemplo 2: Criar Apenas Cliente
```
"Criar cliente Maria Santos"
↓
Julia pede mais informações
↓
Você fornece CPF, endereço, etc.
↓
Cliente criado! ✅
```

### Exemplo 3: Buscar Processo Existente
```
"Buscar processo 1234567-89"
↓
Julia busca no banco
↓
Mostra resultados 📋
```

---

## 🎯 Resultado Final

Após seguir o fluxo automático, você terá:

✅ Cliente cadastrado com:
- Nome completo
- CPF
- Endereço completo
- Vinculado ao seu escritório

✅ Processo cadastrado com:
- Número único
- Vinculado ao cliente
- Vara/Tribunal
- Tipo (Trabalhista, Cível, etc.)
- Valor da causa
- Status "Ativo"
- Vinculado ao seu escritório

✅ Pronto para usar no sistema!

---

**💬 Dúvidas?** Digite "ajuda" para Julia mostrar todos os comandos disponíveis!
