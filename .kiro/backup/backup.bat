@echo off
echo ===================================================
echo Criando backup do código antes da implementação do Supabase
echo ===================================================

REM Criar nome da branch com data e hora
set branch_name=backup-supabase

REM Verificar se há alterações não commitadas
git status --porcelain > nul
if %ERRORLEVEL% EQU 0 (
    echo Nenhuma alteração pendente encontrada.
) else (
    echo Existem alterações não commitadas. Salvando alterações...
    git add .
    git commit -m "Backup automático antes da implementação do Supabase"
)

REM Criar branch de backup
echo Criando branch de backup: %branch_name%
git branch %branch_name%
if %ERRORLEVEL% EQU 0 (
    echo Branch de backup criada com sucesso: %branch_name%
    echo Para restaurar este backup, use: git checkout %branch_name%
) else (
    echo Falha ao criar branch de backup.
    exit /b 1
)

REM Criar arquivo de log com informações do backup
echo Criando log de backup...
echo Backup criado em: %date% %time% > .kiro/backup/backup_info.txt
echo Branch de backup: %branch_name% >> .kiro/backup/backup_info.txt
echo. >> .kiro/backup/backup_info.txt
echo Para restaurar este backup, use os seguintes comandos: >> .kiro/backup/backup_info.txt
echo git checkout %branch_name% >> .kiro/backup/backup_info.txt
echo. >> .kiro/backup/backup_info.txt
echo Para voltar à branch principal após verificar o backup: >> .kiro/backup/backup_info.txt
echo git checkout master >> .kiro/backup/backup_info.txt

echo ===================================================
echo Backup concluído com sucesso!
echo Informações do backup salvas em .kiro/backup/backup_info.txt
echo ===================================================