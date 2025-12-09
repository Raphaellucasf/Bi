# 🔧 Corrigir Erro: "Could not find the 'cpf' column"

## ❌ Problema
Ao tentar criar um cliente com CPF, Julia retorna erro:
```
Could not find the 'cpf' column of 'clientes' in the schema cache
```

## ✅ Solução Rápida

### Passo 1: Acessar Supabase SQL Editor
1. Acesse: https://zodfekamwsidlrjrujmr.supabase.co
2. Faça login
3. Clique em **"SQL Editor"** no menu lateral esquerdo

### Passo 2: Executar Script
1. Abra o arquivo `ADICIONAR_CAMPOS_CLIENTES.sql` (está na raiz do projeto)
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione **Ctrl + Enter**

### Passo 3: Verificar Sucesso
Você deve ver a mensagem:
```
✅ Colunas criadas: 6 de 6
✅ SUCESSO! Todos os campos foram adicionados à tabela clientes
📋 Agora você pode cadastrar clientes com CPF, RG, Data de Nascimento, etc.
```

## 📋 Campos Adicionados

Após executar o script, a tabela `clientes` terá:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| ✅ `nome_completo` | TEXT | Nome completo (já existe) |
| ✅ `email` | TEXT | Email (já existe) |
| ✅ `telefone` | TEXT | Telefone (já existe) |
| ✅ `endereco` | TEXT | Endereço (já existe) |
| **🆕 `cpf`** | VARCHAR(14) | CPF do cliente |
| **🆕 `data_nascimento`** | DATE | Data de nascimento |
| **🆕 `rg`** | VARCHAR(20) | RG do cliente |
| **🆕 `naturalidade`** | VARCHAR(100) | Cidade/UF de nascimento |
| **🆕 `estado_civil`** | VARCHAR(30) | Estado civil |
| **🆕 `profissao`** | VARCHAR(100) | Profissão |

## 🎯 Depois de Executar

1. **Recarregue a página** do sistema (F5)
2. Teste novamente criar o cliente
3. Agora Julia conseguirá salvar o CPF e outros dados!

## 🔍 Se Ainda Não Funcionar

Execute no Supabase SQL Editor:
```sql
-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientes'
ORDER BY ordinal_position;
```

Se não aparecer o CPF na lista, execute novamente o `ADICIONAR_CAMPOS_CLIENTES.sql`.

## 💡 Por Que Isso Aconteceu?

O sistema foi atualizado para suportar mais campos do cliente (CPF, RG, etc.), mas o banco de dados Supabase ainda tem a estrutura antiga. O script SQL adiciona os campos faltantes de forma segura (usando `IF NOT EXISTS`).
