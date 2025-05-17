<template>
  <div class="q-pa-md q-gutter-sm flex justify-between">
    <q-breadcrumbs class="text-grey" active-color="black">
      <template v-slot:separator>
        <q-icon size="1.2em" name="arrow_forward" color="green" />
      </template>

      <q-breadcrumbs-el icon="home" />
      <q-breadcrumbs-el label="Gerenciamento Mensal" icon="navigation" />
    </q-breadcrumbs>
    <div class="text-dark text-subtitle2" v-if="$q.screen.gt.xs">
      <q-icon name="schedule" color="dark" size="xs" /> <span>{{ dataAtual }}</span>
    </div>
  </div>
  <div class="row justify-center q-gutter-lg espaco-itens">
    <CardValores
      :valor="acumulado.valorRendimento"
      :icon="IconesGerenciamentoMensal.ICONE_RENDIMENTO"
      icon-color="green"
      label="Recebimentos"
    />
    <CardValores
      :valor="acumulado.valorDespesas"
      :icon="IconesGerenciamentoMensal.ICONE_DESPESA"
      icon-color="red"
      label="Despesas"
    />
    <CardValores
      :valor="acumulado.valorInvestimentos"
      :icon="IconesGerenciamentoMensal.ICONE_INVESTIMENTO"
      icon-color="green"
      label="Investimentos"
    />
    <CardValores
      :valor="acumulado.valorFinal"
      :icon="IconesGerenciamentoMensal.ICONE_RESTANTE"
      :icon-color="acumulado.valorFinal < 0 ? 'red' : 'green'"
      label="Restante"
    />
  </div>
  <div class="espaco-itens">
    <MothYearSelector
      @update:period="handlePeriodChange"
      :mes="useGerenciamentoMensal.mesAtual.mes"
      :ano="useGerenciamentoMensal.mesAtual.ano"
    />
  </div>
  <div>
    <q-tabs
      :v-model="''"
      dense
      align="center"
      class="text-dark"
      :breakpoint="0"
      no-caps
      inline-label
      narrow-indicator
      indicator-color="deep-purple-12"
    >
      <q-route-tab
        name="Recebimentos"
        :icon="IconesGerenciamentoMensal.ICONE_RENDIMENTO"
        label="Rendimentos"
        to="/"
      />
      <q-route-tab
        name="Despesas"
        :icon="IconesGerenciamentoMensal.ICONE_DESPESA"
        label="Despesas"
        to="/Despesas"
      />
      <q-route-tab
        name="Investimentos"
        :icon="IconesGerenciamentoMensal.ICONE_INVESTIMENTO"
        label="Investimentos"
        to="/Investimentos"
      />
    </q-tabs>
  </div>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import { computed, ref } from 'vue';
import MothYearSelector from 'src/components/MothYearSelector.vue';
import CardValores from 'src/components/CardValores.vue';
import IconesGerenciamentoMensal from 'src/helpers/IconesGerenciamentoMensal';

const dataAtual = ref(getDataAtualFormatada());

setInterval(() => {
  dataAtual.value = getDataAtualFormatada();
}, 1000);

const handlePeriodChange = ({ mes, ano }: any) => {
  useGerenciamentoMensal.setMesAno(ano, mes);
};

const useGerenciamentoMensal = useGerenciamentoMensalStore();

const acumulado = computed(() => {
  return useGerenciamentoMensal.getAcumuladoMensal();
});

function getDataAtualFormatada() {
  return new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
}
</script>

<style scoped>
@media (max-width: 460px) {
}

.espaco-itens {
  margin-bottom: 5px;
}
</style>
