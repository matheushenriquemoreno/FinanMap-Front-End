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
            Distribuição de Categorias
          </div>
          <div
            class="text-caption q-mt-xs"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
            Participação percentual de cada categoria
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

    <q-card-section class="q-pt-none flex flex-center">
      <div v-if="loading" class="dashboard-card__state dashboard-card__state--350">
        <q-spinner color="primary" size="3em" />
      </div>
      <div
        v-else-if="semDados"
        class="dashboard-card__state dashboard-card__state--empty dashboard-card__state--350"
      >
        <q-icon name="donut_large" size="48px" :color="$q.dark.isActive ? 'grey-7' : 'grey-4'" />
        <span :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">
          Nenhum dado para o período
        </span>
      </div>
      <div v-else class="dashboard-chart-center">
        <VueApexCharts
          type="donut"
          height="350"
          width="100%"
          class="dashboard-chart--distribution"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { useDashboardStore } from 'src/stores/dashboardStore';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

const $q = useQuasar();
const store = useDashboardStore();

const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Despesa);
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
const series = computed(() => dadosCategorias.value.map((item) => item.valor));
const labels = computed(() => dadosCategorias.value.map((item) => item.categoria));
const semDados = computed(() => series.value.length === 0);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    background: 'transparent',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 900,
      animateGradually: { enabled: true, delay: 100 },
      dynamicAnimation: { enabled: true, speed: 600 },
    },
  },
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light',
  },
  labels: labels.value,
  legend: {
    position: 'bottom',
    labels: { colors: $q.dark.isActive ? '#ccc' : '#555' },
    markers: { shape: 'circle', offsetX: -4 },
    itemMargin: { horizontal: 16, vertical: 8 },
    fontSize: '13px',
    fontWeight: 500,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          name: {
            show: true,
            color: $q.dark.isActive ? '#aaa' : '#666',
            fontSize: '13px',
          },
          value: {
            show: true,
            color: $q.dark.isActive ? '#fff' : '#1a1a1a',
            fontSize: '18px',
            fontWeight: 700,
            formatter: (val: string) => formatarValor(val),
          },
          total: {
            show: true,
            showAlways: false,
            label: 'Total',
            color: $q.dark.isActive ? '#aaa' : '#666',
            formatter: (w: { globals: { seriesTotals: number[] } }) => {
              const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              return formatarValor(total);
            },
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
    formatter: (val: number) => val.toFixed(1) + '%',
    dropShadow: { enabled: true, top: 1, left: 1, blur: 1, opacity: 0.4 },
    style: { fontSize: '11px', fontWeight: 600 },
  },
  stroke: {
    show: true,
    colors: [$q.dark.isActive ? '#1a1a1a' : '#ffffff'],
    width: 2,
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: { formatter: (val: number) => formatarValor(val) },
  },
}));

function formatarValor(valor: number | string) {
  const valorNumerico = Number(valor);
  if (Number.isNaN(valorNumerico)) return String(valor);
  return valorNumerico.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function carregarCategorias() {
  void store.carregarCategorias(tipoCategoriaSelecionada.value);
}
</script>
