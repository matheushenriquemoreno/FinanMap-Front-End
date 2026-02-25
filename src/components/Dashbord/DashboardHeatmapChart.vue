<template>
  <q-card
    v-if="visivel"
    flat
    bordered
    class="heatmap-card"
    :class="$q.dark.isActive ? 'bg-dark heatmap-card--dark' : 'bg-white heatmap-card--light'"
  >
    <q-card-section>
      <div class="row items-center justify-between">
        <div>
          <div
            class="text-h6 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
          >
            Intensidade Semanal
          </div>
          <div
            class="text-caption"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'"
          >
            Distribuição por semana no mês — valores por tipo de transação
          </div>
        </div>
        <q-chip
          dense
          :color="$q.dark.isActive ? 'grey-9' : 'primary'"
          text-color="white"
          icon="calendar_view_week"
          size="sm"
          outline
        >
          Visão Mensal
        </q-chip>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="loading" class="flex flex-center" style="height: 220px">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="heatmap"
        height="220"
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

// Só visível quando o período é de um único mês
const visivel = computed(
  () =>
    store.mesInicial === store.mesFinal && store.anoInicial === store.anoFinal
);

const series = ref<any[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'heatmap',
    toolbar: { show: false },
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
  },
  theme: {
    mode: $q.dark.isActive ? 'dark' : 'light',
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#fff'],
      fontSize: '11px',
      fontWeight: 600,
    },
    formatter: (val: number) => formatarValorCurto(val),
  },
  colors: ['#1d169c'],
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.6,
      radius: 6,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          { from: 0, to: 0, color: $q.dark.isActive ? '#2a2a2a' : '#f5f5f5', name: 'Vazio' },
          { from: 1, to: 999, color: '#9fa8da', name: 'Baixo' },
          { from: 1000, to: 4999, color: '#5c6bc0', name: 'Médio' },
          { from: 5000, to: 19999, color: '#3949ab', name: 'Alto' },
          { from: 20000, to: 999999, color: '#1a237e', name: 'Muito Alto' },
        ],
      },
    },
  },
  stroke: {
    width: 3,
    colors: [$q.dark.isActive ? '#1a1a1a' : '#fff'],
  },
  xaxis: {
    labels: {
      style: {
        colors: $q.dark.isActive ? '#aaa' : '#666',
        fontSize: '11px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: $q.dark.isActive ? '#aaa' : '#666',
        fontSize: '12px',
        fontWeight: 600,
      },
    },
  },
  grid: {
    padding: { top: 0, right: 0, bottom: 0, left: 5 },
  },
  legend: {
    show: true,
    position: 'bottom',
    labels: {
      colors: $q.dark.isActive ? '#aaa' : '#666',
    },
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: {
      formatter: (val: number) => formatarValor(val),
    },
  },
}));

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}

function formatarValorCurto(valor: number) {
  if (valor === 0) return '—';
  if (Math.abs(valor) >= 1000) return 'R$' + (valor / 1000).toFixed(1) + 'k';
  return 'R$' + valor.toFixed(0);
}

async function fetchData() {
  if (!visivel.value) return;
  loading.value = true;
  try {
    const resultado = await service.obterEvolucao(store.dataInicial, store.dataFinal);

    // evolucao no mês único retorna semanas; transforma no formato heatmap
    const labels = resultado.map((item) => item.label);
    series.value = [
      {
        name: 'Rendimentos',
        data: resultado.map((item, i) => ({ x: labels[i] ?? `S${i + 1}`, y: item.rendimento })),
      },
      {
        name: 'Despesas',
        data: resultado.map((item, i) => ({ x: labels[i] ?? `S${i + 1}`, y: item.despesa })),
      },
      {
        name: 'Investimentos',
        data: resultado.map((item, i) => ({ x: labels[i] ?? `S${i + 1}`, y: item.investimento })),
      },
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

<style scoped>
.heatmap-card {
  border-radius: 16px !important;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}

.heatmap-card--light {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07) !important;
}

.heatmap-card--dark {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4) !important;
}
</style>
