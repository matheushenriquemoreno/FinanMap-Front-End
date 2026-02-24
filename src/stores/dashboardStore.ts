import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  const mesInicial = ref<number>(new Date().getMonth() + 1);
  const anoInicial = ref<number>(new Date().getFullYear());
  const mesFinal = ref<number>(new Date().getMonth() + 1);
  const anoFinal = ref<number>(new Date().getFullYear());
  const isLoading = ref(false);

  function setFiltros(novoMesInicial: number, novoAnoInicial: number, novoMesFinal: number, novoAnoFinal: number) {
    mesInicial.value = novoMesInicial;
    anoInicial.value = novoAnoInicial;
    mesFinal.value = novoMesFinal;
    anoFinal.value = novoAnoFinal;
    // Trigger a "refresh" or just let components watch these values
  }

  const dataInicial = computed(() => `${anoInicial.value}-${String(mesInicial.value).padStart(2, '0')}`);
  const dataFinal = computed(() => `${anoFinal.value}-${String(mesFinal.value).padStart(2, '0')}`);

  return {
    mesInicial,
    anoInicial,
    mesFinal,
    anoFinal,
    dataInicial,
    dataFinal,
    isLoading,
    setFiltros,
  };
});
