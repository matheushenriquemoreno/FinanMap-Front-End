import { computed, ref, watch } from 'vue';

interface MonthYearProps {
  mes?: number | undefined;
  ano?: number | undefined;
}

export interface MonthYearPeriod {
  mes: number;
  ano: number;
}

export function useMonthYearSelector(
  props: MonthYearProps,
  emitPeriod: (period: MonthYearPeriod) => void,
) {
  const currentDate = new Date();
  const selectedMonth = ref(props.mes ?? currentDate.getMonth() + 1);
  const selectedYear = ref(props.ano ?? currentDate.getFullYear());
  const showSelector = ref(false);
  const baseYear = ref(selectedYear.value);

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ].map((name, index) => ({ name, mes: index + 1 }));

  const visibleYears = computed(() =>
    Array.from({ length: 5 }, (_, index) => baseYear.value - 2 + index),
  );
  const mesAtualNome = computed(
    () => months.find((month) => month.mes === selectedMonth.value)?.name,
  );
  const mesAnoSelecionadoEhAtual = computed(
    () =>
      selectedMonth.value === currentDate.getMonth() + 1 &&
      selectedYear.value === currentDate.getFullYear(),
  );

  watch([selectedMonth, selectedYear], ([mes, ano]) => {
    if (!showSelector.value) emitPeriod({ mes, ano });
  });

  watch(showSelector, (isOpen) => {
    if (!isOpen && (selectedMonth.value !== props.mes || selectedYear.value !== props.ano)) {
      selectedMonth.value = props.mes ?? currentDate.getMonth() + 1;
      selectedYear.value = props.ano ?? currentDate.getFullYear();
    } else if (isOpen) {
      baseYear.value = selectedYear.value;
    }
  });

  function voltarMesAnterior() {
    if (selectedMonth.value === 1) {
      selectedMonth.value = 12;
      selectedYear.value--;
    } else selectedMonth.value--;
  }

  function passarParaProximoMes() {
    if (selectedMonth.value === 12) {
      selectedMonth.value = 1;
      selectedYear.value++;
    } else selectedMonth.value++;
  }

  function voltarAnoAnterior() {
    baseYear.value--;
  }

  function passarParaProximoAno() {
    baseYear.value++;
  }

  function aplicarSelecao() {
    emitPeriod({ mes: selectedMonth.value, ano: selectedYear.value });
    showSelector.value = false;
  }

  function selecionarDataAtual() {
    selectedMonth.value = currentDate.getMonth() + 1;
    selectedYear.value = currentDate.getFullYear();
    baseYear.value = currentDate.getFullYear();
    aplicarSelecao();
  }

  return {
    aplicarSelecao,
    baseYear,
    mesAnoSelecionadoEhAtual,
    mesAtualNome,
    months,
    passarParaProximoAno,
    passarParaProximoMes,
    selectedMonth,
    selectedYear,
    selecionarDataAtual,
    showSelector,
    visibleYears,
    voltarAnoAnterior,
    voltarMesAnterior,
  };
}
