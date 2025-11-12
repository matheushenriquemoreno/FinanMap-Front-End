<!-- Dashboard.vue -->
<template>
  <div class="q-pa-md q-gutter-sm">
    <q-breadcrumbs class="text-grey" active-color="black">
      <template v-slot:separator>
        <q-icon size="1.2em" name="arrow_forward" color="primary" />
      </template>

      <q-breadcrumbs-el icon="home" />
      <q-breadcrumbs-el label="Dashboard" icon="dashboard" />
    </q-breadcrumbs>
  </div>
  <q-page padding>
    <div class="content-limit">
      <SectionFiltrarPeriodo
        @filtrar="(mesInicial, mesFinal, ano) => console.log(mesInicial, mesFinal, ano)"
        class="q-mb-lg"
      />

      <!-- Cards de Demonstrativo -->
      <div class="row q-col-gutter-md justify-center">
        <div class="col-12 col-sm-6 col-md-4">
          <Demostrativo
            :valor="7400"
            sub-titulo="Rendimento 01/2024 a 03/2024"
            :meses-grafico="meses"
            :dados-grafico="sparklineData"
            nome-valor-grafico="rendimento"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <Demostrativo
            :valor="5800"
            sub-titulo="Despesas 01/2024 a 03/2024"
            :meses-grafico="meses"
            :dados-grafico="sparklineData"
            nome-valor-grafico="Despesa"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4">
          <Demostrativo
            :valor="1600"
            sub-titulo="Investimentos 01/2024 a 03/2024"
            :meses-grafico="meses"
            :dados-grafico="sparklineData"
            nome-valor-grafico="Investimento"
          />
        </div>
      </div>

      <!-- Gráficos -->
      <div class="row q-col-gutter-md q-mt-lg">
        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Valores por Categoria</div>
              <q-option-group
                v-model="tipoCategoriaSelecionada"
                :options="categoriasOptions"
                color="primary"
                inline
                dense
              />
            </q-card-section>
            <q-card-section>
              <apexchart
                type="bar"
                height="350"
                :options="categoriaOptions"
                :series="categoriaValores"
              ></apexchart>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-h6">Distribuição de Categorias</div>
            </q-card-section>
            <q-card-section class="flex flex-center">
              <apexchart
                type="donut"
                height="350"
                :options="categoriaPIE"
                :series="categoriasValoresPIE"
              ></apexchart>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 q-mt-md">
          <q-card flat bordered>
            <q-card-section>
              <apexchart
                type="bar"
                height="500"
                :options="chartOptions"
                :series="seriesGraficoStakedBar"
              ></apexchart>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import Demostrativo from 'src/components/Dashbord/DemostrativoPage.vue';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import SectionFiltrarPeriodo from './SectionFiltrarPeriodo.vue';

// --- DADOS MOCADOS (EXEMPLO) ---
const sparklineData = [7500, 7500, 10000, 15000, 7500, 20000];
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jul'];

const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
const categoriasOptions = [
  { label: 'Rendimentos', value: TipoCategoriaETransacao.Rendimento },
  { label: 'Despesas', value: TipoCategoriaETransacao.Despesa },
  { label: 'Investimentos', value: TipoCategoriaETransacao.Investimento },
];

const categoriaValores = ref([
  {
    name: 'Valor',
    data: [1000, 3299, 4953, 8333, 2500],
  },
]);
const categoriasNomes = ['Saúde', 'Transporte', 'Alimentação', 'Educação', 'Moradia'];
const categoriasValoresPIE = ref(categoriaValores.value[0]!.data);

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

// --- FUNÇÕES UTILITÁRIAS ---
function formatarValor(valor: any, style: 'currency' | 'decimal' = 'currency') {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor; // Retorna o valor original se não for número
  return valorNumerico.toLocaleString('pt-br', {
    style: style,
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// --- OPÇÕES DOS GRÁFICOS ---

const categoriaOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
  },
  colors: ['#1d169c'],
  plotOptions: {
    bar: {
      borderRadius: 5,
      horizontal: true,
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => formatarValor(val, 'currency'),
  },
  xaxis: {
    categories: categoriasNomes,
    labels: {
      formatter: (val) => formatarValor(val, 'currency'),
    },
  },
  yaxis: {
    labels: {
      style: { colors: '#333', fontSize: '12px' },
    },
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => formatarValor(val),
      title: { formatter: () => '' },
    },
  },
  responsive: [
    {
      breakpoint: 600, // Breakpoint para telas menores (mobile)
      options: {
        plotOptions: {
          bar: {
            horizontal: false, // Barras verticais em mobile
          },
        },
        yaxis: {
          labels: {
            show: false, // Oculta labels do eixo Y para ganhar espaço
          },
        },
      },
    },
  ],
}));

const categoriaPIE = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
  },
  labels: categoriasNomes,
  legend: {
    position: 'bottom',
  },
  tooltip: {
    y: { formatter: (val) => formatarValor(val) },
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          width: '100%',
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
}));

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: { show: false },
  },
  stroke: {
    width: 1,
    colors: ['#fff'],
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => formatarValor(val, 'decimal'),
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      horizontal: false,
    },
  },
  title: {
    text: 'Demonstrativo do Período',
    align: 'left',
    style: { fontSize: '16px', color: '#333' },
  },
  xaxis: {
    categories: meses,
    position: 'bottom',
  },
  yaxis: {
    labels: {
      formatter: (val) => formatarValor(val, 'decimal'),
    },
  },
  colors: ['#21ba45', '#c10015', '#31ccec'], // Positive, Negative, Info
  legend: {
    position: 'top',
    horizontalAlign: 'left',
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            horizontal: true, // Barras horizontais em telas menores
          },
        },
        xaxis: {
          labels: {
            show: false, // Oculta labels do eixo X
          },
        },
        yaxis: {
          labels: {
            show: true,
          },
        },
      },
    },
  ],
}));
</script>

<style scoped>
.content-limit {
  max-width: 1600px;
  margin: 0 auto;
}
.q-page {
  background-color: #f5f5f5;
}
</style>
