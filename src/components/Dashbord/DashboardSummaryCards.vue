<template>
  <div class="row q-col-gutter-md justify-center">
    <div class="col-12 col-sm-6 col-md-4">
      <Demostrativo
        :valor="dados.rendimento"
        :sub-titulo="`Rendimento ${periodoFormatado}`"
        :meses-grafico="meses"
        :dados-grafico="dadosGrafico.rendimento"
        nome-valor-grafico="Rendimento"
        cor-grafico="#21ba45"
        :loading="loading"
      />
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <Demostrativo
        :valor="dados.despesa"
        :sub-titulo="`Despesas ${periodoFormatado}`"
        :meses-grafico="meses"
        :dados-grafico="dadosGrafico.despesa"
        nome-valor-grafico="Despesa"
        cor-grafico="#c10015"
        :loading="loading"
      />
    </div>
    <div class="col-12 col-sm-6 col-md-4">
      <Demostrativo
        :valor="dados.investimento"
        :sub-titulo="`Investimentos ${periodoFormatado}`"
        :meses-grafico="meses"
        :dados-grafico="dadosGrafico.investimento"
        nome-valor-grafico="Investimento"
        cor-grafico="#31ccec"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import Demostrativo from 'src/components/Dashbord/DemostrativoPage.vue';
import obterDashboardService from 'src/services/DashboardService';

const store = useDashboardStore();
const service = obterDashboardService();
const loading = ref(false);

const dados = ref({
  rendimento: 0,
  despesa: 0,
  investimento: 0,
});

const dadosGrafico = ref({
  rendimento: [] as number[],
  despesa: [] as number[],
  investimento: [] as number[],
});

const meses = ref<string[]>([]);

const periodoFormatado = computed(() => {
  const mesIni = String(store.mesInicial).padStart(2, '0');
  const mesFim = String(store.mesFinal).padStart(2, '0');
  return `${mesIni}/${store.anoInicial} a ${mesFim}/${store.anoFinal}`;
});

function gerarLabels(quantidadePontos: number): string[] {
  if (store.mesInicial === store.mesFinal && store.anoInicial === store.anoFinal) {
    return Array.from({ length: quantidadePontos }, (_, i) => `Semana ${i + 1}`);
  }
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const labels: string[] = [];

  let ano = store.anoInicial;
  let mes = store.mesInicial;

  while (ano < store.anoFinal || (ano === store.anoFinal && mes <= store.mesFinal)) {
    labels.push(monthNames[mes - 1]!);
    mes++;
    if (mes > 12) {
      mes = 1;
      ano++;
    }
  }

  return labels.length > 0 ? labels : Array.from({ length: quantidadePontos }, (_, i) => `${i + 1}`);
}

async function fetchData() {
  loading.value = true;
  try {
    const resumo = await service.obterResumo(store.dataInicial, store.dataFinal);

    dados.value = {
      rendimento: resumo.rendimento.total,
      despesa: resumo.despesa.total,
      investimento: resumo.investimento.total,
    };

    dadosGrafico.value = {
      rendimento: resumo.rendimento.tendencia,
      despesa: resumo.despesa.tendencia,
      investimento: resumo.investimento.tendencia,
    };

    const quantidadePontos = resumo.rendimento.tendencia.length;
    meses.value = gerarLabels(quantidadePontos);
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
