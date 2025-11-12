<template>
  <div class="box box1 shadow-2 rounded-borders">
    <apexchart :options="configuracoesGrafico" :series="valoresGrafico" height="100%" />
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts';
import { ref, type PropType } from 'vue';

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
});

const randomizeArray = (arg: number[]) => {
  const array = [...arg];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
};

const formatarValor = (valor: number) => {
  return valor.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
};

const configuracoesGrafico = ref<ApexOptions>({
  chart: {
    id: 'Demostrativo',
    group: 'sparklines',
    type: 'area',
    height: 160,
    sparkline: {
      enabled: true,
    },
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
    },
  },
  subtitle: {
    text: props.subTitulo,
    offsetX: 30,
    style: {
      fontSize: '14px',
      color: '#666',
    },
  },
  tooltip: {
    theme: 'dark',
    x: {
      show: true,
    },
    y: {
      title: {
        formatter: (seriesName) => seriesName,
      },
    },
  },
});

const valoresGrafico = [
  {
    name: props.nomeValorGrafico,
    data: randomizeArray(props.dadosGrafico),
  },
];
</script>

<style scoped>
.box {
  height: 190px;
  background-color: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
