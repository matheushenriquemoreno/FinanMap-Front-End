# Plano de Implementação — Lista de Compras Planejadas (Front-end)

| Status       | Aprovado   |
|--------------|------------|
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

PRD de referência: `.specs/lista-compras-planejadas/PRODUCT-REQUIREMENTS.md` (Aprovado)

Design técnico: dispensado. Premissas no lugar: a feature seguirá Vue 3, Quasar, TypeScript, roteamento atual, serviços Axios, notificações e `useCompartilhamentoStore`; modelos e serviços serão próprios da feature e o cadastro opcional de despesa reutilizará o fluxo existente. Qualquer necessidade de substituir esses padrões interrompe o plano e retorna para `create-technical-design`.

## Histórico de atualizações

| Data       | Alteração |
|------------|-----------|
| 2026-09-09 | Versão inicial criada a partir do PRD aprovado, incluindo a preservação da despesa ao excluir um item comprado. |
| 2026-09-09 | Gate 3 aprovado pelo solicitante; plano liberado para execução futura pela skill `implement`. |

## Objetivo geral da implementação

Entregar a experiência completa de compras planejadas: navegação, gestão de pendentes, totais, conclusão e histórico, integração opcional com despesas, reversão, exclusão e respeito ao contexto compartilhado.

## Estratégia de execução

A primeira fase prova o caminho mínimo de navegação, consulta e cadastro contra o contrato do back-end. A segunda completa a gestão de pendentes, a terceira fecha o ciclo da compra e a quarta valida compartilhamento, apresentação e volume. Testes automatizados simples serão incrementados na mesma fase do comportamento e complementados por lint, build e validação visual.

Cada fase depende da fase correspondente do plano de back-end estar concluída e aprovada. Cada fase deste plano também passa por `review` antes da seguinte.

## Fases

| #  | Fase | Arquivo | Status |
|----|------|---------|--------|
| 01 | Tracer bullet de navegação e cadastro | [fase-01-tracer-bullet-navegacao-cadastro.md](fases/fase-01-tracer-bullet-navegacao-cadastro.md) | Pendente |
| 02 | Gestão dos itens pendentes | [fase-02-gestao-itens-pendentes.md](fases/fase-02-gestao-itens-pendentes.md) | Pendente |
| 03 | Ciclo da compra e despesa | [fase-03-ciclo-compra-despesa.md](fases/fase-03-ciclo-compra-despesa.md) | Pendente |
| 04 | Compartilhamento, apresentação e volume | [fase-04-compartilhamento-apresentacao-volume.md](fases/fase-04-compartilhamento-apresentacao-volume.md) | Pendente |

## Dependências e ordem entre as fases

1. A Fase 01 depende do contrato aprovado da Fase 01 do back-end.
2. A Fase 02 depende da Fase 01 deste plano e das operações de atualização/exclusão da Fase 02 do back-end.
3. A Fase 03 depende das Fases 01 e 02 e do ciclo de compra/despesa da Fase 03 do back-end.
4. A Fase 04 depende de todos os fluxos anteriores e da autorização final validada na Fase 04 do back-end.

Não há ciclos; o back-end sempre disponibiliza e documenta o contrato antes do consumidor equivalente.

## Marcos de entrega

- Marco 1 — Fase 01 concluída e aprovada: usuário navega, consulta pendentes e cadastra o primeiro item.
- Marco 2 — Fase 02 concluída e aprovada: CRUD de pendentes e estados de erro/vazio estão completos.
- Marco 3 — Fase 03 concluída e aprovada: ciclo completo entre pendente, comprado e despesa está utilizável.
- Marco 4 — Fase 04 concluída e aprovada: permissões, temas, responsividade e centenas de itens estão verificados.

## Cobertura de requisitos

| Requisitos | Tarefas |
|------------|---------|
| `LCP-FE-01`, `LCP-FE-04`, `LCP-FE-05`, `LCP-FE-06` | `T01`–`T05` |
| `LCP-FE-02`, `LCP-FE-03` | `T06`–`T09` |
| `LCP-FE-07`–`LCP-FE-13`, `LCP-FE-15` | `T10`–`T15` |
| `LCP-FE-14` | `T16` |
| `EXPECT-FE-01`, `EXPECT-FE-02`, `EXPECT-FE-05` | `T03`–`T05`, `T08`–`T18` |
| `EXPECT-FE-03` | `T18` |
| `EXPECT-FE-04` | `T05`, `T08`, `T10`, `T12`, `T13` |

## Riscos e verificações gerais

- O contrato é desenvolvido no back-end separado — validar DTOs/OpenAPI antes de iniciar cada integração.
- A interface pode apresentar estado otimista incorreto em falhas — atualizar listas somente após confirmação ou recarregamento confiável.
- O fluxo de despesa existente possui opções além do necessário — reutilizar apenas o comportamento aprovado, sem criar lote, recorrência ou agrupamento para esta feature.
- A troca de contexto compartilhado exige recarga dos dados — verificar que nenhuma lista do proprietário anterior permanece visível.
- Cards com links e ações podem degradar em telas pequenas — validar geometrias mobile/desktop, temas e navegação por teclado.

## Estratégia de reversão

- Rota e item de menu podem ser removidos para desabilitar a entrada da feature sem afetar Mês a Mês.
- Componentes e serviços são isolados na pasta da feature para permitir reversão por fase.
- Despesas já criadas permanecem comuns no Mês a Mês e não devem ser removidas em rollback do front-end.

## Perguntas que bloqueiam a implementação

| Pergunta | Por que bloqueia | Status |
|----------|------------------|--------|
| Nenhuma. | Os fluxos e a regra de preservação da despesa estão definidos; edição direta de comprado está fora desta versão. | Resolvida |
