// Script para testar quais modelos Gemini funcionam
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAWqf2WK1oh0I0dNtwjukNvw5HUcL43zsU';

const modelsToTest = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'models/gemini-pro',
  'models/gemini-1.5-pro',
  'models/gemini-1.5-flash',
];

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const result = await model.generateContent('Diga apenas: OK');
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ ${modelName}: FUNCIONA! (Resposta: ${text.substring(0, 50)})`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message.substring(0, 100)}`);
    return false;
  }
}

async function testAllModels() {
  console.log('🧪 Testando modelos Gemini disponíveis...\n');
  
  for (const modelName of modelsToTest) {
    await testModel(modelName);
  }
  
  console.log('\n✅ Teste concluído!');
}

testAllModels();
