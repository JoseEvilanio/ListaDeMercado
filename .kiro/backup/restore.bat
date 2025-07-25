@echo off
echo ===================================================
echo Restaurando código para versão anterior à implementação do Supabase
echo ===================================================

REM Verificar se o arquivo de informações de backup existe
if not exist .kiro/backup/backup_info.txt (
    echo Arquivo de informações de backup não encontrado.
    echo Não é possível restaurar o backup.
    exit /b 1
)

REM Extrair nome da branch de backup do arquivo de informações
for /f "tokens=3" %%i in ('findstr "Branch de backup:" .kiro/backup/backup_info.txt') do set branch_name=%%i

REM Verificar se a branch existe
git show-ref --verify --quiet refs/heads/%branch_name%
if %ERRORLEVEL% NEQ 0 (
    echo Branch de backup %branch_name% não encontrada.
    echo Não é possível restaurar o backup.
    exit /b 1
)

REM Verificar se há alterações não commitadas
git status --porcelain > nul
if %ERRORLEVEL% NEQ 0 (
    echo Existem alterações não commitadas.
    set /p confirm=Deseja salvar essas alterações antes de restaurar o backup? (S/N): 
    if /i "%confirm%"=="S" (
        set /p commit_msg=Digite uma mensagem para o commit: 
        git add .
        git commit -m "%commit_msg%"
    ) else (
        echo Descartando alterações não commitadas...
        git reset --hard
    )
)

REM Restaurar para a branch de backup
echo Restaurando para a branch de backup: %branch_name%
git checkout %branch_name%
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo Restauração concluída com sucesso!
    echo O código foi restaurado para a versão anterior à implementação do Supabase.
    echo ===================================================
) else (
    echo Falha ao restaurar para a branch de backup.
    exit /b 1
)