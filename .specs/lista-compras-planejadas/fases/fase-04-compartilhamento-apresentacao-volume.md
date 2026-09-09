# Fase 04 — Compartilhamento, apresentação e volume

| Status       | Pendente   |
|--------------|------------|
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

**Objetivo e resultado esperado:** a experiência final respeita permissões, troca corretamente de contexto e permanece clara, responsiva e utilizável com centenas de itens.

**Capacidade ou fluxo coberto:** proprietário, convidados, temas, tamanhos de tela, links, volume e regressão completa.

**Requisitos relacionados:** `LCP-FE-14`, `EXPECT-FE-01`–`EXPECT-FE-05`.

**Dependências externas:** Fases 01 a 03 deste plano e Fase 04 do back-end concluídas e aprovadas.

## Tarefa T16 — Adaptar ações e dados ao contexto compartilhado

Manter a página acessível em contexto compartilhado, ocultar todas as ações de escrita para visualização, liberar as ações para edição e recarregar dados ao trocar de proprietário.

- **Requisitos relacionados:** `LCP-FE-14`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de usar `useCompartilhamentoStore.podeEditar`, a chave de contexto do `AxiosHelper` e o padrão de `router-view` atual.
- **Dependências:** `T02`–`T15`, contrato autorizado da Fase 04 do back-end.
- **Parte do sistema afetada:** página, cards, modais e integração com `compartilhamento-store`.
- **Testes e verificações:** proprietário; convidado editor; convidado visualizador; troca entre contextos; permissão revogada; tentativa forçada pela API.
- **Critérios de conclusão:** ações visíveis correspondem à permissão, a lista sempre representa o contexto ativo e falhas `403` não alteram estado.
- **Riscos ou premissas:** ocultar ação é UX; a segurança efetiva continua no back-end.

## Tarefa T17 — Refinar BRL, temas, responsividade e links

Revisar todos os estados e componentes em claro/escuro e mobile/desktop, garantir formatação BRL consistente, foco e rótulos das ações e abertura segura dos links de loja.

- **Requisitos relacionados:** `EXPECT-FE-01`, `EXPECT-FE-02`, `EXPECT-FE-05` e critérios visuais dos requisitos funcionais.
- **Referência ao design:** premissa de seguir tokens/classes Quasar e padrões visuais existentes, sem criar identidade paralela.
- **Dependências:** `T16`.
- **Parte do sistema afetada:** página, cards, formulários, diálogos, estados vazios e estilos da feature.
- **Testes e verificações:** larguras representativas; teclado; claro/escuro; textos longos; muitos links; valores grandes; contraste e foco visível.
- **Critérios de conclusão:** não há overflow ou ação inacessível, valores são legíveis e links abrem sem comprometer a página atual.
- **Riscos ou premissas:** validação de geometria deve ser feita no navegador, não inferida apenas do código.

## Tarefa T18 — Verificar centenas de itens e consolidar a regressão

Exercitar as listas com centenas de pendentes e comprados, ajustar renderização somente se necessário e completar o script de regressão com a cobertura estática compatível com o projeto.

- **Requisitos relacionados:** `EXPECT-FE-03` e regressão de `LCP-FE-01`–`LCP-FE-15`.
- **Referência ao design:** premissa de manter a solução simples; virtualização ou paginação só entram se a medição demonstrar necessidade e o contrato suportar.
- **Dependências:** `T16`, `T17`.
- **Parte do sistema afetada:** listas, script da feature, `package.json` e documentação de evidências.
- **Testes e verificações:** massa controlada com centenas; rolagem e interação; troca de abas/contexto; `npm test`, lint e build.
- **Critérios de conclusão:** carregamento e rolagem permanecem fluidos, ações continuam responsivas e toda a suíte passa.
- **Riscos ou premissas:** se paginação se tornar necessária, coordenar contrato com o back-end antes de concluir a tarefa.

## Orientações de implementação

- Não redirecionar o usuário apenas por estar em modo compartilhado.
- Não manter dados do contexto anterior durante a troca.
- Otimizações devem responder a medição; não adicionar complexidade preventiva sem evidência.

## Testes e verificações da fase

- `npm test`
- `npm run lint`
- `npm run build`
- Validação integrada nos três níveis de acesso.
- Validação visual em claro/escuro, mobile/desktop e navegação por teclado.
- Verificação com centenas de itens e registro da evidência observada.

## Critérios de aceitação da fase

1. A interface respeita proprietário, edição e visualização.
2. Troca de contexto não vaza dados anteriores.
3. Todos os fluxos permanecem utilizáveis nos dois temas e tamanhos de tela.
4. Links, mensagens e foco são claros e acessíveis.
5. Centenas de itens mantêm carregamento e rolagem fluidos.
6. Testes, lint, build e validação integrada final passam.

## Riscos, premissas e dependências externas da fase

- Evidência local de fluidez não substitui monitoramento em produção, fora do escopo deste plano.
- O contrato de paginação não faz parte do PRD; qualquer inclusão precisa preservar acesso e totais.
