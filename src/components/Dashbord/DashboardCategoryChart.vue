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
            Valores por Categoria
          </div>
          <div
            class="text-caption q-mt-xs"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
            Ranking das maiores categorias no período
          </div>
        </div>
        <q-btn-toggle
          v-model="tipoCategoriaSelecionada"
          toggle-color="primary"
          :color="$q.dark.isActive ? 'dark' : 'white'"
          :text-color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
          rounded
          unelevated
          :options="categoriasOptions"
          @update:model-value="carregarCategorias"
          size="13px"
        />
      </div>
    </q-card-section>

    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 350px">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else-if="semDados" class="flex flex-center column" style="height: 350px; gap: 12px">
        <q-icon name="bar_chart" size="48px" :color="$q.dark.isActive ? 'grey-7' : 'grey-4'" />
        <span :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">
          Nenhum dado para o período
        </span>
      </div>
      <VueApexCharts v-else type="bar" height="350" :options="chartOptions" :series="series" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { useDashboardStore } from 'src/stores/dashboardStore';

const $q = useQuasar();
const store = useDashboardStore();

const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
const categoriasOptions = [
  { label: 'Rendimentos', value: TipoCategoriaETransacao.Rendimento },
  { label: 'Despesas', value: TipoCategoriaETransacao.Despesa },
  { label: 'Investimentos', value: TipoCategoriaETransacao.Investimento },
];

const dadosCategorias = computed(() =>
  store.obterCategoriasPorTipo(tipoCategoriaSelecionada.value),
);
const loading = computed(
  () => store.isLoading || store.categoriaEstaCarregando(tipoCategoriaSelecionada.value),
);
const series = computed(() => [
  { name: 'Valor', data: dadosCategorias.value.map((item) => item.valor) },
]);
const categories = computed(() => dadosCategorias.value.map((item) => item.categoria));
const semDados = computed(() => !series.value[0]?.data.length);

const corPorTipo: Record<string, [string, string]> = {
  [TipoCategoriaETransacao.Rendimento]: ['#21ba45', '#2e7d32'],
  [TipoCategoriaETransacao.Despesa]: ['#e53935', '#c10015'],
  [TipoCategoriaETransacao.Investimento]: ['#31ccec', '#0288d1'],
};

const cores = computed(() => corPorTipo[tipoCategoriaSelecionada.value] ?? ['#1d169c', '#0d0a6e']);

const corPrimaria = computed((): string => cores.value[0] ?? '#1d169c');
const corSecundaria = computed((): string => cores.value[1] ?? '#0d0a6e');

const computedMax = computed(() => {
  if (!series.value[0]?.data.length) return 100;
  const max = Math.max(...series.value[0].data);
  return max === 0 ? 100 : max * 1.28;
});

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    background: 'transparent',
    foreColor: $q.dark.isActive ? '#ccc' : '#444',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: { enabled: true, delay: 80 },
      dynamicAnimation: { enabled: true, speed: 500 },
    },
  },
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light',
  },
  fill: {
    type: 'gradient',
    gradient: {
      type: 'horizontal',
      gradientToColors: [corSecundaria.value],
      stops: [0, 100],
    },
  },
  colors: [corPrimaria.value],
  plotOptions: {
    bar: {
      borderRadius: 6,
      horizontal: true,
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    offsetX: 10,
    formatter: (val: number) => formatarValor(val, 'currency'),
    style: {
      colors: [$q.dark.isActive ? '#ddd' : '#333'],
      fontSize: '11px',
      fontWeight: 600,
    },
  },
  xaxis: {
    categories: categories.value,
    max: computedMax.value,
    labels: {
      formatter: (val: string) => formatarValor(val, 'currency'),
      style: { colors: $q.dark.isActive ? '#aaa' : '#666' },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: $q.dark.isActive ? '#ccc' : '#555',
        fontSize: '12px',
        fontWeight: 600,
      },
    },
  },
  grid: {
    borderColor: $q.dark.isActive ? '#2a2a2a' : '#f0f0f0',
    strokeDashArray: 4,
    padding: { right: 80 },
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: {
      formatter: (val: number) => formatarValor(val),
      title: { formatter: () => '' },
    },
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        plotOptions: { bar: { horizontal: false } },
        yaxis: { labels: { show: false } },
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

function carregarCategorias() {
  void store.carregarCategorias(tipoCategoriaSelecionada.value);
}
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
