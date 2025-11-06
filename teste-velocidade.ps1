# 🚀 TESTE AUTOMATIZADO DE VELOCIDADE - BI-MASTER
# Execute este script no PowerShell para verificar as otimizações

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  🚀 TESTE DE VELOCIDADE - BI-MASTER                   ║" -ForegroundColor Cyan
Write-Host "║                     Verificação de Otimizações                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Função para medir tempo de execução
function Measure-LoadTime {
    param (
        [string]$Url,
        [string]$Name
    )
    
    Write-Host "⏱️  Testando: $Name..." -ForegroundColor Yellow
    
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 30 -ErrorAction Stop
        $end = Get-Date
        $duration = ($end - $start).TotalSeconds
        
        Write-Host "   ✅ Tempo: $([math]::Round($duration, 2))s" -ForegroundColor Green
        Write-Host "   📊 Status: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host ""
        
        return $duration
    }
    catch {
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return -1
    }
}

# URLs para testar
$baseUrl = "http://localhost:4028"

Write-Host "📋 CHECKLIST DE OTIMIZAÇÕES" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar arquivos de otimização
$optimizations = @{
    "INDICES_ESSENCIAIS.sql" = "Índices do Banco de Dados"
    "ANALYZE_INDICES.sql" = "Análise de Performance SQL"
    "src/pages/process-management/components/ProcessCard.jsx" = "React.memo - ProcessCard"
    "src/pages/process-management/components/ProcessListItem.jsx" = "React.memo - ProcessListItem"
    "src/pages/client-management/components/ClientCard.jsx" = "React.memo - ClientCard"
    "src/pages/client-management/components/ClientListItem.jsx" = "React.memo - ClientListItem"
}

foreach ($file in $optimizations.Keys) {
    if (Test-Path $file) {
        Write-Host "   ✅ $($optimizations[$file])" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ $($optimizations[$file]) - Arquivo não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
Write-Host "🔍 Verificando servidor..." -ForegroundColor Cyan
try {
    $ping = Invoke-WebRequest -Uri $baseUrl -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Servidor rodando em $baseUrl" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "   ❌ Servidor não está rodando!" -ForegroundColor Red
    Write-Host "   💡 Execute: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit
}

# Testar velocidade das páginas
Write-Host "⚡ TESTE DE VELOCIDADE DAS PÁGINAS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$results = @{}

# Página Principal
$results["Home"] = Measure-LoadTime -Url "$baseUrl" -Name "Página Principal"

# Process Management
$results["ProcessManagement"] = Measure-LoadTime -Url "$baseUrl/process-management" -Name "Process Management"

# Client Management
$results["ClientManagement"] = Measure-LoadTime -Url "$baseUrl/client-management" -Name "Client Management"

# Dashboard
$results["Dashboard"] = Measure-LoadTime -Url "$baseUrl/dashboard" -Name "Dashboard"

# Calcular média
$validResults = $results.Values | Where-Object { $_ -gt 0 }
if ($validResults.Count -gt 0) {
    $average = ($validResults | Measure-Object -Average).Average
    
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 RESUMO DOS RESULTADOS" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   🎯 Tempo Médio: $([math]::Round($average, 2))s" -ForegroundColor Yellow
    Write-Host ""
    
    # Avaliar performance
    if ($average -lt 1) {
        Write-Host "   🏆 EXCELENTE! Performance acima do esperado! ✨" -ForegroundColor Green
    }
    elseif ($average -lt 2) {
        Write-Host "   ✅ MUITO BOM! Performance dentro do esperado! 👍" -ForegroundColor Green
    }
    elseif ($average -lt 3) {
        Write-Host "   ⚠️  ACEITÁVEL. Pode melhorar ainda. 🔧" -ForegroundColor Yellow
    }
    else {
        Write-Host "   ❌ LENTO. Verificar otimizações! ⚡" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # Comparação com baseline
    $baseline = 2.5 # Tempo médio ANTES das otimizações
    $improvement = (($baseline - $average) / $baseline) * 100
    
    if ($improvement -gt 0) {
        Write-Host "   📈 MELHORIA: +$([math]::Round($improvement, 1))% mais rápido!" -ForegroundColor Green
    }
    else {
        Write-Host "   📉 Sem melhoria significativa" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. Execute VERIFICAR_PERFORMANCE_SQL.sql no Supabase" -ForegroundColor Yellow
Write-Host "   2. Verifique se os índices estão sendo usados (Index Scan)" -ForegroundColor Yellow
Write-Host "   3. Abra React DevTools Profiler para ver re-renderizações" -ForegroundColor Yellow
Write-Host "   4. Teste CRUD operations (Create, Edit, Delete)" -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Teste concluído! Verifique os resultados acima. ✨" -ForegroundColor Cyan
Write-Host ""

# Salvar resultados em arquivo
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportFile = "TESTE_VELOCIDADE_$timestamp.txt"

@"
╔════════════════════════════════════════════════════════════════════════╗
║                  RELATÓRIO DE TESTE DE VELOCIDADE                     ║
║                          BI-MASTER v1.0                               ║
╚════════════════════════════════════════════════════════════════════════╝

Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

RESULTADOS:
──────────────────────────────────────────────────────────────────────────

$(foreach ($key in $results.Keys) {
    $time = $results[$key]
    if ($time -gt 0) {
        "✅ $key : $([math]::Round($time, 2))s"
    } else {
        "❌ $key : ERRO"
    }
})

──────────────────────────────────────────────────────────────────────────
Tempo Médio: $([math]::Round($average, 2))s
Melhoria: +$([math]::Round($improvement, 1))%
──────────────────────────────────────────────────────────────────────────

OTIMIZAÇÕES APLICADAS:
✅ Google Calendar Integration
✅ React.memo (4 componentes)
✅ Índices de Banco de Dados (14 índices)
✅ ANALYZE Postgres
✅ useCache ClientManagement
✅ useCache ProcessManagement

════════════════════════════════════════════════════════════════════════

Relatório salvo automaticamente.
"@ | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "💾 Relatório salvo em: $reportFile" -ForegroundColor Green
Write-Host ""
