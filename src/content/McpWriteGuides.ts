export type McpWriteDomain = 'categoria' | 'receita' | 'despesa' | 'investimento' | 'custo-fixo';

export type McpWriteAction = 'create' | 'update' | 'delete';

export interface McpWriteGuide {
  id: `${McpWriteDomain}-${McpWriteAction}`;
  domain: McpWriteDomain;
  action: McpWriteAction;
  title: string;
  description: string;
  prompt: string;
}

const exactTarget =
  'Localize o alvo pelo identificador opaco [id]. Se nenhum registro ou mais de um resultado corresponder, não prepare uma ação ambígua: esclareça comigo o campo necessário.';

function createOrUpdatePrompt(request: string, review: string): string {
  return `${request} Prepare uma prévia sem alterar os dados. Não execute a escrita diretamente. ${review} Peça que eu revise a prévia e só confirme se eu responder com a decisão exata APPLY_CHANGES vinculada à prévia.`;
}

function deletePrompt(request: string, review: string): string {
  return `${request} Prepare uma prévia de exclusão sem alterar os dados. Não execute a escrita diretamente. ${review} Destaque que a exclusão é definitiva e peça que eu revise a prévia. Só confirme se eu responder com a decisão exata DELETE_PERMANENTLY vinculada à prévia.`;
}

export const mcpWriteGuides: readonly McpWriteGuide[] = [
  {
    id: 'categoria-create',
    domain: 'categoria',
    action: 'create',
    title: 'Criar categoria',
    description: 'Nome e tipo propostos, sempre apresentados em prévia.',
    prompt: createOrUpdatePrompt(
      'Quero criar uma categoria com nome [nome] e tipo [tipo].',
      'Mostre o nome e o tipo propostos e esclareça qualquer campo ausente ou ambíguo.',
    ),
  },
  {
    id: 'categoria-update',
    domain: 'categoria',
    action: 'update',
    title: 'Alterar categoria',
    description: 'Alvo inequívoco, valores atuais e somente as mudanças propostas.',
    prompt: createOrUpdatePrompt(
      `Quero alterar uma categoria. ${exactTarget} Proponha somente estas mudanças: nome [novo nome] e/ou tipo [novo tipo].`,
      'Mostre o nome e o tipo atuais ao lado dos valores propostos e explique dependências ou bloqueios.',
    ),
  },
  {
    id: 'categoria-delete',
    domain: 'categoria',
    action: 'delete',
    title: 'Excluir categoria definitivamente',
    description: 'Dependências verificadas antes da decisão destrutiva.',
    prompt: deletePrompt(
      `Quero excluir uma categoria. ${exactTarget}`,
      'Mostre o nome, o tipo e as dependências atuais; se a regra de domínio bloquear a exclusão, explique o motivo e não peça confirmação.',
    ),
  },
  {
    id: 'receita-create',
    domain: 'receita',
    action: 'create',
    title: 'Criar receita',
    description: 'Descrição, valor, período e categoria propostos.',
    prompt: createOrUpdatePrompt(
      'Quero criar uma receita com descrição [descrição], valor [valor em BRL], mês [mês], ano [ano] e categoria [categoria].',
      'Mostre todos os campos propostos e esclareça valor, período ou categoria ausente, inválida ou ambígua.',
    ),
  },
  {
    id: 'receita-update',
    domain: 'receita',
    action: 'update',
    title: 'Alterar receita',
    description: 'Compara o registro atual com os campos propostos.',
    prompt: createOrUpdatePrompt(
      `Quero alterar uma receita. ${exactTarget} Proponha somente os campos informados entre descrição [nova descrição], valor [novo valor em BRL], mês [novo mês], ano [novo ano] e categoria [nova categoria].`,
      'Mostre os valores atuais e propostos lado a lado e esclareça qualquer valor, período ou categoria incompatível.',
    ),
  },
  {
    id: 'receita-delete',
    domain: 'receita',
    action: 'delete',
    title: 'Excluir receita definitivamente',
    description: 'Identifica a receita e destaca a irreversibilidade.',
    prompt: deletePrompt(
      `Quero excluir uma receita. ${exactTarget}`,
      'Mostre descrição, valor, mês, ano e categoria atuais para eu reconhecer inequivocamente o registro.',
    ),
  },
  {
    id: 'despesa-create',
    domain: 'despesa',
    action: 'create',
    title: 'Criar despesa',
    description: 'Inclui estrutura simples, agrupada, parcelada ou recorrente.',
    prompt: createOrUpdatePrompt(
      'Quero criar uma despesa com descrição [descrição], valor [valor em BRL], mês [mês], ano [ano] e categoria [categoria]. Antes da prévia, esclareça se é simples ou envolve agrupamento, parcelamento ou recorrência e solicite os campos necessários para a opção escolhida.',
      'Mostre a estrutura e todos os registros que seriam afetados. Não prometa atomicidade entre documentos; descreva os passos idempotentes e o resultado esperado por item.',
    ),
  },
  {
    id: 'despesa-update',
    domain: 'despesa',
    action: 'update',
    title: 'Alterar despesa',
    description: 'Exige alvo, estrutura e escopo exatos antes da prévia.',
    prompt: createOrUpdatePrompt(
      `Quero alterar uma despesa. ${exactTarget} Proponha somente os campos informados entre descrição [nova descrição], valor [novo valor em BRL], mês [novo mês], ano [novo ano], categoria [nova categoria], agrupamento, parcelamento e recorrência. Esclareça e registre exatamente um escopo: ApenasEsta, EstaEProximas ou TodasDoLote.`,
      'Mostre valores atuais e propostos, a estrutura do lote e cada registro afetado pelo escopo. Não prometa atomicidade entre documentos; descreva os passos idempotentes e o resultado esperado por item.',
    ),
  },
  {
    id: 'despesa-delete',
    domain: 'despesa',
    action: 'delete',
    title: 'Excluir despesa definitivamente',
    description: 'Revisa lote, dependências e escopo antes da exclusão.',
    prompt: deletePrompt(
      `Quero excluir uma despesa. ${exactTarget} Esclareça se há agrupamento, parcelamento ou recorrência e registre exatamente um escopo: ApenasEsta, EstaEProximas ou TodasDoLote.`,
      'Mostre os dados atuais, a estrutura do lote e cada registro afetado. Não prometa atomicidade entre documentos; descreva os passos idempotentes e o resultado esperado por item.',
    ),
  },
  {
    id: 'investimento-create',
    domain: 'investimento',
    action: 'create',
    title: 'Criar investimento',
    description: 'Descrição, valor, período e categoria propostos.',
    prompt: createOrUpdatePrompt(
      'Quero criar um investimento com descrição [descrição], valor [valor em BRL], mês [mês], ano [ano] e categoria [categoria].',
      'Mostre todos os campos propostos e esclareça valor, período ou categoria ausente, inválida ou ambígua.',
    ),
  },
  {
    id: 'investimento-update',
    domain: 'investimento',
    action: 'update',
    title: 'Alterar investimento',
    description: 'Compara os valores atuais e propostos.',
    prompt: createOrUpdatePrompt(
      `Quero alterar um investimento. ${exactTarget} Proponha somente os campos informados entre descrição [nova descrição], valor [novo valor em BRL], mês [novo mês], ano [novo ano] e categoria [nova categoria].`,
      'Mostre os valores atuais e propostos lado a lado e esclareça qualquer valor, período ou categoria incompatível.',
    ),
  },
  {
    id: 'investimento-delete',
    domain: 'investimento',
    action: 'delete',
    title: 'Excluir investimento definitivamente',
    description: 'Identifica o investimento antes da decisão destrutiva.',
    prompt: deletePrompt(
      `Quero excluir um investimento. ${exactTarget}`,
      'Mostre descrição, valor, mês, ano e categoria atuais para eu reconhecer inequivocamente o registro.',
    ),
  },
  {
    id: 'custo-fixo-create',
    domain: 'custo-fixo',
    action: 'create',
    title: 'Criar custo fixo',
    description: 'Nome, vencimento e categoria; o novo custo fixo será criado ativo.',
    prompt: createOrUpdatePrompt(
      'Quero criar um custo fixo mensal com nome [nome], dia de vencimento [dia] e categoria [categoria]. O novo custo fixo será criado com o status ativo. O status pode ser alterado depois pelo prompt de alteração de custo fixo.',
      'Mostre nome, dia de vencimento, categoria e status ativo propostos e esclareça qualquer campo inválido ou ambíguo.',
    ),
  },
  {
    id: 'custo-fixo-update',
    domain: 'custo-fixo',
    action: 'update',
    title: 'Alterar custo fixo',
    description: 'Compara nome, vencimento, categoria e status.',
    prompt: createOrUpdatePrompt(
      `Quero alterar um custo fixo mensal. ${exactTarget} Proponha somente os campos informados entre nome [novo nome], dia de vencimento [novo dia], categoria [nova categoria] e status [ativo ou inativo].`,
      'Mostre nome, dia de vencimento, categoria e status atuais e propostos e esclareça qualquer campo inválido ou ambíguo.',
    ),
  },
  {
    id: 'custo-fixo-delete',
    domain: 'custo-fixo',
    action: 'delete',
    title: 'Excluir custo fixo definitivamente',
    description: 'Revisa os dados mensais antes da exclusão.',
    prompt: deletePrompt(
      `Quero excluir um custo fixo mensal. ${exactTarget}`,
      'Mostre nome, dia de vencimento, categoria e status atuais para eu reconhecer inequivocamente o registro e explique qualquer bloqueio de domínio.',
    ),
  },
];
