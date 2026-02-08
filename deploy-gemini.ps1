# Deploy Gemini Edge Function to Supabase
# Execute este script no PowerShell

Write-Host "🚀 Deploy da Edge Function Gemini AI" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase CLI está instalado
Write-Host "Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host "📦 Instale com: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Supabase CLI instalado: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "Verificando login..." -ForegroundColor Yellow
$projects = supabase projects list 2>&1
if ($projects -match "not logged in") {
    Write-Host "🔐 Fazendo login no Supabase..." -ForegroundColor Yellow
    supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login falhou!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Login confirmado" -ForegroundColor Green
Write-Host ""

# Listar projetos
Write-Host "📋 Seus projetos Supabase:" -ForegroundColor Cyan
supabase projects list
Write-Host ""

# Obter project ID
$projectId = Read-Host "Digite o ID do projeto (ou pressione Enter para usar o linked project)"
Write-Host ""

# Deploy da função
Write-Host "🚀 Fazendo deploy da função gemini-insight..." -ForegroundColor Yellow
if ($projectId) {
    supabase functions deploy gemini-insight --project-ref $projectId
} else {
    supabase functions deploy gemini-insight
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy falhou!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚙️  Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o secret GEMINI_API_KEY:" -ForegroundColor Yellow
Write-Host "   supabase secrets set GEMINI_API_KEY=sua_chave_aqui" -ForegroundColor White
Write-Host ""
Write-Host "2. Obtenha API key do Gemini em:" -ForegroundColor Yellow
Write-Host "   https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host ""
Write-Host "3. Teste a função:" -ForegroundColor Yellow
Write-Host "   supabase functions invoke gemini-insight --data '{\"type\":\"market_insight\",\"prompt\":\"test\"}'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Pronto! O sistema híbrido agora usará Gemini AI!" -ForegroundColor Green
