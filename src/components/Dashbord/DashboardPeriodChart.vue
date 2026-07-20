<template>
  <q-card
    bordered
    class="dashboard-card"
    :class="$q.dark.isActive ? 'bg-dark dashboard-card--dark' : 'bg-white dashboard-card--light'"
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
          <q-chip v-for="(item, i) in legendItems" :key="i" size="13px" :class="item.className">
            {{ item.label }}
          </q-chip>
        </div>
      </div>
    </q-card-section>

    <q-card-section>
      <div v-if="loading" class="dashboard-card__state dashboard-card__state--440">
        <q-spinner color="primary" size="3em" />
      </div>
      <VueApexCharts v-else type="bar" height="440" :options="chartOptions" :series="series" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { useDashboardStore } from 'src/stores/dashboardStore';
import { getDashboardSeriesPalette } from 'src/design-system/dashboardTheme';

const $q = useQuasar();
const store = useDashboardStore();
const loading = computed(() => store.isLoading);

const categories = computed(() => store.evolucao.map((item) => item.label));
const series = computed(() => [
  {
    name: 'Rendimentos',
    group: 'Total',
    data: store.evolucao.map((item) => item.rendimento),
  },
  {
    name: 'Despesas',
    group: 'Total',
    data: store.evolucao.map((item) => item.despesa),
  },
  {
    name: 'Investimentos',
    group: 'Total',
    data: store.evolucao.map((item) => item.investimento),
  },
]);

const legendItems = [
  { label: 'Rendimentos', className: 'dashboard-series-chip--income' },
  { label: 'Despesas', className: 'dashboard-series-chip--expense' },
  { label: 'Investimentos', className: 'dashboard-series-chip--investment' },
];

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
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
  colors: getDashboardSeriesPalette(),
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

function formatarValor(valor: number | string, style: 'currency' | 'decimal' = 'currency') {
  const valorNumerico = Number(valor);
  if (Number.isNaN(valorNumerico)) return String(valor);
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
</script>
