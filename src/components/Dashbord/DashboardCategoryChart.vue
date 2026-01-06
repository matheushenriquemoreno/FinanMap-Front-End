<template>
  <q-card flat bordered :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <q-card-section>
      <div class="text-h6" :class="$q.dark.isActive ? 'text-white' : 'text-black'">
        Valores por Categoria
      </div>
      <q-option-group
        v-model="tipoCategoriaSelecionada"
        :options="categoriasOptions"
        :color="$q.dark.isActive ? 'secondary' : 'primary'"
        :class="$q.dark.isActive ? 'text-white' : ''"
        inline
        dense
        @update:model-value="fetchData"
      />
    </q-card-section>
    <q-card-section>
      <div v-if="loading" class="flex flex-center" style="height: 350px">
        <q-spinner color="primary" size="3em" />
      </div>
      <apexchart
        v-else
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { ApexOptions } from 'apexcharts';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { useDashboardStore } from 'src/stores/dashboardStore';

const $q = useQuasar();
const store = useDashboardStore();
const loading = ref(false);

const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
const categoriasOptions = [
  { label: 'Rendimentos', value: TipoCategoriaETransacao.Rendimento },
  { label: 'Despesas', value: TipoCategoriaETransacao.Despesa },
  { label: 'Investimentos', value: TipoCategoriaETransacao.Investimento },
];

const series = ref([
  {
    name: 'Valor',
    data: [] as number[],
  },
]);

const categories = ref<string[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    foreColor: $q.dark.isActive ? '#fff' : '#333',
  },
  colors: [$q.dark.isActive ? '#5e72e4' : '#1d169c'],
  plotOptions: {
    bar: {
      borderRadius: 5,
      horizontal: true,
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => formatarValor(val, 'currency'),
  },
  xaxis: {
    categories: categories.value,
    labels: {
      formatter: (val: string) => formatarValor(val, 'currency'),
      style: {
        colors: $q.dark.isActive ? '#fff' : '#333',
      }
    },
  },
  yaxis: {
    labels: {
      style: { 
        colors: $q.dark.isActive ? '#fff' : '#333',
        fontSize: '12px' 
      },
    },
  },
  grid: {
    borderColor: $q.dark.isActive ? '#404040' : '#e0e0e0',
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
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
  ],
}));

function formatarValor(valor: any, style: 'currency' | 'decimal' = 'currency') {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', {
    style: style,
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function fetchData() {
  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Mock data
  const mockCategories = ['Saúde', 'Transporte', 'Alimentação', 'Educação', 'Moradia'];
  categories.value = mockCategories;
  
  series.value = [{
    name: 'Valor',
    data: mockCategories.map(() => Math.floor(Math.random() * 5000) + 500)
  }];

  loading.value = false;
}

watch(
  () => [store.mesInicial, store.mesFinal, store.ano],
  () => {
    fetchData();
  },
  { immediate: true }
);
</script>
