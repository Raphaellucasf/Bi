# 📖 EXEMPLOS DE USO - JULIA AI

## Como usar o sistema completo de petições e cadastros

---

## 1️⃣ REDIGIR PETIÇÕES (Modo Duplo Agente)

### **Cenário 1: Pedir Esboço Primeiro**

**Você:**
```
Preciso de uma petição de cumprimento de sentença para um processo trabalhista. 
O valor da condenação foi R$ 15.000,00 e já se passaram 15 dias do trânsito em julgado.
```

**Julia (Agente Estratégia):**
```markdown
## Esboço Detalhado da Petição de Cumprimento de Sentença

### I. Preâmbulo (Endereçamento e Qualificação das Partes)
- Objetivo: Identificar o processo, as partes e o objeto da petição
- Conteúdo: Cabeçalho com vara, número do processo, exequente, executado, advogado
- Atenção: Usar qualificação completa das partes

### II. Breve Resumo Processual e Fundamentação Fática
- Objetivo: Contextualizar o débito e a fase de execução
- Argumentos Principais:
  • Sentença transitada em julgado há 15 dias
  • Valor líquido e certo: R$ 15.000,00
  • Direito à citação para pagamento voluntário (8 dias)
- Fundamentação Jurídica: Arts. 523, 829, 831 do CPC

### III. Pedido de Citação para Cumprimento Voluntário
- Objetivo: Requerer citação do executado
- Prazo: 8 dias úteis (art. 523, §1º, CPC)
- Multa de 10% (art. 523, §1º, CPC)
- Honorários de 10% (art. 523, §1º, CPC)

### IV. Demonstrativo de Cálculo Atualizado
- Objetivo: Demonstrar valor exequendo com clareza
- Conteúdo: Planilha com principal, juros, correção monetária
- Atenção: Usar índices da Justiça do Trabalho (TR ou IPCA-E)

### V. Pedidos Finais
- Citação do executado
- Fixação de multa e honorários
- Penhora em caso de inadimplemento
- Expedição de certidão de crédito trabalhista

### ESTRATÉGIA GERAL
Esta petição é estratégica porque:
- Inicia a fase executória imediatamente após o trânsito
- Aproveita o prazo de 15 dias para evitar prescrição intercorrente
- Pressiona o devedor com multa de 10% + honorários de 10%
- Demonstra valor líquido para facilitar constrição judicial

**Deseja que eu redija a petição completa agora?**
```

**Você:** "Sim, pode redigir completo"

**Julia (Agente Redator):**
```markdown
# EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA 23ª VARA DO TRABALHO DE MACEIÓ/AL

**PROCESSO Nº:** 1234567-89.2024.5.02.0001

**EXEQUENTE:** JOÃO DA SILVA, brasileiro, solteiro, operário, portador do CPF nº 123.456.789-00, residente e domiciliado na Rua das Flores, nº 100, Bairro Centro, Maceió/AL, CEP 57000-000.

**EXECUTADO:** EMPRESA XYZ LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 12.345.678/0001-99, com sede na Avenida Principal, nº 500, Bairro Industrial, Maceió/AL.

**ADVOGADO:** Dr. Pedro Oliveira, OAB/AL nº 12345

---

## I – BREVE RELATO PROCESSUAL E FUNDAMENTAÇÃO FÁTICA

Excelência,

O EXEQUENTE, por meio de seu advogado signatário, vem, respeitosamente, à presença de Vossa Excelência, com fundamento nos artigos 523, 829 e 831 do Código de Processo Civil, propor a presente **PETIÇÃO DE CUMPRIMENTO DE SENTENÇA** em face do EXECUTADO, pelos fatos e fundamentos jurídicos a seguir expostos.

Trata-se de ação trabalhista julgada procedente em 10 de janeiro de 2024, transitada em julgado em 15 de fevereiro de 2024, conforme certidão de trânsito em julgado anexa aos autos.

A condenação imposta ao EXECUTADO totaliza o valor líquido e certo de **R$ 15.000,00 (quinze mil reais)**, correspondente a verbas rescisórias não pagas, conforme demonstrativo de cálculo que segue anexo.

Decorridos 15 (quinze) dias do trânsito em julgado, o EXECUTADO permanece inerte, não tendo realizado o pagamento voluntário do débito trabalhista.

## II – DO PEDIDO DE CITAÇÃO PARA CUMPRIMENTO VOLUNTÁRIO

Diante do exposto, requer-se a **CITAÇÃO** do EXECUTADO para que, no prazo de **8 (oito) dias úteis**, efetue o pagamento voluntário do valor de **R$ 15.000,00**, devidamente atualizado até a data do efetivo pagamento, sob pena de:

1. **Multa de 10% (dez por cento)** sobre o valor da condenação, nos termos do art. 523, §1º, do CPC;
2. **Honorários advocatícios de 10% (dez por cento)** sobre o valor da condenação, também nos termos do art. 523, §1º, do CPC.

## III – DO DEMONSTRATIVO DE CÁLCULO ATUALIZADO

O valor exequendo foi apurado com base nos seguintes parâmetros:

| Descrição | Valor (R$) |
|-----------|-----------|
| **Principal (Sentença)** | 15.000,00 |
| **Juros (1% a.m. - 15 dias)** | 75,00 |
| **Correção Monetária (TR - 15 dias)** | 120,00 |
| **TOTAL EXEQUENDO** | **15.195,00** |

*Obs.: Valores atualizados até 01/03/2024. Sujeitos a nova atualização até o efetivo pagamento.*

## IV – DOS PEDIDOS FINAIS

Diante do exposto, requer-se a Vossa Excelência:

1. O **RECEBIMENTO** desta petição de cumprimento de sentença;
2. A **CITAÇÃO** do EXECUTADO para pagamento voluntário no prazo de 8 dias, sob pena de multa de 10% e honorários de 10%;
3. Caso não haja pagamento voluntário, a **PENHORA** de bens suficientes à garantia da execução, nos moldes do art. 835 do CPC;
4. A **EXPEDIÇÃO** de certidão de crédito trabalhista, se necessário;
5. A **CONDENAÇÃO** do EXECUTADO ao pagamento das custas processuais e honorários advocatícios devidos.

Nestes termos, pede deferimento.

Maceió/AL, 01 de março de 2024.

__________________________________  
Dr. Pedro Oliveira  
OAB/AL nº 12345  

---

## DOCUMENTOS ANEXADOS
1. Certidão de trânsito em julgado
2. Demonstrativo de cálculo atualizado
3. Procuração (se já não constar dos autos)
```

**[Sistema detecta que começa com # e exibe botão]**

🟦 **📝 Abrir Editor de Petições** ← Clique aqui

---

## 2️⃣ CADASTRAR CLIENTES E PROCESSOS

### **Cenário 2: Colar Dados do PJe**

**Você:** (cola o seguinte texto)
```
PROCESSO: 0000123-45.2024.5.02.0001
VARA: 23ª Vara do Trabalho de Maceió
RECLAMANTE: MARIA SANTOS
CPF: 987.654.321-00
ENDEREÇO: RUA DAS PALMEIRAS, 50, FAROL, MACEIÓ/AL, CEP 57050-000
EMAIL: maria.santos@email.com
TELEFONE: (82) 99999-8888

RECLAMADA: EMPRESA ABC LTDA
CNPJ: 98.765.432/0001-10
```

**Julia:**
```
🔍 Buscando se já temos cadastro de Maria Santos...

❌ Cliente não encontrado no sistema.

📋 **Dados Extraídos:**

👤 **Cliente:**
• Nome: Maria Santos
• CPF: 98765432100
• Endereço: RUA DAS PALMEIRAS, 50, FAROL, MACEIÓ/AL, CEP 57050-000
• Email: maria.santos@email.com
• Telefone: (82) 99999-8888

⚖️ **Processo:**
• Número: 0000123-45.2024.5.02.0001
• Vara: 23ª Vara do Trabalho de Maceió
• Tipo: Trabalhista

✅ Vou criar o cliente e depois o processo. Confirma?

[Botões: ✓ Confirmar | ✗ Cancelar]
```

**Você:** (clica em "✓ Confirmar")

**Julia:**
```
✅ Cliente "Maria Santos" criado com sucesso!
🔄 Agora criando o processo 0000123-45.2024.5.02.0001...
✅ Processo criado com sucesso!

🎉 Cliente e Processo criados com sucesso!
```

---

## 3️⃣ AGENDAR AUDIÊNCIAS E COMPROMISSOS

### **Cenário 3: Criar Audiência**

**Você:**
```
Agendar audiência para o processo 0000123-45.2024.5.02.0001 
no dia 15 de março de 2024 às 14h na sala 5 do TRT
```

**Julia:**
```json
{
  "action": "criarAudiencia",
  "params": {
    "titulo": "Audiência - Processo 0000123-45.2024.5.02.0001",
    "data_andamento": "2024-03-15T14:00:00",
    "processo_id": "uuid-do-processo",
    "descricao": "Audiência de instrução e julgamento",
    "local": "Sala 5 - TRT Maceió"
  }
}
```

**Julia:**
```
✅ Audiência "Audiência - Processo 0000123-45.2024.5.02.0001" 
agendada para 15/03/2024!

📅 Registro criado no sistema e sincronizado com seu calendário.
```

---

### **Cenário 4: Criar Reunião**

**Você:**
```
Marcar reunião com Maria Santos amanhã às 10h
```

**Julia:**
```
✅ Reunião "Reunião com Maria Santos" agendada para 02/03/2024!
```

---

### **Cenário 5: Criar Prazo**

**Você:**
```
Criar prazo de 5 dias para contestação do processo 0000123-45.2024.5.02.0001
```

**Julia:**
```
✅ Prazo "Contestação - Processo 0000123-45.2024.5.02.0001" 
criado para 06/03/2024!

⚠️ Lembre-se: prazo de 5 dias úteis a partir de hoje.
```

---

## 4️⃣ BUSCAR E CONSULTAR

### **Cenário 6: Buscar Cliente**

**Você:**
```
Buscar cliente com CPF 987.654.321-00
```

**Julia:**
```
🔍 Buscando... aguarde um momento.

✅ **Cliente já cadastrado!**

📋 **Maria Santos**
• CPF: 98765432100
• Email: maria.santos@email.com
• Telefone: (82) 99999-8888
• Endereço: RUA DAS PALMEIRAS, 50, FAROL, MACEIÓ/AL, CEP 57050-000
```

---

### **Cenário 7: Listar Processos de Cliente**

**Você:**
```
Quais processos temos da Maria Santos?
```

**Julia:**
```
✅ Encontrei 1 processo(s):

1. **0000123-45.2024.5.02.0001**
   Tipo: Trabalhista
   Status: Ativo
```

---

## 5️⃣ CONVERSA GERAL

### **Cenário 8: Perguntas Jurídicas**

**Você:**
```
O que é prescrição intercorrente?
```

**Julia:**
```
📚 **Prescrição Intercorrente:**

É a prescrição que ocorre durante o curso do processo executivo, 
quando não há movimentação por culpa do exequente por mais de 2 anos 
(art. 921, §4º do CPC).

⚠️ **Atenção:**
• Na Justiça do Trabalho: 2 anos de inércia
• Exequente deve impulsionar o processo constantemente
• Recomendo sempre movimentar o processo a cada 6 meses

💡 **Posso ajudar:**
Quer que eu crie lembretes automáticos para impulsionar seus processos?
```

---

## 🎯 DICAS DE USO

### ✅ **DO:**
- ✅ Cole textos completos do PJe/DataJus - Julia extrai tudo automaticamente
- ✅ Fale naturalmente: "criar reunião amanhã 10h com João"
- ✅ Use atalhos: "buscar CPF 123" ou "processos do João"
- ✅ Peça petições completas: "redigir contestação trabalhista"
- ✅ Confirme sempre antes de executar ações críticas

### ❌ **DON'T:**
- ❌ Não forneça dados incompletos se você tem o texto do processo
- ❌ Não digite informações manualmente se pode colar
- ❌ Não esqueça de revisar petições geradas antes de protocolar
- ❌ Não crie duplicatas - Julia sempre busca antes de criar

---

## 🚀 COMANDOS RÁPIDOS

```
"Redigir petição de..."                → Modo Petições
"Colar dados do processo..."            → Modo Cadastro
"Agendar audiência para..."             → Modo Tarefas
"Buscar cliente CPF..."                 → Busca automática
"Quais processos de [nome]?"            → Consulta processos
"O que é [termo jurídico]?"             → Modo Conversa
```

---

**Aproveite o poder da Julia AI! 🚀**
**Qualquer dúvida, é só perguntar - sou MUITO inteligente! 😉**
