import { effectScope, nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { useMonthYearSelector, type MonthYearPeriod } from 'src/composables/useMonthYearSelector';

describe('useMonthYearSelector', () => {
  it('navega de janeiro para dezembro do ano anterior e emite o novo período', async () => {
    const periodos: MonthYearPeriod[] = [];
    const scope = effectScope();

    const seletor = scope.run(() =>
      useMonthYearSelector({ mes: 1, ano: 2026 }, (periodo) => periodos.push(periodo)),
    );

    expect(seletor).toBeDefined();
    seletor?.voltarMesAnterior();
    await nextTick();

    expect(periodos.at(-1)).toEqual({ mes: 12, ano: 2025 });
    scope.stop();
  });
});
