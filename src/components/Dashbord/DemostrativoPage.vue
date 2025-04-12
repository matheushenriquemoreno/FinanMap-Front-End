<template>
  <div class="box box1">
    <apexchart :options="configuracoesGrafico" :series="valoresGrafico" />
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
    required: true,
    default: '#5c52ff',
  },
  mesesGrafico: {
    type: Object as PropType<string[]>,
    required: true,
  },
});

const randomizeArray = function (arg: number[]) {
  const array = arg.slice();
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex]!;
    array[randomIndex] = temporaryValue!;
  }

  return array;
};

const configuracoesGrafico = ref<ApexOptions>({
  chart: {
    id: 'Demostrativo',
    group: 'sparklines',
    type: 'area',
    height: 180,
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
      formatter: function (val: number) {
        return formatarValor(val);
      },
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
    },
  },
  subtitle: {
    text: props.subTitulo,
    offsetX: 30,
    style: {
      fontSize: '14px',
    },
  },
});

const valoresGrafico = [
  {
    name: props.nomeValorGrafico,
    data: randomizeArray(props.dadosGrafico),
  },
];

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
}
</script>

<style scoped>
.box {
  /* box-shadow: 0px 1px 22px -12px #607d8b; */
  background-color: #fff;
  /* padding: 25px 35px 25px 30px;
  max-height: 444px; */
}
</style>
