<template>
  <!--Modal Adicionar/Editar Rendimento-->
  <q-dialog
    persistent
    v-model="localModelValue"
    @before-hide="closeModal"
    @hide="closeModal"
    position="top"
  >
    <q-card style="width: 700px; max-width: 90vw; margin-top: 40px; border-radius: 15px">
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
          <DateBR
            v-model="dadosFormulario.dataInicial"
            label="Periodo Inicial"
            required
            :styled="{
              rounded: true,
              filled: true,
            }"
          />
          <span>A</span>
          <DateBR
            v-model="dadosFormulario.dataFinal"
            label="Periodo Final"
            required
            :styled="{
              rounded: true,
              filled: true,
            }"
          />
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
import DateBR from 'src/components/Inputs/DateBR.vue';
import type { TipoCategoriaETransacao } from 'src/Model/Categoria';
import replicarTransacoesPorPeriodo from 'src/services/ReplicarTranscoes';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';

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
const dataSelecionadaAtualmente = new Date(
  useGerenciamentoMensal.mesAtual.ano,
  useGerenciamentoMensal.mesAtual.mes,
  1,
);
const dadosFormulario = ref({
  dataInicial: dataSelecionadaAtualmente,
  dataFinal: date.addToDate(dataSelecionadaAtualmente, { months: 3 }),
});

const localModelValue = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
});

const loading = ref(false);

watch(localModelValue, (valor) => {
  if (valor === true) {
    const dataSelecionadaAtualmente = new Date(
      useGerenciamentoMensal.mesAtual.ano,
      useGerenciamentoMensal.mesAtual.mes,
      1,
    );
    dadosFormulario.value.dataInicial = dataSelecionadaAtualmente;
    dadosFormulario.value.dataFinal = date.addToDate(dataSelecionadaAtualmente, { months: 3 });
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

async function handleCriarRegistroProximoMes() {
  try {
    loading.value = true;
    await replicarTransacoesPorPeriodo(
      props.idsTransacao,
      dadosFormulario.value.dataInicial,
      dadosFormulario.value.dataFinal,
      props.tipoCategoriaTransacao,
    );
  } finally {
    loading.value = false;
    closeModal();
  }
}
</script>
