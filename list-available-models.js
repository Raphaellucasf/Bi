// Listar modelos disponíveis na API do Gemini
const API_KEY = 'AIzaSyAWqf2WK1oh0I0dNtwjukNvw5HUcL43zsU';

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    console.log('🎯 Modelos disponíveis:');
    console.log('');
    
    if (data.models) {
      data.models.forEach(model => {
        console.log(`✅ ${model.name}`);
        console.log(`   Suporta: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum modelo encontrado');
      console.log('Resposta completa:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listModels();
