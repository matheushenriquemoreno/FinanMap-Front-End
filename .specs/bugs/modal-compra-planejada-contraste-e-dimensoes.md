# Bug — Modal de compra planejada com contraste e dimensões divergentes

| Status       | Resolvido  |
| ------------ | ---------- |
| Created      | 2026-09-19 |
| Last Updated | 2026-09-19 |

## Comportamento esperado e observado

**Esperado:** o modal deve apresentar campos com a mesma altura visual, tornar
a seção de lojas compreensível e legível nos temas claro e escuro, e usar
“Salvar” como ação de criação.

**Observado:** no modal de nova compra, “Valor estimado” fica menor que os
demais campos; no dark mode, a seção “Lojas para pesquisar” tem pouca
separação da superfície do modal e textos auxiliares pouco contrastados; o
botão exibe “Salvar plano”.

## Contexto e evidências

- **Entradas:** abrir o modal de nova compra planejada sem links adicionados.
- **Ambiente:** FinanMap Front-end, Vue 3/Quasar, desktop, temas claro e escuro.
- **Frequência:** sempre que o modal é aberto nessas condições.
- **Evidências:** prints fornecidos pelo usuário em
  `C:\Users\Usuario1\AppData\Local\Temp\codex-clipboard-21561ae1-0658-407b-bc31-8a7cdcbc4f5c.png`
  e
  `C:\Users\Usuario1\AppData\Local\Temp\codex-clipboard-d395180e-4276-4174-ba4e-35dbf535036a.png`.

## Reprodução

1. Atualizar a aplicação e autenticar.
2. Acessar `/compras-planejadas` e abrir “Nova compra planejada”.
3. Comparar a altura de “Valor estimado” com os campos adjacentes.
4. Alternar entre claro e escuro e observar “Lojas para pesquisar”.
5. Conferir o rótulo do botão de submissão sem uma compra existente.

**Confirmação:** a reprodução apresenta os três sintomas relatados — sim; a
diferença de altura decorre da prop padrão do componente de moeda, e a seção
usa uma superfície e textos auxiliares sem variante específica para dark mode.

## Hipóteses testadas e resultados

| #   | Hipótese                                                             | Teste (uma variável por vez)                                                                                                    | Resultado                                                                                                        |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| H1  | O campo de valor tem altura diferente por uma regra global do tema.  | Comparar as props do `MoneyInputBR` com os `q-input`/`q-select` adjacentes e inspecionar o default do componente compartilhado. | Refutada; o `MoneyInputBR` define `dense=true` por padrão e a chamada não o substitui.                           |
| H2  | A dificuldade no dark mode vem de dados, API ou estado de permissão. | Inspecionar o markup e os estilos locais da seção sem alterar o carregamento de dados.                                          | Refutada; o sintoma existe com lista vazia e é produzido pela superfície/borda e pelos textos auxiliares locais. |
| H3  | O CTA divergente é apenas o texto condicional do modal.              | Inspecionar a expressão `label` do botão de submissão.                                                                          | Confirmada; a criação retorna literalmente “Salvar plano”.                                                       |

## Causa raiz confirmada

`CompraPlanejadaFormModal.vue` usa `MoneyInputBR` sem `dense=false`, enquanto
os campos Quasar vizinhos usam a densidade padrão. A seção de lojas só possui
estilos claros e aplica `text-grey-6` aos textos auxiliares em ambos os temas,
sem uma superfície dark dedicada. O rótulo de criação contém uma expressão
condicional específica com “Salvar plano”.

## Proposta de correção

Passar `dense=false` somente na instância do `MoneyInputBR` deste modal,
adicionar uma classe dark local para a superfície/borda e textos da seção de
lojas com instrução explícita sobre nome e link do produto, e trocar apenas o
rótulo de criação para “Salvar”, preservando “Salvar alterações” na edição.

## Teste de regressão

`scripts/check-lista-compras-planejadas.mjs` exige a prop de densidade, a
variante `links-section--dark`, a instrução de loja/link e a expressão de CTA;
as novas assertivas devem falhar antes da correção e passar depois.

## Validações realizadas

- Teste de regressão antes da correção: `npm run test:compras-planejadas` falhou
  na assertiva `:dense="false"`, confirmando o contrato ausente antes da
  alteração.
- Correção aplicada: `CompraPlanejadaFormModal.vue` recebeu densidade explícita
  no valor, variante dark local para lojas, texto orientativo e CTA simplificado.
- Teste de regressão depois: `npm run test:compras-planejadas` passou com os
  contratos de densidade, dark mode, instrução e CTA.
- Reprodução original: a evidência estática da causa foi eliminada; a inspeção
  visual autenticada não foi concluída porque a aplicação local redirecionou
  para `/login` e não foram fornecidas credenciais para automação.
- Testes relevantes do projeto: `npm test`, `npm run lint`, `npx vue-tsc
--noEmit`, `npm run build`, Prettier focado e `git diff --check` passaram.

## Riscos e prevenções futuras

- **Risco:** alterar o default de `MoneyInputBR` afetaria outros formulários.
  **Prevenção:** limitar a densidade ao uso deste modal.
- **Risco:** uma regra de dark mode scoped atingir o `body` indevidamente.
  **Prevenção:** manter a variante em classes locais do componente e validar
  `npm test`.
