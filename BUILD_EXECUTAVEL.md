# 🚀 Meritus - Guia de Build do Executável

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Windows para gerar executável .exe

## 🔧 Instalação das Dependências

Execute no terminal (PowerShell):

```powershell
npm install
```

Isso instalará:
- `electron` - Framework para criar apps desktop
- `electron-builder` - Ferramenta para gerar executáveis
- `cross-env` - Gerenciar variáveis de ambiente

## 🏗️ Gerar Executável Windows

### Passo 1: Build da Aplicação Web
```powershell
npm run build
```

Isso cria a pasta `dist/` com os arquivos otimizados.

### Passo 2: Gerar o Executável
```powershell
npm run electron:build:win
```

Ou simplesmente:
```powershell
npm run dist
```

## 📦 Resultado

O instalador será criado em:
```
release/
  └── Meritus-Setup-1.0.0.exe
```

### Características do Instalador:
✅ Instalador NSIS completo
✅ Opção de escolher diretório de instalação
✅ Atalho na Área de Trabalho
✅ Atalho no Menu Iniciar
✅ Desinstalador incluído
✅ Tamanho aproximado: 150-200 MB

## 🎮 Comandos Disponíveis

### Desenvolvimento
```powershell
# Rodar app web no navegador
npm start

# Rodar app no Electron (desenvolvimento)
npm run electron:dev
```

### Produção
```powershell
# Build web + executável Windows
npm run electron:build:win

# Build completo
npm run dist
```

## 📐 Configurações do Executável

### Tamanho da Janela
- Tamanho inicial: 1400x900
- Tamanho mínimo: 1024x768

### Recursos
- Menu em português
- Atalhos de teclado (F5, Alt+F4, etc.)
- Ferramentas do desenvolvedor (F12)
- Zoom (Ctrl +/-)
- Tela cheia (F11)

## 🔍 Estrutura de Arquivos

```
meritus/
├── electron.js          # Arquivo principal do Electron
├── package.json         # Configurações do projeto
├── dist/                # Build da aplicação web (após npm run build)
└── release/             # Executáveis gerados (após npm run dist)
    └── Meritus-Setup-1.0.0.exe
```

## 🐛 Troubleshooting

### Erro: "Electron failed to install"
```powershell
npm install electron --save-dev --force
```

### Erro: "Builder failed"
Certifique-se de ter executado o build primeiro:
```powershell
npm run build
npm run electron:build:win
```

### Aplicação não abre
Verifique o console do Electron:
```powershell
npm run electron:dev
```

## 📱 Distribuição

### Para distribuir o app:

1. **Instalador completo**: 
   - Envie `Meritus-Setup-1.0.0.exe`
   - Usuário executa e instala normalmente

2. **Portable** (futuro):
   - Adicione `"portable"` nos targets do electron-builder

3. **Auto-update** (futuro):
   - Configure electron-updater no código

## 🎯 Próximos Passos

- [ ] Adicionar ícone personalizado (.ico)
- [ ] Configurar assinatura digital (certificado)
- [ ] Implementar auto-update
- [ ] Gerar versão portable
- [ ] Build para macOS e Linux

## ✨ Versão Atual

**Meritus v1.0.0**
- Sistema Jurídico Completo
- Sincronização Google Calendar
- Interface Desktop Nativa

---

**Data**: 17/11/2025  
**Status**: ✅ PRONTO PARA BUILD
