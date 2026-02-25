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
          @update:model-value="fetchData"
          size="13px"
        />
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none flex flex-center">
      <div v-if="loading" class="flex flex-center" style="height: 350px; width: 100%">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else-if="semDados" class="flex flex-center column" style="height: 350px; width: 100%; gap: 12px">
        <q-icon name="donut_large" size="48px" :color="$q.dark.isActive ? 'grey-7' : 'grey-4'" />
        <span :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">
          Nenhum dado para o período
        </span>
      </div>
      <div v-else style="width: 100%; display: flex; justify-content: center;">
        <apexchart
          type="donut"
          height="350"
          width="100%"
          style="max-width: 460px;"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { useDashboardStore } from 'src/stores/dashboardStore';
import obterDashboardService from 'src/services/DashboardService';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

const $q = useQuasar();
const store = useDashboardStore();
const service = obterDashboardService();
const loading = ref(false);

const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Despesa);
const categoriasOptions = [
  { label: 'Rendimentos', value: TipoCategoriaETransacao.Rendimento },
  { label: 'Despesas', value: TipoCategoriaETransacao.Despesa },
  { label: 'Investimentos', value: TipoCategoriaETransacao.Investimento },
];

const series = ref<number[]>([]);
const labels = ref<string[]>([]);
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
            formatter: (w: any) => {
              const total = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
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

function formatarValor(valor: any) {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

async function fetchData() {
  loading.value = true;
  try {
    const resultado = await service.obterCategorias(
      store.dataInicial,
      store.dataFinal,
      tipoCategoriaSelecionada.value
    );
    labels.value = resultado.map((item) => item.categoria);
    series.value = resultado.map((item) => item.valor);
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
