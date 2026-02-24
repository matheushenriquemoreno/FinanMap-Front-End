<template>
  <q-card flat bordered :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <q-card-section>
      <div class="text-h6" :class="$q.dark.isActive ? 'text-white' : 'text-black'">
        Distribuição de Categorias
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
    <q-card-section class="q-pt-none flex flex-center">
      <div v-if="loading" class="flex flex-center" style="height: 350px; width: 100%">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else style="width: 100%; display: flex; justify-content: center;">
        <apexchart
          type="donut"
          height="350"
          width="100%"
          style="max-width: 450px;"
          :options="chartOptions"
          :series="series"
        ></apexchart>
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
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

const $q = useQuasar();
const store = useDashboardStore();
const service = obterDashboardService();
const loading = ref(false);

const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Despesa);
const categoriasOptions = [
  { label: 'Rendimentos', value: TipoCategoriaETransacao.Rendimento },
  { label: 'Despesas', value: TipoCategoriaETransacao.Despesa },
  { label: 'Investimentos', value: TipoCategoriaETransacao.Investimento },
];

const series = ref<number[]>([]);
const labels = ref<string[]>([]);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    foreColor: $q.dark.isActive ? '#fff' : '#333',
    toolbar: { show: false },
  },
  labels: labels.value,
  legend: {
    position: 'bottom',
    labels: {
        colors: $q.dark.isActive ? '#fff' : '#333',
    },
    markers: {
      shape: 'circle',
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            color: $q.dark.isActive ? '#aaaaaa' : '#666666',
          },
          value: {
            show: true,
            color: $q.dark.isActive ? '#ffffff' : '#000000',
            formatter: (val: string) => formatarValor(val),
          },
          total: {
            show: true,
            showAlways: false,
            label: 'Total',
            color: $q.dark.isActive ? '#aaaaaa' : '#666666',
            formatter: function (w: any) {
              const total = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
              return formatarValor(total);
            }
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val.toFixed(1) + '%';
    },
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 1,
      opacity: 0.45
    }
  },
  stroke: {
    show: true,
    colors: $q.dark.isActive ? ['#1d1d1d'] : ['#ffffff'], 
    width: 2
  },
  tooltip: {
    theme: $q.dark.isActive ? 'dark' : 'light',
    y: { formatter: (val: number) => formatarValor(val) },
  },
}));

function formatarValor(valor: any) {
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico)) return valor;
  return valorNumerico.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
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

    labels.value = resultado.map((item) => item.categoria);
    series.value = resultado.map((item) => item.valor);
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
