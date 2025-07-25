# Script para salvar automaticamente o projeto ListaDeMercado no Git
Write-Host "Iniciando processo de salvamento automatico..." -ForegroundColor Green

# Verificar se ha mudancas para commitar
$status = git status --porcelain
if ($status) {
    Write-Host "Mudancas detectadas, fazendo commit..." -ForegroundColor Yellow
    
    # Adicionar todos os arquivos
    git add .
    
    # Fazer commit com timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto-save: Atualizacao do projeto ListaDeMercado - $timestamp"
    
    Write-Host "Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Nenhuma mudanca detectada para commit." -ForegroundColor Blue
}

# Verificar se o repositorio remoto esta configurado
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "Repositorio remoto encontrado: $remote" -ForegroundColor Cyan
    
    # Fazer push para o repositorio
    Write-Host "Enviando mudancas para o GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Projeto salvo com sucesso no GitHub!" -ForegroundColor Green
        Write-Host "Acesse em: $remote" -ForegroundColor Cyan
    } else {
        Write-Host "Erro ao fazer push. Verifique suas credenciais." -ForegroundColor Red
    }
} else {
    Write-Host "Repositorio remoto nao configurado." -ForegroundColor Yellow
    Write-Host "Para configurar, execute:" -ForegroundColor White
    Write-Host "git remote add origin https://github.com/SEU_USUARIO/ListaDeMercado.git" -ForegroundColor Gray
}

Write-Host "Processo concluido!" -ForegroundColor Green