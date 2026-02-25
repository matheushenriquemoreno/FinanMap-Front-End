<template>
  <q-card
    flat
    bordered
    class="trend-card"
    :class="$q.dark.isActive ? 'bg-dark trend-card--dark' : 'bg-white trend-card--light'"
  >
    <q-card-section>
      <div class="row items-center justify-between q-mb-xs">
        <div>
          <div
            class="text-h6 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
          >
            Evolução Financeira
          </div>
          <div
            class="text-caption q-mt-xs"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
            Comparativo de rendimentos, despesas e investimentos ao longo do período
          </div>
        </div>
        <div class="trend-legend row q-gutter-sm gt-xs">
          <q-chip
            size="13px"
            :style="{ background: 'rgba(33, 186, 69, 0.15)', color: '#21ba45' }"
          >
            <q-icon name="circle" size="8px" class="q-mr-xs" />Rendimentos
          </q-chip>
          <q-chip
            
            size="13px"
            :style="{ background: 'rgba(193, 0, 21, 0.15)', color: '#c10015' }"
          >
            <q-icon name="circle" size="8px" class="q-mr-xs" />Despesas
          </q-chip>
          <q-chip
            
            size="13px"
            :style="{ background: 'rgba(49, 204, 236, 0.15)', color: '#31ccec' }"
          >
            <q-icon name="circle" size="8px" class="q-mr-xs" />Investimentos
          </q-chip>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="loading" class="flex flex-center" style="height: 380px">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="area"
        height="380"
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

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
    foreColor: $q.dark.isActive ? '#ccc' : '#444',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 900,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 600,
      },
    },
  },
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light',
  },
  colors: ['#21ba45', '#c10015', '#31ccec'],
  stroke: {
    curve: 'smooth',
    width: 2.5,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: $q.dark.isActive ? 0.35 : 0.25,
      opacityTo: 0.02,
      stops: [0, 95, 100],
    },
  },
  markers: {
    size: 4,
    strokeWidth: 2,
    fillOpacity: 1,
    hover: { size: 7 },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      style: {
        colors: $q.dark.isActive ? '#aaa' : '#666',
        fontSize: '12px',
      },
    },
    axisBorder: { color: $q.dark.isActive ? '#333' : '#e0e0e0' },
    axisTicks: { color: $q.dark.isActive ? '#333' : '#e0e0e0' },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatarValorCurto(val),
      style: {
        colors: $q.dark.isActive ? '#aaa' : '#666',
        fontSize: '11px',
      },
    },
  },
  grid: {
    borderColor: $q.dark.isActive ? '#2a2a2a' : '#f0f0f0',
    strokeDashArray: 4,
    padding: { top: 0, right: 10, bottom: 0, left: 10 },
  },
  legend: { show: false },
  dataLabels: { enabled: false },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => formatarValor(val),
    },
    custom({ series: s, seriesIndex, dataPointIndex, w }: any) {
      const labels = ['Rendimentos', 'Despesas', 'Investimentos'];
      const colors = ['#21ba45', '#c10015', '#31ccec'];
      const xLabel = w.globals.categoryLabels[dataPointIndex] || '';
      let html = `<div class="trend-tooltip">
        <div class="trend-tooltip__header">${xLabel}</div>`;
      s.forEach((serie: number[], i: number) => {
        const val = serie[dataPointIndex] ?? 0;
        html += `<div class="trend-tooltip__row">
          <span class="trend-tooltip__dot" style="background:${colors[i]};"></span>
          <span class="trend-tooltip__label">${labels[i]}</span>
          <span class="trend-tooltip__val">${formatarValor(val)}</span>
        </div>`;
      });
      const total = s.reduce((acc: number, serie: number[]) => acc + (serie[dataPointIndex] || 0), 0);
      html += `<div class="trend-tooltip__total">Total: ${formatarValor(total)}</div></div>`;
      return html;
    },
  },
}));

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function formatarValorCurto(valor: number) {
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
      { name: 'Rendimentos', data: resultado.map((item) => item.rendimento) },
      { name: 'Despesas', data: resultado.map((item) => item.despesa) },
      { name: 'Investimentos', data: resultado.map((item) => item.investimento) },
    ];
  } catch {
    // Erro já tratado pelo handleErrorAxios
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

<style>
/* Tooltip customizado — sem scoped para targeting global */
.trend-tooltip {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.trend-tooltip__header {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.trend-tooltip__row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}
.trend-tooltip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.trend-tooltip__label {
  font-size: 12px;
  color: #ccc;
  flex: 1;
}
.trend-tooltip__val {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.trend-tooltip__total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}
</style>

<style scoped>
.trend-card {
  border-radius: 16px !important;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}

.trend-card--light {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07) !important;
}

.trend-card--dark {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
}
</style>
