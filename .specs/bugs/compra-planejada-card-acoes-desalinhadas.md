# Bug — Card de compra planejada com ações desalinhadas

| Status       | Resolvido  |
| ------------ | ---------- |
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

## Comportamento esperado e observado

**Esperado:** conteúdo, estimativa e ações devem ocupar blocos verticais claros, como nos cards de Metas e Custos Fixos.

**Observado:** as ações são comprimidas na lateral do card; título, data e estimativa perdem largura. Na captura, ícones e rótulos de editar, excluir e concluir aparecem fragmentados.

## Contexto e evidências

- **Entrada:** compra pendente teste, prioridade média e estimativa de R$ 1.111,11.
- **Ambiente:** FinanMap Front-end, Vue 3 e Quasar, viewport compacto.
- **Frequência:** sempre que o card é renderizado.
- **Evidência:** C:\Users\Usuario1\AppData\Local\Temp\codex-clipboard-b0d7936e-e61d-4781-9cd4-d6a84b399f54.png.

## Reprodução

1. Iniciar o front-end e autenticar.
2. Acessar /compras-planejadas com uma compra pendente.
3. Reduzir a largura da tela até a coluna única de cards.
4. Observar conteúdo à esquerda e ações empilhadas à direita.

**Confirmação:** .compra-card usa display: flex sem flex-direction: column, fazendo seus filhos diretos disputarem largura horizontalmente.

## Hipóteses testadas e resultados

| #   | Hipótese                                                              | Teste, uma variável por vez                                | Resultado                                                       |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| H1  | Os ícones do Quasar não estão disponíveis.                            | Conferir a captura e os q-icon do template.                | Refutada; os glifos são renderizados.                           |
| H2  | A disposição horizontal dos filhos diretos estreita conteúdo e ações. | Comparar o container com MetaCard.vue e CustoFixoCard.vue. | Confirmada; os cards de referência usam flex-direction: column. |

## Causa raiz confirmada

CompraPlanejadaCard.vue declara .compra-card como flexível, mas omite flex-direction: column. A seção de conteúdo, separador e ações entram no fluxo horizontal; por isso a estimativa e os rótulos ficam comprimidos e as ações parecem defeituosas.

## Proposta de correção

Definir o fluxo vertical, reservar espaço para exclusão no cabeçalho, distribuir as ações no rodapé e apresentar a estimativa em um bloco monetário compacto.

## Teste de regressão

Ampliar scripts/check-lista-compras-planejadas.mjs para exigir o fluxo em coluna do card e o bloco específico da estimativa. O teste deve falhar antes da correção e passar depois.

## Validações realizadas

- **Regressão antes da correção:** npm run test:compras-planejadas falhou na asserção que exige flex-direction: column em .compra-card.
- **Correção aplicada:** CompraPlanejadaCard.vue passou a organizar o card em coluna, reservou área para excluir, posicionou ações no rodapé e criou o bloco compacto de estimativa.
- **Regressão depois da correção:** npm run test:compras-planejadas passou.
- **Qualidade:** npm test, npm run lint, npx vue-tsc --noEmit, npm run build, npx prettier --check e git diff --check passaram.
- **Reprodução no navegador:** antes da reinicialização do servidor, a árvore de acessibilidade confirmou a compra, a estimativa e as ações em controles separados. Após autenticar novamente, as consultas GET /compras-planejadas e GET /compras-planejadas/compradas retornaram 404 da API remota; por isso a nova sessão só exibe o estado de erro e não permite reproduzir o card com dados reais.

## Riscos e prevenções futuras

- **Risco:** mudanças futuras em display flex podem recolocar filhos diretos na horizontal. **Prevenção:** a regressão exige explicitamente o fluxo em coluna no seletor raiz do card.
- **Risco:** títulos muito longos podem competir com a ação de exclusão. **Prevenção:** o cabeçalho reserva 32px e mantém o título com ellipsis.
- **Risco operacional:** o ambiente remoto não disponibiliza os endpoints do módulo. **Prevenção:** validar o card com uma API que exponha compras planejadas antes de homologar visualmente dados reais.
