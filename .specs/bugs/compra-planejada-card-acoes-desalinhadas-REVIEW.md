# Review — Card de compra planejada com ações desalinhadas

| Status       | Aprovado   |
| ------------ | ---------- |
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

**Escopo revisado:** correção do bug compra-planejada-card-acoes-desalinhadas

**Versão da avaliação:** 1

## Artefatos analisados

- Relatório do bug: .specs/bugs/compra-planejada-card-acoes-desalinhadas.md.
- Implementação: src/components/ComprasPlanejadas/CompraPlanejadaCard.vue.
- Regressão: scripts/check-lista-compras-planejadas.mjs.
- Referências visuais: src/components/MetasFinanceiras/MetaCard.vue e src/components/CustosFixos/CustoFixoCard.vue.

## Resumo executivo

A revisão rederivou a causa relatada: o container raiz do card era flexível sem orientação vertical, colocando seção, separador e ações na mesma linha. A correção define o fluxo em coluna, separa prioridade, estimativa e ações em blocos legíveis e mantém todos os emits do CRUD. A regressão falhou antes da mudança pelo seletor raiz ausente e passou depois; os testes, lint, tipos e build também passaram.

## Resultado das verificações obrigatórias

| Verificação                      | Resultado | Evidência                                                                                                      |
| -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| Reprodução original e causa raiz | Atendida  | O relatório registra H1 refutada, H2 confirmada; o estilo anterior não tinha flex-direction: column.           |
| Estrutura vertical do card       | Atendida  | CompraPlanejadaCard.vue define display flex e flex-direction: column no seletor raiz.                          |
| Estimativa legível               | Atendida  | O template usa compra-card\_\_estimate e o valor monetário não quebra linha.                                   |
| Ações e permissões               | Atendida  | Excluir, concluir, editar e reverter preservam os emits e a condição podeEditar.                               |
| Regressão                        | Atendida  | npm run test:compras-planejadas falhou antes e passou depois.                                                  |
| Qualidade                        | Atendida  | npm test, npm run lint, npx vue-tsc --noEmit, npm run build, npx prettier --check e git diff --check passaram. |
| Complexidade ciclomática         | Atendida  | Não há função nova; a única computada alterada removeu o campo slug e permanece com complexidade 1.            |
| Complexidade algorítmica         | Atendida  | O escopo altera apenas markup, estilos e asserções estáticas; não introduz coleção crescente, I/O ou laço.     |
| Segurança, dados e contratos     | Atendida  | Não houve alteração em endpoints, DTOs, serviço, armazenamento ou permissões de domínio.                       |

## Matriz de rastreabilidade

| Requisito                                    | Código                                                              | Teste                                                            | Evidência                                                          | Status     |
| -------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- |
| Conteúdo e ações em blocos verticais         | CompraPlanejadaCard.vue, seletor compra-card                        | check-lista-compras-planejadas.mjs, asserção do seletor          | Falha antes e aprovação depois                                     | Comprovado |
| Estimativa clara e sem quebra do valor       | CompraPlanejadaCard.vue, compra-card**estimate e compra-card**value | check-lista-compras-planejadas.mjs, asserção do bloco            | Valor usa white-space: nowrap e o bloco foi exigido pela regressão | Comprovado |
| Gestão preservada para pendentes e compradas | CompraPlanejadaCard.vue, emits comprar, editar, reverter e excluir  | check-lista-compras-planejadas.mjs, asserções de emits           | Contratos de interação permanecem presentes                        | Comprovado |
| Comportamento em largura compacta            | CompraPlanejadaCard.vue, ação de exclusão visível até 600px         | Inspeção de estilos e árvore de acessibilidade anterior ao build | Sem compressão horizontal dos filhos diretos                       | Comprovado |

## Achados

| ID   | Severidade  | Achado                                                                                         | Evidência                                                                   | Impacto                                                                | Recomendação                                          | Encaminhamento                                        |
| ---- | ----------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| I-01 | Informativo | A API remota retorna 404 para as duas listas de compras planejadas na nova sessão autenticada. | GET /compras-planejadas e GET /compras-planejadas/compradas retornaram 404. | Impede uma segunda inspeção visual com dados reais no ambiente remoto. | Disponibilizar os endpoints no ambiente de validação. | Operação do ambiente/back-end, fora deste bug visual. |

## Riscos residuais e ressalvas

- A regressão funcional e a reprodução do mecanismo visual estão comprovadas. A consulta remota 404 é externa ao escopo e não invalida o card já renderizado antes do reinício do servidor; apenas impede repetir a inspeção com dados reais nesta sessão.

## Veredito

**Veredito:** Aprovado

**Fundamentação:** não há achado bloqueador, alto ou médio na correção. O mecanismo que comprimida as ações foi eliminado no container raiz, a regressão observou a ausência e a presença do mecanismo, os contratos de interação foram preservados e todas as verificações de qualidade passaram.

## Próxima ação

Bug fechado. A disponibilidade dos endpoints no ambiente pode ser tratada separadamente, se necessária.

## Histórico de revisões anteriores

| Versão | Data       | Veredito | Resumo                                                                   |
| ------ | ---------- | -------- | ------------------------------------------------------------------------ |
| 1      | 2026-09-09 | Aprovado | Fluxo vertical, estimativa e ações validados sem alteração de contratos. |
