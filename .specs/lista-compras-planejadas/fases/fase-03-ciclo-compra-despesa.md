# Fase 03 — Ciclo da compra e despesa

| Status       | Concluída   |
|--------------|------------|
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

**Objetivo e resultado esperado:** o usuário conclui uma compra, consulta seu histórico, registra opcionalmente uma despesa, reverte ou exclui o item com as consequências aprovadas.

**Capacidade ou fluxo coberto:** ciclo completo entre pendentes, comprados e Mês a Mês.

**Requisitos relacionados:** `LCP-FE-07`–`LCP-FE-13`, `LCP-FE-15`, `EXPECT-FE-01`, `EXPECT-FE-02`, `EXPECT-FE-04`, `EXPECT-FE-05`.

**Dependências externas:** Fases 01 e 02 deste plano e Fase 03 do back-end concluídas e aprovadas.

## Tarefa T10 — Coletar e confirmar os dados da compra realizada

Adicionar a ação de marcar como comprado e um formulário que exija valor real positivo e data igual ou anterior à atual, preservando os dados em falha.

- **Requisitos relacionados:** `LCP-FE-07`, `EXPECT-FE-01`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de modal Quasar e serviço da feature para a ação de conclusão.
- **Dependências:** `T01`–`T09`, contrato de conclusão do back-end.
- **Parte do sistema afetada:** card de pendente, modal de conclusão, página, modelo e serviço.
- **Testes e verificações:** valor válido/zero; data atual/passada/futura; cancelar; falha; tentativa repetida.
- **Critérios de conclusão:** somente dados válidos são enviados, cancelamento não altera a lista e falha mantém o preenchimento.
- **Riscos ou premissas:** data é apresentada sem deslocamento de fuso que altere o dia escolhido.

## Tarefa T11 — Apresentar a lista e os dados dos comprados

Criar a visualização de comprados e alternância clara entre as listas, exibindo estimativa original, valor real, data e indicação de despesa vinculada.

- **Requisitos relacionados:** `LCP-FE-08`, `LCP-FE-10`, `EXPECT-FE-01`, `EXPECT-FE-02`.
- **Referência ao design:** premissa de componentes próprios da feature e estado confirmado pela consulta do back-end.
- **Dependências:** `T03`, `T10`, consulta de comprados do back-end.
- **Parte do sistema afetada:** página, cards/lista de comprados e serviço.
- **Testes e verificações:** concluir item; alternar listas; recarregar página; vazio de cada lista; diferenças estimado/real.
- **Critérios de conclusão:** item concluído deixa pendentes, aparece em comprados e mostra os três dados aprovados.
- **Riscos ou premissas:** não existe ação de edição direta no comprado.

## Tarefa T12 — Oferecer o registro opcional da despesa

No fluxo de conclusão, permitir seguir sem despesa ou informar mês e categoria para criar uma despesa comum com o valor real previamente preenchido e não editável para um valor divergente.

- **Requisitos relacionados:** `LCP-FE-09`, `EXPECT-FE-01`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de reutilizar componentes e serviços de categoria/despesa estritamente no modo simples, coordenados pelo contrato de conclusão.
- **Dependências:** `T10`, contrato de vínculo da Fase 03 do back-end.
- **Parte do sistema afetada:** modal de conclusão, seletor de categoria/período e serviço da feature.
- **Testes e verificações:** concluir sem despesa; com categoria/mês; categoria inválida; falha; confirmar aparição no Mês a Mês.
- **Critérios de conclusão:** escolha é opcional, valor inicial corresponde ao real e sucesso cria exatamente uma despesa vinculada.
- **Riscos ou premissas:** lote, recorrência, parcelamento e agrupamento não fazem parte deste fluxo.

## Tarefa T13 — Reverter compra com tratamento da despesa vinculada

Adicionar reversão; quando houver despesa, mostrar aviso e exigir escolha explícita entre preservá-la ou excluí-la antes de confirmar.

- **Requisitos relacionados:** `LCP-FE-11`, `LCP-FE-12`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** regra do PRD e contrato de reversão do back-end.
- **Dependências:** `T11`, `T12`.
- **Parte do sistema afetada:** card comprado, diálogo/modal, página e serviço.
- **Testes e verificações:** sem vínculo; preservar; excluir; cancelar; falha; confirmar retorno aos pendentes.
- **Critérios de conclusão:** aviso só aparece quando aplicável, a escolha enviada é inequívoca e a interface reflete a resposta confirmada.
- **Riscos ou premissas:** preservar a despesa remove apenas sua associação visual com o item.

## Tarefa T14 — Excluir comprado sem excluir a despesa

Adicionar exclusão de comprado com confirmação explícita de que eventual despesa permanecerá no Mês a Mês, removendo o card somente após sucesso.

- **Requisitos relacionados:** `LCP-FE-13`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** decisão material registrada no PRD em 2026-09-09.
- **Dependências:** `T11`, contrato de exclusão do back-end.
- **Parte do sistema afetada:** card comprado, diálogo, página e serviço.
- **Testes e verificações:** item sem/com despesa; cancelar; falha; conferir despesa preservada no Mês a Mês.
- **Critérios de conclusão:** texto comunica a preservação, item some somente em sucesso e despesa continua acessível.
- **Riscos ou premissas:** exclusão do item não é reversível.

## Tarefa T15 — Exibir o comparativo agregado dos comprados

Apresentar os totais estimado e real retornados pelo serviço, incluindo estado zero e atualização após concluir, reverter ou excluir.

- **Requisitos relacionados:** `LCP-FE-15`, `EXPECT-FE-01`, `EXPECT-FE-02`.
- **Referência ao design:** premissa de usar o agregado do contrato do back-end como fonte de verdade.
- **Dependências:** `T11`, `T13`, `T14`.
- **Parte do sistema afetada:** resumo da página, modelos e serviço.
- **Testes e verificações:** vazio; valores diferentes; transições; formatação BRL.
- **Critérios de conclusão:** os dois totais coincidem com a resposta atual e não incluem itens que voltaram aos pendentes ou foram excluídos.
- **Riscos ou premissas:** despesa preservada após exclusão não entra mais no comparativo de compras.

## Orientações de implementação

- A conclusão deve ser uma jornada única, mas a despesa permanece opcional.
- Reversão com exclusão de despesa e exclusão do item comprado são ações distintas.
- Não reutilizar opções avançadas do modal de despesa que ampliem o escopo.

## Testes e verificações da fase

- Ampliar `scripts/check-lista-compras-planejadas.mjs` com os fluxos e proteções desta fase.
- `npm test`
- `npm run lint`
- `npm run build`
- Validação manual integrada com back-end e Mês a Mês para todas as escolhas de despesa.

## Critérios de aceitação da fase

1. Conclusão move o item e exibe estimativa, valor real e data.
2. Despesa opcional é criada uma única vez com o valor real.
3. Reversão preserva ou exclui despesa conforme escolha.
4. Exclusão de comprado preserva sempre a despesa.
5. Comparativo acompanha o estado atual dos comprados.
6. Falhas não produzem sucesso visual falso.

## Riscos, premissas e dependências externas da fase

- O contrato da Fase 03 do back-end precisa garantir as diferenças entre concluir, reverter e excluir.
- A validação integrada é obrigatória porque scripts estáticos não comprovam persistência no Mês a Mês.

## Registro de execução

- Implementadas as jornadas de conclusão, compradas, despesa opcional, reversão com escolha explícita e exclusão preservando despesa.
- Totais estimado/real usam o agregado retornado pelo back-end; falhas mantêm modal/lista confirmados.
- Verificação: `npm test`, lint, `vue-tsc` e build aprovados.
- Limitação: Mês a Mês real, persistência e falhas HTTP aguardam smoke autenticado.
