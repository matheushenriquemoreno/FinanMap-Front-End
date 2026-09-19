# Lista de Compras Planejadas — Front-end

| Status       | Aprovado    |
|--------------|-------------|
| Created      | 2026-08-29  |
| Last Updated | 2026-09-09  |

## Histórico de atualizações

| Data       | Alteração |
|------------|-----------|
| 2026-08-29 | Aprovação do PRD unificado da Lista de Compras Planejadas. |
| 2026-09-09 | Separação editorial das responsabilidades de front-end, sem alteração do escopo ou do comportamento de produto aprovado. |
| 2026-09-09 | Regra de exclusão de item comprado confirmada: a despesa vinculada permanece no Mês a Mês e somente o vínculo e o item são removidos (`LCP-FE-13`). |

## Visão geral

A experiência front-end da Lista de Compras Planejadas permite ao usuário registrar e acompanhar compras futuras no FinanMap. A interface apresenta itens pendentes, total estimado, prioridades, links de lojas e histórico de itens comprados. Ela também conduz a conclusão e a reversão de compras, integra o registro opcional de uma despesa e adapta as ações às permissões do contexto compartilhado.

Este documento delimita somente os comportamentos observáveis sob responsabilidade do front-end. As regras, persistência, autorização e operações de dados correspondentes estão no PRD de back-end da mesma iniciativa.

## Problema e impacto

**Problema:** o usuário não possui no FinanMap uma interface para organizar compras futuras, compreender seu impacto estimado no orçamento e acompanhar a diferença entre o valor planejado e o efetivamente pago.

**Quem é afetado:** proprietários de contas, convidados com permissão de edição e convidados com permissão de visualização que participam do planejamento financeiro.

**Impacto se não for resolvido:** o planejamento permanece fora do aplicativo, sem visão consolidada nem fluxo claro entre a intenção de compra e o registro da despesa realizada.

## Usuários e perfis afetados

| Perfil | Contexto de uso | Necessidade principal |
|--------|-----------------|----------------------|
| Proprietário da conta | Planeja compras pessoais ou do lar | Cadastrar, alterar, concluir, reverter e excluir itens. |
| Convidado com permissão de edição | Participa do planejamento de uma conta compartilhada | Executar as mesmas ações de planejamento autorizadas ao proprietário. |
| Convidado com permissão de visualização | Consulta uma conta compartilhada | Visualizar listas e totais sem receber ações de escrita. |

## Objetivos e critérios de sucesso

| Objetivo | Critério de sucesso | Forma de verificação |
|----------|--------------------|----------------------|
| Tornar o planejamento de compras compreensível | O usuário cadastra um item e o encontra na lista de pendentes com os dados informados. | Executar o fluxo pela interface e conferir o item exibido. |
| Expor o impacto estimado | O total visível corresponde à soma dos valores estimados dos itens pendentes. | Comparar o total apresentado com a soma manual de itens de teste. |
| Conduzir o fechamento da compra | A interface coleta valor real e data, move o item para comprados e oferece o registro de despesa. | Concluir uma compra e verificar as duas listas e a oferta de despesa. |
| Respeitar o compartilhamento | Ações de escrita aparecem somente para proprietário e convidado com edição. | Comparar a interface nos três perfis de permissão. |

## Escopo e não objetivos

### Dentro do escopo

- Entrada de navegação e tela da Lista de Compras Planejadas.
- Listas de itens pendentes e comprados.
- Formulários de cadastro e edição de itens pendentes.
- Gerenciamento de múltiplos links de lojas por item.
- Exibição do total estimado dos pendentes e do comparativo agregado dos comprados.
- Fluxos de concluir, reverter e excluir compras.
- Oferta do fluxo existente de cadastro de despesa ao concluir uma compra.
- Estados de carregamento, vazio, validação e falha.
- Adequação das ações ao nível de permissão do contexto compartilhado.

### Fora do escopo

- Persistência, regras de autorização e consistência dos dados — são responsabilidades do back-end.
- Notificações automáticas sobre a lista — a primeira versão pressupõe consulta ativa.
- Teto de orçamento configurável — a versão cobre estimativa por item e total, sem limite definido pelo usuário.
- Comparação automática de preços entre lojas — os links são apenas referências externas.
- Categoria e data desejada no item planejado — não fazem parte do cadastro desta versão.
- Aportes por item ou conversão em Meta Financeira — esse comportamento pertence ao módulo de metas e não foi solicitado.
- Edição direta de um item já comprado — não existe requisito aprovado para essa ação; eventual inclusão exige revisão do PRD.

### Adiado

- Nenhum.

## Requisitos funcionais

Prioridades: **Essencial** (bloqueia a entrega), **Importante** (deve entrar), **Desejável** (entra se couber, sem comprometer os demais).

- **Essencial** `LCP-FE-01` A interface deve permitir cadastrar um item pendente com nome, valor estimado, prioridade, descrição e links de lojas.
- **Essencial** `LCP-FE-02` A interface deve permitir editar todos os campos de um item pendente.
- **Essencial** `LCP-FE-03` A interface deve permitir excluir um item pendente.
- **Essencial** `LCP-FE-04` O formulário deve permitir adicionar e remover múltiplos links contendo URL e nome da loja.
- **Essencial** `LCP-FE-05` A interface deve exibir o total estimado dos itens pendentes.
- **Essencial** `LCP-FE-06` A interface deve apresentar os itens pendentes na ordem Alta, Média e Baixa e, dentro da mesma prioridade, do mais recente para o mais antigo.
- **Essencial** `LCP-FE-07` A interface deve solicitar valor real e data ao usuário que marcar um item como comprado.
- **Essencial** `LCP-FE-08` Após a conclusão da compra, a interface deve retirar o item dos pendentes e apresentá-lo entre os comprados.
- **Essencial** `LCP-FE-09` Ao concluir uma compra, a interface deve oferecer o cadastro de uma despesa com o valor real previamente preenchido e permitir a escolha de mês e categoria.
- **Essencial** `LCP-FE-10` Cada item comprado deve exibir o valor estimado original, o valor real pago e a data da compra.
- **Essencial** `LCP-FE-11` A interface deve permitir reverter uma compra para a lista de pendentes.
- **Essencial** `LCP-FE-12` Ao reverter uma compra com despesa vinculada, a interface deve avisar sobre a despesa e oferecer sua exclusão.
- **Essencial** `LCP-FE-13` A interface deve permitir excluir um item comprado sem excluir a despesa vinculada existente.
- **Essencial** `LCP-FE-14` A interface deve ocultar ações de escrita de convidados com permissão somente de visualização.
- **Importante** `LCP-FE-15` A interface deve exibir o comparativo agregado entre o total estimado e o total efetivamente gasto dos itens comprados.

## Expectativas não funcionais

- **EXPECT-FE-01** Valores monetários devem ser exibidos em Real (BRL), seguindo o padrão de formatação do FinanMap.
- **EXPECT-FE-02** A tela deve seguir os padrões visuais do aplicativo, inclusive modo escuro, carregamento e estados vazios.
- **EXPECT-FE-03** As listas devem manter carregamento e rolagem fluidos com centenas de itens.
- **EXPECT-FE-04** Em falhas de salvamento ou conclusão de compra, a interface deve preservar os dados preenchidos e permitir nova tentativa.
- **EXPECT-FE-05** Mensagens de validação e falha devem indicar claramente o campo ou a operação que precisa de correção.

## Regras de negócio e restrições

### Regras de negócio

- Nome, valor estimado e prioridade são obrigatórios; descrição e links são opcionais.
- A prioridade aceita somente Alta, Média e Baixa.
- Valor estimado e valor real devem ser maiores que zero.
- Cada link informado deve conter URL válida e nome da loja.
- A data da compra pode ser igual ou anterior à data atual.
- O formulário de despesa deve iniciar com o valor real pago.
- A reversão devolve o item aos pendentes com a estimativa original.
- A exclusão de um item comprado remove somente o item e seu vínculo; a despesa vinculada permanece no Mês a Mês.

### Restrições

- A interface deve utilizar o contexto de compartilhamento já existente no FinanMap — não haverá configuração de permissão específica para a lista.
- O cadastro de despesa acionado pela compra deve utilizar o fluxo comum do módulo Mês a Mês — não haverá um tipo visual separado de despesa.
- O front-end não deve assumir sucesso de uma operação antes da confirmação do back-end — a lista exibida precisa refletir o estado confirmado.

## Premissas

- O back-end fornece listas, totais, vínculos e permissões necessários aos estados descritos — risco: sem o contrato correspondente, a interface não consegue cumprir os fluxos de forma confiável.
- Dentro da mesma prioridade, itens mais recentes aparecem primeiro — risco: baixo; outra preferência exigiria apenas revisão da ordenação aprovada.
- A lista de comprados permanece disponível até exclusão manual — risco: o histórico pode crescer indefinidamente.
- Não há limite rígido de itens ou links nesta versão — risco: grandes volumes podem exigir paginação ou virtualização em uma evolução.

## Fluxos e casos de borda

### Fluxos principais

- **Planejar compra:** o usuário abre a Lista de Compras, cadastra os dados e encontra o item na posição definida pela prioridade; o total estimado é atualizado.
- **Concluir compra:** o usuário informa valor real e data; após confirmação, o item aparece em comprados e a interface oferece o cadastro da despesa com valor pré-preenchido.
- **Desfazer compra:** o usuário solicita a reversão; se houver despesa vinculada, escolhe se deseja excluí-la; após confirmação, o item retorna aos pendentes.

### Estados vazios

- Pendentes vazios: exibir orientação para cadastrar o primeiro item.
- Comprados vazios: informar que compras concluídas aparecerão nessa lista.

### Erros e falhas

- Campos inválidos bloqueiam o envio e exibem mensagem contextual.
- Uma falha de comunicação mantém o formulário preenchido e oferece nova tentativa.
- Uma falha parcial ou resposta inconsistente não pode fazer a interface apresentar a operação como concluída.

### Limites

- Não há limite rígido de itens ou links nesta versão.
- Totais e listas exibidos devem refletir o estado atual confirmado pelo back-end.

## Critérios de aceitação

1. Cadastrar um item com descrição e dois links resulta no item visível entre os pendentes com todos os dados informados.
2. Adicionar, editar ou excluir um pendente atualiza o total estimado exibido.
3. Os pendentes aparecem ordenados por prioridade e data de criação conforme a regra aprovada.
4. Concluir uma compra move o item para comprados e exibe estimativa original, valor real e data.
5. Ao concluir uma compra, o fluxo de despesa é oferecido com o valor real preenchido e permite escolher mês e categoria.
6. Reverter uma compra com despesa vinculada apresenta aviso e opção de exclusão antes da confirmação.
7. Excluir um item comprado com despesa vinculada remove o item da lista sem excluir a despesa do Mês a Mês.
8. Um convidado com visualização não vê ações de escrita; um convidado com edição vê as mesmas ações do proprietário.
9. A lista de comprados apresenta o comparativo agregado entre valores estimados e reais.
10. Estados vazios, carregamento, erros e modo escuro seguem os padrões existentes do aplicativo.

## Rastreabilidade com o PRD unificado

| Responsabilidade de front-end | Requisitos de produto de origem |
|-------------------------------|---------------------------------|
| `LCP-FE-01` a `LCP-FE-04` | `LCP-01` a `LCP-04` |
| `LCP-FE-05` e `LCP-FE-06` | `LCP-05` e `LCP-06` |
| `LCP-FE-07` a `LCP-FE-09` | `LCP-07` a `LCP-09` |
| `LCP-FE-10` a `LCP-FE-13` | `LCP-10` a `LCP-13` |
| `LCP-FE-14` | `LCP-14` |
| `LCP-FE-15` | `LCP-15` |
| `EXPECT-FE-01` a `EXPECT-FE-03` | `EXPECT-01` a `EXPECT-03` |

## Perguntas em aberto

| Pergunta | Por que importa | Status |
|----------|-----------------|--------|
| Um item já comprado poderá ser editado diretamente em uma versão futura? | Uma resposta positiva adicionará um novo fluxo e exigirá nova validação das responsabilidades de front-end e back-end. | Aberta, não bloqueante para esta versão |
