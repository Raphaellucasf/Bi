/**
 * Teste simples para verificar se a API CPFHub está funcionando
 * Execute: node test_cpfhub.js
 */

const CPFHUB_API_KEY = '35e0812df4400a9689307ca25c22c17affe91311da699d73e31cf6d08d9b0c0f';
const CPFHUB_BASE_URL = 'https://cpfhub.io/api';

async function testarCPFHub() {
  try {
    console.log('🔍 Testando integração com CPFHub...');
    
    // CPF de teste (você pode usar um CPF válido para teste)
    const cpfTeste = '12345678901'; // Substitua por um CPF válido para teste real
    
    const response = await fetch(`${CPFHUB_BASE_URL}/consulta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CPFHUB_API_KEY}`
      },
      body: JSON.stringify({
        cpf: cpfTeste
      })
    });

    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ CPF não encontrado (esperado para CPF de teste)');
        return;
      }
      if (response.status === 429) {
        console.log('⚠️ Limite de consultas atingido');
        return;
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API CPFHub está funcionando!');
    console.log('📊 Dados retornados:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao testar CPFHub:', error.message);
  }
}

// Executar teste
testarCPFHub();