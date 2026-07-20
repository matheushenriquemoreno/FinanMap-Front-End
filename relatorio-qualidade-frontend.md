# Relatório de Qualidade de Implementação Front-end

**Escopo analisado**: codebase completa

**Path**: `D:\FinamMap\FinanMap-Front-End`

**Data**: 19/07/2026

**Rodada**: 3 — reauditoria após a Fase 2

**Stack identificada**: Vue 3.4, Quasar 2.18, Vite 6.2, TypeScript 5.5 em modo estrito, Pinia 3, Vue Router 4 em modo hash, Axios 1.2, ApexCharts 4 e SCSS.

---

## Resumo executivo

A segunda fase eliminou os três achados de performance. ApexCharts não participa mais do boot global e ficou contido no chunk lazy do dashboard; o entrypoint de produção não contém tokens da biblioteca. O dashboard passou a orquestrar e compartilhar resumo, evolução e categorias por período/tipo, com deduplicação concorrente, cache multiperíodo e proteção contra respostas obsoletas.

A regressão de performance executa os módulos reais de cache, registro de categorias e composição de snapshots. Ela cobre requisições concorrentes, A→B→A, retorno a A enquanto B está pendente e reidratação de categorias lazy em snapshots antigos. A implementação passou por quatro ciclos de revisão independente até não restar achado crítico, alto ou médio no escopo da fase.

O principal risco restante está na arquitetura de sessão: access e refresh tokens continuam no `localStorage`, o que exige alinhamento com o backend. Também permanecem débitos médios de configuração HTTP, tipagem/lint, testes de componentes, decomposição de arquivos grandes, Design System e CSS.

| Dimensão                            |  Nota   | Crítico | Alto  | Médio | Baixo |
| ----------------------------------- | :-----: | :-----: | :---: | :---: | :---: |
| Design System / consistência visual |   9,0   |    0    |   0   |   2   |   0   |
| Performance / Core Web Vitals       |  10,0   |    0    |   0   |   0   |   0   |
| Acessibilidade / UX                 |  10,0   |    0    |   0   |   0   |   0   |
| Arquitetura Vue/Quasar              |   6,4   |    0    |   1   |   4   |   1   |
| CSS/SCSS/Quasar                     |   9,0   |    0    |   0   |   2   |   0   |
| **Nota geral ponderada**            | **8,9** |  **0**  | **1** | **8** | **1** |

**Pesos**: Performance 25%, Acessibilidade/UX 25%, Arquitetura 25%, Design System 15% e CSS/SCSS/Quasar 10%. Tailwind não foi cobrado porque não faz parte da stack.

### Evolução da qualidade

| Indicador      | Rodada 1 | Rodada 2 | Rodada 3 | Evolução total |
| -------------- | :------: | :------: | :------: | :------------: |
| Nota ponderada |   5,7    |   8,0    |   8,9    |      +3,2      |
| Críticos       |    2     |    0     |    0     |       -2       |
| Altos          |    6     |    3     |    1     |       -5       |
| Médios         |    10    |    9     |    8     |       -2       |

---

## Top 3 prioridades restantes

1. Migrar a sessão para cookie `HttpOnly` em conjunto com o backend, retirando o refresh token do `localStorage`.
2. Consolidar URL por ambiente e um único cliente Axios, removendo a instância de exemplo.
3. Adicionar Vitest/Vue Test Utils e reativar regras de tipagem, começando por serviços e stores.

---

## Achados resolvidos nesta rodada

### A11Y-01 — Nomes acessíveis em formulários — Resolvido

- Autenticação usa labels programáticos em `LoginPage.vue:14`, `CadastroPage.vue:13,25` e `ConfirmarCodigoLoginPage.vue:14`.
- Labels visuais de custos fixos e metas foram associados aos respectivos controles.
- A varredura global cobre `q-input`, `q-select`, wrappers conhecidos e correlação entre `label` e `for` em `scripts/check-accessibility-ux.mjs`.

### A11Y-02 — Operação por teclado em período e data — Resolvido

- Anos e meses são botões com estado `aria-pressed` em `MothYearSelector.vue:82-133`.
- O campo de data abre com Enter ou Espaço em `ModernDateInput.vue:14-15`, e o acionador é um botão nomeado.

### A11Y-03 — Zoom bloqueado — Resolvido

- A viewport mantém apenas escala inicial e largura do dispositivo em `index.html:10-13`.

### A11Y-04 — Card de autenticação rígido — Resolvido

- `.card-login` usa largura fluida com margem segura em `src/css/app.scss:79-104`.

### A11Y-05 — Botões icon-only sem nome — Resolvido

- Ações de tema, conta, configuração, navegação e fechamento receberam `aria-label`; o checker percorre todos os componentes Vue.

### ARCH-01 — Redirecionamento incompatível com router hash — Resolvido

- `LOGIN_URL` está consistente em `quasar.config.ts:58` e `src/env.d.ts:7`.
- Os fallbacks usam `/#/login` em `AxiosHelper.ts:40,196` e `TokenRenewalService.ts:114`.
- A regressão proíbe o casing incorreto nos dois contratos em `scripts/check-accessibility-ux.mjs:317-336`.

### PERF-01 — ApexCharts no boot global — Resolvido

- O boot contém apenas Axios em `quasar.config.ts:14`; `src/boot/apexchart.ts` foi removido.
- Os gráficos importam `VueApexCharts` localmente, por exemplo em `DashboardCategoryChart.vue:48,55`.
- O build confirmou **0 tokens ApexCharts no entrypoint de 255,27 KB**; a biblioteca ficou no chunk lazy do dashboard, com 603,42 KB / 163,88 KB gzip.

### PERF-02 — Chamadas equivalentes repetidas no dashboard — Resolvido

- A página orquestra a carga por período em `dashbord-Gerenciamento-Mensal.vue:158-163`.
- O store centraliza a sequência e descarta respostas obsoletas em `dashboardStore.ts:94-120`.
- Cache, registro e loader testáveis cobrem deduplicação, cache multiperíodo, categorias lazy e corridas em `dashboardRequestCache.mjs`, `dashboardCategoryRegistry.mjs` e `dashboardSnapshotLoader.mjs:13-53`.
- A carga inicial realiza quatro chaves únicas — resumo, evolução, rendimentos e despesas — e Investimento permanece lazy até ser solicitado.

### PERF-03 — Logo de autenticação superdimensionado — Resolvido

- `logo-auth.webp` tem 360×299 e 26.578 bytes, redução de **90,3%** frente ao PNG de 273.115 bytes.
- As três páginas públicas usam o asset com `width`, `height`, `fetchpriority="high"` e `decoding="async"`; exemplo em `LoginPage.vue:3-10,54`.

---

## Achados restantes

## 1. Design System / consistência visual

### DS-01 — Cores semânticas são repetidas como valores literais

**Severidade**: Médio

**Local**: `src/css/quasar.variables.scss`; `DashboardSummaryCards.vue`; `DashboardTrendLineChart.vue:27-41`

- **Esperado**: cores de marca e estado devem vir de uma fonte semântica única.
- **Implementado**: componentes e gráficos repetem hexadecimais como `#21ba45`, `#c10015` e `#31ccec`, embora o tema Quasar já defina cores equivalentes.
- **Impacto**: mudanças de tema exigem edições dispersas e podem gerar tons divergentes.
- **Sugestão**: criar tokens compartilhados para gráficos e usar nomes semânticos do Quasar nos componentes.

### DS-02 — O shell visual dos cards de dashboard é duplicado

**Severidade**: Médio

**Local**: `DashboardCategoryChart.vue:221-231`; `DashboardCategoryDistributionChart.vue:192-202`; `DashboardCategoryTreemap.vue:266-276`; `DashboardTrendLineChart.vue:264-274`

- **Esperado**: cards equivalentes devem reutilizar um shell ou tokens comuns.
- **Implementado**: raio, sombra e variações de tema são repetidos em pelo menos seis componentes.
- **Impacto**: ajustes visuais precisam ser replicados e já apresentam diferenças de alpha.
- **Sugestão**: extrair `DashboardCard.vue` ou uma classe global baseada em custom properties.

## 2. Performance / Core Web Vitals

Nenhum achado aberto nesta rodada. O dashboard ainda gera um aviso por ultrapassar 500 KB, mas esse chunk é lazy e exclusivo da rota que usa os gráficos; não afeta mais a carga inicial das páginas públicas.

## 3. Acessibilidade / UX

Nenhum achado aberto nesta rodada. Isso não equivale a certificação WCAG: a Fase 3 ainda deve adicionar testes comportamentais e auditoria em navegador/leitor de tela.

## 4. Arquitetura Vue/Quasar

### ARCH-02 — Access e refresh tokens ficam no `localStorage`

**Severidade**: Alto

**Local**: `ConfirmarCodigoLoginPage.vue:76-79`; `RefreshTokenManager.ts:35-36,82-83`; `AxiosHelper.ts:45-51`

- **Esperado**: refresh token em cookie `HttpOnly`, `Secure` e `SameSite`; access token de curta duração conforme o modelo de backend.
- **Implementado**: os dois tokens são persistidos em armazenamento acessível a JavaScript.
- **Impacto**: uma vulnerabilidade XSS pode exfiltrar uma sessão persistente, risco relevante para aplicação financeira.
- **Sugestão**: migrar o contrato de sessão com o backend e tratar CSRF conforme a estratégia de cookies.

### ARCH-03 — Configuração de API está acoplada ao código-fonte

**Severidade**: Médio

**Local**: `quasar.config.ts:57`; `src/boot/axios.ts:18`

- **Esperado**: URL por ambiente e um único cliente HTTP real.
- **Implementado**: a API de produção está versionada na configuração e o boot exporta outra instância com `api.example.com`.
- **Impacto**: ambientes ficam acoplados e duas arquiteturas HTTP concorrentes confundem manutenção e testes.
- **Sugestão**: validar variáveis `.env` no build, remover o cliente de exemplo e consolidar a fábrica Axios.

### ARCH-04 — TypeScript estrito é enfraquecido pela política de lint

**Severidade**: Médio

**Local**: `eslint.config.js:68-74`; componentes base e gráficos

- **Esperado**: `any`, promises ignoradas e símbolos sem uso devem ser exceções locais e justificadas.
- **Implementado**: `no-explicit-any`, `no-unused-vars` e `no-floating-promises` estão desativadas globalmente.
- **Impacto**: contratos críticos perdem verificação apesar do modo estrito anunciado.
- **Sugestão**: reativar regras gradualmente, começando por serviços, stores e componentes compartilhados.

### ARCH-05 — Componentes concentram responsabilidades demais

**Severidade**: Médio

**Local**: `SectionFiltrarPeriodo.vue` (638 linhas); `CategoriaConfig.vue` (534); `CustosFixosPage.vue` (558); `CompartilhamentoModal.vue` (497); `MothYearSelector.vue` (459)

- **Esperado**: páginas orquestram; domínio, fetch e estado reutilizável ficam em stores/composables; blocos visuais permanecem focados.
- **Implementado**: vários arquivos misturam template, serviços, watchers, transformação e centenas de linhas de CSS.
- **Impacto**: aumenta o raio de mudança, dificulta testes e favorece duplicação.
- **Sugestão**: extrair responsabilidades testáveis, começando por período, tabelas de transação e modais.

### ARCH-06 — A suíte ainda não testa comportamento real

**Severidade**: Médio

**Local**: `package.json`; `scripts/check-*.mjs`

- **Esperado**: componentes, stores e fluxos financeiros devem ter testes unitários/de componente e smoke E2E.
- **Implementado**: o checker de performance já executa módulos puros e fluxos assíncronos reais, mas componentes Vue, store Pinia e jornadas de navegador ainda não usam Vitest, Vue Test Utils ou Playwright.
- **Impacto**: payloads, watchers, renderização, foco e refresh de sessão podem regredir sem detecção runtime.
- **Sugestão**: manter os checks rápidos e adicionar Vitest + Vue Test Utils e Playwright nos fluxos críticos.

### ARCH-07 — Nomenclatura e organização são inconsistentes

**Severidade**: Baixo

**Local**: `src/Model/` e `src/models/`; `Dashbord`; `MothYearSelector`; `ObterSusgentaoCategorias`; `ReplicarTranscoes`

- **Esperado**: convenção única de casing, idioma e nomes.
- **Implementado**: pastas duplicadas por casing e nomes com erros ortográficos convivem na base.
- **Impacto**: dificulta busca, onboarding e execução em sistemas case-sensitive.
- **Sugestão**: corrigir em migração isolada, com atualização atômica dos imports.

## 5. CSS/SCSS/Quasar

### CSS-01 — Overrides profundos dependem de `!important`

**Severidade**: Médio

**Local**: cards do dashboard; `MothYearSelector.vue:331-453`; `ModernDateInput.vue:127-142`

- **Esperado**: customização via API do Quasar, wrappers e tokens com especificidade previsível.
- **Implementado**: há vários `!important` para raio, sombra, cursor, borda e estados internos.
- **Impacto**: cria uma escala de especificidade difícil de evoluir e sensível a upgrades do Quasar.
- **Sugestão**: migrar primeiro os shells dos cards e documentar exceções realmente necessárias.

### CSS-02 — Estilos inline dificultam consistência e responsividade

**Severidade**: Médio

**Local**: componentes de dashboard, metas, `MothYearSelector.vue:25,70` e `ModernDateInput.vue:46`

- **Esperado**: estilos estáticos e responsivos em classes/tokens; `:style` apenas para valores realmente dinâmicos.
- **Implementado**: dimensões, flex, espaçamento, raio e opacidade aparecem inline em diversos templates.
- **Impacto**: reduz reutilização, dificulta media queries e aumenta divergência visual.
- **Sugestão**: mover estilos estáticos para classes; preservar bindings apenas para cor/progresso calculados.

---

## Evidências de validação

- `npm test`: passou, incluindo `test:quality:a11y` e `test:quality:performance`.
- `npm run lint`: passou.
- `npm run build`: passou.
- `git diff --check`: passou.
- Revisão independente final: PASS, sem achados críticos, altos ou médios no escopo.
- Build: 1.194,68 KB de JS e 233,75 KB de CSS; entrypoint de 255,27 KB sem ApexCharts e dashboard lazy de 603,42 KB.
- Logo: 26.578 bytes, 90,3% menor que o PNG anterior.

## Próxima rodada recomendada

Executar a Fase 3 do plano em `.specs/frontend-quality-improvements/IMPLEMENTATION-PLAN.md`: consolidar configuração HTTP, fortalecer tipagem/lint, implantar testes de componentes/fluxos e decompor responsabilidades. A nota ainda está abaixo da meta de 9,0 e restam 1 achado alto, 8 médios e 1 baixo.
