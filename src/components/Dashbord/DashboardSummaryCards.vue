<template>
  <div class="row q-col-gutter-md justify-center">
    <div class="col-12 col-sm-6 col-md-4">
      <Demostrativo
        :valor="dados.rendimento"
        :sub-titulo="`Rendimento ${periodoFormatado}`"
        :meses-grafico="meses"
        :dados-grafico="dadosGrafico.rendimento"
        nome-valor-grafico="Rendimento"
        :loading="loading"
      />
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <Demostrativo
        :valor="dados.despesa"
        :sub-titulo="`Despesas ${periodoFormatado}`"
        :meses-grafico="meses"
        :dados-grafico="dadosGrafico.despesa"
        nome-valor-grafico="Despesa"
        :loading="loading"
      />
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <Demostrativo
        :valor="dados.investimento"
        :sub-titulo="`Investimentos ${periodoFormatado}`"
        :meses-grafico="meses"
        :dados-grafico="dadosGrafico.investimento"
        nome-valor-grafico="Investimento"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import Demostrativo from 'src/components/Dashbord/DemostrativoPage.vue';

const store = useDashboardStore();
const loading = ref(false);

const dados = ref({
  rendimento: 0,
  despesa: 0,
  investimento: 0,
});

const dadosGrafico = ref({
  rendimento: [] as number[],
  despesa: [] as number[],
  investimento: [] as number[],
});

const meses = ref<string[]>([]);

const periodoFormatado = computed(() => {
  const mesIni = store.mesInicial.toString().padStart(2, '0');
  const mesFim = store.mesFinal.toString().padStart(2, '0');
  return `${mesIni}/${store.ano} a ${mesFim}/${store.ano}`;
});

async function fetchData() {
  loading.value = true;
  // Simulating API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock data generation based on filters (just randomizing for demo)
  dados.value = {
    rendimento: Math.floor(Math.random() * 10000) + 5000,
    despesa: Math.floor(Math.random() * 8000) + 2000,
    investimento: Math.floor(Math.random() * 3000) + 1000,
  };

  // Generate labels and data
  if (store.mesInicial === store.mesFinal) {
    // Single month selected: Show weekly breakdown (4 weeks)
    meses.value = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    
    // Logic: Week 1 starts at 0, ramps up to total value at Week 4
    const generateRampUpData = (totalValue: number) => {
      return [
        0, // Week 1
        Math.floor(totalValue * 0.33), // Week 2 (~33%)
        Math.floor(totalValue * 0.66), // Week 3 (~66%)
        totalValue // Week 4 (100%)
      ];
    };

    dadosGrafico.value = {
      rendimento: generateRampUpData(dados.value.rendimento),
      despesa: generateRampUpData(dados.value.despesa),
      investimento: generateRampUpData(dados.value.investimento),
    };
  } else {
    // Multiple months: Show monthly breakdown
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    meses.value = [];
    for (let i = store.mesInicial - 1; i < store.mesFinal; i++) {
      const month = monthNames[i];
      if (month) meses.value.push(month);
    }

    const length = meses.value.length;
    const safeLength = length > 0 ? length : 1;
    
    dadosGrafico.value = {
      rendimento: Array.from({ length: safeLength }, () => Math.floor(Math.random() * 5000) + 2000),
      despesa: Array.from({ length: safeLength }, () => Math.floor(Math.random() * 4000) + 1000),
      investimento: Array.from({ length: safeLength }, () => Math.floor(Math.random() * 2000) + 500),
    };
  }

  loading.value = false;
}

watch(
  () => [store.mesInicial, store.mesFinal, store.ano],
  () => {
    fetchData();
  },
  { immediate: true }
);
</script>
