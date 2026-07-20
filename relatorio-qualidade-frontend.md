# Relatório de Qualidade de Implementação Front-end

**Escopo analisado**: codebase completa

**Path**: `D:\FinamMap\FinanMap-Front-End`

**Data**: 19/07/2026

**Rodada**: 2 — reauditoria após a Fase 1

**Stack identificada**: Vue 3.4, Quasar 2.18, Vite 6.2, TypeScript 5.5 em modo estrito, Pinia 3, Vue Router 4 em modo hash, Axios 1.2, ApexCharts 4 e SCSS.

---

## Resumo executivo

A primeira rodada de correções eliminou todos os achados críticos e reduziu os altos de seis para três. Os fluxos centrais agora têm nomes acessíveis, headings semânticos, controles de período e data operáveis por teclado, zoom habilitado, autenticação responsiva e redirecionamento de sessão compatível com o router hash.

A regressão automatizada adicionada varre os componentes Vue, correlaciona `label`/`for`, verifica imagens e botões icon-only e cobre os contratos dos wrappers de input. O checker também contém casos negativos para não confundir `v-for`, `data-label` ou `some-for` com atributos acessíveis. A implementação passou por revisão independente após duas rodadas de endurecimento do teste.

O principal risco restante está em performance: ApexCharts ainda participa do boot global e o dashboard continua repetindo chamadas equivalentes em componentes diferentes. A arquitetura de sessão também mantém access e refresh tokens no `localStorage`, o que exige alinhamento com o backend.

| Dimensão                            |  Nota   | Crítico | Alto  | Médio | Baixo |
| ----------------------------------- | :-----: | :-----: | :---: | :---: | :---: |
| Design System / consistência visual |   9,0   |    0    |   0   |   2   |   0   |
| Performance / Core Web Vitals       |   6,5   |    0    |   2   |   1   |   0   |
| Acessibilidade / UX                 |  10,0   |    0    |   0   |   0   |   0   |
| Arquitetura Vue/Quasar              |   6,4   |    0    |   1   |   4   |   1   |
| CSS/SCSS/Quasar                     |   9,0   |    0    |   0   |   2   |   0   |
| **Nota geral ponderada**            | **8,0** |  **0**  | **3** | **9** | **1** |

**Pesos**: Performance 25%, Acessibilidade/UX 25%, Arquitetura 25%, Design System 15% e CSS/SCSS/Quasar 10%. Tailwind não foi cobrado porque não faz parte da stack.

### Evolução da qualidade

| Indicador      | Rodada 1 | Rodada 2 | Evolução |
| -------------- | :------: | :------: | :------: |
| Nota ponderada |   5,7    |   8,0    |   +2,3   |
| Críticos       |    2     |    0     |    -2    |
| Altos          |    6     |    3     |    -3    |
| Médios         |    10    |    9     |    -1    |

---

## Top 3 prioridades restantes

1. Remover ApexCharts do boot global e confirmar que autenticação não baixa o chunk de 561,98 KB.
2. Centralizar e deduplicar as quatro chaves de dados do dashboard hoje solicitadas por vários componentes.
3. Migrar a sessão para cookie `HttpOnly` em conjunto com o backend, retirando o refresh token do `localStorage`.

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

### PERF-01 — ApexCharts é carregado no boot global

**Severidade**: Alto

**Local**: `quasar.config.ts:14`; `src/boot/apexchart.ts:1`; build de produção

- **Esperado**: uma biblioteca exclusiva de gráficos deve carregar apenas nas rotas que a utilizam.
- **Implementado**: `apexchart` permanece no boot e o build gera um chunk de **561,98 KB minificado / 152,81 KB gzip**.
- **Impacto**: páginas públicas pagam transferência, parsing e inicialização sem exibir gráficos.
- **Sugestão**: remover o boot e usar wrapper assíncrono/import dinâmico nos componentes do dashboard.

### PERF-02 — O dashboard repete chamadas equivalentes por componente

**Severidade**: Alto

**Local**: `DashboardSummaryCards.vue:94-117`; `DashboardBalanceCard.vue:147-157`; `DashboardRadialComposition.vue:181-192`; componentes de evolução e categoria

- **Esperado**: dados compartilhados devem ser buscados uma vez por período/tipo e distribuídos de forma reativa.
- **Implementado**: resumo, evolução e categorias são solicitados por componentes independentes e repetidos nos watchers.
- **Impacto**: aumenta rede/backend, cria loaders concorrentes e permite recortes temporalmente inconsistentes.
- **Sugestão**: cachear as quatro chaves no store por período/tipo e carregá-las com uma única orquestração.

### PERF-03 — Logo de autenticação está superdimensionado

**Severidade**: Médio

**Local**: `src/assets/logo-sem-fundo-menor.png`; páginas de autenticação

- **Esperado**: um logo exibido a 160–180 px deve usar vetor ou bitmap otimizado e dimensões reservadas.
- **Implementado**: o PNG tem 753×626 e 273.115 bytes, mas é renderizado em tamanho muito menor.
- **Impacto**: transfere bytes desnecessários nas três rotas públicas e pode atrasar o elemento visual principal.
- **Sugestão**: substituir por SVG limpo ou WebP/AVIF recortado e declarar dimensões/aspect ratio.

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
- **Implementado**: os checks estruturais melhoraram e agora cobrem acessibilidade no código-fonte, mas ainda usam leitura de arquivos e regex; não há Vitest, Vue Test Utils ou Playwright.
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

- `npm test`: passou, incluindo `test:quality:a11y`.
- `npm run lint`: passou.
- `npm run build`: passou.
- `git diff --check`: passou.
- Revisão independente final: PASS, sem bloqueantes.
- Build: 1.192,74 KB de JS e 233,74 KB de CSS; warning de chunk mantido para a Fase 2.

## Próxima rodada recomendada

Executar a Fase 2 do plano em `.specs/frontend-quality-improvements/IMPLEMENTATION-PLAN.md`: carregamento sob demanda do ApexCharts, store/orquestração única dos dados do dashboard e otimização do logo. Essa rodada deve remover os dois achados altos de performance e elevar a nota projetada para aproximadamente 8,9, desde que não introduza novas regressões.
