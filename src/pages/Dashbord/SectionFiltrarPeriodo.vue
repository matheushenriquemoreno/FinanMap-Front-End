<template>
  <section
    class="q-mb-md bg-white"
    style="
      border-radius: 15px;
      box-shadow:
        rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
        rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    "
  >
    <q-form
      class="row q-gutter-x-md q-gutter-y-xs justify-center items-center"
      style="padding: 10px"
    >
      <InputSelectMes
        class="col-sm-2 col-10"
        v-model:model-value="mesInicial"
        label="Mês Inicial"
      />
      <InputSelectMes class="col-sm-2 col-10" v-model:model-value="mesFinal" label="Mês Final" />

      <InputSelectAno class="col-sm-2 col-10" v-model:model-value="ano" label="Ano" />
      <div class="col-sm-1 col-12 row justify-center">
        <q-btn flat round color="grey" icon="filter_alt" @click="filtrar" />
      </div>
      <q-btn
        color="primary"
        no-caps
        label="Ultimos 3 Meses"
        style="border-radius: 8px"
        @click="aplicarUltimosTresMeses"
      />
      <q-btn
        color="grey"
        no-caps
        label="Este ano"
        style="border-radius: 8px"
        @click="aplicarEsteAno"
      />
    </q-form>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import InputSelectMes from 'src/components/Inputs/InputSelectMes.vue';
import InputSelectAno from 'src/components/Inputs/InputSelectAno.vue';

interface EmitEvent {
  (e: 'filtrar', mesInicial: number, mesFinal: number, ano: number): void;
}

const emit = defineEmits<EmitEvent>();

// Definindo props
const props = defineProps({
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// Estado do componente
const mesInicial = ref<number>(getMesAtual());
const mesFinal = ref<number>(getMesAtual());
const ano = ref<number>(new Date().getFullYear());

// Função para filtrar e emitir o evento
const filtrar = () => {
  emit('filtrar', mesInicial.value, mesFinal.value, ano.value);
};

function getMesAtual() {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  return mesAtual;
}

// Função para aplicar filtro de últimos 3 meses
const aplicarUltimosTresMeses = () => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  ano.value = dataAtual.getFullYear();

  if (mesAtual >= 3) {
    mesInicial.value = mesAtual - 2;
  } else {
    mesInicial.value = 1;
  }
  mesFinal.value = mesAtual;
  filtrar();
};

// Função para aplicar filtro de este ano
const aplicarEsteAno = () => {
  const dataAtual = new Date();
  ano.value = dataAtual.getFullYear();
  mesInicial.value = 1;
  mesFinal.value = dataAtual.getMonth() + 1;

  filtrar();
};

// Emitir o evento quando o componente for montado
onMounted(() => {
  filtrar();
});
</script>
