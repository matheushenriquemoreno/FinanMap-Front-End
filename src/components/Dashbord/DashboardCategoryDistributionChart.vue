<template>
  <q-card flat bordered :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <q-card-section>
      <div class="text-h6" :class="$q.dark.isActive ? 'text-white' : 'text-black'">
        Distribuição de Categorias
      </div>
      <!-- Spacer to align with the radio buttons height in the other chart -->
      <div style="height: 28px;"></div>
    </q-card-section>
    <q-card-section class="flex flex-center">
      <div v-if="loading" class="flex flex-center" style="height: 350px; width: 100%">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="donut"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { useDashboardStore } from 'src/stores/dashboardStore';

const $q = useQuasar();
const store = useDashboardStore();
const loading = ref(false);

const series = ref<number[]>([]);
const labels = ref<string[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    foreColor: $q.dark.isActive ? '#fff' : '#333',
  },
  labels: labels.value,
  legend: {
    position: 'bottom',
    labels: {
        colors: $q.dark.isActive ? '#fff' : '#333',
    }
  },
  stroke: {
    show: true,
    colors: $q.dark.isActive ? ['#1d1d1d'] : ['#fff'], 
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: { formatter: (val: number) => formatarValor(val) },
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          width: '100%',
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
}));

function formatarValor(valor: any) {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
}

async function fetchData() {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Mock data
  labels.value = ['Saúde', 'Transporte', 'Alimentação', 'Educação', 'Moradia'];
  series.value = labels.value.map(() => Math.floor(Math.random() * 5000) + 500);

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
