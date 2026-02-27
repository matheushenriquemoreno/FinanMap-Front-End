<template>
  <!--Modal Adicionar/Editar Rendimento-->
  <q-dialog persistent v-model="localModelValue" @before-hide="closeModal" @hide="closeModal" position="top"
    backdrop-filter="brightness(60%)">
    <q-card style="width: 550px; max-width: 90vw; margin-top: 40px; border-radius: 15px">
      <q-card-section class="row items-center q-pb-md">
        <div class="text-h6">Replicar registros.</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pt-none">
        <div class="q-pa-md">
          <span>Deseja replicar os registros selecionados para qual o periodo?</span>
        </div>

        <q-form class="q-gutter-md" @submit.prevent="handleCriarRegistroProximoMes">
          <InputSelectMesAno label="Periodo Inicial" :styled="{
            rounded: true,
            filled: true,
          }" v-model:model-value="mesAno" />
          <q-separator />
          <InputSelectMesAno label="Periodo Final" :styled="{
            rounded: true,
            filled: true,
          }" v-model:model-value="mesAnoFinal" />
          <q-card-actions class="text-primary" align="between">
            <q-btn flat label="Fechar" dense v-close-popup />
            <q-btn flat icon-right="add" dense label="Replicar" type="submit" :loading="loading" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar, date } from 'quasar';
import type { TipoCategoriaETransacao } from 'src/Model/Categoria';
import replicarTransacoesPorPeriodo from 'src/services/ReplicarTranscoes';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import InputSelectMesAno from 'src/components/Inputs/InputSelectMesAno.vue';
import type { MesAno } from 'src/Model/Transacao';

// Props do componente
interface Props {
  modelValue: boolean;
  idsTransacao: string[];
  tipoCategoriaTransacao: TipoCategoriaETransacao;
}

// Definição das props com validação
const props = defineProps<Props>();

// services
const $q = useQuasar();
const useGerenciamentoMensal = useGerenciamentoMensalStore();

// Variaveis
const mesAno = ref<MesAno>({} as MesAno);
const mesAnoFinal = ref<MesAno>({} as MesAno);

const localModelValue = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
});

const loading = ref(false);

watch(localModelValue, (abrirModal) => {
  if (abrirModal === true) {
    preencherMesAnoFiltroComProximo3Meses();
  }
});

// Emits do componente
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'closeModal'): void;
}>();

const closeModal = () => {
  localModelValue.value = false;
  emit('closeModal');
};

function preencherMesAnoFiltroComProximo3Meses() {
  // Pega o momento atual do painel selecionado pelo usuário
  const mesAtualPainel = new Date(
    useGerenciamentoMensal.mesAtual.ano,
    useGerenciamentoMensal.mesAtual.mes - 1, // Atenção: Em JS o mês começa do 0 (Jan = 0, Fev = 1)
    1,
  );

  // Mês Inicial: Próximo mês
  const dataInicial = date.addToDate(mesAtualPainel, { months: 1 });

  // Mês Final: +2 meses depois da Inícial (Para contabilizar 3 meses no total)
  const dataFinal = date.addToDate(dataInicial, { months: 2 });

  mesAno.value = {
    ano: dataInicial.getFullYear(),
    mes: dataInicial.getMonth() + 1, // Voltamos para formato Humano (1-12)
  };
  mesAnoFinal.value = {
    ano: dataFinal.getFullYear(),
    mes: dataFinal.getMonth() + 1,
  };
}

async function handleCriarRegistroProximoMes() {
  try {
    loading.value = true;
    await replicarTransacoesPorPeriodo(
      props.idsTransacao,
      new Date(mesAno.value.ano, mesAno.value.mes - 1, 1),
      new Date(mesAnoFinal.value.ano, mesAnoFinal.value.mes - 1, 1),
      props.tipoCategoriaTransacao,
    );
  } finally {
    loading.value = false;
    closeModal();
  }
}
</script>
