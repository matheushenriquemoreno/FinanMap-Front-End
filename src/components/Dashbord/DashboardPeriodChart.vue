<template>
  <q-card flat bordered :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <q-card-section>
      <div class="text-h6" :class="$q.dark.isActive ? 'text-white' : 'text-black'">
        Demonstrativo do Período
      </div>
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 500px">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="bar"
        height="500"
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
import obterDashboardService from 'src/services/DashboardService';

const $q = useQuasar();
const store = useDashboardStore();
const service = obterDashboardService();
const loading = ref(false);

const series = ref<any[]>([]);
const categories = ref<string[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
    foreColor: $q.dark.isActive ? '#fff' : '#333',
  },
  stroke: {
    width: 1,
    colors: $q.dark.isActive ? ['#1d1d1d'] : ['#fff'],
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => formatarValor(val, 'decimal'),
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      horizontal: false,
    },
  },
  xaxis: {
    categories: categories.value,
    position: 'bottom',
    labels: {
        style: {
            colors: $q.dark.isActive ? '#fff' : '#333',
        }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatarValor(val, 'decimal'),
      style: {
        colors: $q.dark.isActive ? '#fff' : '#333',
      }
    },
  },
  grid: {
    borderColor: $q.dark.isActive ? '#404040' : '#e0e0e0',
  },
  colors: ['#21ba45', '#c10015', '#31ccec'], // Positive, Negative, Info
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    labels: {
        colors: $q.dark.isActive ? '#fff' : '#333',
    }
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        xaxis: {
          labels: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            show: true,
          },
        },
      },
    },
  ],
}));

function formatarValor(valor: any, style: 'currency' | 'decimal' = 'currency') {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', {
    style: style,
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function fetchData() {
  loading.value = true;
  try {
    const resultado = await service.obterEvolucao(
      store.dataInicial,
      store.dataFinal
    );

    categories.value = resultado.map((item) => item.label);

    series.value = [
      {
        name: 'Rendimentos',
        group: 'Total',
        data: resultado.map((item) => item.rendimento),
      },
      {
        name: 'Despesas',
        group: 'Total',
        data: resultado.map((item) => item.despesa),
      },
      {
        name: 'Investimentos',
        group: 'Total',
        data: resultado.map((item) => item.investimento),
      },
    ];
  } catch {
    // Erro já tratado pelo handleErrorAxios no service
  } finally {
    loading.value = false;
  }
}

watch(
  () => [store.dataInicial, store.dataFinal],
  () => {
    fetchData();
  },
  { immediate: true }
);
</script>
