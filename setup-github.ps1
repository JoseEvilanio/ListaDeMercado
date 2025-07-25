# 🚀 Script Automatizado para Configurar GitHub
# Execute este script no PowerShell para configurar tudo automaticamente

Write-Host "🚀 Configurando Git e GitHub para o projeto Mobile Device Database..." -ForegroundColor Green

# Configurar Git global
Write-Host "⚙️ Configurando Git..." -ForegroundColor Yellow
git config --global user.name "José Evilânio"
git config --global user.email "jose_evilanio@hotmail.com"

# Verificar configuração
Write-Host "✅ Configuração do Git:" -ForegroundColor Green
Write-Host "Nome: $(git config --global user.name)" -ForegroundColor Cyan
Write-Host "Email: $(git config --global user.email)" -ForegroundColor Cyan

# Inicializar repositório se não existir
if (-not (Test-Path ".git")) {
    Write-Host "📁 Inicializando repositório Git..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "📁 Repositório Git já existe" -ForegroundColor Green
}

# Criar .gitignore se não existir
if (-not (Test-Path ".gitignore")) {
    Write-Host "📝 Criando .gitignore..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp

# Supabase
.supabase/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
}

# Adicionar todos os arquivos
Write-Host "📦 Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .

# Fazer commit inicial
Write-Host "💾 Fazendo commit inicial..." -ForegroundColor Yellow
git commit -m "🎉 Initial commit: Mobile Device Database App

✨ Features implemented:
- 🔐 Supabase authentication system
- 📱 Responsive mobile-first design
- 🛒 Shopping list management
- 🎨 Modern UI with glassmorphism effects
- ⚡ Real-time updates
- 🔄 Offline fallback system
- 📊 Advanced debug tools
- 🎯 Complete CRUD operations

🛠️ Tech Stack:
- React + TypeScript
- Tailwind CSS
- Supabase (Backend)
- Vite (Build tool)
- Lucide React (Icons)

👨‍💻 Author: José Evilânio <jose_evilanio@hotmail.com>"

Write-Host "✅ Git configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://github.com" -ForegroundColor White
Write-Host "2. Clique em 'New repository'" -ForegroundColor White
Write-Host "3. Nome: mobile-device-database" -ForegroundColor White
Write-Host "4. Descrição: 📱 Aplicativo web responsivo para gerenciamento de listas de compras com Supabase" -ForegroundColor White
Write-Host "5. Deixe como Public" -ForegroundColor White
Write-Host "6. NÃO marque nenhuma opção adicional" -ForegroundColor White
Write-Host "7. Clique em 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "8. Depois execute estes comandos (substitua SEU_USUARIO):" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/mobile-device-database.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "📚 Consulte o arquivo GITHUB_SETUP_GUIDE.md para instruções detalhadas!" -ForegroundColor Green