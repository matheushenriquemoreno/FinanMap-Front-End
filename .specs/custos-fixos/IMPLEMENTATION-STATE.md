# Implementation State: custos-fixos

## Phase 1: Tracer Bullet — Página de Custos Fixos com listagem, criação e exclusão
**Status: completed**
- [x] Task CFFR-P1-01: Criar interfaces TypeScript em `src/Model/CustoFixo.ts`
- [x] Task CFFR-P1-02: Criar `CustoFixoService.ts` em `src/services/`
- [x] Task CFFR-P1-03: Criar `src/pages/CustosFixos/CustosFixosPage.vue`
- [x] Task CFFR-P1-04: Criar componente `src/components/CustosFixos/CustoFixoCard.vue`
- [x] Task CFFR-P1-05: Criar componente `src/components/CustosFixos/ModalCriarCustoFixo.vue`
- [x] Task CFFR-P1-06: Adicionar rota `/custos-fixos` em `routes.ts`
- [x] Task CFFR-P1-07: Adicionar item "Custos Fixos" no menu lateral (`MainLayout.vue`)

## Phase 2: Edição, Toggle Ativo/Inativo e Opt-out Global
- [ ] Task CFFR-P2-01: Adicionar métodos `atualizar(dto)` e `alterarStatus(id, ativo)` no `CustoFixoService`
- [ ] Task CFFR-P2-02: Criar `src/components/CustosFixos/ModalEditarCustoFixo.vue`
- [ ] Task CFFR-P2-03: Adicionar toggle `q-toggle` no `CustoFixoCard.vue`
- [ ] Task CFFR-P2-04: Integrar modal de edição na `CustosFixosPage.vue`
- [ ] Task CFFR-P2-05: Criar métodos de opt-out no service
- [ ] Task CFFR-P2-06: Criar componente `src/components/Configuracoes/CustoFixoConfig.vue`
- [ ] Task CFFR-P2-07: Registrar nova tab "Custos Fixos" no `ModalConfiguracoes.vue`

## Phase 3: Polimento Visual, UX e Produção
- [ ] Task CFFR-P3-01: Adicionar animações de entrada/saída nos cards da lista
- [ ] Task CFFR-P3-02: Adicionar feedback visual de sucesso via `$q.notify`
- [ ] Task CFFR-P3-03: Implementar busca/filtro na lista de custos fixos
- [ ] Task CFFR-P3-04: Revisar responsividade completa
- [ ] Task CFFR-P3-05: Garantir que a funcionalidade respeita o modo compartilhado
- [ ] Task CFFR-P3-06: Teste end-to-end completo
