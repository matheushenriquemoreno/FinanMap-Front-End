# Documentação - Compartilhamento de Informações Entre Contas

## 📋 Índice

Esta pasta contém a documentação completa dos fluxos de negócio da funcionalidade de compartilhamento de dados entre contas.

### Arquivos de Fluxo

1. [**01-enviar-convite.md**](./01-enviar-convite.md) - Fluxo de envio de convite de compartilhamento
2. [**02-responder-convite.md**](./02-responder-convite.md) - Fluxo de aceitar/recusar convites
3. [**03-trocar-contexto.md**](./03-trocar-contexto.md) - Fluxo de alternar entre dados próprios e compartilhados
4. [**04-validacao-permissoes.md**](./04-validacao-permissoes.md) - Como funciona a validação de permissões
5. [**05-gerenciar-compartilhamentos.md**](./05-gerenciar-compartilhamentos.md) - Atualizar permissões e revogar acessos
6. [**06-modo-leitura.md**](./06-modo-leitura.md) - Como funciona o modo somente leitura

### Arquivos de Referência

- [**arquitetura.md**](./arquitetura.md) - Visão geral da arquitetura
- [**componentes.md**](./componentes.md) - Descrição dos componentes Vue
- [**api-endpoints.md**](./api-endpoints.md) - Documentação dos endpoints da API

## 🎯 Visão Geral

A funcionalidade de compartilhamento permite que um usuário (proprietário) compartilhe seus dados financeiros com outro usuário (convidado), com dois níveis de permissão:

- **Visualizar** (0): O convidado pode apenas ver os dados
- **Editar** (1): O convidado pode ver e modificar os dados

## 🔑 Conceitos Principais

### Estados do Convite

- **Pendente** (0): Convite enviado, aguardando resposta
- **Aceito** (1): Convite aceito, acesso liberado
- **Recusado** (2): Convite recusado, sem acesso

### Contexto de Dados

- **Contexto Próprio**: Usuário visualiza seus próprios dados
- **Contexto Compartilhado**: Usuário visualiza dados de outro usuário (via `X-Proprietario-Id` header)

### Componentes Principais

- **ContextoSelector**: Dropdown + botão de compartilhamento no header (com badge de convites pendentes)
- **CompartilhamentoModal**: Modal de gerenciamento (enviar convites, ver acessos, responder convites pendentes)
- **BannerModoCompartilhado**: Banner indicando visualização de dados compartilhados (inserido nas páginas)
- **CompartilhamentoConfig**: Painel de gerenciamento nas Configurações

## 🚀 Início Rápido

Para entender o fluxo completo, recomendamos ler os arquivos na ordem numérica (01 a 06).

## 📞 Suporte

Para dúvidas sobre a implementação, consulte também:
- [walkthrough.md](../../../.gemini/antigravity/brain/845cacfd-0826-46fc-b400-c5a20daa80d2/walkthrough.md) - Guia de implementação completo
- Código-fonte em `src/stores/compartilhamento-store.ts`
- Código-fonte em `src/services/CompartilhamentoService.ts`
