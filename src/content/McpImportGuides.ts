export const MCP_IMPORT_MAX_ITEMS = 1_000;

export type McpImportGuideType =
  | 'category'
  | 'income'
  | 'expense'
  | 'investment'
  | 'fixed_cost'
  | 'correction';

export interface McpImportGuide {
  id: string;
  type: McpImportGuideType;
  title: string;
  description: string;
  prompt: string;
}

const privacyAndReview =
  'Use somente JSON estruturado com até 1.000 itens. No mesmo lote, você pode misturar itens type category, type income, type expense, type investment e type fixed_cost. Cada item deve ter clientItemId único e estável e, quando disponível, sourceRef com aba, linha ou referência de origem. Não faça upload no FinanMap, não envie o arquivo Excel ou CSV original, binário ou base64 e não inclua nenhum segredo. Valide cada item separadamente. Para possível duplicidade, peça minha decisão explícita entre skip e import_anyway. Prepare uma prévia sem gravar dados, com contagens por estado e tipo, totais financeiros por tipo e motivos acionáveis. Peça que eu revise a prévia e só confirme os itens válidos se eu responder com a decisão exata IMPORT_VALID_ITEMS vinculada à prévia.';

function importPrompt(request: string): string {
  return `${request} ${privacyAndReview}`;
}

export const mcpImportGuides: readonly McpImportGuide[] = [
  {
    id: 'import-category',
    type: 'category',
    title: 'Importar categorias',
    description: 'Prepara categorias estruturadas sem enviar o documento original.',
    prompt: importPrompt(
      'Prepare uma importação de categorias. Normalize em cada item type category e data com nome [nome] e tipo financeiro [receita ou despesa].',
    ),
  },
  {
    id: 'import-income',
    type: 'income',
    title: 'Importar receitas',
    description: 'Prepara receitas com período, valor e categoria.',
    prompt: importPrompt(
      'Prepare uma importação de receitas. Normalize em cada item type income e data com descrição [descrição], valor [valor em BRL], mês [mês], ano [ano] e categoryHint [categoria].',
    ),
  },
  {
    id: 'import-expense',
    type: 'expense',
    title: 'Importar despesas',
    description: 'Prepara despesas e suas referências de agrupamento.',
    prompt: importPrompt(
      'Prepare uma importação de despesas. Normalize em cada item type expense e data com descrição [descrição], valor [valor em BRL], mês [mês], ano [ano], categoryHint [categoria] e referências estruturadas de agrupamento, parcelamento ou recorrência quando existirem.',
    ),
  },
  {
    id: 'import-investment',
    type: 'investment',
    title: 'Importar investimentos',
    description: 'Prepara investimentos com valores e categorias.',
    prompt: importPrompt(
      'Prepare uma importação de investimentos. Normalize em cada item type investment e data com descrição [descrição], valor [valor em BRL], mês [mês], ano [ano] e categoryHint [categoria].',
    ),
  },
  {
    id: 'import-fixed_cost',
    type: 'fixed_cost',
    title: 'Importar custos fixos',
    description: 'Prepara custos fixos mensais criados como ativos.',
    prompt: importPrompt(
      'Prepare uma importação de custos fixos. Normalize em cada item type fixed_cost e data com nome [nome], dia de vencimento [dia] e categoryHint [categoria]. Considere que novos custos fixos são criados ativos.',
    ),
  },
  {
    id: 'import-correct-failed',
    type: 'correction',
    title: 'Corrigir itens que falharam',
    description: 'Reenvia somente itens inválidos, pendentes ou falhos.',
    prompt: importPrompt(
      'Corrija e reenvie somente os itens inválidos, pendentes ou que falharam no lote anterior. Reutilize o mesmo clientItemId e sourceRef de cada item corrigido, informe a referência do lote anterior e não reenvie itens concluídos ou já aplicados.',
    ),
  },
];
