<template>
  <q-card
    flat
    bordered
    class="chart-card"
    :class="$q.dark.isActive ? 'bg-dark chart-card--dark' : 'bg-white chart-card--light'"
  >
    <q-card-section>
      <div class="row items-center justify-between">
        <div>
          <div
            class="text-h6 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
          >
            Demonstrativo do Período
          </div>
          <div
            class="text-caption q-mt-xs"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
            Rendimentos, despesas e investimentos agrupados por período
          </div>
        </div>
        <div class="row q-gutter-xs items-center">
          <q-chip
            v-for="(item, i) in legendItems"
            :key="i"
            size="13px"
            :style="{ background: item.bg, color: item.color }"
          >
            {{ item.label }}
          </q-chip>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 440px">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="bar"
        height="440"
        :options="chartOptions"
        :series="series"
      />
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

const legendItems = [
  { label: 'Rendimentos', color: '#21ba45', bg: 'rgba(33, 186, 69, 0.15)' },
  { label: 'Despesas', color: '#c10015', bg: 'rgba(193, 0, 21, 0.15)' },
  { label: 'Investimentos', color: '#31ccec', bg: 'rgba(49, 204, 236, 0.15)' },
];

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: {
      show: true,
      tools: { download: true, selection: false, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true },
    },
    background: 'transparent',
    foreColor: $q.dark.isActive ? '#ccc' : '#444',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 850,
      animateGradually: { enabled: true, delay: 120 },
      dynamicAnimation: { enabled: true, speed: 550 },
    },
  },
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light',
  },
  stroke: {
    width: 1,
    colors: [$q.dark.isActive ? '#1a1a1a' : '#fff'],
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => formatarValorCurto(val),
    style: {
      fontSize: '10px',
      fontWeight: 600,
      colors: ['#fff'],
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '55%',
    },
  },
  xaxis: {
    categories: categories.value,
    position: 'bottom',
    labels: {
      style: { colors: $q.dark.isActive ? '#aaa' : '#666', fontSize: '12px' },
    },
    axisBorder: { color: $q.dark.isActive ? '#333' : '#e0e0e0' },
    axisTicks: { color: $q.dark.isActive ? '#333' : '#e0e0e0' },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatarValorCurto(val),
      style: { colors: $q.dark.isActive ? '#aaa' : '#666', fontSize: '11px' },
    },
  },
  grid: {
    borderColor: $q.dark.isActive ? '#2a2a2a' : '#f0f0f0',
    strokeDashArray: 4,
  },
  colors: ['#21ba45', '#c10015', '#31ccec'],
  legend: { show: false },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => formatarValor(val) },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        plotOptions: { bar: { horizontal: true } },
        xaxis: { labels: { show: false } },
        yaxis: { labels: { show: true } },
      },
    },
  ],
}));

function formatarValor(valor: any, style: 'currency' | 'decimal' = 'currency') {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', {
    style,
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarValorCurto(valor: number) {
  if (valor === 0) return '';
  if (Math.abs(valor) >= 1000000) return 'R$' + (valor / 1000000).toFixed(1) + 'M';
  if (Math.abs(valor) >= 1000) return 'R$' + (valor / 1000).toFixed(0) + 'k';
  return 'R$' + valor.toFixed(0);
}

async function fetchData() {
  loading.value = true;
  try {
    const resultado = await service.obterEvolucao(store.dataInicial, store.dataFinal);
    categories.value = resultado.map((item) => item.label);
    series.value = [
      { name: 'Rendimentos', group: 'Total', data: resultado.map((item) => item.rendimento) },
      { name: 'Despesas', group: 'Total', data: resultado.map((item) => item.despesa) },
      { name: 'Investimentos', group: 'Total', data: resultado.map((item) => item.investimento) },
    ];
  } catch {
    // Erro já tratado pelo handleErrorAxios no service
  } finally {
    loading.value = false;
  }
}

watch(
  () => [store.dataInicial, store.dataFinal],
  () => fetchData(),
  { immediate: true }
);
</script>

<style scoped>
.chart-card {
  border-radius: 16px !important;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}

.chart-card--light {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07) !important;
}

.chart-card--dark {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
}
</style>
