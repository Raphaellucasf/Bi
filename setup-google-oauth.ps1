# ========================================
# Script para configurar Google OAuth2
# Execute: .\setup-google-oauth.ps1
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAR GOOGLE OAUTH2" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar se .env já existe
$envPath = ".env"
$envExists = Test-Path $envPath

if ($envExists) {
    Write-Host "✅ Arquivo .env já existe`n" -ForegroundColor Green
    
    # Verificar se já tem VITE_GOOGLE_CLIENT_ID
    $content = Get-Content $envPath -Raw
    if ($content -match "VITE_GOOGLE_CLIENT_ID=(.+)") {
        $currentId = $matches[1].Trim()
        if ($currentId -ne "" -and $currentId -ne "seu-client-id-aqui.apps.googleusercontent.com") {
            Write-Host "⚠️  VITE_GOOGLE_CLIENT_ID já está configurado:" -ForegroundColor Yellow
            Write-Host "   $currentId`n" -ForegroundColor Gray
            
            $overwrite = Read-Host "Deseja substituir? (S/N)"
            if ($overwrite -ne "S" -and $overwrite -ne "s") {
                Write-Host "`n❌ Configuração cancelada" -ForegroundColor Red
                exit
            }
        }
    }
} else {
    Write-Host "📝 Criando arquivo .env...`n" -ForegroundColor Cyan
    Copy-Item ".env.example" $envPath
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PASSO 1: Obter Client ID" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Abra o navegador em:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/apis/credentials`n" -ForegroundColor Cyan

Write-Host "2. Clique em '+ Criar Credenciais' → 'ID do cliente OAuth'`n" -ForegroundColor White

Write-Host "3. Configure:" -ForegroundColor White
Write-Host "   - Tipo: Aplicativo da Web" -ForegroundColor Gray
Write-Host "   - URIs JavaScript: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - URIs Redirecionamento: http://localhost:5173`n" -ForegroundColor Gray

Write-Host "4. Copie o Client ID gerado`n" -ForegroundColor White

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PASSO 2: Inserir Client ID" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$clientId = Read-Host "Cole o Client ID aqui"

if ($clientId -eq "" -or $clientId -eq "SUA_CLIENT_ID_AQUI") {
    Write-Host "`n❌ Client ID inválido!" -ForegroundColor Red
    Write-Host "Execute o script novamente após obter o Client ID." -ForegroundColor Yellow
    exit
}

# Atualizar .env
$envContent = Get-Content $envPath -Raw
if ($envContent -match "VITE_GOOGLE_CLIENT_ID=.*") {
    $envContent = $envContent -replace "VITE_GOOGLE_CLIENT_ID=.*", "VITE_GOOGLE_CLIENT_ID=$clientId"
} else {
    $envContent += "`nVITE_GOOGLE_CLIENT_ID=$clientId"
}
Set-Content $envPath $envContent

Write-Host "`n✅ Client ID configurado com sucesso!" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PASSO 3: Ativar Calendar API" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Acesse:" -ForegroundColor White
Write-Host "   https://console.cloud.google.com/apis/library/calendar-json.googleapis.com`n" -ForegroundColor Cyan

Write-Host "2. Clique em 'Ativar'`n" -ForegroundColor White

$activated = Read-Host "API ativada? (S/N)"

if ($activated -eq "S" -or $activated -eq "s") {
    Write-Host "`n✅ Google Calendar API ativada!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Não esqueça de ativar a API!" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAÇÃO COMPLETA!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📝 Arquivo .env atualizado" -ForegroundColor Green
Write-Host "🔑 Client ID: $clientId`n" -ForegroundColor Gray

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PRÓXIMOS PASSOS" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Reinicie o servidor:" -ForegroundColor White
Write-Host "   npm run dev`n" -ForegroundColor Cyan

Write-Host "2. Vá em: Configurações → Perfil → Notificações" -ForegroundColor White
Write-Host "3. Clique em 'Conectar Google Calendar'`n" -ForegroundColor White

Write-Host "✅ Pronto para usar!`n" -ForegroundColor Green

# Perguntar se deve reiniciar o servidor
$restart = Read-Host "Deseja reiniciar o servidor agora? (S/N)"

if ($restart -eq "S" -or $restart -eq "s") {
    Write-Host "`n🔄 Reiniciando servidor..." -ForegroundColor Cyan
    npm run dev
}
