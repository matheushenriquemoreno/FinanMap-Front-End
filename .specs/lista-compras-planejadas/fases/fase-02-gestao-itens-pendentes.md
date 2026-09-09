# Fase 02 — Gestão dos itens pendentes

| Status       | Pendente   |
|--------------|------------|
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

**Objetivo e resultado esperado:** o usuário altera e exclui pendentes com confirmação, feedback e estados previsíveis.

**Capacidade ou fluxo coberto:** completar o CRUD visual dos itens ainda não comprados.

**Requisitos relacionados:** `LCP-FE-02`, `LCP-FE-03`, `LCP-FE-04`, `EXPECT-FE-01`, `EXPECT-FE-02`, `EXPECT-FE-04`, `EXPECT-FE-05`.

**Dependências externas:** Fase 01 deste plano e Fase 02 do back-end concluídas e aprovadas.

## Tarefa T06 — Editar todos os campos de um pendente

Reutilizar o formulário com os dados atuais, permitir mudança de campos e links e refletir a resposta confirmada na lista e no total.

- **Requisitos relacionados:** `LCP-FE-02`, `LCP-FE-04`, `EXPECT-FE-01`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de modal compartilhado entre criar/editar com DTOs distintos quando o contrato exigir.
- **Dependências:** `T01`, `T03`–`T05`, operação de atualização do back-end.
- **Parte do sistema afetada:** formulário, página, modelos e serviço da feature.
- **Testes e verificações:** editar cada campo; substituir links; erro de validação; falha de rede; cancelar sem salvar.
- **Critérios de conclusão:** dados confirmados aparecem, cancelamento não altera a lista e falha preserva valores para nova tentativa.
- **Riscos ou premissas:** somente pendentes exibem ação de edição.

## Tarefa T07 — Excluir um pendente com confirmação

Adicionar ação de exclusão, confirmação clara e atualização de lista/total somente após sucesso.

- **Requisitos relacionados:** `LCP-FE-03`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de seguir o padrão `$q.dialog` usado no projeto.
- **Dependências:** `T01`, `T03`, operação de exclusão do back-end.
- **Parte do sistema afetada:** card/lista, página e serviço da feature.
- **Testes e verificações:** cancelar; confirmar; falha; exclusão do último item; total depois da remoção.
- **Critérios de conclusão:** cancelamento mantém o item; sucesso remove somente o alvo; falha não muda o estado visual.
- **Riscos ou premissas:** exclusão não oferece restauração.

## Tarefa T08 — Completar carregamento, vazios e recuperação de falha

Separar o estado inicial de carregamento, lista vazia, falha de consulta e lista carregada, oferecendo nova tentativa sem apagar conteúdo confirmado desnecessariamente.

- **Requisitos relacionados:** `EXPECT-FE-02`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de seguir skeletons e estados vazios de `CustosFixosPage.vue`.
- **Dependências:** `T03`, `T05`–`T07`.
- **Parte do sistema afetada:** página e componentes de estado da feature.
- **Testes e verificações:** primeira carga lenta; vazio; erro e retry; erro após lista carregada; última exclusão.
- **Critérios de conclusão:** cada estado é distinguível e o usuário sempre entende se pode tentar novamente ou cadastrar o primeiro item.
- **Riscos ou premissas:** mensagens do Axios e da página não devem duplicar a mesma falha.

## Tarefa T09 — Ampliar a regressão automatizada do CRUD visual

Estender o script da feature para verificar a presença dos contratos, ações, validações e proteções essenciais de criação, edição e exclusão, mantendo as verificações comportamentais manuais registradas.

- **Requisitos relacionados:** `LCP-FE-01`–`LCP-FE-06`, `EXPECT-FE-02`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de seguir os scripts `check-*.mjs` já executados por `npm test`.
- **Dependências:** `T06`–`T08`.
- **Parte do sistema afetada:** `scripts/check-lista-compras-planejadas.mjs` e `package.json` se necessário.
- **Testes e verificações:** executar teste da feature, suíte completa, lint e build; validar manualmente sucesso e falha com API local.
- **Critérios de conclusão:** as ações essenciais têm proteção automatizada compatível com o projeto e os comandos passam.
- **Riscos ou premissas:** checagens estáticas não substituem a validação real do fluxo no navegador.

## Orientações de implementação

- Criar e editar podem compartilhar campos, mas não estado residual entre aberturas.
- Não aplicar atualização otimista a operações destrutivas.
- Recarcular ou recarregar totais após sucesso, nunca após cancelamento/falha.

## Testes e verificações da fase

- `npm test`
- `npm run lint`
- `npm run build`
- Validação manual do CRUD, dos estados vazios e da preservação de formulário em mobile e desktop.

## Critérios de aceitação da fase

1. Todos os campos de pendente podem ser editados.
2. Exclusão exige confirmação e atualiza corretamente o total.
3. Falhas preservam o estado necessário para nova tentativa.
4. Estados de carregamento, vazio e erro são claros.
5. Regressão da Fase 01 permanece verde.

## Riscos, premissas e dependências externas da fase

- Esta fase depende do contrato final de pendentes publicado pelo back-end.
