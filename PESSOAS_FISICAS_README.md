# Configuração de Pessoas Físicas como Partes Contrárias

## Alterações Realizadas

### 1. Atualização da Chave API do CPFHub
- Nova chave: `616dba7bb9ba1ad271f17ab8ddbbfe99fa3e5a7b24a99ddea86cbe69e1451ba6`
- Arquivo: `src/services/cpfHubService.js`

### 2. Estrutura de Banco de Dados

#### Tabela `pessoas_fisicas`
Armazena dados de pessoas físicas (partes contrárias com CPF):
- `id` (UUID, PK)
- `cpf` (VARCHAR(14), UNIQUE) - CPF com máscara
- `nome_completo` (VARCHAR(255))
- `endereco_rfb` (TEXT)
- `endereco_trabalho` (TEXT)
- `advogado` (VARCHAR(255))
- `oab` (VARCHAR(50))
- `telefone` (VARCHAR(20))
- `email` (VARCHAR(255))
- `observacoes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### Tabela `processos_pessoas_fisicas`
Relacionamento N:N entre processos e pessoas físicas:
- `id` (UUID, PK)
- `processo_id` (UUID, FK → processos)
- `pessoa_fisica_id` (UUID, FK → pessoas_fisicas)
- `created_at` (TIMESTAMP)

### 3. Fluxo de Busca de CPF

O sistema agora segue este fluxo otimizado:

1. **Busca no Supabase** (cache local)
   - Verifica se o CPF já foi consultado anteriormente
   - Retorna dados salvos instantaneamente
   
2. **Busca no CPFHub** (apenas se não encontrado)
   - Consulta a API externa do CPFHub
   - Economiza chamadas à API (limite de 50/mês)
   
3. **Salvamento Automático**
   - Dados obtidos do CPFHub são salvos no Supabase
   - Futuras consultas do mesmo CPF serão instantâneas

### 4. Funcionalidades Implementadas

#### Modal de Novo Processo - Etapa 2

**Seleção de Tipo de Parte:**
- ☑️ Pessoa Jurídica (CNPJ)
- ☑️ Pessoa Física (CPF)

**Formulário para CPF:**
- Campo CPF com máscara (000.000.000-00)
- Busca automática ao preencher 11 dígitos
- Preenchimento automático de dados:
  - Nome Completo
  - Endereço
  - Telefone
  - Email
  - Observações (ex: nome da mãe)

**Gerenciamento de Partes:**
- ✅ Adicionar múltiplas partes (CNPJ ou CPF)
- ✅ Visualizar partes adicionadas como chips
- ✅ Remover partes com botão "×"

## Instruções de Configuração

### Passo 1: Executar Scripts SQL no Supabase

Execute os seguintes arquivos SQL no Supabase (na ordem):

1. `create_pessoas_fisicas_table.sql`
   - Cria a tabela de pessoas físicas
   
2. `create_processos_pessoas_fisicas_table.sql`
   - Cria a tabela de relacionamento

### Passo 2: Configurar Políticas RLS (Row Level Security)

```sql
-- Habilitar RLS nas novas tabelas
ALTER TABLE pessoas_fisicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos_pessoas_fisicas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (ajuste conforme necessário)
-- Exemplo: permitir leitura e escrita para usuários autenticados

CREATE POLICY "Permitir leitura para usuários autenticados"
ON pessoas_fisicas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON pessoas_fisicas FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON pessoas_fisicas FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Permitir leitura para usuários autenticados"
ON processos_pessoas_fisicas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON processos_pessoas_fisicas FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir exclusão para usuários autenticados"
ON processos_pessoas_fisicas FOR DELETE
TO authenticated
USING (true);
```

### Passo 3: Verificar Funcionamento

1. Acesse o modal de "Novo Processo"
2. Avance para a Etapa 2 (Adicionar Parte Contrária)
3. Selecione "Pessoa Física (CPF)"
4. Digite um CPF válido (ex: 230.772.918-60)
5. Aguarde o preenchimento automático dos dados
6. Adicione a parte e salve o processo

### Passo 4: Atualizar Código de Salvamento do Processo

Certifique-se de que o código que salva o processo também salva as relações com pessoas físicas:

```javascript
// Exemplo de como salvar as relações
for (const parte of partesContrarias) {
  if (parte.tipo === 'cpf') {
    // Buscar ou criar pessoa física
    let { data: pessoaFisica } = await supabase
      .from('pessoas_fisicas')
      .select('id')
      .eq('cpf', parte.cpf)
      .single();
    
    if (!pessoaFisica) {
      const { data: novaPessoa } = await supabase
        .from('pessoas_fisicas')
        .insert([{
          cpf: parte.cpf,
          nome_completo: parte.nomeCompleto,
          endereco_rfb: parte.enderecoRfb,
          endereco_trabalho: parte.enderecoTrabalho,
          advogado: parte.advogado,
          oab: parte.oab,
          telefone: parte.telefone,
          email: parte.email,
          observacoes: parte.observacoes
        }])
        .select()
        .single();
      pessoaFisica = novaPessoa;
    }
    
    // Criar relacionamento
    await supabase
      .from('processos_pessoas_fisicas')
      .insert([{
        processo_id: processoId,
        pessoa_fisica_id: pessoaFisica.id
      }]);
  } else {
    // Lógica existente para empresas (CNPJ)
    // ...
  }
}
```

## Benefícios

1. **Economia de API**: Consultas repetidas ao mesmo CPF usam cache local
2. **Performance**: Busca no Supabase é instantânea
3. **Histórico**: Mantém registro de todas as pessoas físicas consultadas
4. **Flexibilidade**: Aceita tanto CNPJ quanto CPF como partes contrárias
5. **UX Melhorada**: Preenchimento automático de dados

## Observações

- Limite do CPFHub: 50 consultas gratuitas por mês
- Dados são salvos automaticamente no Supabase após primeira consulta
- CPF deve ter 11 dígitos válidos para busca
- Validação de CPF é feita antes de consultar a API
