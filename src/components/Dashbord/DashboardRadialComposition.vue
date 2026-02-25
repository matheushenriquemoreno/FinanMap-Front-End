<template>
  <q-card
    flat
    bordered
    class="radial-card"
    :class="$q.dark.isActive ? 'bg-dark radial-card--dark' : 'bg-white radial-card--light'"
  >
    <q-card-section>
      <div
        class="text-h6 text-weight-bold"
        :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
      >
        Resumo Financeiro
      </div>
      <div
        class="text-caption"
        :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
      >
        Valores totais no período selecionado
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
      <div v-if="loading" class="flex flex-center" style="height: 250px">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="bar"
        height="220"
        :options="chartOptions"
        :series="series"
      />

      <!-- Legenda customizada -->
      <div class="row justify-around q-mt-sm" v-if="!loading">
        <div
          v-for="(item, i) in legendItems"
          :key="i"
          class="text-center"
        >
          <div
            class="radial-legend-dot"
            :style="{ background: item.color }"
          />
          <div
            class="text-caption"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
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
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { useDashboardStore } from 'src/stores/dashboardStore';
import obterDashboardService from 'src/services/DashboardService';

const $q = useQuasar();
const store = useDashboardStore();
const service = obterDashboardService();
const loading = ref(false);

const rendimento = ref(0);
const despesa = ref(0);
const investimento = ref(0);

const series = computed(() => [{
  name: 'Valor',
  data: [rendimento.value, despesa.value, investimento.value]
}]);

const COLORS = ['#21ba45', '#c10015', '#31ccec'];
const LABELS = ['Rendimentos', 'Despesas', 'Investimentos'];

const legendItems = computed(() =>
  [
    { label: 'Rendimentos', valor: rendimento.value, color: COLORS[0] },
    { label: 'Despesas', valor: despesa.value, color: COLORS[1] },
    { label: 'Investimentos', valor: investimento.value, color: COLORS[2] },
  ]
);

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
  colors: COLORS,
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
      colors: ['#fff']
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 1,
      opacity: 0.45
    }
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
      }
    }
  },
  grid: { show: false },
  legend: { show: false },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: {
      formatter: (val: number) => formatarValor(val),
      title: { formatter: () => '' }
    }
  }
}));

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function formatarValorCurto(valor: number) {
  if (Math.abs(valor) >= 1000000) return 'R$' + (valor / 1000000).toFixed(1) + 'M';
  if (Math.abs(valor) >= 1000) return 'R$' + (valor / 1000).toFixed(1) + 'k';
  return 'R$' + valor.toFixed(0);
}

async function fetchData() {
  loading.value = true;
  try {
    const resumo = await service.obterResumo(store.dataInicial, store.dataFinal);
    rendimento.value = resumo.rendimento.total;
    despesa.value = resumo.despesa.total;
    investimento.value = resumo.investimento.total;
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

<style scoped>
.radial-card {
  border-radius: 16px !important;
  overflow: hidden;
  height: 100%;
  transition: box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
}

.radial-card--light {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07) !important;
}

.radial-card--dark {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
}

.radial-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 auto 4px;
}
</style>
