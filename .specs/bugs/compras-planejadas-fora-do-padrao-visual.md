# Bug — Compras Planejadas fora do padrão visual

| Status       | Resolvido  |
| ------------ | ---------- |
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

## Comportamento esperado e observado

**Esperado:** a tela de Compras Planejadas deve reutilizar a composição visual
das telas de Metas e Custos Fixos: cabeçalho padrão, resumo em cards, filtros
segmentados, grid e estados Quasar consistentes.

**Observado:** a tela exibe um gradiente próprio, abas `q-tabs`, um banner-resumo
escuro e um estado vazio ilustrado com CTA duplicado, destoando das telas de
referência.

## Contexto e evidências

- **Entradas:** navegação para `/compras-planejadas` sem alterar dados.
- **Ambiente:** FinanMap Front-end, Vue 3/Quasar, desktop.
- **Frequência:** sempre que a tela é aberta.
- **Evidências:** captura fornecida em `C:\Users\Usuario1\AppData\Local\Temp\codex-clipboard-014fe22a-561c-4bb1-9ad2-190f6b47e60b.png`; `ComprasPlanejadasPage.vue` usa `gradient`, `q-tabs` e `.compras-total`, enquanto Metas usa `PainelResumoMetas` e Custos Fixos usa busca com `q-btn-toggle`.

## Reprodução

1. Iniciar o front-end.
2. Autenticar e acessar `/compras-planejadas`.
3. Comparar cabeçalho, resumo, filtros, cards e estado vazio com `/metas` e `/custos-fixos`.

**Confirmação:** a reprodução apresenta exatamente a divergência visual
relatada — sim; os seletores e estilos exclusivos da página são observáveis no
código e na captura.

## Hipóteses testadas e resultados

| #   | Hipótese                                               | Teste (uma variável por vez)                                                                 | Resultado                                                                                                 |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| H1  | O desvio vem de dados ou permissões.                   | Inspecionar modelos, serviços e bindings de permissão.                                       | Refutada; o comportamento de dados e ações é independente da composição visual.                           |
| H2  | O desvio vem de markup e estilos exclusivos da página. | Comparar `ComprasPlanejadasPage.vue` e `CompraPlanejadaCard.vue` com as telas de referência. | Confirmada; gradiente, abas, banner-resumo, ilustração e estilos próprios estão implementados localmente. |

## Causa raiz confirmada

`ComprasPlanejadasPage.vue` não reutiliza `PainelResumoMetas`, cria o próprio
seletor e resumo com estilos exclusivos e mantém um estado vazio diferente dos
componentes de referência. A causa é estrutural/presentacional, não de API.

## Proposta de correção

Reutilizar `PageHeaderBanner` com o gradiente padrão, criar um painel de resumo
no padrão de Metas, usar busca e `q-btn-toggle` no padrão de Custos Fixos,
padronizar cards/estados e preservar toda a lógica de domínio existente.

## Teste de regressão

Ampliar `scripts/check-lista-compras-planejadas.mjs` para exigir os padrões de
markup e testar a filtragem local por nome. O teste foi preparado antes da
correção e deve falhar enquanto os seletores exclusivos atuais permanecerem.

## Validações realizadas

- Teste de regressão antes da correção: `npm run test:compras-planejadas` falhou em `assert.doesNotMatch(page, /<q-tabs/)`, confirmando o seletor divergente.
- Correção aplicada: painel de resumo, filtros e estados padronizados em `ComprasPlanejadasPage.vue`, novo `PainelResumoCompras.vue`, card alinhado e helper de busca.
- Teste de regressão depois: `npm run test:compras-planejadas` passou com contratos, CRUD, ciclo, permissões, busca e massa de 500 itens.
- Reprodução original: o markup e estilos exclusivos que produziam a divergência foram removidos; inspeção autenticada completa no navegador não foi possível sem credenciais adicionais.
- Testes relevantes do projeto: `npm test`, `npm run lint`, `npx vue-tsc --noEmit`, `npm run build` e `git diff --check` passaram.

## Riscos e prevenções futuras

- **Risco:** carregamento paralelo tornar o estado global de loading impreciso. **Prevenção:** usar flags de carregamento/erro por lista na página e manter cada conjunto confirmado visível.
- **Risco:** novos módulos repetirem markup próprio. **Prevenção:** preferir `PageHeaderBanner`, painéis de resumo e padrões de filtro compartilhados nas próximas telas.
