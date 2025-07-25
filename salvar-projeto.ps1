# Script para salvar automaticamente o projeto ListaDeMercado
Write-Host "=== SALVAMENTO AUTOMATICO - LISTA DE MERCADO ===" -ForegroundColor Cyan
Write-Host ""

# Verificar status do repositorio
Write-Host "Verificando mudancas..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "Mudancas encontradas:" -ForegroundColor Green
    git status --short
    Write-Host ""
    
    # Adicionar todos os arquivos
    Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
    git add .
    
    # Criar mensagem de commit com timestamp
    $timestamp = Get-Date -Format "dd/MM/yyyy HH:mm"
    $commitMessage = "Atualizacao automatica - $timestamp"
    
    Write-Host "Fazendo commit: $commitMessage" -ForegroundColor Yellow
    git commit -m "$commitMessage"
    
    # Fazer push
    Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCESSO! Projeto salvo no GitHub" -ForegroundColor Green
        Write-Host "Repositorio: https://github.com/JoseEvilanio/ListaDeMercado" -ForegroundColor Cyan
        Write-Host "Commit: $commitMessage" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "ERRO ao enviar para GitHub!" -ForegroundColor Red
        Write-Host "Verifique sua conexao e credenciais." -ForegroundColor Yellow
    }
} else {
    Write-Host "Nenhuma mudanca detectada." -ForegroundColor Blue
    Write-Host "O projeto ja esta atualizado no GitHub." -ForegroundColor Green
    Write-Host "Repositorio: https://github.com/JoseEvilanio/ListaDeMercado" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== PROCESSO CONCLUIDO ===" -ForegroundColor Cyan