# 🚨 Solução: Erro 429 - Limite de API do Gemini

## O Problema

Você está vendo este erro:
```
429 (Too Many Requests)
[429] Quota exceeded for quota metric 'GenerateContent request' per minute per region
```

**Causa:** O Google Gemini tem limites gratuitos de uso:
- **60 requisições por minuto** (RPM - Requests Per Minute)
- **1.500 requisições por dia** (RPD - Requests Per Day)

## ✅ Soluções Implementadas

### 1. **Modo Fallback Automático** ✨
Julia agora funciona em "modo offline" quando o limite é atingido:
- Respostas pré-programadas para comandos comuns
- Continua ajudando sem usar a API
- Aviso visual no header do chat

### 2. **Detecção Inteligente**
- Sistema detecta erro 429 automaticamente
- Não quebra a experiência do usuário
- Logs detalhados no console

## 🔧 Como Resolver Permanentemente

### Opção 1: Aguardar (Gratuito)
- Aguarde 1 minuto para o limite RPM resetar
- Aguarde até meia-noite (horário Pacific) para RPD resetar
- Julia funcionará normalmente após reset

### Opção 2: Upgrade para API Paga
1. Acesse: https://aistudio.google.com/app/apikey
2. Configure faturamento na sua conta Google Cloud
3. Limites aumentam significativamente:
   - 1.000 RPM
   - 1.500.000 RPD

### Opção 3: Usar Múltiplas API Keys (Avançado)
```javascript
// Implementar rotação de keys
const API_KEYS = [
  'AIzaSy...',
  'AIzaSy...',
  'AIzaSy...'
];
```

## 📊 Monitoramento de Uso

### Ver limites atuais:
1. Acesse: https://console.cloud.google.com/apis/api/generativeai.googleapis.com/quotas
2. Veja uso em tempo real
3. Configure alertas

### No código:
```javascript
// Logs no console mostram:
console.log('📤 Enviando para Gemini:', message);
console.log('📥 Resposta do Gemini:', response);
```

## 🎯 Melhores Práticas

### 1. Cache de Respostas
```javascript
// Armazenar respostas comuns
const cache = new Map();
if (cache.has(userMessage)) {
  return cache.get(userMessage);
}
```

### 2. Debounce
```javascript
// Aguardar usuário parar de digitar
const debounce = setTimeout(() => {
  sendMessage();
}, 500);
```

### 3. Limite de Histórico
```javascript
// Já implementado - mantém apenas 10 mensagens
if (this.chatHistory.length > 10) {
  this.chatHistory = this.chatHistory.slice(-10);
}
```

## 🔍 Diagnóstico

### Teste se a API está funcionando:
```bash
curl https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=SUA_API_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Olá"}]}]}'
```

### Resposta esperada:
- ✅ **200 OK** - API funcionando
- ❌ **429** - Limite atingido (aguarde)
- ❌ **401** - API Key inválida
- ❌ **403** - API não habilitada

## 💡 Status Atual do Sistema

✅ **Julia agora tem:**
- Modo fallback automático
- Detecção de erro 429
- Respostas offline para comandos comuns
- Aviso visual quando em modo offline
- Logs detalhados para debug

## 🆘 Se Continuar com Problemas

### 1. Verifique a API Key:
```bash
# Windows PowerShell
$env:VITE_GEMINI_API_KEY
```

### 2. Limpe o cache do navegador:
- F12 → Application → Clear Storage → Clear site data

### 3. Reinicie o servidor:
- Ctrl+C no terminal
- `npm run dev` novamente

### 4. Teste com conta diferente:
- Crie nova API Key em outra conta Google
- Use para desenvolvimento

## 📚 Links Úteis

- **Console do Google AI**: https://aistudio.google.com/
- **Documentação de Quotas**: https://ai.google.dev/pricing
- **Status da API**: https://status.cloud.google.com/
- **Gemini API Docs**: https://ai.google.dev/docs

## 🎉 Mensagem Final

Não se preocupe! Este é um limite normal da versão gratuita. Julia continuará funcionando em modo offline e você pode:

1. **Aguardar 1 minuto** para o limite resetar
2. **Usar o modo offline** - Julia ainda ajuda!
3. **Fazer upgrade** - Se precisar de mais requisições

O sistema está protegido e não quebrará! 🛡️
