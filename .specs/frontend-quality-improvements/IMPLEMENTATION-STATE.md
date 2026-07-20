# Implementation State: frontend-quality-improvements

## Phase 1 -- Acessibilidade, responsividade e sessão

- [x] Task 1: adicionar regressão automatizada para os gaps da fase
- [x] Task 2: corrigir nomes acessíveis e operação por teclado
- [x] Task 3: corrigir zoom, responsividade e redirecionamento hash
- [x] Task 4: validar, revisar e reauditar a rodada

**Status da fase**: concluída e versionada no commit `152eb8b`.

## Phase 2 -- Performance de carregamento e dashboard

- [x] Task 1: remover ApexCharts do boot global
- [x] Task 2: deduplicar dados do dashboard
- [x] Task 3: otimizar o logo de autenticação
- [x] Task 4: validar, revisar, reauditar e versionar a rodada

**Status da fase**: concluída; validação independente final em PASS após corrigir cache multiperíodo, deduplicação inicial/lazy, reidratação de snapshots e navegação A → B pendente → A.

## Phase 3 -- Arquitetura, testes e configuração

- [ ] Task 1: consolidar ambiente e cliente HTTP
- [ ] Task 2: fortalecer tipagem e lint
- [ ] Task 3: implantar testes de comportamento
- [ ] Task 4: reduzir componentes com responsabilidades misturadas
- [ ] Task 5: validar, revisar, reauditar e versionar a rodada

## Phase 4 -- Design System e CSS

- [ ] Task 1: centralizar tokens e cards de dashboard
- [ ] Task 2: reduzir estilos inline e overrides frágeis
- [ ] Task 3: validar, revisar, reauditar e versionar a rodada
