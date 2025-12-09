# 🔑 Como Obter API Key do Claude (Anthropic)

## Por que Claude?

Claude é considerada a **IA mais inteligente disponível** atualmente:
- ✅ Melhor que GPT-4 em muitos benchmarks
- ✅ Excelente em português
- ✅ Mais contextual e precisa
- ✅ $5 de crédito GRÁTIS ao criar conta
- ✅ Limites muito generosos

## 📝 Passo a Passo

### 1. Criar Conta
1. Acesse: https://console.anthropic.com/
2. Clique em **"Sign Up"**
3. Use seu email (pode ser Gmail)
4. Confirme o email

### 2. Gerar API Key
1. Após login, vá em **"API Keys"** no menu lateral
2. Clique em **"Create Key"**
3. Dê um nome (ex: "Meritus Julia")
4. Clique em **"Create"**
5. **COPIE a chave imediatamente** (não será mostrada novamente!)

### 3. Configurar no Meritus
1. Abra o arquivo `.env` na raiz do projeto
2. Encontre a linha:
   ```
   VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here
   ```
3. Substitua por:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-SUA_CHAVE_AQUI
   ```
4. Salve o arquivo
5. **Reinicie o servidor**: `Ctrl+C` e depois `npm run dev`

## 💰 Custos

### Plano Gratuito:
- **$5 de crédito inicial** 🎉
- ~20.000 mensagens (dependendo do tamanho)
- Válido por 1 mês

### Preços após crédito:
- **Claude 3.5 Sonnet**: $0.003 por 1.000 tokens (~750 palavras)
- Para uso normal: ~$0.01 por conversa
- Para 1000 conversas: ~$10

### Comparação:
```
Julia com Claude: ~$0.01 por sessão
Julia com Gemini: Grátis (limites)
Julia Local: Grátis (sempre)
```

## 🎯 Sistema Híbrido Recomendado

### Configuração Ideal:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-... (sua chave real)
VITE_GEMINI_API_KEY=AIza... (já configurada)
```

### Como Funciona:
1. **Conversas complexas** → Claude (melhor qualidade)
2. **Claude com limite** → Gemini (backup)
3. **Gemini com limite** → Modo Local (sempre funciona)

**Resultado: Julia sempre funciona! 🎉**

## 🔒 Segurança

### ⚠️ NUNCA faça:
- ❌ Comite a API key no Git
- ❌ Compartilhe a key publicamente
- ❌ Cole em sites desconhecidos

### ✅ Sempre:
- ✅ Mantenha a key no `.env`
- ✅ Adicione `.env` no `.gitignore`
- ✅ Regenere se vazar

## 📊 Monitorar Uso

### No Console Anthropic:
1. Acesse: https://console.anthropic.com/settings/usage
2. Veja:
   - Créditos restantes
   - Tokens usados
   - Custo por dia

### No Código:
```javascript
// Console do navegador
console.log('Memória:', juliaService.conversationMemory.length);
console.log('Última IA:', juliaService.activeAI);
```

## 🎮 Testando

Após configurar:

1. **Recarregue a página** (F5)
2. **Abra Julia**
3. **Veja no console**:
   ```
   🔄 Inicializando Julia AI (Multi-IA)...
   ✅ Claude AI inicializada (Prioridade 1)
   🎯 Julia usando: CLAUDE
   ```
4. **Envie mensagem**:
   ```
   Você: "Olá Julia"
   [Console]: 🟣 Tentando Claude...
   [Console]: ✅ Claude respondeu
   Julia: "Olá! Como posso ajudar?"
   ```

## 🚨 Troubleshooting

### Erro: "API key not valid"
```
Solução: Verifique se copiou a chave completa
Deve começar com: sk-ant-api03-
```

### Erro: "dangerouslyAllowBrowser"
```
Solução: Já configurado! Se persistir, atualize @anthropic-ai/sdk
npm install @anthropic-ai/sdk@latest
```

### Claude não inicia
```
1. Verifique .env tem a chave correta
2. Reinicie servidor (Ctrl+C, npm run dev)
3. Limpe cache do navegador (F12 > Application > Clear)
```

### Julia usa Gemini em vez de Claude
```
Solução: Claude teve erro ou não está configurada
Veja console para logs detalhados
```

## 💡 Dicas

1. **Teste Claude primeiro**: Vale a pena pelos $5 grátis
2. **Monitor de uso**: Veja quanto gastou regularmente
3. **Modo Híbrido**: Deixe todas as 3 opções ativas
4. **Produção**: Use apenas Gemini + Local (gratuito)
5. **Desenvolvimento**: Use Claude (melhor qualidade)

## 🎁 Bônus: Créditos Extras

Algumas formas de conseguir mais créditos:

1. **Nova conta**: Novos emails = novos $5
2. **Programa educacional**: Estudantes podem ter descontos
3. **Referral**: Indique amigos (se disponível)

## 📚 Links Úteis

- **Console**: https://console.anthropic.com/
- **Documentação**: https://docs.anthropic.com/
- **Pricing**: https://www.anthropic.com/pricing
- **Status**: https://status.anthropic.com/
- **Discord**: https://discord.gg/anthropic

## ✅ Checklist

- [ ] Conta criada na Anthropic
- [ ] API Key gerada
- [ ] Chave adicionada no `.env`
- [ ] Servidor reiniciado
- [ ] Julia testada e funcionando
- [ ] Console mostra "Claude respondeu"

---

**Pronto! Julia agora usa a IA mais inteligente do mercado! 🚀**

**Tem dúvidas? Pergunte para a própria Julia depois! 😄**
