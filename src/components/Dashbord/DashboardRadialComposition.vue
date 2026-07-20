<template>
  <q-card
    bordered
    class="dashboard-card radial-card"
    :class="$q.dark.isActive ? 'bg-dark dashboard-card--dark' : 'bg-white dashboard-card--light'"
  >
    <q-card-section>
      <div
        class="text-h6 text-weight-bold"
        :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
      >
        Resumo Financeiro
      </div>
      <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
        Valores totais no período selecionado
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none dashboard-card__body">
      <div v-if="loading" class="dashboard-card__state dashboard-card__state--250">
        <q-spinner color="primary" size="3em" />
      </div>
      <VueApexCharts v-else type="bar" height="220" :options="chartOptions" :series="series" />

      <!-- Legenda customizada -->
      <div class="row justify-around q-mt-sm" v-if="!loading">
        <div v-for="(item, i) in legendItems" :key="i" class="text-center">
          <div class="radial-legend-dot" :style="{ background: item.color }" />
          <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
            {{ item.label }}
          </div>
          <div
            class="text-subtitle2 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
          >
            {{ formatarValorCurto(item.valor) }}
          </div>
        </div>
      </div>
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

const rendimento = computed(() => store.resumo?.rendimento.total ?? 0);
const despesa = computed(() => store.resumo?.despesa.total ?? 0);
const investimento = computed(() => store.resumo?.investimento.total ?? 0);

const series = computed(() => [
  {
    name: 'Valor',
    data: [rendimento.value, despesa.value, investimento.value],
  },
]);

const seriesPalette = computed(() => {
  void $q.dark.isActive;
  return getDashboardSeriesPalette();
});
const LABELS = ['Rendimentos', 'Despesas', 'Investimentos'];

const legendItems = computed(() => [
  { label: 'Rendimentos', valor: rendimento.value, color: seriesPalette.value[0] },
  { label: 'Despesas', valor: despesa.value, color: seriesPalette.value[1] },
  { label: 'Investimentos', valor: investimento.value, color: seriesPalette.value[2] },
]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
  },
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light',
  },
  colors: seriesPalette.value,
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      borderRadius: 4,
      dataLabels: {
        position: 'center',
      },
      barHeight: '60%',
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'middle',
    formatter: (val: number) => {
      if (val === 0) return '';
      return formatarValorCurto(val);
    },
    style: {
      fontSize: '12px',
      fontWeight: 600,
      colors: ['#fff'],
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 1,
      opacity: 0.45,
    },
  },
  xaxis: {
    categories: LABELS,
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: $q.dark.isActive ? '#ccc' : '#444',
        fontSize: '12px',
        fontWeight: 600,
      },
    },
  },
  grid: { show: false },
  legend: { show: false },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: {
      formatter: (val: number) => formatarValor(val),
      title: { formatter: () => '' },
    },
  },
}));

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function formatarValorCurto(valor: number) {
  if (Math.abs(valor) >= 1000000) return 'R$' + (valor / 1000000).toFixed(1) + 'M';
  if (Math.abs(valor) >= 1000) return 'R$' + (valor / 1000).toFixed(1) + 'k';
  return 'R$' + valor.toFixed(0);
}
</script>

<style scoped>
.radial-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.radial-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 auto 4px;
}
</style>
