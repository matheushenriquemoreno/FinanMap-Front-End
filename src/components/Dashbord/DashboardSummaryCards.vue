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
import { computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import Demostrativo from 'src/components/Dashbord/DemostrativoPage.vue';

const store = useDashboardStore();
const loading = computed(() => store.isLoading);

const dados = computed(() => ({
  rendimento: store.resumo?.rendimento.total ?? 0,
  despesa: store.resumo?.despesa.total ?? 0,
  investimento: store.resumo?.investimento.total ?? 0,
}));

const dadosGrafico = computed(() => ({
  rendimento: store.resumo?.rendimento.tendencia ?? [],
  despesa: store.resumo?.despesa.tendencia ?? [],
  investimento: store.resumo?.investimento.tendencia ?? [],
}));

const periodoFormatado = computed(() => {
  const mesIni = String(store.mesInicial).padStart(2, '0');
  const mesFim = String(store.mesFinal).padStart(2, '0');
  return `${mesIni}/${store.anoInicial} a ${mesFim}/${store.anoFinal}`;
});

function gerarLabels(quantidadePontos: number): string[] {
  if (store.mesInicial === store.mesFinal && store.anoInicial === store.anoFinal) {
    return Array.from({ length: quantidadePontos }, (_, i) => `Semana ${i + 1}`);
  }
  const monthNames = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
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

  return labels.length > 0
    ? labels
    : Array.from({ length: quantidadePontos }, (_, i) => `${i + 1}`);
}

const meses = computed(() => gerarLabels(dadosGrafico.value.rendimento.length));
</script>
