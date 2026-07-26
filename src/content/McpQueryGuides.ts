export interface McpQueryGuide {
  id:
    | 'categorias'
    | 'receitas'
    | 'despesas'
    | 'investimentos'
    | 'custos-fixos'
    | 'totais-saldo'
    | 'maiores-movimentos'
    | 'distribuicao-categoria'
    | 'comparacao-periodos';
  title: string;
  description: string;
  prompt: string;
}

const readOnlyContract = 'Esta é uma consulta somente leitura e não exige confirmação.';

function readPrompt(request: string): string {
  return `${request} ${readOnlyContract}`;
}

export const mcpQueryGuides: readonly McpQueryGuide[] = [
  {
    id: 'categorias',
    title: 'Consultar categorias',
    description: 'Categorias por tipo e parte do nome, com paginação.',
    prompt: readPrompt(
      'Liste minhas categorias usando o tipo "Despesa", o texto "Casa" e o limite de 50 registros. Informe as categorias encontradas e os filtros aplicados. Se não houver registros, apresente um estado vazio inequívoco. Se houver mais resultados, informe a paginação e o ponto de continuação para buscar a próxima parte.',
    ),
  },
  {
    id: 'receitas',
    title: 'Consultar receitas',
    description: 'Receitas por período, categoria e descrição.',
    prompt: readPrompt(
      'Consulte minhas receitas de 01/06/2026 a 30/06/2026. Use a categoria "Salário", a descrição "Empresa" e o limite de 50 registros. Informe o período aplicado, a moeda BRL e os filtros aplicados. Se não houver registros, apresente um estado vazio inequívoco. Se houver mais resultados, informe a paginação e o ponto de continuação para buscar a próxima parte.',
    ),
  },
  {
    id: 'despesas',
    title: 'Consultar despesas',
    description: 'Despesas por período, categoria e descrição.',
    prompt: readPrompt(
      'Consulte minhas despesas de 01/06/2026 a 30/06/2026. Use a categoria "Alimentação", a descrição "Supermercado" e o limite de 50 registros. Informe o período aplicado, a moeda BRL e os filtros aplicados. Se não houver registros, apresente um estado vazio inequívoco. Se houver mais resultados, informe a paginação e o ponto de continuação para buscar a próxima parte.',
    ),
  },
  {
    id: 'investimentos',
    title: 'Consultar investimentos',
    description: 'Investimentos por período e filtros relevantes.',
    prompt: readPrompt(
      'Consulte meus investimentos de 01/01/2026 a 30/06/2026. Use a categoria "Renda fixa", a descrição "Tesouro" e o limite de 50 registros. Informe o período aplicado, a moeda BRL e os filtros aplicados. Se não houver registros, apresente um estado vazio inequívoco. Se houver mais resultados, informe a paginação e o ponto de continuação para buscar a próxima parte.',
    ),
  },
  {
    id: 'custos-fixos',
    title: 'Consultar custos fixos',
    description: 'Custos fixos por status, categoria e paginação.',
    prompt: readPrompt(
      'Liste meus custos fixos com status "ativos" — use "inativos" quando eu quiser consultar os desativados —, categoria "Moradia" e limite de 50 registros. Informe o status e a categoria aplicados. Se não houver registros, apresente um estado vazio inequívoco. Se houver mais resultados, informe a paginação e o ponto de continuação para buscar a próxima parte.',
    ),
  },
  {
    id: 'totais-saldo',
    title: 'Ver totais e saldo',
    description: 'Totais oficiais retornados pelo FinanMap para o período.',
    prompt: readPrompt(
      'Mostre os totais financeiros e o saldo retornado pelo FinanMap de 01/06/2026 a 30/06/2026. Informe o período aplicado e a moeda BRL.',
    ),
  },
  {
    id: 'maiores-movimentos',
    title: 'Encontrar maiores movimentos',
    description: 'Maiores receitas e despesas, com quantidade definida.',
    prompt: readPrompt(
      'Mostre os maiores movimentos usando o tipo "receitas", a quantidade 5 e o período de 01/01/2026 a 30/06/2026. Para consultar despesas, troque apenas o tipo por "despesas". Informe o período aplicado, a moeda BRL e o ranking na ordem retornada pelo FinanMap. Se não houver registros, apresente um estado vazio inequívoco.',
    ),
  },
  {
    id: 'distribuicao-categoria',
    title: 'Analisar por categoria',
    description: 'Distribuição dos valores usando o agrupamento do FinanMap.',
    prompt: readPrompt(
      'Mostre os valores e percentuais das despesas agrupados por categoria de 01/06/2026 a 30/06/2026. Informe o período aplicado e a moeda BRL. Se não houver registros, apresente um estado vazio inequívoco.',
    ),
  },
  {
    id: 'comparacao-periodos',
    title: 'Comparar dois períodos',
    description: 'Dados suficientes para comparar intervalos definidos.',
    prompt: readPrompt(
      'Compare os dados financeiros de 01/05/2026 a 31/05/2026 com 01/06/2026 a 30/06/2026 usando as métricas de totais, diferença e percentual. Informe os dois períodos aplicados e a moeda BRL.',
    ),
  },
];

export const mcpQueryTips: readonly string[] = [
  'Use somente os parâmetros aceitos pela ferramenta do guia escolhido; nem toda consulta aceita período, moeda, categoria ou descrição.',
  'Para listas extensas, escolha um limite e peça a paginação ou o ponto de continuação antes de solicitar a próxima parte.',
  'Em listas sem registros, considere o estado vazio válido; não peça ao agente para estimar ou inventar dados ausentes.',
  'Se a solicitação exceder um limite, diminua a quantidade; quando houver período, reduza o intervalo ou divida a consulta em partes menores.',
  'O agente pode distinguir erros de autenticação, autorização, validação, conflito e indisponibilidade sem revelar dados de outra conta.',
  'Consultas e análises são executadas sem confirmação; criação, alteração, exclusão e importação pertencem a outro fluxo.',
];
