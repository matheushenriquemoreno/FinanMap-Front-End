import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  const mesInicial = ref<number>(new Date().getMonth() + 1);
  const mesFinal = ref<number>(new Date().getMonth() + 1);
  const ano = ref<number>(new Date().getFullYear());
  const isLoading = ref(false);

  function setFiltros(novoMesInicial: number, novoMesFinal: number, novoAno: number) {
    mesInicial.value = novoMesInicial;
    mesFinal.value = novoMesFinal;
    ano.value = novoAno;
    // Trigger a "refresh" or just let components watch these values
  }

  return {
    mesInicial,
    mesFinal,
    ano,
    isLoading,
    setFiltros,
  };
});
