<!-- Dashboard.vue -->
<template>
  <div class="q-pa-md q-gutter-sm">
    <q-breadcrumbs class="text-grey" active-color="black">
      <template v-slot:separator>
        <q-icon size="1.2em" name="arrow_forward" color="green" />
      </template>

      <q-breadcrumbs-el icon="home" />
      <q-breadcrumbs-el label="Dashbord" icon="navigation" />
    </q-breadcrumbs>
  </div>
  <div class="dashboard">
    <div class="container">
      <SectionFiltrarPeriodo
        @filtrar="(mesInicial, mesFinal, ano) => console.log(mesInicial, mesFinal, ano)"
      />
      <div class="row justify-center q-gutter-lg">
        <div>
          <Demostrativo
            :valor="7400"
            sub-titulo="Total de Rendimento dos ultimos 3 meses"
            :meses-grafico="meses"
            :dados-grafico="sparklineData"
            nome-valor-grafico="rendimento"
          />
        </div>
        <div>
          <Demostrativo
            :valor="5800"
            sub-titulo="Total de despesas dos ultimos 3 meses"
            :meses-grafico="meses"
            :dados-grafico="sparklineData"
            nome-valor-grafico="Despesa"
          />
        </div>
        <div>
          <Demostrativo
            :valor="1600"
            sub-titulo="Total de Investimentos dos ultimos 3 meses"
            :meses-grafico="meses"
            :dados-grafico="sparklineData"
            nome-valor-grafico="Investimento"
          />
        </div>
      </div>

      <div class="row justify-between q-mt-md">
        <!-- Juntar esses dois itens, e criar um compoente-->
        <div class="col-xs-12 q-pa-xs col-md-6">
          <q-card flat class="q-pa-sm">
            <span>Valores por Categoria</span>
            <q-option-group
              v-model="tipoCategoriaSelecionada"
              :options="categoriasOptions"
              color="primary"
              inline
            />
            <apexchart
              type="bar"
              :options="categoriaOptions"
              :series="categoriaValores"
            ></apexchart>
          </q-card>
        </div>
        <div class="col-xs-12 q-pa-xs col-md-6">
          <q-card flat class="q-pa-sm">
            <apexchart
              type="donut"
              :options="categoriaPIE"
              :series="categoriasValoresPIE"
            ></apexchart>
          </q-card>
        </div>
        <div class="col-12 q-pa-xs">
          <q-card flat class="q-pa-sm">
            <apexchart
              type="bar"
              height="500"
              :options="chartOptions"
              :series="seriesGraficoStakedBar"
            ></apexchart>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ApexOptions } from 'apexcharts';
import Demostrativo from 'src/components/Dashbord/DemostrativoPage.vue';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import SectionFiltrarPeriodo from './SectionFiltrarPeriodo.vue';
import { date } from 'quasar';

// Variaveis
const dataSelecionadaAtualmente = new Date();
const dadosFormulario = ref({
  dataInicial: dataSelecionadaAtualmente,
  dataFinal: date.addToDate(dataSelecionadaAtualmente, { months: 3 }),
});

/* Grafico inicial que traz os ultimos 3 meses de despesas e receitas */
const sparklineData = [7500, 7500, 10000, 15000, 7500, 20000];
const meses = ['Jan', 'Fev', 'Mar', 'Abril', 'Mai', 'Jul'];

// Valores por Categoria
const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
const categoriasOptions = [
  {
    label: 'Rendimentos',
    value: TipoCategoriaETransacao.Rendimento,
  },
  {
    label: 'Despesas',
    value: TipoCategoriaETransacao.Despesa,
  },
  {
    label: 'Investimentos',
    value: TipoCategoriaETransacao.Investimento,
  },
];

const categoriaOptions: ApexOptions = {
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
  },
  colors: ['#5c52ff'],
  plotOptions: {
    bar: {
      borderRadius: 5,
      borderRadiusApplication: 'end', // 'around', 'end'
      borderRadiusWhenStacked: 'last', // 'all', 'last'
      horizontal: true,
      dataLabels: {
        total: {
          enabled: true,
          formatter: function (val: string) {
            return formatarValor(val, 'currency');
          },
          style: {
            fontSize: '14px',
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['Saude', 'Transporte', 'Alimentação', 'Educação', 'Moradia'],
    labels: {
      formatter: function (val) {
        return formatarValor(val, 'decimal');
      },
    },
  },
  yaxis: {
    labels: {
      formatter: function (val: any) {
        // aqui vai passar tando o valor quando o nome da categoria.
        return isNaN(parseFloat(val)) ? val : formatarValor(val, 'currency');
      },
    },
    min: 0,
  },
  tooltip: {
    theme: 'dark',
    x: {
      show: true,
    },
    y: {
      title: {
        formatter: function () {
          return '';
        },
      },
    },
  },
};

const categoriaValores = [
  {
    data: [400.31, 3299, 4953, 8333, 2500],
  },
];

const categoriaPIE: ApexOptions = {
  chart: {
    id: 'categoria',
    type: 'donut',
  },
  labels: ['Saude', 'Transporte', 'Alimentação', 'Educação', 'Moradia'],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
  yaxis: {
    labels: {
      formatter: function (val: number) {
        return formatarValor(val);
      },
    },
    min: 0,
  },
};

const categoriasValoresPIE = categoriaValores[0]?.data;

// Fim Valores por categoria

const seriesGraficoStakedBar = [
  {
    name: 'Rendimentos',
    group: 'Total',
    data: [7500, 7500, 7500, 15000, 7500, 22000],
  },
  {
    name: 'Despesas',
    group: 'Total',
    data: [7000, 7500, 7500, 15000, 7500, 2000],
  },
  {
    name: 'Investimentos',
    group: 'Total',
    data: [1000, 1000, 750, 0, 750, 2200],
  },
];

const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'bar',
    stacked: true,
  },
  stroke: {
    width: 1,
    colors: ['#fff'],
  },
  dataLabels: {
    enabled: true,
    formatter: (val: any) => {
      return formatarValor(val, 'decimal');
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      horizontal: false,
      borderRadiusApplication: 'end', // 'around', 'end'
      borderRadiusWhenStacked: 'last', // 'all', 'last'
      dataLabels: {
        position: 'center',
        total: {
          enabled: true,
          formatter: (val: any) => {
            return formatarValor(val, 'currency');
          },
        },
      },
    },
  },
  title: {
    text: 'Demostrativo do periodo selecionado',
    style: {
      fontSize: '15px',
    },
  },
  xaxis: {
    categories: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'junho', 'Julho'],
    position: 'top',
    labels: {
      formatter: (val) => {
        return val;
      },
    },
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        return formatarValor(val, 'decimal');
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return formatarValor(val);
      },
    },
  },
  fill: {
    opacity: 1,
  },
  colors: ['#5c52ff', '#f53517', '#01b321', '#c4c4c4'],
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    offsetX: 40,
  },
});

function formatarValor(valor: any, style: 'currency' | 'decimal' = 'currency') {
  if (valor === undefined || valor === null) {
    return '';
  }

  const valorConvertido = parseFloat(valor);

  if (isNaN(valorConvertido)) {
    return '';
  }

  return valorConvertido.toLocaleString('pt-br', {
    style: style,
    currency: 'BRL',
  });
}
</script>

<style scoped>
.dashboard {
  padding: 24px;
  min-height: 100vh;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.container {
  max-width: 1200px;
}

.demostrativo {
  width: 300px;
}

@media (max-width: 520px) {
  .grafico {
    width: 320px;
  }
}
</style>
