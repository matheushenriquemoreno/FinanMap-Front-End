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
import obterDashboardService from 'src/services/DashboardService';

const $q = useQuasar();
const store = useDashboardStore();
const service = obterDashboardService();
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

const computedMax = computed(() => {
  if (!series.value[0]?.data.length) return 100;
  const max = Math.max(...series.value[0].data);
  return max === 0 ? 100 : max * 1.25;
});

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
      dataLabels: {
        position: 'top', // joga pro fim da barra
      },
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    offsetX: 10, // afasta da barra para a área vazia
    formatter: (val: number) => formatarValor(val, 'currency'),
    style: {
      colors: [$q.dark.isActive ? '#fff' : '#333'],
      fontSize: '11px',
    }
  },
  xaxis: {
    categories: categories.value,
    max: computedMax.value,
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
    padding: {
      right: 80, // espaço extra na direita para garantir que labels grandes caibam
    }
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
  try {
    const resultado = await service.obterCategorias(
      store.dataInicial,
      store.dataFinal,
      tipoCategoriaSelecionada.value
    );

    categories.value = resultado.map((item) => item.categoria);
    series.value = [{
      name: 'Valor',
      data: resultado.map((item) => item.valor),
    }];
  } catch {
    // Erro já tratado pelo handleErrorAxios no service
  } finally {
    loading.value = false;
  }
}

watch(
  () => [store.dataInicial, store.dataFinal],
  () => {
    fetchData();
  },
  { immediate: true }
);
</script>
