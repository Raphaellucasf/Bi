# Vercel Deployment Configuration
# Este arquivo contém instruções para o deploy no Vercel

## Passos para deploy:

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. O deploy será automático a cada push

## Variáveis de ambiente necessárias:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY  
- VITE_GEMINI_API_KEY

## Build settings:
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: build
- Install Command: npm install

## Domínio personalizado:
Após o deploy, você pode configurar um domínio personalizado no painel do Vercel.