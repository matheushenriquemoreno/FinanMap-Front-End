# Relatório de Qualidade de Implementação Front-end

**Escopo analisado**: codebase completa

**Path**: `D:\FinamMap\FinanMap-Front-End`

**Data**: 19/07/2026

**Rodada**: 5 — reauditoria final após a Fase 4

**Stack identificada**: Vue 3.5, Quasar 2.18, Vite 6.4, TypeScript 5.9 em modo estrito, Pinia 3, Vue Router 4 em modo hash, Axios 1.18, Vitest 3.2, Vue Test Utils 2.4, ApexCharts 4 e SCSS.

---

## Resumo executivo

As quatro fases planejadas foram concluídas. A rodada final removeu os quatro últimos achados médios: cores de gráficos agora derivam das variáveis semânticas do Quasar por uma fronteira única e segura sem DOM; o shell dos cards analíticos foi consolidado; estilos estáticos saíram dos templates auditados; e os overrides frágeis de dashboard, seletor de período e calendário foram substituídos por especificidade previsível.

A regressão `check-design-system-css.mjs` verifica o uso executável de `getCssVar`, o fallback server-side, os consumidores do tema, as propriedades concretas do shell compartilhado e a ausência dos padrões removidos. Paletas são recalculadas dentro de dependências reativas do dark mode, evitando cores congeladas após a troca de tema.

Não restam achados críticos, altos ou médios. Permanecem cinco débitos baixos: três arquiteturais já conhecidos e dois de CSS legado fora dos hotspots corrigidos. A suíte completa, o lint, o build e a revisão independente passam.

| Dimensão                            |  Nota   | Crítico | Alto  | Médio | Baixo |
| ----------------------------------- | :-----: | :-----: | :---: | :---: | :---: |
| Design System / consistência visual |  10,0   |    0    |   0   |   0   |   0   |
| Performance / Core Web Vitals       |  10,0   |    0    |   0   |   0   |   0   |
| Acessibilidade / UX                 |  10,0   |    0    |   0   |   0   |   0   |
| Arquitetura Vue/Quasar              |   9,7   |    0    |   0   |   0   |   3   |
| CSS/SCSS/Quasar                     |   9,5   |    0    |   0   |   0   |   2   |
| **Nota geral ponderada**            | **9,9** |  **0**  | **0** | **0** | **5** |

**Pesos**: Performance 25%, Acessibilidade/UX 25%, Arquitetura 25%, Design System 15% e CSS/SCSS/Quasar 10%. Tailwind não foi cobrado porque não faz parte da stack.

### Evolução da qualidade

| Indicador      | Rodada 1 | Rodada 2 | Rodada 3 | Rodada 4 | Rodada 5 | Evolução total |
| -------------- | :------: | :------: | :------: | :------: | :------: | :------------: |
| Nota ponderada |   5,7    |   8,0    |   8,9    |   9,7    |   9,9    |      +4,2      |
| Críticos       |    2     |    0     |    0     |    0     |    0     |       -2       |
| Altos          |    6     |    3     |    1     |    0     |    0     |       -6       |
| Médios         |    10    |    9     |    8     |    4     |    0     |      -10       |

---

## Top 3 prioridades restantes

1. Normalizar nomes e casing de pastas/arquivos em uma migração isolada.
2. Adicionar smoke E2E das jornadas financeiras críticas quando houver API de teste determinística.
3. Reduzir gradualmente os estilos inline e overrides legados de baixa severidade fora dos hotspots da Fase 4.

---

## Achados resolvidos nesta rodada

### DS-01 — Cores semânticas repetidas como valores literais — Resolvido

- `src/design-system/dashboardTheme.ts` resolve `primary`, `positive`, `negative` e `info` com `getCssVar`, mantém fallback sem DOM e fornece paletas tipadas para séries, categorias e heatmap.
- Oito consumidores explícitos importam a fronteira semântica; chips e estados visuais usam custom properties nomeadas em `app.scss`.
- Paletas são obtidas dentro de `computed` que acompanham `$q.dark.isActive`, preservando a troca de tema em runtime.

### DS-02 — Shell visual dos cards de dashboard duplicado — Resolvido

- `.dashboard-card`, seus modificadores claro/escuro e utilitários de corpo/estado vivem em `src/css/app.scss`.
- Nove componentes analíticos usam o mesmo shell; raio, overflow, transição e elevação não são mais repetidos nos SFCs.

### CSS-01 — Overrides profundos dependentes de `!important` — Resolvido

- Cards do dashboard não usam mais `!important` para raio ou sombra.
- `MothYearSelector` usa seletores de estado com especificidade local e tokens semânticos.
- `ModernDateInput` usa wrappers compostos para borda, cursor e raios do card, sem escalation de especificidade.

### CSS-02 — Estilos inline nos hotspots auditados — Resolvido

- Dimensões e estados dos gráficos usam utilitários compartilhados; apenas larguras e cores realmente calculadas permanecem em `:style`.
- Metas, seletor de período e calendário moveram dimensões, flex, opacidade, tipografia e raios estáticos para classes locais.
- A regressão percorre esses diretórios e impede a reintrodução de atributos `style` estáticos.

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

Nenhum achado aberto. Os tokens semânticos e o shell dos cards possuem fonte compartilhada e regressão automatizada.

## 2. Performance / Core Web Vitals

Nenhum achado aberto nesta rodada. O dashboard ainda gera um aviso por ultrapassar 500 KB, mas esse chunk é lazy e exclusivo da rota que usa os gráficos; não afeta mais a carga inicial das páginas públicas.

## 3. Acessibilidade / UX

Nenhum achado aberto nesta rodada. Isso não equivale a certificação WCAG; auditoria manual em navegador e leitor de tela continua recomendada para releases maiores.

## 4. Arquitetura Vue/Quasar

Nenhum achado crítico, alto ou médio permanece nesta dimensão. Os débitos abaixo são baixos e não bloqueiam o gate final de qualidade.

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

Nenhum achado crítico, alto ou médio permanece nesta dimensão.

### CSS-03 — Overrides legados permanecem fora dos hotspots corrigidos

**Severidade**: Baixo

**Local**: `src/css/app.scss`; configuração de conta/compartilhamento; custos fixos

- **Esperado**: customizações do Quasar devem preferir tokens e seletores locais previsíveis.
- **Implementado**: 23 declarações `!important` permanecem em regras globais de dark mode, tooltip e módulos legados não relacionados aos quatro achados médios.
- **Impacto**: manutenção localizada e risco baixo de disputa de especificidade em futuros upgrades.
- **Sugestão**: remover por módulo quando cada tela voltar a ser alterada, com teste visual claro/escuro.

### CSS-04 — Estilos inline simples permanecem em módulos legados

**Severidade**: Baixo

**Local**: layout, autenticação, configurações, tabelas e modais de transação

- **Esperado**: estilos estáticos devem preferir classes, sobretudo quando reutilizados ou responsivos.
- **Implementado**: 34 atributos estáticos simples ainda definem largura, tipografia ou raio em componentes fora do escopo focal da Fase 4.
- **Impacto**: dívida dispersa, sem efeito funcional ou inconsistência sistêmica observada nesta rodada.
- **Sugestão**: migrar oportunisticamente para classes locais; bindings calculados devem continuar como `:style`.

---

## Evidências de validação

- `npm test`: passou, com 6 arquivos/8 testes Vitest e todos os checkers de regressão.
- `npm run lint`: passou.
- `npm run build`: passou após validar `.env.prod`; URL com protocolo inválido também foi rejeitada no teste negativo.
- `git diff --check`: passou.
- `npm audit`: 0 crítico, 0 alto, 0 médio e 2 baixos.
- Revisão independente final da Fase 4: PASS após corrigir segurança sem DOM, reatividade de tema, robustez do checker e a colisão do prop `flat` com a elevação compartilhada.
- Build: 1.193,96 KB de JS e 230,15 KB de CSS; entrypoint de 91,50 KB e dashboard lazy de 597,06 KB.
- Logo: 26.578 bytes, 90,3% menor que o PNG anterior.

## Próxima rodada recomendada

O gate final foi atingido: **9,9**, sem achados críticos, altos ou médios. As próximas rodadas podem tratar os cinco débitos baixos como manutenção evolutiva, priorizando smoke E2E, nomenclatura e remoção oportunística de CSS legado.
