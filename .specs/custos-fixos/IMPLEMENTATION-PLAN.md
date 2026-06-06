# Implementation Plan — Custos Fixos (Front-End)

| Field        | Value                        |
| ------------ | ---------------------------- |
| Tech Lead    | @Usuario                     |
| Team         | Solo developer               |
| Epic/Ticket  | Custos Fixos                 |
| Status       | Completed                        |
| Created      | 2026-05-21                   |
| Last Updated | 2026-05-21                   |

## Overview

Implementação da interface de **Custos Fixos** no FinanMap Front-End — uma nova seção com página dedicada no menu lateral para o cadastro, listagem, ativação/inativação e exclusão de compromissos financeiros recorrentes. A tela também inclui toggle de opt-out global nas configurações do usuário e empty state orientativo.

A estratégia segue **vertical slices** (tracer bullet): cada fase entrega funcionalidade visível e navegável, começando pela página mínima com listagem e cadastro, e evoluindo até configurações de opt-out e polimento final.

**Technical Design (Backend)**: [TECHNICAL-DESIGN.md](file:///d:/GitHub/FinanMap-Back-End/.specs/custos-fixos/TECHNICAL-DESIGN.md)

**Stack**: Vue 3 + Quasar Framework + Pinia + TypeScript + Axios

**Padrões identificados no projeto**:
- **Services**: Classe com `requestWithLoading` + instância Axios, exportada via factory function (ex: `getMetaFinanceiraService()`)
- **Models**: Interfaces TypeScript em `src/Model/`
- **Pages**: Vue SFC com `<script setup lang="ts">`, componentes Quasar, modals com `v-model`
- **Router**: Lazy import em `routes.ts`, rotas protegidas como children do `MainLayout`
- **Configurações**: Modal lateral com tabs em `ModalConfiguracoes.vue`
- **Empty state**: Padrão com ícone grande + mensagem orientativa (ver MetasFinanceirasPage)

## Implementation Phases

---

### Phase 1: Tracer Bullet — Página de Custos Fixos com listagem, criação e exclusão

**Goal**: O usuário navega até "Custos Fixos" no menu lateral, vê a lista dos seus custos fixos cadastrados (ou empty state), cria um novo custo fixo via modal e pode excluir um existente.

**Vertical slice**: Model (TypeScript) → Service (API) → Page (Vue) → Components (Modal + Card/List) → Router → Layout (Menu)

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFFR-P1-01 | Criar interfaces TypeScript em `src/Model/CustoFixo.ts`: `CustoFixoCreate` (nome, diaVencimento, categoriaId?), `CustoFixoResult` (id, nome, diaVencimento, ativo, categoriaId?, categoriaNome?), `UpdateCustoFixoDTO`. | @Usuario | 30min |
| CFFR-P1-02 | Criar `CustoFixoService.ts` em `src/services/` seguindo padrão de `MetaFinanceiraService`: classe com `requestWithLoading`, métodos `obterTodos()`, `criar(dto)`, `excluir(id)`. Base URL: `process.env.URL_API + 'custos-fixos'`. Exportar via `getCustoFixoService()`. | @Usuario | 1h |
| CFFR-P1-03 | Criar `src/pages/CustosFixos/CustosFixosPage.vue` seguindo padrão de `MetasFinanceirasPage.vue`: header com gradiente e ícone, botão "Novo Custo Fixo", listagem em grid/cards, empty state com ícone + mensagem orientativa (`CFIX-23`), skeleton loaders durante loading. | @Usuario | 2.5h |
| CFFR-P1-04 | Criar componente `src/components/CustosFixos/CustoFixoCard.vue`: card individual mostrando nome, dia do vencimento formatado, badge de status (ativo/inativo), nome da categoria (se houver), botões de ação (editar, excluir). | @Usuario | 1.5h |
| CFFR-P1-05 | Criar componente `src/components/CustosFixos/ModalCriarCustoFixo.vue`: dialog Quasar com formulário: input nome (obrigatório), select dia do vencimento (1-31), select de categoria opcional (usando `CategoriaService` existente, filtrando por tipo Despesa). Validação inline antes de emitir. | @Usuario | 1.5h |
| CFFR-P1-06 | Adicionar rota `/custos-fixos` em `routes.ts` como child do `MainLayout`, com lazy import de `CustosFixosPage.vue`. Nome: `CustosFixosPage`. | @Usuario | 15min |
| CFFR-P1-07 | Adicionar item "Custos Fixos" no menu lateral (`MainLayout.vue`) com ícone `receipt_long`, apontando para `/custos-fixos`, no padrão dos itens existentes (Mês a Mês, Dashboard, Metas Financeiras). | @Usuario | 15min |

**Testing**:

- **Manual (Browser)**: Navegar via menu lateral → abrir página de Custos Fixos → visualizar empty state → criar custo fixo via modal → ver card na listagem → excluir com confirmação → verificar empty state retorna.
- **Responsividade**: Testar em telas mobile (≤600px) e desktop. Verificar que o layout se adapta (grid columns, modal width).
- **Dark mode**: Verificar que todos os componentes respeitam o tema dark/light do Quasar.

**Acceptance Criteria**:

- [ ] Menu lateral contém item "Custos Fixos" com navegação funcional
- [ ] Página exibe empty state quando não há custos fixos — `CFIX-23`
- [ ] Modal de criação valida campos obrigatórios antes de submeter
- [ ] Card exibe nome, dia do vencimento e status ativo/inativo
- [ ] Exclusão com diálogo de confirmação
- [ ] Loading skeleton durante chamadas à API
- [ ] Funciona em dark mode e light mode

**Dependencies**: Backend Phase 1 completa (endpoints CRUD de `custos-fixos` funcionais).

---

### Phase 2: Edição, Toggle Ativo/Inativo e Opt-out Global

**Goal**: O usuário pode editar custos fixos existentes, ativar/desativar individualmente com toggle visual, e controlar o opt-out global de lembretes via configurações.

**Vertical slice**: Service (novos métodos) → Components (Modal edição + Toggle) → Configurações (nova tab opt-out)

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFFR-P2-01 | Adicionar métodos `atualizar(dto)` e `alterarStatus(id, ativo)` no `CustoFixoService`. O `atualizar` usa PUT com `UpdateCustoFixoDTO`; o `alterarStatus` envia PUT com campo `ativo`. | @Usuario | 30min |
| CFFR-P2-02 | Criar `src/components/CustosFixos/ModalEditarCustoFixo.vue`: dialog pré-populado com dados do custo fixo selecionado. Mesmos campos do modal de criação. Emite evento `@salvar` com DTO atualizado. | @Usuario | 1h |
| CFFR-P2-03 | Adicionar toggle `q-toggle` no `CustoFixoCard.vue` para ativar/inativar o custo fixo diretamente do card, chamando `alterarStatus` no service. Visual feedback: card com opacidade reduzida quando inativo. | @Usuario | 1h |
| CFFR-P2-04 | Integrar modal de edição na `CustosFixosPage.vue`: botão "Editar" no card abre modal pré-populado, salva e atualiza a listagem localmente. | @Usuario | 30min |
| CFFR-P2-05 | Criar métodos de opt-out no service: `obterConfiguracoes()` (GET `/api/usuarios/configuracoes/custos-fixos`) e `atualizarOptOut(receberNotificacoes: boolean)` (PUT). Pode ser no próprio `CustoFixoService` ou num `UsuarioConfigService` novo. | @Usuario | 30min |
| CFFR-P2-06 | Criar componente `src/components/Configuracoes/CustoFixoConfig.vue`: seção com `q-toggle` para "Receber lembretes por e-mail de custos fixos" com descrição explicativa abaixo. Carregar estado atual via `obterConfiguracoes()` no `onMounted`. | @Usuario | 1h |
| CFFR-P2-07 | Registrar nova tab "Custos Fixos" no `ModalConfiguracoes.vue`: adicionar item no `menuItems` com ícone `notifications`, importar e renderizar `CustoFixoConfig` quando `tab === 'custosFixos'`. | @Usuario | 30min |

**Testing**:

- **Manual**: Editar nome e dia de vencimento de um custo fixo → verificar atualização no card. Toggle ativo/inativo → verificar visual (opacidade) e persistência no refresh. Abrir configurações → toggle opt-out → fechar e reabrir → verificar estado persistido.
- **Cenários de borda**: Tentar editar para nome duplicado (mesmo nome + dia de outro custo ativo) → deve exibir erro vindo do backend.

**Acceptance Criteria**:

- [ ] Modal de edição abre pré-populado e salva alterações — `CFIX-06`
- [ ] Toggle de ativo/inativo funciona visualmente e persiste — `CFIX-04`
- [ ] Card inativo tem visual diferenciado (opacidade reduzida ou badge)
- [ ] Configurações contém tab "Custos Fixos" com toggle de opt-out — `CFIX-21`
- [ ] Estado do opt-out é carregado do backend e persiste ao reabrir

**Dependencies**: Phase 1 completa. Backend Phase 4 completa (endpoints de opt-out).

---

### Phase 3: Polimento Visual, UX e Produção

**Goal**: A página está polida com micro-interações, feedbacks visuais adequados, responsividade completa e pronta para produção.

**Vertical slice**: Components (refinamento) → CSS (animações) → Page (UX) → Deploy

**Tasks**:

| ID | Task | Owner | Estimate |
|----|------|-------|----------|
| CFFR-P3-01 | Adicionar animações de entrada/saída nos cards da lista: `q-transition` ou CSS transitions ao adicionar/remover custos fixos. | @Usuario | 1h |
| CFFR-P3-02 | Adicionar feedback visual de sucesso via `$q.notify` (padrão Quasar) para todas as ações: criar, editar, excluir, alterar status, alterar opt-out. Garantir mensagens em português, consistentes com o restante do app. | @Usuario | 30min |
| CFFR-P3-03 | Implementar busca/filtro na lista de custos fixos: campo de busca por nome e/ou filtro por status (todos, ativos, inativos). | @Usuario | 1h |
| CFFR-P3-04 | Revisar responsividade completa: testar em breakpoints 320px, 480px, 768px, 1024px, 1440px. Ajustar grid, modals, cards e header conforme necessário. | @Usuario | 1h |
| CFFR-P3-05 | Garantir que a funcionalidade respeita o **modo compartilhado** (header `X-Proprietario-Id` já é adicionado automaticamente pelo `AxiosHelper`). Testar que custos fixos são isolados por contexto. Se o usuário está em modo compartilhado como convidado, esconder ou desabilitar a funcionalidade de custos fixos. | @Usuario | 1h |
| CFFR-P3-06 | Teste end-to-end completo: fluxo de criar → listar → editar → ativar/inativar → excluir → empty state → opt-out global. Verificar em dark mode e light mode. | @Usuario | 1h |

**Testing**:

- **Manual completo**: Fluxo inteiro em diferentes resoluções e modos (dark/light). Verificar que notificações aparecem corretamente. Verificar animações suaves. Verificar isolamento de dados entre usuários.
- **Modo compartilhado**: Acessar como convidado → custos fixos não devem estar disponíveis (convidados não recebem e-mails, conforme regra de negócio `CFIX-20`).

**Acceptance Criteria**:

- [ ] Animações de entrada/saída nos cards
- [ ] Notificações de sucesso/erro em todas as ações
- [ ] Busca/filtro funcionando na listagem
- [ ] Layout responsivo em todas as resoluções testadas
- [ ] Dark mode e light mode consistentes
- [ ] Modo compartilhado tratado (oculto para convidados)
- [ ] Fluxo end-to-end funcional sem erros

**Dependencies**: Phase 2 completa. Backend completo (todas as fases).

## Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| Página Navegável | Sem deadline | Página de Custos Fixos acessível via menu, com CRUD mínimo (criar, listar, excluir) e empty state |
| Gestão Completa | Sem deadline | Edição, toggle ativo/inativo, opt-out global nas configurações |
| Produção | Sem deadline | UX polida com animações, filtros, responsividade e modo compartilhado tratado |

## Dependencies

| Dependency | Type | Owner | Status | Risk if Delayed |
|------------|------|-------|--------|-----------------|
| Backend CRUD (Phase 1) | Internal | @Usuario | Pendente | Phase 1 do front bloqueada — sem API, a página não funciona |
| Backend Opt-out (Phase 4) | Internal | @Usuario | Pendente | Phase 2 do front parcialmente bloqueada — tab de configurações depende do endpoint |
| `CategoriaService` existente | Internal | @Usuario | Disponível | Modal de criação usa seletor de categorias do tipo Despesa |
| `AxiosHelper` com interceptors | Internal | @Usuario | Disponível | Autenticação JWT e header de compartilhamento já tratados |
| Quasar Framework components | External | @Usuario | Disponível | Todos os componentes UI (QCard, QDialog, QToggle, etc.) já disponíveis |

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Backend não pronto quando frontend iniciar** — API de custos fixos ainda não implementada | Alto | Média | Desenvolver frontend com dados mockados localmente. Trocar para API real quando backend estiver pronto. Service já terá a estrutura correta. |
| **Inconsistência visual com o restante do app** — nova página destoa do padrão visual | Médio | Baixa | Seguir estritamente os padrões de `MetasFinanceirasPage` (header gradient, cards, modals). Usar componentes Quasar existentes. |
| **Modo compartilhado causa comportamento inesperado** — custos fixos de um proprietário acessíveis por convidado | Alto | Média | O `AxiosHelper` já envia `X-Proprietario-Id`. No frontend, ocultar a seção de Custos Fixos quando o usuário está em modo compartilhado como convidado (verificar via `compartilhamentoStore`). |
| **Seletor de categoria não filtra por tipo Despesa** — categorias de Rendimento ou Investimento aparecem no select | Baixo | Média | Usar filtro no frontend ao carregar categorias, ou verificar se `CategoriaService` já suporta filtro por tipo. |

## Testing Strategy

Sem testes automatizados — a estratégia é manual, seguindo o padrão do projeto.

### Ferramentas
- **Browser (Chrome DevTools)**: Testar responsividade, dark mode, network requests e console errors.
- **Scalar/Swagger (Backend)**: Validar que as respostas da API estão no formato esperado pelos models TypeScript.
- **Quasar Dev Server (`npm run dev`)**: Desenvolvimento local com hot reload.

### Cenários Críticos

**Phase 1 — CRUD Mínimo**:
1. Empty state visível quando não há custos fixos
2. Criar custo fixo → aparece na lista imediatamente
3. Excluir custo fixo → some da lista com confirmação
4. Erro de validação (nome vazio, dia inválido) → feedback visual no modal
5. Erro de duplicata do backend → notificação de erro ao usuário

**Phase 2 — Gestão Completa**:
1. Editar custo fixo → dados atualizados no card
2. Toggle ativo/inativo → visual muda imediatamente
3. Opt-out nas configurações → toggle reflete estado do backend
4. Opt-out persiste ao reabrir configurações

**Phase 3 — Polimento**:
1. Animações suaves ao adicionar/remover cards
2. Filtro/busca funciona corretamente
3. Layout adequado em mobile e desktop
4. Dark mode/light mode sem quebras visuais
5. Convidado de conta compartilhada não vê Custos Fixos

## Rollback Plan

### Deployment Strategy

Deploy direto, sem feature flags. O frontend é um SPA estático — reverter é trocar o build.

### Rollback Steps

1. **Imediato**: Fazer deploy da versão anterior do frontend (sem a página de Custos Fixos).
2. **Impacto mínimo**: A rota `/custos-fixos` simplesmente deixa de existir. O item do menu some. Nenhum dado do usuário é afetado.
3. **Backend independente**: O backend continua funcionando normalmente. Os endpoints de custos fixos ficam órfãos mas não causam problemas.
