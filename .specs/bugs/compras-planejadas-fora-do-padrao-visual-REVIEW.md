# Review — Bug Compras Planejadas fora do padrão visual

| Status       | Aprovado com ressalvas |
| ------------ | ---------------------- |
| Created      | 2026-09-09             |
| Last Updated | 2026-09-09             |

**Escopo revisado:** correção do bug `compras-planejadas-fora-do-padrao-visual`
**Versão da avaliação:** 1

## Artefatos analisados

- Relatório do bug: `.specs/bugs/compras-planejadas-fora-do-padrao-visual.md`.
- Implementação: `src/pages/ComprasPlanejadas/ComprasPlanejadasPage.vue`, `src/components/ComprasPlanejadas/PainelResumoCompras.vue`, `src/components/ComprasPlanejadas/CompraPlanejadaCard.vue` e `src/helpers/CompraPlanejadaPresentation.mjs`.
- Regressão: `scripts/check-lista-compras-planejadas.mjs`.
- Referências visuais: `src/pages/MetasFinanceiras/MetasFinanceirasPage.vue`, `src/components/MetasFinanceiras/PainelResumoMetas.vue` e `src/pages/CustosFixos/CustosFixosPage.vue`.

## Resumo executivo

A correção removeu os elementos exclusivos que causavam a divergência e
recompôs a tela com o cabeçalho, resumo, filtros, cards e estados usados como
padrão no projeto. O teste de regressão falhou antes em `q-tabs` e passou após
a correção, junto com a suíte, lint, typecheck, build e verificação de diff.
O veredito é **Aprovado com ressalvas** porque o smoke visual autenticado e a
inspeção formal de teclado não puderam ser executados sem credenciais.

## Resultado das verificações obrigatórias

| Verificação                      | Resultado              | Evidência                                                                                                                       |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Reprodução e causa raiz          | Atendida               | Relatório do bug registra a captura, comparação estrutural e H2 confirmada.                                                     |
| Teste de regressão antes         | Atendida               | `npm run test:compras-planejadas` falhou em `assert.doesNotMatch(page, /<q-tabs/)`.                                             |
| Teste de regressão depois        | Atendida               | O mesmo comando passou com busca, markup padronizado, contratos e massa de 500 itens.                                           |
| Requisitos de apresentação       | Atendida estaticamente | Cabeçalho padrão, `PainelResumoCompras`, `q-input`, `q-btn-toggle`, grid e estados Quasar presentes na página.                  |
| Filtragem                        | Atendida               | `filtrarComprasPlanejadas` cobre trim, caixa, correspondência parcial, vazio e nenhum resultado.                                |
| Erros e carregamento             | Atendida estaticamente | `carregarDados`/`carregarComprados` têm flags independentes; `carregarTudo` usa `Promise.all`; retry preserva lista confirmada. |
| API e domínio                    | Atendida               | Nenhum endpoint, DTO, modelo, modal ou regra de permissão foi alterado.                                                         |
| Complexidade ciclomática         | Atendida               | Funções novas/alteradas permanecem abaixo do limite de 10; o helper de filtro possui apenas um ramo condicional.                |
| Complexidade algorítmica         | Atendida               | Filtro O(N), agregados O(N) e ordenação O(N log N); nenhuma chamada de rede ocorre dentro de loops.                             |
| Suíte do projeto                 | Atendida               | `npm test`, `npm run lint`, `npx vue-tsc --noEmit`, `npm run build`, Prettier focado e `git diff --check` passaram.             |
| Smoke visual/teclado autenticado | Não verificado         | A rota local redireciona para login; não foram fornecidas credenciais para a inspeção.                                          |

## Matriz de rastreabilidade

| Critério                      | Código                               | Teste                                     | Evidência                                                      | Status                   |
| ----------------------------- | ------------------------------------ | ----------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| Remover composição divergente | Página de compras e painel de resumo | Assertivas de ausência/presença no script | Regressão verde; `q-tabs`, gradiente e banner antigo removidos | Comprovado               |
| Filtro por nome e status      | Página + helper de apresentação      | Casos de busca no script                  | Trim, caixa, parcial e vazio verificados                       | Comprovado               |
| Cards e estados no padrão     | Card e estados da página             | Assertivas de avatar, separador e estados | Lint/typecheck/build verdes                                    | Comprovado estaticamente |
| Erro parcial e retry          | Flags por lista e `carregarTudo`     | Assertivas estruturais e revisão de fluxo | Dados confirmados permanecem visíveis                          | Comprovado estaticamente |
| Preservar CRUD/permissões     | Handlers existentes e `podeEditar`   | Suíte de compras planejadas               | Contratos, ciclo e permissões aprovados                        | Comprovado               |

## Achados

| ID   | Severidade         | Achado                                                                         | Evidência                                                    | Impacto                                                                                  | Recomendação                                                   | Encaminhamento          |
| ---- | ------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| A-01 | Baixo, operacional | Não houve inspeção autenticada de visual, teclado e muitos cards no navegador. | Proteção da rota redirecionou para `/login` sem credenciais. | Pequeno risco de diferenças de renderização não capturadas por build e análise estática. | Executar smoke visual/teclado autenticado antes da publicação. | Operação/pré-publicação |

## Riscos residuais e ressalvas aceitas

- A correção está validada no código e nos gates locais; a confirmação visual
  autenticada continua necessária antes da publicação.
- O teste estrutural não substitui E2E real nem medição de FPS/memória para
  centenas de cards.

## Veredito

**Veredito:** Aprovado com ressalvas.

**Fundamentação:** não há achado bloqueador ou alto; a causa confirmada foi
removida, a regressão passou e os contratos existentes permanecem cobertos.
A ressalva é exclusivamente operacional e não indica falha conhecida na
implementação.

## Próxima ação

Executar inspeção visual/teclado autenticada e medir a experiência com volume
alto antes da publicação. Não há alteração de código pendente neste review.

## Histórico de revisões anteriores

| Versão | Data       | Veredito               | Resumo                                                                                 |
| ------ | ---------- | ---------------------- | -------------------------------------------------------------------------------------- |
| 1      | 2026-09-09 | Aprovado com ressalvas | Correção estrutural validada por regressão e gates locais; smoke autenticado pendente. |
