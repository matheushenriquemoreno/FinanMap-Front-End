# Relatório de Qualidade de Implementação Front-end

**Escopo analisado**: codebase completa

**Path**: `D:\FinamMap\FinanMap-Front-End`

**Data**: 19/07/2026

**Rodada**: 4 — reauditoria após a Fase 3

**Stack identificada**: Vue 3.5, Quasar 2.18, Vite 6.4, TypeScript 5.9 em modo estrito, Pinia 3, Vue Router 4 em modo hash, Axios 1.18, Vitest 3.2, Vue Test Utils 2.4, ApexCharts 4 e SCSS.

---

## Resumo executivo

A terceira fase eliminou o risco alto de credenciais persistidas no navegador e os quatro débitos médios de arquitetura. Access e refresh tokens agora ficam somente em memória; como o backend atual recebe o refresh token no corpo e não oferece cookie `HttpOnly`, recarregar a página encerra a sessão por decisão explícita de segurança.

Configuração e transporte HTTP foram consolidados em um único `apiClient`, com URL por ambiente, validação antes do build, refresh preventivo/forçado deduplicado e retry único após `401`. O lockfile também foi atualizado: `npm audit` caiu de 1 crítico, 14 altos e 8 médios para apenas 2 baixos em dependências de desenvolvimento.

O lint voltou a rejeitar `any`, símbolos sem uso e promises flutuantes. Vitest e Vue Test Utils executam oito testes de sessão, store, componente, composable, concorrência de refresh e interceptores. Os cinco maiores SFCs auditados delegam estado/efeitos a composables, mantêm CSS externo e ficaram abaixo de 300 linhas. Permanecem quatro achados médios, todos concentrados em Design System e CSS para a Fase 4.

| Dimensão                            |  Nota   | Crítico | Alto  | Médio | Baixo |
| ----------------------------------- | :-----: | :-----: | :---: | :---: | :---: |
| Design System / consistência visual |   9,0   |    0    |   0   |   2   |   0   |
| Performance / Core Web Vitals       |  10,0   |    0    |   0   |   0   |   0   |
| Acessibilidade / UX                 |  10,0   |    0    |   0   |   0   |   0   |
| Arquitetura Vue/Quasar              |   9,7   |    0    |   0   |   0   |   3   |
| CSS/SCSS/Quasar                     |   9,0   |    0    |   0   |   2   |   0   |
| **Nota geral ponderada**            | **9,7** |  **0**  | **0** | **4** | **3** |

**Pesos**: Performance 25%, Acessibilidade/UX 25%, Arquitetura 25%, Design System 15% e CSS/SCSS/Quasar 10%. Tailwind não foi cobrado porque não faz parte da stack.

### Evolução da qualidade

| Indicador      | Rodada 1 | Rodada 2 | Rodada 3 | Rodada 4 | Evolução total |
| -------------- | :------: | :------: | :------: | :------: | :------------: |
| Nota ponderada |   5,7    |   8,0    |   8,9    |   9,7    |      +4,0      |
| Críticos       |    2     |    0     |    0     |    0     |       -2       |
| Altos          |    6     |    3     |    1     |    0     |       -6       |
| Médios         |    10    |    9     |    8     |    4     |       -6       |

---

## Top 3 prioridades restantes

1. Centralizar cores semânticas de gráficos e componentes em tokens compartilhados.
2. Extrair o shell visual comum dos cards de dashboard.
3. Reduzir estilos inline estáticos, overrides profundos e `!important` não essenciais.

---

## Achados resolvidos nesta rodada

### ARCH-02 — Credenciais persistidas no navegador — Resolvido

- `SessionService.ts` mantém access token, refresh token e identidade apenas em memória; a varredura de arquitetura proíbe `token` e `refreshToken` em `localStorage`/`sessionStorage`.
- Login inicia a sessão em memória; router, interceptores, renovação e logout consomem o mesmo serviço.
- O contrato disponível no backend ainda recebe refresh token no corpo. Sem cookie `HttpOnly`, a decisão segura é exigir novo login após reload, evitando uma credencial financeira persistente e legível por JavaScript.

### ARCH-03 — Ambiente e transporte HTTP concorrentes — Resolvido

- `.env.prod` e `.env.example` documentam a URL por ambiente; `validate-build-env.mjs` rejeita configuração ausente ou fora de HTTP(S) antes do build.
- `ApiConfig.ts` normaliza a base URL, e `AxiosHelper.ts` contém o único `axios.create` da aplicação.
- Serviços autenticados, autenticação, refresh, `$api` e `$axios` usam o mesmo `apiClient`; endpoints públicos usam `skipSession` para não enviar token nem contexto de compartilhamento.

### ARCH-04 — Regras críticas de lint desativadas — Resolvido

- `no-explicit-any`, `no-unused-vars` e `no-floating-promises` voltaram como erros globais.
- Os 117 erros inicialmente expostos foram tipados ou tratados; a suíte atual passa sem suppression global dessas regras.

### ARCH-05 — Componentes com responsabilidades misturadas — Resolvido

- `SectionFiltrarPeriodo`, `CustosFixosPage`, `CategoriaConfig`, `CompartilhamentoModal` e `MothYearSelector` delegam estado e efeitos a composables nomeados.
- Os estilos foram movidos para arquivos dedicados e todos os cinco SFCs ficaram abaixo do limite de 300 linhas da rodada.

### ARCH-06 — Ausência de testes comportamentais reais — Resolvido

- Vitest, jsdom e Vue Test Utils agora fazem parte de `npm test`.
- Oito testes cobrem sessão em memória, store Pinia, renderização de componente, navegação de período, refresh concorrente, rotação de tokens, classificação 4xx/rede/5xx, retry após `401` e isolamento dos endpoints públicos.
- A correção foi guiada por RED/GREEN; os testes dos interceptores revelaram e impediram a repetição do token antigo após `401`.

### DEP-01 — Lockfile com vulnerabilidades críticas e altas — Resolvido

- Axios foi atualizado para 1.18.1 e a toolchain foi alinhada a TypeScript 5.9, `vue-tsc` 3.3 e `vite-plugin-checker` 0.14.
- `npm audit` passou de 29 vulnerabilidades (1 crítica, 14 altas, 8 médias e 6 baixas) para 2 baixas de desenvolvimento, sem `--force` ou upgrade para TypeScript 7.

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

Nenhum achado crítico, alto ou médio permanece nesta dimensão. Os débitos abaixo são baixos e não bloqueiam a Fase 4.

### ARCH-07 — Nomenclatura e organização são inconsistentes

**Severidade**: Baixo

**Local**: `src/Model/` e `src/models/`; `Dashbord`; `MothYearSelector`; `ObterSusgentaoCategorias`; `ReplicarTranscoes`

- **Esperado**: convenção única de casing, idioma e nomes.
- **Implementado**: pastas duplicadas por casing e nomes com erros ortográficos convivem na base.
- **Impacto**: dificulta busca, onboarding e execução em sistemas case-sensitive.
- **Sugestão**: corrigir em migração isolada, com atualização atômica dos imports.

### ARCH-08 — Não há smoke E2E de jornada completa

**Severidade**: Baixo

**Local**: `tests/unit/`; `package.json`

- **Esperado**: login, refresh, lançamento e logout também devem ter um smoke test no navegador.
- **Implementado**: os contratos críticos agora têm testes unitários e de componente, mas ainda não há Playwright/Cypress.
- **Impacto**: integração entre navegação, foco e backend pode regredir fora das fronteiras unitárias.
- **Sugestão**: adicionar smoke E2E quando houver ambiente de API isolado e determinístico.

### ARCH-09 — Auditoria mantém duas vulnerabilidades baixas de desenvolvimento

**Severidade**: Baixo

**Local**: `@quasar/app-vite` → `esbuild`

- **Esperado**: lockfile sem advisories conhecidos.
- **Implementado**: `npm audit` informa duas ocorrências baixas ligadas ao dev server no Windows; não há correção compatível adicional sem trocar a linha principal da toolchain.
- **Impacto**: risco restrito ao ambiente local de desenvolvimento, sem dependência afetada no bundle de produção.
- **Sugestão**: acompanhar a próxima versão compatível do builder Quasar e atualizar assim que o advisory for resolvido.

## 5. CSS/SCSS/Quasar

### CSS-01 — Overrides profundos dependem de `!important`

**Severidade**: Médio

**Local**: cards do dashboard; `MothYearSelector.styles.css`; `ModernDateInput.vue:127-142`

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

- `npm test`: passou, com 6 arquivos/8 testes Vitest e todos os checkers de regressão.
- `npm run lint`: passou.
- `npm run build`: passou após validar `.env.prod`; URL com protocolo inválido também foi rejeitada no teste negativo.
- `git diff --check`: passou.
- `npm audit`: 0 crítico, 0 alto, 0 médio e 2 baixos.
- Revisão independente final: PASS após três ciclos, sem achados críticos, altos ou médios no escopo da Fase 3.
- Build: 1.193,92 KB de JS e 229,19 KB de CSS; entrypoint de 91,50 KB e dashboard lazy de 596,86 KB.
- Logo: 26.578 bytes, 90,3% menor que o PNG anterior.

## Próxima rodada recomendada

Executar a Fase 4 do plano em `.specs/frontend-quality-improvements/IMPLEMENTATION-PLAN.md`: centralizar tokens semânticos e shells de cards, reduzir estilos inline estáticos, overrides profundos e `!important`. A nota já superou 9,0, mas o gate final ainda exige resolver os quatro achados médios restantes; também permanecem três débitos baixos não bloqueantes.
