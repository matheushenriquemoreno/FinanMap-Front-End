<template>
  <div 
    class="box shadow-2 rounded-borders transition-all duration-300"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-black'"
  >
    <div v-if="loading" class="flex flex-center full-height">
      <q-spinner color="primary" size="3em" />
    </div>
    <apexchart 
      v-else 
      :options="configuracoesGrafico" 
      :series="valoresGrafico" 
      height="100%" 
    />
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import { computed, type PropType } from 'vue';
import { useQuasar } from 'quasar';

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
    default: '#1d169c', // Cor primaria do projeto
  },
  mesesGrafico: {
    type: Object as PropType<string[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  }
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
    sparkline: {
      enabled: true,
    },
    foreColor: $q.dark.isActive ? '#fff' : '#333',
  },
  stroke: {
    curve: 'straight',
  },
  fill: {
    opacity: 1,
  },
  labels: props.mesesGrafico,
  yaxis: {
    labels: {
      formatter: (val) => formatarValor(val),
    },
    min: 0,
  },
  xaxis: {
    type: 'category',
  },
  colors: [props.corGrafico],
  title: {
    text: formatarValor(props.valor),
    offsetX: 30,
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: $q.dark.isActive ? '#fff' : '#333',
    },
  },
  subtitle: {
    text: props.subTitulo,
    offsetX: 30,
    style: {
      fontSize: '14px',
      color: $q.dark.isActive ? '#ccc' : '#666',
    },
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    x: {
      show: true,
    },
    y: {
      title: {
        formatter: (seriesName) => seriesName,
      },
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
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.full-height {
  height: 100%;
}
</style>
