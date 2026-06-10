# Context — Custo Fixo Para Despesa

| Field   | Value      |
|---------|------------|
| Author  | @Usuario   |
| Date    | 2026-06-09 |

## Problem Framing

**What is happening today?** O usuario consegue gerenciar custos fixos em uma pagina dedicada, com cadastro, edicao, exclusao, ativacao/inativacao, busca e filtro por status. Quando esta na pagina de custos fixos e quer registrar aquele compromisso no controle mensal como uma despesa, o fluxo visivel hoje exige sair da pagina de custos fixos, ir para o gerenciamento mensal, abrir a aba de despesas e preencher uma nova despesa manualmente.

**Who is affected?** Usuarios que usam custos fixos como compromissos recorrentes e tambem mantem o fechamento mensal em despesas. O contexto mais evidente e o usuario que esta revisando custos fixos e decide materializar um custo especifico no mes corrente ou em outro mes de controle.

**Cost of the status quo.** O fluxo atual aumenta troca de contexto e retrabalho de digitacao. Campos que ja existem no custo fixo, como nome e categoria, precisam ser reinterpretados ou preenchidos novamente no cadastro de despesa. Tambem existe risco de inconsistencia manual entre o custo fixo cadastrado e a despesa registrada no mes.

## Stakeholders & Users

| Stakeholder / User | Role or Context | Pain or Need |
|--------------------|-----------------|--------------|
| Usuario do FinanMap | Pessoa gerenciando compromissos recorrentes na pagina de custos fixos | Quer transformar um compromisso recorrente em uma despesa mensal sem abandonar o contexto atual. |
| Usuario do gerenciamento mensal | Pessoa conferindo despesas do mes em `DespesaPage` | Precisa que a despesa criada a partir de um custo fixo respeite as mesmas opcoes e comportamento do cadastro normal de despesa. |
| Desenvolvedor do front-end | Mantem os fluxos Vue/Quasar de custos fixos e transacoes | Precisa entender como os componentes existentes se relacionam para evitar duplicacao de formulario e regras. |

## Constraints

### Technical
- Componentes separados por dominio: custos fixos usam `src/pages/CustosFixos/CustosFixosPage.vue` e componentes em `src/components/CustosFixos/`; despesas usam `src/pages/GerenciamentoMensal/DespesaPage.vue` e `src/components/Despesa/ModalCreateUpdateDespesa.vue`.
- Cadastro de despesa existente: `ModalCreateUpdateDespesa.vue` ja contempla descricao, valor, categoria, despesa agrupadora e modo de lote para parcelamento/recorrencia fixa.
- Dados de custo fixo: `CustoFixoResult` contem `id`, `nome`, `diaVencimento`, `ativo`, `categoriaId` e `categoriaNome`, mas nao contem valor.
- Dados de despesa: `DespesaCreate` exige `descricao`, `valor`, `categoriaId`, `ano`, `mes` e `idDespesaAgrupadora`.
- Periodo mensal: despesas sao criadas usando `useGerenciamentoMensalStore().mesAtual` no fluxo atual da `DespesaPage`.
- Modo compartilhado: a pagina de custos fixos redireciona para `/` quando `compartilhamentoStore.emModoCompartilhado` esta ativo.

### Legal / Compliance
- None identified.

### Operational
- O projeto usa Vue 3, Quasar, Pinia, TypeScript e Axios.
- A documentacao interna de custos fixos indica estrategia de testes manuais, incluindo responsividade, dark mode, modo compartilhado e fluxo end-to-end.
- O idioma da interface e das mensagens e pt-BR.

### Time / Team
- A documentacao existente aponta desenvolvimento por `@Usuario` como solo developer.

## Prior Art

| Solution / Approach | Source | Key Finding | Applicability |
|---------------------|--------|-------------|---------------|
| Fluxo atual de custos fixos no FinanMap | Internal: `.specs/custos-fixos/IMPLEMENTATION-PLAN.md` e `.specs/custos-fixos/IMPLEMENTATION-STATE.md` | Custos fixos ja foram implementados como pagina dedicada com CRUD, status, opt-out, filtros, responsividade e restricao para modo compartilhado. | High — descreve o estado interno e os limites ja existentes do dominio de custos fixos. |
| Cadastro atual de despesa no FinanMap | Internal: `src/components/Despesa/ModalCreateUpdateDespesa.vue` e `src/pages/GerenciamentoMensal/DespesaPage.vue` | O cadastro de despesa ja concentra opcoes de categoria, agrupadora e lote; a pagina de despesas injeta ano/mes conforme o gerenciamento mensal. | High — e o fluxo citado pelo usuario como referencia para preservar todas as opcoes de cadastro existentes. |
| Monarch Money recurring tracking | https://help.monarch.com/hc/en-us/articles/4890751141908-Tracking-Recurring-Expenses-and-Bills | Recorrencias aparecem como uma area propria, com visualizacao mensal, status de pagamento esperado e itens ativos/cancelados. | Medium — produto similar mostra separacao entre lista recorrente e acompanhamento mensal, mas nao descreve diretamente reaproveitamento de formulario de despesa. |
| Boulevard recurring expense workflow | https://mainstsoftware.zendesk.com/hc/en-us/articles/219237347-Create-Edit-or-Delete-a-Recurring-Expense | Despesas recorrentes podem gerar entradas futuras e entradas ja postadas sao tratadas separadamente da definicao recorrente. | Medium — reforca a diferenca conceitual entre configuracao recorrente e registro financeiro materializado. |

## Codebase Findings

- **`src/pages/CustosFixos/CustosFixosPage.vue`**: pagina dedicada lista custos fixos, abre modais de criar/editar, exclui registros, altera status localmente, filtra por nome/status e bloqueia acesso em modo compartilhado.
- **`src/components/CustosFixos/CustoFixoCard.vue`**: card mostra nome, categoria, dia de vencimento, status ativo/inativo, acao de editar e acao de excluir; nao existe acao relacionada a criar despesa.
- **`src/Model/CustoFixo.ts`**: o modelo de custo fixo nao possui valor; contem dados suficientes para sugerir descricao/nome e categoria em uma despesa.
- **`src/pages/GerenciamentoMensal/DespesaPage.vue`**: a pagina de despesas controla abertura do modal, define edicao/criacao, injeta ano e mes do store no cadastro simples, cria em lote via service, atualiza o acumulado mensal e respeita permissoes de compartilhamento.
- **`src/components/Despesa/ModalCreateUpdateDespesa.vue`**: modal de despesa tem as opcoes existentes de cadastro: descricao, valor, categoria, despesa agrupadora e lancamento em lote com parcelamento ou recorrencia fixa. Em edicao, preenche dados pela prop `transacao`; em criacao, inicia com formulario vazio.
- **`src/services/transacao/DespesaService.ts`**: expõe criacao simples via `create` herdado de `TransacaoServiceBase` e criacao em lote via `criarEmLote`.
- **`src/stores/GerenciamentoMensal-store.ts`**: o periodo mensal global vem de `mesAtual`, inicializado com data atual, e e usado pela pagina de despesas.
- **`src/router/routes.ts`**: custos fixos ficam em `/custos-fixos`; despesas ficam dentro do fluxo raiz de gerenciamento mensal, com rota filha `Despesas`.

## External References

| Reference | URL | Key Finding |
|-----------|-----|-------------|
| Monarch Money — Tracking Recurring Expenses and Bills | https://help.monarch.com/hc/en-us/articles/4890751141908-Tracking-Recurring-Expenses-and-Bills | Descreve recorrencias como itens acompanhados mensalmente, com estados de pagamento e separacao entre itens ativos/cancelados. |
| Boulevard — Create, Edit or Delete a Recurring Expense | https://mainstsoftware.zendesk.com/hc/en-us/articles/219237347-Create-Edit-or-Delete-a-Recurring-Expense | Diferencia a definicao de despesa recorrente das entradas efetivamente postadas, incluindo edicao/exclusao de entradas futuras ou ja adicionadas. |

## Open Questions

| Question | Why It Matters | Owner | Status |
|----------|---------------|-------|--------|
| Ao cadastrar despesa a partir de um custo fixo, qual periodo mensal deve ser usado quando o usuario esta na pagina de custos fixos? | A pagina de custos fixos hoje nao possui seletor de mes/ano, enquanto o cadastro de despesa atual depende de `mesAtual`. | @Usuario | Open |
| Como o valor da despesa deve ser definido se o custo fixo nao possui campo de valor? | O modal de despesa exige valor, mas `CustoFixoResult` nao fornece esse dado para pre-preenchimento. | @Usuario | Open |
| A despesa criada deve manter algum vinculo persistente com o custo fixo de origem? | Sem vinculo, a criacao e apenas uma copia assistida; com vinculo, pode exigir contrato de API/modelo e impacto em historico. | @Usuario | Open |
| Custos fixos inativos podem ser materializados como despesa? | O card permite distinguir ativo/inativo, mas ainda nao ha regra registrada sobre acoes permitidas por status. | @Usuario | Open |
| O fluxo deve permitir criacao simples, lote, agrupadora e todas as opcoes atuais do modal de despesa a partir da pagina de custos fixos? | O usuario mencionou "todas as opcoes de cadastro existente na despesa", mas e preciso confirmar se isso inclui lote e agrupadora no mesmo comportamento atual. | @Usuario | Open |
