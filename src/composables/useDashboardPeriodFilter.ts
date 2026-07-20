import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useDashboardStore } from 'src/stores/dashboardStore';

export type DashboardPeriod = { mes: number; ano: number };
export type DashboardPresetId = 'mes-atual' | 'ultimos-tres-meses' | 'este-ano';

export function useDashboardPeriodFilter() {
  const $q = useQuasar();
  const dashboardStore = useDashboardStore();
  const inputStyled = { dense: true, filled: false, rounded: false, borderless: false };
  const isEditorOpen = ref(false);
  const prefersReducedMotion = ref(false);
  let reducedMotionMediaQuery: MediaQueryList | undefined;

  const localPeriodoInicial = ref<DashboardPeriod>({
    mes: dashboardStore.mesInicial,
    ano: dashboardStore.anoInicial,
  });
  const localPeriodoFinal = ref<DashboardPeriod>({
    mes: dashboardStore.mesFinal,
    ano: dashboardStore.anoFinal,
  });
  const presets: Array<{ id: DashboardPresetId; label: string; icon: string }> = [
    { id: 'mes-atual', label: 'Mês atual', icon: 'today' },
    { id: 'ultimos-tres-meses', label: 'Últimos 3 meses', icon: 'date_range' },
    { id: 'este-ano', label: 'Este ano', icon: 'calendar_today' },
  ];

  const periodoAplicadoInicial = computed<DashboardPeriod>(() => ({
    mes: dashboardStore.mesInicial,
    ano: dashboardStore.anoInicial,
  }));
  const periodoAplicadoFinal = computed<DashboardPeriod>(() => ({
    mes: dashboardStore.mesFinal,
    ano: dashboardStore.anoFinal,
  }));
  const hasValidationError = computed(
    () =>
      localPeriodoInicial.value.ano * 100 + localPeriodoInicial.value.mes >
      localPeriodoFinal.value.ano * 100 + localPeriodoFinal.value.mes,
  );
  const validationErrorMessage = computed(() =>
    hasValidationError.value ? 'O período inicial não pode ser posterior ao período final.' : '',
  );
  const activePreset = computed<DashboardPresetId | null>(() => {
    for (const preset of presets) {
      const periodo = obterPeriodoPreset(preset.id);
      if (
        periodosIguais(periodoAplicadoInicial.value, periodo.inicio) &&
        periodosIguais(periodoAplicadoFinal.value, periodo.fim)
      ) {
        return preset.id;
      }
    }
    return null;
  });
  const periodoAplicadoFormatado = computed(() => {
    const inicio = periodoAplicadoInicial.value;
    const fim = periodoAplicadoFinal.value;
    const inicioFormatado = formatarMesAno(inicio);

    if (periodosIguais(inicio, fim)) return capitalizar(inicioFormatado);
    if (inicio.ano === fim.ano) {
      return `${capitalizar(formatarMes(inicio))} a ${capitalizar(formatarMesAno(fim))}`;
    }
    return `${capitalizar(inicioFormatado)} a ${capitalizar(formatarMesAno(fim))}`;
  });

  watch(
    () => [
      dashboardStore.mesInicial,
      dashboardStore.anoInicial,
      dashboardStore.mesFinal,
      dashboardStore.anoFinal,
    ],
    restaurarRascunho,
  );

  onMounted(() => {
    reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = reducedMotionMediaQuery.matches;
    reducedMotionMediaQuery.addEventListener('change', atualizarPreferenciaDeMovimento);
  });
  onBeforeUnmount(() =>
    reducedMotionMediaQuery?.removeEventListener('change', atualizarPreferenciaDeMovimento),
  );

  function atualizarPreferenciaDeMovimento(event: MediaQueryListEvent) {
    prefersReducedMotion.value = event.matches;
  }
  function periodosIguais(a: DashboardPeriod, b: DashboardPeriod) {
    return a.mes === b.mes && a.ano === b.ano;
  }
  function dataDoPeriodo(periodo: DashboardPeriod) {
    return new Date(periodo.ano, periodo.mes - 1, 1);
  }
  function formatarMes(periodo: DashboardPeriod) {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataDoPeriodo(periodo));
  }
  function formatarMesAno(periodo: DashboardPeriod) {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      dataDoPeriodo(periodo),
    );
  }
  function capitalizar(valor: string) {
    return valor.charAt(0).toLocaleUpperCase('pt-BR') + valor.slice(1);
  }
  function obterPeriodoPreset(preset: DashboardPresetId) {
    const atual = new Date();
    const fim = { mes: atual.getMonth() + 1, ano: atual.getFullYear() };
    if (preset === 'mes-atual') return { inicio: { ...fim }, fim };
    if (preset === 'este-ano') {
      return { inicio: { mes: 1, ano: atual.getFullYear() }, fim };
    }
    const inicio = new Date(atual.getFullYear(), atual.getMonth() - 2, 1);
    return { inicio: { mes: inicio.getMonth() + 1, ano: inicio.getFullYear() }, fim };
  }
  function restaurarRascunho() {
    localPeriodoInicial.value = { ...periodoAplicadoInicial.value };
    localPeriodoFinal.value = { ...periodoAplicadoFinal.value };
  }
  function alternarEditor() {
    if (isEditorOpen.value) cancelarEdicao();
    else {
      restaurarRascunho();
      isEditorOpen.value = true;
    }
  }
  function cancelarEdicao() {
    restaurarRascunho();
    isEditorOpen.value = false;
  }
  function aplicarPeriodo(inicio: DashboardPeriod, fim: DashboardPeriod) {
    dashboardStore.setFiltros(inicio.mes, inicio.ano, fim.mes, fim.ano);
  }
  function aplicarPreset(preset: DashboardPresetId) {
    const periodo = obterPeriodoPreset(preset);
    aplicarPeriodo(periodo.inicio, periodo.fim);
  }
  function aplicarFiltroManual() {
    if (hasValidationError.value) return;
    aplicarPeriodo(localPeriodoInicial.value, localPeriodoFinal.value);
    isEditorOpen.value = false;
  }

  return {
    $q,
    activePreset,
    alternarEditor,
    aplicarFiltroManual,
    aplicarPreset,
    cancelarEdicao,
    hasValidationError,
    inputStyled,
    isEditorOpen,
    localPeriodoFinal,
    localPeriodoInicial,
    periodoAplicadoFormatado,
    prefersReducedMotion,
    presets,
    validationErrorMessage,
  };
}
