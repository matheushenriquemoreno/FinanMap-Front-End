import type { LocationQueryValue } from 'vue-router';

export type DashboardPeriod = {
  mes: number;
  ano: number;
};

export type DashboardPeriodRange = {
  inicio: DashboardPeriod;
  fim: DashboardPeriod;
};

type DashboardPeriodQueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

function parsePeriod(value: DashboardPeriodQueryValue): DashboardPeriod | null {
  if (typeof value !== 'string') return null;

  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const ano = Number(match[1]);
  const mes = Number(match[2]);

  if (ano < 1 || mes < 1 || mes > 12) return null;

  return { mes, ano };
}

function periodValue(period: DashboardPeriod) {
  return period.ano * 100 + period.mes;
}

export function currentDashboardPeriod(date = new Date()): DashboardPeriodRange {
  const current = { mes: date.getMonth() + 1, ano: date.getFullYear() };
  return { inicio: { ...current }, fim: current };
}

export function parseDashboardPeriodQuery(
  inicio: DashboardPeriodQueryValue,
  fim: DashboardPeriodQueryValue,
  fallback = currentDashboardPeriod(),
): DashboardPeriodRange {
  const parsedInicio = parsePeriod(inicio);
  const parsedFim = parsePeriod(fim);

  if (!parsedInicio || !parsedFim || periodValue(parsedInicio) > periodValue(parsedFim)) {
    return fallback;
  }

  return { inicio: parsedInicio, fim: parsedFim };
}

export function formatDashboardPeriodQuery(period: DashboardPeriod) {
  return `${period.ano}-${String(period.mes).padStart(2, '0')}`;
}
