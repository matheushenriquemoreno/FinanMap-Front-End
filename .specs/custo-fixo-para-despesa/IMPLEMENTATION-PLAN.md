# Implementation Plan — Custo Fixo Para Despesa

| Field        | Value        |
| ------------ | ------------ |
| Tech Lead    | @Usuario     |
| Team         | Solo developer |
| Epic/Ticket  | Custo Fixo Para Despesa |
| Status       | Completed    |
| Created      | 2026-06-09   |
| Last Updated | 2026-06-10   |

## Overview

Implementar a possibilidade de iniciar o cadastro de uma despesa a partir de um custo fixo na pagina de custos fixos. A execucao deve reaproveitar o cadastro de despesa existente, preservando as opcoes ja disponiveis para despesa simples, agrupadora e lote, enquanto preenche automaticamente os dados que o custo fixo ja conhece.

**Technical Design**: Not provided

**Context**: `.specs/custo-fixo-para-despesa/CONTEXT.md`

**Execution assumptions to confirm before implementation**:
- O periodo padrao da nova despesa sera o `mesAtual` do `GerenciamentoMensalStore`.
- O valor continuara sendo preenchido manualmente, pois `CustoFixoResult` nao possui valor.
- A primeira versao nao criara vinculo persistente entre despesa e custo fixo.
- Custos fixos inativos tambem poderao abrir o cadastro, mantendo o comportamento de copia assistida.
- "Todas as opcoes de cadastro existente na despesa" inclui agrupadora e lancamento em lote.

## Implementation Phases

### Phase 1: Tracer Bullet — Abrir Cadastro De Despesa Pelo Card

**Goal**: O usuario consegue clicar em um custo fixo e abrir o modal de cadastro de despesa dentro da propria pagina de custos fixos, com descricao e categoria ja sugeridas.

**Vertical slice**: `CustoFixoCard` emite nova acao, `CustosFixosPage` controla o modal de despesa, `ModalCreateUpdateDespesa` aceita dados iniciais de criacao, e o fluxo visual abre sem criar registro ainda.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFXD-P1-01 | Adicionar uma acao no `CustoFixoCard.vue` para "Cadastrar despesa" com icone adequado, tooltip e emissao de evento com o custo selecionado. | @Usuario | 30min |
| CFXD-P1-02 | Integrar o evento em `CustosFixosPage.vue`, armazenando o custo fixo selecionado e abrindo `ModalCreateUpdateDespesa.vue` em modo criacao. | @Usuario | 45min |
| CFXD-P1-03 | Ajustar `ModalCreateUpdateDespesa.vue` para aceitar dados iniciais opcionais de criacao sem afetar o fluxo atual de despesa. | @Usuario | 1h |
| CFXD-P1-04 | Mapear `custo.nome` para `descricao` e `custo.categoriaId/categoriaNome` para a categoria selecionada inicial. | @Usuario | 45min |
| CFXD-P1-05 | Garantir limpeza correta dos dados iniciais ao fechar o modal ou trocar de custo fixo. | @Usuario | 30min |

**Testing**:

- Manual: abrir pagina de custos fixos, clicar em "Cadastrar despesa", verificar modal aberto com descricao e categoria preenchidas.
- Regressao manual: abrir cadastro normal pela `DespesaPage` e confirmar que continua vazio quando nao ha dados iniciais.
- Responsividade: verificar que a nova acao no card nao quebra layout mobile e desktop.

**Acceptance Criteria**:

- [ ] Card de custo fixo possui acao clara para iniciar cadastro de despesa.
- [ ] Modal de despesa abre na pagina de custos fixos.
- [ ] Descricao inicial vem do nome do custo fixo.
- [ ] Categoria inicial vem do custo fixo quando existir.
- [ ] Cadastro normal de despesa continua funcionando como antes.

**Dependencies**: Contexto da feature capturado em `.specs/custo-fixo-para-despesa/CONTEXT.md`.

---

### Phase 2: Criacao Real Da Despesa

**Goal**: O usuario consegue salvar uma despesa simples a partir do custo fixo, usando o mesmo service e o mesmo contrato do cadastro normal de despesas.

**Vertical slice**: `CustosFixosPage` recebe submit do modal, injeta ano/mes do store, chama `DespesaService.create`, fecha o modal e mostra feedback.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFXD-P2-01 | Importar e instanciar `DespesaService` em `CustosFixosPage.vue` seguindo o padrao usado em `DespesaPage.vue`. | @Usuario | 20min |
| CFXD-P2-02 | Implementar handler de `onSubmitAdd` para preencher `ano` e `mes` com `useGerenciamentoMensalStore().mesAtual`. | @Usuario | 30min |
| CFXD-P2-03 | Chamar `despesaService.create` para persistir a despesa simples e fechar o modal em sucesso. | @Usuario | 30min |
| CFXD-P2-04 | Exibir notificacao de sucesso e erro em pt-BR usando o padrao atual de `$q.notify` e `notificarErro`. | @Usuario | 30min |
| CFXD-P2-05 | Revisar regras de loading para evitar conflito entre loading de custos fixos e loading de despesa. | @Usuario | 30min |

**Testing**:

- Manual: criar despesa simples a partir de custo fixo e validar no gerenciamento mensal se a despesa aparece no mes esperado.
- Manual: tentar salvar sem valor e confirmar validacao do modal.
- Manual: criar a partir de custo fixo sem categoria e confirmar que o usuario precisa selecionar uma categoria.

**Acceptance Criteria**:

- [ ] Despesa simples e criada pelo endpoint existente de despesas.
- [ ] Ano e mes sao preenchidos automaticamente conforme `mesAtual`.
- [ ] Modal fecha apos sucesso.
- [ ] Usuario recebe feedback de sucesso ou erro.
- [ ] Validacoes existentes do modal continuam sendo respeitadas.

**Dependencies**: Phase 1 completa; backend de despesas existente disponivel.

---

### Phase 3: Opcoes Avancadas Do Cadastro Existente

**Goal**: O fluxo iniciado pelo custo fixo preserva as opcoes atuais do cadastro de despesa, incluindo despesa agrupadora e lancamento em lote.

**Vertical slice**: `CustosFixosPage` passa ano/mes ao modal, o modal busca agrupadoras normalmente, e os submits de lote sao tratados com `DespesaService.criarEmLote`.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFXD-P3-01 | Conectar `onSubmitAddLote` em `CustosFixosPage.vue` para chamar `DespesaService.criarEmLote`. | @Usuario | 30min |
| CFXD-P3-02 | Garantir que a busca de despesa agrupadora no modal usa o mesmo ano/mes do fluxo iniciado em custos fixos. | @Usuario | 30min |
| CFXD-P3-03 | Validar comportamento de parcelamento e recorrencia fixa com dados iniciais vindos do custo fixo. | @Usuario | 45min |
| CFXD-P3-04 | Revisar textos de titulo e botoes do modal para comunicar que o usuario esta cadastrando uma despesa sem duplicar campos ou criar formulario paralelo. | @Usuario | 30min |

**Testing**:

- Manual: criar despesa com agrupadora a partir de custo fixo.
- Manual: criar lote parcelado a partir de custo fixo.
- Manual: criar recorrencia fixa a partir de custo fixo.
- Manual: confirmar que a `DespesaPage` lista corretamente os registros criados.

**Acceptance Criteria**:

- [x] Despesa agrupadora funciona no fluxo iniciado pelo custo fixo.
- [x] Lancamento em lote funciona no fluxo iniciado pelo custo fixo.
- [x] Parcelamento e recorrencia fixa usam o mesmo periodo inicial esperado.
- [x] O modal continua sendo o mesmo componente usado pela pagina de despesas.

**Dependencies**: Phase 2 completa; decisao confirmada de que as opcoes avancadas devem estar disponiveis.

---

### Phase 4: Polimento, Regressao E Prontidao

**Goal**: A melhoria fica pronta para uso, com layout consistente, sem regressao nos fluxos atuais de custos fixos e despesas.

**Vertical slice**: revisar UX no card, estados de loading/erro, dark mode, responsividade e build/lint.

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFXD-P4-01 | Ajustar spacing e responsividade das acoes do `CustoFixoCard.vue` para evitar quebra em telas pequenas. | @Usuario | 45min |
| CFXD-P4-02 | Verificar dark mode/light mode para o novo botao, modal reaproveitado e mensagens. | @Usuario | 30min |
| CFXD-P4-03 | Executar `npm run lint` e corrigir problemas relacionados a mudanca. | @Usuario | 30min |
| CFXD-P4-04 | Executar `npm run build` para validar TypeScript/Vite/Quasar. | @Usuario | 30min |
| CFXD-P4-05 | Atualizar `IMPLEMENTATION-STATE.md` da feature apos implementacao, se o fluxo for executado via `/implement`. | @Usuario | 20min |

**Testing**:

- Manual: fluxo completo criar despesa simples, agrupada e em lote a partir de custo fixo.
- Manual: regressao do CRUD de custos fixos.
- Manual: regressao do cadastro direto em `DespesaPage`.
- Automated: `npm run lint`.
- Automated: `npm run build`.

**Acceptance Criteria**:

- [x] Layout do card permanece profissional em mobile e desktop.
- [x] Dark mode e light mode nao apresentam quebras visuais.
- [x] Fluxo de custos fixos existente continua funcionando.
- [x] Fluxo de despesas existente continua funcionando.
- [x] `npm run lint` passa.
- [x] `npm run build` passa.

**Dependencies**: Phase 3 completa.

## Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| Tracer Bullet Validado | Sem deadline | Modal de despesa abre a partir do card de custo fixo com dados iniciais. |
| Criacao Simples Funcional | Sem deadline | Despesa simples e criada a partir de custo fixo usando service existente. |
| Opcoes Completas Preservadas | Sem deadline | Agrupadora, parcelamento e recorrencia fixa funcionam no fluxo iniciado por custo fixo. |
| Pronto Para Merge | Sem deadline | Layout revisado, regressao manual feita, lint e build validados. |

## Dependencies

| Dependency | Type | Owner | Status | Risk if Delayed |
|------------|------|-------|--------|-----------------|
| Decisao sobre periodo mensal padrao | Product | @Usuario | Open | Sem decisao, despesas podem ser criadas no mes errado para a expectativa do usuario. |
| Decisao sobre valor do custo fixo | Product / Domain | @Usuario | Open | Se o valor passar a existir no custo fixo, o plano precisa incluir modelo, API e UI de custo fixo. |
| Backend de despesas | Technical | @Usuario | Available | Sem endpoint de despesas, a criacao real nao funciona. |
| `ModalCreateUpdateDespesa.vue` | Internal | @Usuario | Available | Se o modal nao puder ser generalizado com dados iniciais, pode haver duplicacao de formulario. |
| `GerenciamentoMensalStore` | Internal | @Usuario | Available | O fluxo depende do periodo global usado hoje pelo gerenciamento mensal. |

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Criar despesa no periodo inesperado porque a pagina de custos fixos nao exibe mes/ano | H | M | Confirmar a regra antes da implementacao e exibir periodo no modal ou feedback se necessario. |
| Generalizar o modal de despesa e quebrar o fluxo atual de `DespesaPage` | H | M | Adicionar props opcionais, manter defaults atuais e testar regressao do cadastro direto. |
| Nova acao deixar o card visualmente poluido em mobile | M | M | Usar icone com tooltip, revisar spacing e testar em telas pequenas. |
| Usuario esperar vinculo persistente entre custo fixo e despesa criada | M | M | Registrar explicitamente que a primeira versao e copia assistida, ou ajustar plano se houver decisao de vinculo. |
| Loading/feedback de despesa conflitar com loading de custo fixo | M | L | Separar service/loading de despesa e manter notificacoes especificas do fluxo. |

## Testing Strategy

O projeto hoje usa principalmente validacao manual com suporte de scripts e build. A estrategia desta feature combina regressao manual dos fluxos afetados com verificacoes automatizadas disponiveis no repositorio.

| Test Type | Scope | Approach | Critical Scenarios |
|-----------|-------|----------|--------------------|
| Manual funcional | Fluxo de custo fixo para despesa | Rodar app localmente e validar via UI | Abrir modal pelo card, salvar despesa simples, salvar com agrupadora, salvar lote parcelado, salvar recorrencia fixa. |
| Manual regressao | Fluxos existentes de custos fixos e despesas | Validar telas atuais depois da mudanca | Criar/editar/excluir custo fixo, alternar status, criar despesa diretamente em `DespesaPage`. |
| Manual responsividade | Cards e modal | Testar mobile e desktop | Card com nova acao em largura pequena, modal sem overflow quebrado. |
| Manual tema | Dark/light mode | Alternar tema e validar contraste | Novo botao, tooltip, modal e notificacoes legiveis. |
| Automated lint | Codigo Vue/TS | `npm run lint` | Sem erros de lint introduzidos. |
| Automated build | Build Quasar/Vite | `npm run build` | TypeScript e bundling sem erro. |

## Rollback Plan

### Deployment Strategy

Deploy direto do SPA, sem feature flag prevista. A mudanca fica concentrada no front-end e usa endpoints de despesa ja existentes.

### Rollback Triggers

| Trigger | Threshold |
|---------|-----------|
| Cadastro direto de despesa quebra apos deploy | Qualquer erro reproduzivel bloqueando criacao em `DespesaPage`. |
| Criacao a partir de custo fixo gera dados incorretos | Qualquer caso confirmado de mes/ano/categoria incorreto sem recuperacao clara para o usuario. |
| Build ou lint falha em pipeline | Qualquer falha antes de publicar. |

### Rollback Steps

1. Reverter o build do front-end para a versao anterior.
2. Remover a acao visual de cadastrar despesa a partir do custo fixo no proximo hotfix, se a reversao completa nao for necessaria.
3. Validar que `DespesaPage` e `CustosFixosPage` voltaram ao comportamento anterior.
4. Registrar causa, ajustar regra de periodo/dados iniciais e retestar antes de novo deploy.
