# Documentação da API e Serviços

Esta documentação descreve a API e os serviços disponíveis no aplicativo Mobile Device Database.

## Índice

1. [Visão Geral](#visão-geral)
2. [Serviços](#serviços)
3. [Autenticação](#autenticação)
4. [Banco de Dados](#banco-de-dados)
5. [Armazenamento](#armazenamento)
6. [Tempo Real](#tempo-real)
7. [Cache](#cache)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Retry e Operações Offline](#retry-e-operações-offline)
10. [Validação](#validação)

## Visão Geral

O aplicativo Mobile Device Database é construído com React e utiliza o Supabase como backend. A arquitetura é baseada em serviços que encapsulam a lógica de negócios e a comunicação com o Supabase.

Os principais componentes da arquitetura são:

- **Serviços**: Classes que encapsulam a lógica de negócios e a comunicação com o Supabase.
- **Hooks**: Funções que facilitam o uso dos serviços nos componentes React.
- **Componentes**: Elementos de UI reutilizáveis.
- **Páginas**: Componentes que representam as diferentes telas do aplicativo.

## Serviços

Os serviços são classes que encapsulam a lógica de negócios e a comunicação com o Supabase. Cada serviço é responsável por uma área específica do aplicativo.

Para mais detalhes sobre cada serviço, consulte:

- [Serviço de Autenticação](./auth-service.md)
- [Serviço de Banco de Dados](./database-service.md)
- [Serviço de Armazenamento](./storage-service.md)
- [Serviço de Tempo Real](./realtime-service.md)
- [Serviço de Cache](./cache-service.md)
- [Serviço de Tratamento de Erros](./error-service.md)
- [Serviço de Retry](./retry-service.md)
- [Serviço de Validação](./validation-service.md)