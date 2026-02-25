<template>
  <q-card
    flat
    bordered
    class="treemap-card"
    :class="$q.dark.isActive ? 'bg-dark treemap-card--dark' : 'bg-white treemap-card--light'"
  >
    <q-card-section>
      <div class="row items-center justify-between">
        <div>
          <div
            class="text-h6 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
          >
            Ranking de Categorias
          </div>
          <div
            class="text-caption"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
            Ordenado por valor decrescente
          </div>
        </div>
        <q-btn-toggle
          v-model="tipoSelecionado"
          toggle-color="primary"
          :color="$q.dark.isActive ? 'dark' : 'white'"
          :text-color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
          rounded
          unelevated
          :options="opcoes"
          @update:model-value="fetchData"
          size="13px"
        />
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="loading" class="flex flex-center" style="height: 380px">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else-if="semDados" class="flex flex-center column" style="height: 380px; gap: 12px">
        <q-icon name="format_list_bulleted" size="48px" :color="$q.dark.isActive ? 'grey-7' : 'grey-4'" />
        <span :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">
          Nenhum dado para o período
        </span>
      </div>
      <apexchart
        v-else
        type="bar"
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
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { useDashboardStore } from 'src/stores/dashboardStore';
import obterDashboardService from 'src/services/DashboardService';

const $q = useQuasar();
const store = useDashboardStore();
const service = obterDashboardService();
const loading = ref(false);

const tipoSelecionado = ref(TipoCategoriaETransacao.Despesa);
const opcoes = [
  { label: 'Despesas', value: TipoCategoriaETransacao.Despesa },
  { label: 'Rendimentos', value: TipoCategoriaETransacao.Rendimento },
  { label: 'Investimentos', value: TipoCategoriaETransacao.Investimento },
];

const rawData = ref<{ x: string; y: number }[]>([]);
const semDados = computed(() => rawData.value.length === 0);

const MAX_CATEGORIES = 8;

const processedData = computed(() => {
  if (rawData.value.length <= MAX_CATEGORIES) {
    return rawData.value;
  }
  
  const topCategories = rawData.value.slice(0, MAX_CATEGORIES - 1);
  const otherCategories = rawData.value.slice(MAX_CATEGORIES - 1);
  
  const sumOthers = otherCategories.reduce((acc, curr) => acc + curr.y, 0);
  
  if (sumOthers > 0) {
    topCategories.push({
      x: 'Outras',
      y: sumOthers
    });
  }
  
  return topCategories.sort((a, b) => b.y - a.y); // Mantendo ordenado mesmo com 'Outras'
});

const series = computed(() => [
  {
    name: 'Valor',
    data: processedData.value.map(item => item.y),
  },
]);

const categories = computed(() => processedData.value.map(item => item.x));

const corPorTipo: Record<string, [string, string]> = {
  [TipoCategoriaETransacao.Rendimento]: ['#21ba45', '#2e7d32'],
  [TipoCategoriaETransacao.Despesa]: ['#e53935', '#c10015'],
  [TipoCategoriaETransacao.Investimento]: ['#31ccec', '#0288d1'],
};

const cores = computed(() => corPorTipo[tipoSelecionado.value] ?? ['#1d169c', '#0d0a6e']);
const corPrimaria = computed((): string => cores.value[0] ?? '#1d169c');
const corSecundaria = computed((): string => cores.value[1] ?? '#0d0a6e');

const computedMax = computed(() => {
  if (!series.value[0]?.data.length) return 100;
  const max = Math.max(...series.value[0].data);
  return max === 0 ? 100 : max * 1.25;
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
      borderRadius: 4,
      horizontal: true,
      dataLabels: { position: 'top' },
      barHeight: '70%',
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    offsetX: 10,
    formatter: (val: number) => formatarValor(val),
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
      formatter: (val: string) => formatarValorCurto(Number(val)),
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
      maxWidth: 150,
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
        dataLabels: { offsetX: 0, offsetY: -20, textAnchor: 'middle' },
      },
    },
  ],
}));

function formatarValor(valor: any) {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function formatarValorCurto(valor: number) {
  if (Math.abs(valor) >= 1000000) return 'R$' + (valor / 1000000).toFixed(1) + 'M';
  if (Math.abs(valor) >= 1000) return 'R$' + (valor / 1000).toFixed(1) + 'k';
  return 'R$' + valor.toFixed(0);
}

async function fetchData() {
  loading.value = true;
  try {
    const resultado = await service.obterCategorias(
      store.dataInicial,
      store.dataFinal,
      tipoSelecionado.value
    );
    rawData.value = resultado
      .filter((item) => item.valor > 0)
      .map((item) => ({ x: item.categoria, y: item.valor }))
      .sort((a, b) => b.y - a.y);
  } catch {
    // Erro já tratado
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
.treemap-card {
  border-radius: 16px !important;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}

.treemap-card--light {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07) !important;
}

.treemap-card--dark {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
}
</style>
