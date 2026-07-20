import { getCssVar } from 'quasar';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

type SemanticColor = 'primary' | 'positive' | 'negative' | 'info';

const semanticFallbacks: Record<SemanticColor, string> = {
  primary: '#1d169c',
  positive: '#21ba45',
  negative: '#c10015',
  info: '#31ccec',
};

function semanticColor(name: SemanticColor) {
  if (typeof document === 'undefined') return semanticFallbacks[name];
  return getCssVar(name) || semanticFallbacks[name];
}

export function getDashboardSeriesColors() {
  return {
    primary: semanticColor('primary'),
    income: semanticColor('positive'),
    expense: semanticColor('negative'),
    investment: semanticColor('info'),
  };
}

export function getDashboardSeriesPalette(): [string, string, string] {
  const colors = getDashboardSeriesColors();
  return [colors.income, colors.expense, colors.investment];
}

export function getDashboardCategoryPalette(tipo: TipoCategoriaETransacao): [string, string] {
  const colors = getDashboardSeriesColors();
  const palettes: Record<TipoCategoriaETransacao, [string, string]> = {
    [TipoCategoriaETransacao.Rendimento]: [colors.income, '#2e7d32'],
    [TipoCategoriaETransacao.Despesa]: [colors.expense, '#e53935'],
    [TipoCategoriaETransacao.Investimento]: [colors.investment, '#0288d1'],
  };
  return palettes[tipo] ?? [colors.primary, '#0d0a6e'];
}

export const dashboardHeatmapPalette = {
  low: '#9fa8da',
  medium: '#5c6bc0',
  high: '#3949ab',
  veryHigh: '#1a237e',
} as const;
