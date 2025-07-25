# Script para configurar o repositorio ListaDeMercado
Write-Host "Configurando repositorio ListaDeMercado..." -ForegroundColor Green

# Remover o repositorio remoto atual
Write-Host "Removendo repositorio remoto antigo..." -ForegroundColor Yellow
git remote remove origin

# Adicionar o novo repositorio
Write-Host "Configurando novo repositorio: ListaDeMercado" -ForegroundColor Yellow
git remote add origin https://github.com/JoseEvilanio/ListaDeMercado.git

# Verificar se o repositorio foi configurado
$remote = git remote get-url origin
Write-Host "Novo repositorio configurado: $remote" -ForegroundColor Green

# Fazer push inicial
Write-Host "Fazendo push inicial para o repositorio..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Repositorio ListaDeMercado configurado com sucesso!" -ForegroundColor Green
    Write-Host "Acesse em: https://github.com/JoseEvilanio/ListaDeMercado" -ForegroundColor Cyan
} else {
    Write-Host "Erro ao fazer push. O repositorio pode nao existir no GitHub." -ForegroundColor Red
    Write-Host "Crie o repositorio em: https://github.com/new" -ForegroundColor Yellow
    Write-Host "Nome do repositorio: ListaDeMercado" -ForegroundColor White
}

Write-Host "Configuracao concluida!" -ForegroundColor Green