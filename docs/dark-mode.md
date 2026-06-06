# Dark Mode: arquitetura e prevenção de regressões

Este documento registra a arquitetura do tema do FinanMap, a causa raiz da
regressão corrigida em junho de 2026 e as regras que devem ser seguidas para
evitar novas áreas brancas no modo escuro.

## Arquitetura do tema

O estado do tema é controlado pelo `theme-store`, que chama `Dark.set()` do
Quasar. O Quasar adiciona ao `body` uma das classes:

- `body--light`
- `body--dark`

As cores compartilhadas ficam em `src/css/app.scss`. A superfície principal
deve sempre usar `--bg-primary`:

```scss
:root {
  --bg-primary: #f7f7f7;
}

body.body--dark {
  --bg-primary: var(--q-dark-page);
}

body,
.q-page-container,
.q-page {
  background-color: var(--bg-primary);
}
```

O `body` cobre a viewport inteira. O `.q-page-container` cobre também rotas que
não usam `<q-page>`, como as telas de gerenciamento mensal. O `.q-page` garante
que páginas Quasar explícitas usem a mesma superfície.

## Causa raiz da regressão

A regressão tinha três fatores combinados:

1. `--bg-primary` não era redefinida dentro de `body.body--dark`, então podia
   continuar com a cor clara.
2. Somente o dashboard definia manualmente um fundo escuro no próprio
   `<q-page>`. Os outros módulos dependiam do fundo global.
3. Seletores parciais com `:global(body.body--dark)` dentro de um
   `<style scoped>` foram compilados como regras aplicadas diretamente ao
   `body`, deixando seu fundo transparente.

O dashboard funcionar parcialmente escondia a ausência da regra global.

## Regras obrigatórias

### Superfícies

- Use `var(--bg-primary)` para o fundo geral.
- Use `var(--bg-card)` para cards, tabelas e painéis.
- Não crie uma classe escura exclusiva para uma página, como
  `.bg-dark-page`, quando a intenção for seguir o tema global.
- Não aplique `bg-white`, `background: white` ou `#fff` sem uma alternativa
  explícita para dark mode.
- Componentes podem customizar sua superfície, mas não devem sobrescrever o
  fundo global do `body`.

### Vue scoped CSS

Dentro de `<style scoped>`, não use um `:global()` parcial:

```scss
/* Incorreto: pode compilar uma regra diretamente no body. */
:global(body.body--dark) .meu-componente:hover {
  background: rgba(255, 255, 255, 0.08);
}
```

Coloque o seletor completo dentro de `:global()`:

```scss
/* Correto. */
:global(body.body--dark .meu-componente:hover) {
  background: rgba(255, 255, 255, 0.08);
}
```

Para componentes Quasar, prefira `$q.dark.isActive` quando a diferença de tema
for comportamental ou definida por props. Para estilos globais, use
`body.body--dark` e as variáveis de tema.

## Guarda automatizada

Execute:

```bash
npm test
```

A checagem `scripts/check-dark-mode.mjs` falha quando:

- `--bg-primary` deixa de usar `--q-dark-page` no modo escuro;
- `.q-page-container` e `.q-page` deixam de usar a superfície global;
- o dashboard volta a ter uma implementação exclusiva de fundo escuro;
- um seletor parcial perigoso `:global(body.body--dark) ...` é introduzido.

Essa checagem protege a arquitetura. Ela não substitui a validação visual.

## Checklist de revisão

Ao criar ou alterar uma página:

1. Alternar entre claro e escuro sem recarregar.
2. Verificar topo, conteúdo, espaços vazios e área abaixo do conteúdo.
3. Validar rotas com `<q-page>` e rotas sem `<q-page>`.
4. Inspecionar `body`, `.q-page-container` e `.q-page` no navegador.
5. Confirmar que nenhum componente scoped gerou regra inesperada no `body`.
6. Executar `npm test`, `npm run lint` e `npm run build`.

Rotas mínimas para regressão:

- `/`, `/Despesas` e `/Investimentos`
- `/dashbord`
- `/metas`
- `/custos-fixos`

## Referências oficiais

- [Quasar Dark Mode](https://quasar.dev/style/dark-mode/)
- [Quasar Dark Plugin](https://quasar.dev/quasar-plugins/dark/)
- [Quasar Body Classes](https://quasar.dev/style/body-classes/)
- [Vue SFC CSS Features](https://vuejs.org/api/sfc-css-features.html)
