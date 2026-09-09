# Fase 01 — Tracer bullet de navegação e cadastro

| Status       | Pendente   |
|--------------|------------|
| Created      | 2026-09-09 |
| Last Updated | 2026-09-09 |

**Objetivo e resultado esperado:** o usuário acessa a nova página, visualiza pendentes e total e cadastra um item com links pela interface.

**Capacidade ou fluxo coberto:** primeiro caminho completo de menu → rota → serviço → formulário → lista atualizada.

**Requisitos relacionados:** `LCP-FE-01`, `LCP-FE-04`, `LCP-FE-05`, `LCP-FE-06`, `EXPECT-FE-01`, `EXPECT-FE-02`, `EXPECT-FE-04`, `EXPECT-FE-05`.

**Dependências externas:** Fase 01 do plano de back-end concluída e aprovada, com contrato de criação e consulta disponível.

## Tarefa T01 — Representar e consumir o contrato mínimo da feature

Criar os modelos TypeScript e o serviço Axios para cadastrar e consultar itens pendentes, incluindo links, prioridades, total e erros no padrão atual do aplicativo.

- **Requisitos relacionados:** `LCP-FE-01`, `LCP-FE-04`, `LCP-FE-05`, `LCP-FE-06`.
- **Referência ao design:** premissa de seguir `src/Model`, `CustoFixoService` e `CreateIntanceAxios`.
- **Dependências:** contrato da Fase 01 do back-end.
- **Parte do sistema afetada:** `src/Model/CompraPlanejada.ts` e `src/services/CompraPlanejadaService.ts`.
- **Testes e verificações:** validar tipagem contra exemplos reais do OpenAPI; simular resposta vazia e com múltiplos itens; confirmar propagação de erro.
- **Critérios de conclusão:** modelos cobrem o DTO publicado e o serviço retorna coleção e total sem transformação inconsistente.
- **Riscos ou premissas:** nomes e formatos seguem o contrato aprovado no back-end.

## Tarefa T02 — Disponibilizar rota e entrada de navegação

Adicionar a rota autenticada e um item claro no menu principal para a Lista de Compras Planejadas, mantendo a navegação funcional em desktop e mobile.

- **Requisitos relacionados:** `LCP-FE-01` e critério de acesso à experiência.
- **Referência ao design:** premissa de seguir `src/router/routes.ts` e `src/layouts/MainLayout.vue`.
- **Dependências:** nenhuma dependência de código; `T01` para o fluxo completo.
- **Parte do sistema afetada:** roteador, layout e página da feature.
- **Testes e verificações:** abrir a rota diretamente e pelo menu; verificar item ativo, drawer mobile e rota autenticada.
- **Critérios de conclusão:** página é alcançável sem quebrar as rotas existentes e o menu comunica sua finalidade.
- **Riscos ou premissas:** a lista deve continuar disponível em modo compartilhado, diferentemente de Custos Fixos.

## Tarefa T03 — Exibir pendentes, total e ordenação

Criar a página e os componentes de listagem para apresentar nome, estimativa, prioridade, descrição e links, além do total em BRL e da ordem confirmada pelo back-end.

- **Requisitos relacionados:** `LCP-FE-05`, `LCP-FE-06`, `EXPECT-FE-01`, `EXPECT-FE-02`.
- **Referência ao design:** premissa de seguir `PageHeaderBanner`, cards Quasar e padrões visuais existentes.
- **Dependências:** `T01`, `T02`.
- **Parte do sistema afetada:** `src/pages/ComprasPlanejadas/` e `src/components/ComprasPlanejadas/`.
- **Testes e verificações:** lista vazia e populada; prioridades misturadas; valores decimais; links clicáveis seguros.
- **Critérios de conclusão:** total usa BRL, dados estão completos e a ordem visual coincide com o contrato.
- **Riscos ou premissas:** a interface não recalcula uma ordem divergente da fonte confirmada sem necessidade.

## Tarefa T04 — Coletar um novo item e múltiplos links

Criar o formulário/modal de cadastro com campos obrigatórios e opcionais, controles para adicionar/remover links e validação contextual antes do envio.

- **Requisitos relacionados:** `LCP-FE-01`, `LCP-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de reutilizar padrões dos modais de Custos Fixos e componentes Quasar, sem copiar responsabilidades de serviço.
- **Dependências:** `T01`, `T03`.
- **Parte do sistema afetada:** componentes de formulário e página da feature.
- **Testes e verificações:** cadastro mínimo; descrição; dois links; remoção de link; nome vazio; valor zero; prioridade ausente; URL inválida.
- **Critérios de conclusão:** formulário envia somente dados válidos e aponta cada erro no campo correspondente.
- **Riscos ou premissas:** não há limite rígido de links; o formulário precisa permanecer navegável com vários campos.

## Tarefa T05 — Confirmar o cadastro e preservar dados em falhas

Integrar formulário e serviço, atualizar a lista e o total somente após sucesso, apresentar feedback e manter os valores preenchidos quando a operação falhar.

- **Requisitos relacionados:** `LCP-FE-01`, `LCP-FE-05`, `EXPECT-FE-04`, `EXPECT-FE-05`.
- **Referência ao design:** premissa de seguir `$q.notify`, `notificarErro` e loading separado por operação.
- **Dependências:** `T01`, `T03`, `T04`.
- **Parte do sistema afetada:** página, modal, serviço e script de verificação da feature.
- **Testes e verificações:** sucesso; validação do servidor; falha de rede; tentativa repetida; confirmar que o formulário só fecha em sucesso.
- **Critérios de conclusão:** item confirmado aparece e altera o total; falha mantém os dados e não cria estado visual falso.
- **Riscos ou premissas:** o tratamento global do Axios pode notificar, portanto evitar mensagens duplicadas.

## Orientações de implementação

- O card não deve tornar toda URL editável fora do formulário; links exibidos abrem o endereço informado com proteção adequada.
- A fonte do total confirmado é a resposta do back-end ou uma nova consulta após mutação.
- Não adicionar filtro, busca, categoria ou prazo não previstos.

## Testes e verificações da fase

- Criar ou iniciar `scripts/check-lista-compras-planejadas.mjs` e registrá-lo nos scripts de teste do projeto.
- `npm test`
- `npm run lint`
- `npm run build`
- Validação manual mobile/desktop do menu, cadastro, links, vazio, falha e tema claro/escuro.

## Critérios de aceitação da fase

1. A rota é acessível pelo menu e diretamente.
2. Pendentes e total são exibidos na ordem e formato aprovados.
3. Cadastro mínimo e cadastro com dois links funcionam.
4. Entradas inválidas mostram erro por campo.
5. Falha preserva o formulário; sucesso atualiza lista e total.

## Riscos, premissas e dependências externas da fase

- O contrato da Fase 01 do back-end precisa estar estável antes da integração.
- O novo script deve complementar, não substituir, lint e build.
