<template>
  <div
    class="dashboard-card box"
    :class="
      $q.dark.isActive ? 'box--dark dashboard-card--dark' : 'box--light dashboard-card--light'
    "
  >
    <div v-if="loading" class="flex flex-center full-height">
      <q-spinner color="primary" size="2em" />
    </div>
    <div v-else class="box__content q-pa-xs">
      <VueApexCharts :options="configuracoesGrafico" :series="valoresGrafico" height="100%" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import { computed, type PropType } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useQuasar } from 'quasar';
import { getDashboardSeriesColors } from 'src/design-system/dashboardTheme';

const $q = useQuasar();

// Definindo props
const props = defineProps({
  valor: {
    type: Number,
    required: true,
  },
  subTitulo: {
    type: String,
    required: true,
  },
  dadosGrafico: {
    type: Object as PropType<number[]>,
    required: true,
  },
  nomeValorGrafico: {
    type: String,
    required: true,
  },
  corGrafico: {
    type: String,
    default: '',
  },
  mesesGrafico: {
    type: Object as PropType<string[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
};

const configuracoesGrafico = computed<ApexOptions>(() => ({
  chart: {
    id: 'Demostrativo',
    group: 'sparklines',
    type: 'area',
    height: 160,
    sparkline: { enabled: true },
    foreColor: $q.dark.isActive ? '#fff' : '#333',
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 900,
      animateGradually: { enabled: true, delay: 100 },
      dynamicAnimation: { enabled: true, speed: 500 },
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2.5,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: $q.dark.isActive ? 0.45 : 0.35,
      opacityTo: 0.02,
      stops: [0, 90, 100],
    },
  },
  markers: {
    size: 0,
    hover: { size: 5 },
  },
  labels: props.mesesGrafico,
  yaxis: {
    labels: {
      formatter: (val) => formatarValor(val),
    },
    min: 0,
  },
  xaxis: { type: 'category' },
  colors: [props.corGrafico || getDashboardSeriesColors().primary],
  title: {
    text: formatarValor(props.valor),
    offsetX: 30,
    style: {
      fontSize: '22px',
      fontWeight: '800',
      color: $q.dark.isActive ? '#fff' : '#1a1a1a',
    },
  },
  subtitle: {
    text: props.subTitulo,
    offsetX: 30,
    style: {
      fontSize: '13px',
      color: $q.dark.isActive ? '#bbb' : '#777',
    },
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    x: { show: true },
    y: {
      title: { formatter: (seriesName) => seriesName },
      formatter: (val) => formatarValor(val),
    },
  },
}));

const valoresGrafico = computed(() => [
  {
    name: props.nomeValorGrafico,
    data: props.dadosGrafico,
  },
]);
</script>

<style scoped>
.box {
  height: 190px;
  cursor: default;
  position: relative;
}

.box:hover {
  transform: translateY(-2px);
}

.box--light {
  background: #fff;
}

.box--dark {
  background: #1e2021;
}

.box__content {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.box__trend-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.box__trend-badge--up {
  background: var(--semantic-positive-soft);
  color: var(--q-positive);
}

.box__trend-badge--down {
  background: var(--semantic-negative-soft-subtle);
  color: var(--q-negative);
}

.full-height {
  height: 100%;
}
</style>
