# Sistema de Backup e Restauração

Este diretório contém scripts para backup e restauração do código antes da implementação do Supabase como banco de dados.

## Arquivos

- `backup.bat`: Script para criar um backup do código atual
- `restore.bat`: Script para restaurar o código para a versão anterior à implementação do Supabase
- `backup_info.txt`: Arquivo gerado automaticamente com informações sobre o backup realizado

## Como usar

### Criar um backup

Antes de iniciar a implementação do Supabase, execute o script de backup:

```
.kiro\backup\backup.bat
```

Este script irá:
1. Verificar se há alterações não commitadas e salvá-las
2. Criar uma branch Git específica para backup
3. Salvar informações sobre o backup em `backup_info.txt`

### Restaurar um backup

Se ocorrerem problemas durante a implementação e você precisar reverter para a versão original, execute o script de restauração:

```
.kiro\backup\restore.bat
```

Este script irá:
1. Verificar se o arquivo de informações de backup existe
2. Extrair o nome da branch de backup
3. Verificar se há alterações não commitadas e perguntar se deseja salvá-las
4. Restaurar o código para a branch de backup

## Restauração manual

Você também pode restaurar manualmente o backup usando os comandos Git:

1. Verifique o nome da branch de backup em `backup_info.txt`
2. Execute o comando: `git checkout nome-da-branch-de-backup`

Para voltar à branch principal após verificar o backup:
```
git checkout master
```

## Verificação de integridade

Após a restauração, é recomendável verificar a integridade do código restaurado:

1. Verifique se todos os arquivos necessários estão presentes
2. Execute testes automatizados, se disponíveis
3. Verifique se o aplicativo inicia corretamente