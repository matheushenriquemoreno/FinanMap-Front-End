<template>
  <div>
    <q-card-section class="q-pa-xs">
      <div class="row items-center justify-center">
        <div class="row items-center">
          <q-btn flat round dense icon="chevron_left" @click="voltarMesAnterior" />

          <q-btn
            flat
            no-caps
            class="text-body1 q-px-md"
            @click="showSelector = !showSelector"
            :loading="loading"
            style="width: 185px"
          >
            <div class="row items-center text-center">
              {{ mesAtualNome }} {{ selectedYear }}
              <q-icon name="expand_more" size="sm" class="q-ml-xs" />
            </div>
          </q-btn>

          <q-btn flat round dense icon="chevron_right" @click="passarParaProximoMes" />
        </div>
      </div>

      <q-dialog v-model="showSelector">
        <q-card style="min-width: 350px">
          <q-card-section class="q-pb-none">
            <div class="text-h6">Selecionar Período</div>
          </q-card-section>

          <q-card-section>
            <div class="q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Ano</div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="year in years"
                  :key="year"
                  :color="selectedYear === year ? 'green' : 'grey-3'"
                  :text-color="selectedYear === year ? 'white' : 'black'"
                  no-caps
                  unelevated
                  dense
                  @click="selectedYear = year"
                >
                  {{ year }}
                </q-btn>
                <q-btn round color="grey" icon="event_available" @click="selecionarDataAtual">
                  <q-tooltip class="bg-grey">Atualiza a data para o mês atual</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-sm">Mês</div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="month in months"
                  :key="month.mes"
                  :color="selectedMonth === month.mes ? 'green' : 'grey-3'"
                  :text-color="selectedMonth === month.mes ? 'white' : 'black'"
                  no-caps
                  unelevated
                  dense
                  @click="selectedMonth = month.mes"
                >
                  {{ month.name.substring(0, 3) }}
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="dark" @click="selecionarDataAtual" v-close-popup />
            <q-btn flat label="Aplicar" color="primary" @click="aplicarSelecao" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card-section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  mes: {
    type: Number,
    required: false,
  },
  ano: {
    type: Number,
    required: false,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// Estado
const currentDate = new Date();
const selectedMonth = ref(props.mes || currentDate.getMonth() + 1);
const selectedYear = ref(props.ano || currentDate.getFullYear());
const showSelector = ref(false);

// Faz a listagem de 3 anos, pegando sempre o atual o anterior e o proximo
const years = computed(() => {
  return Array.from({ length: 3 }, (_, i) => selectedYear.value - 1 + i);
});

// Nomes dos meses em português
const months = [
  { name: 'Janeiro', mes: 1 },
  { name: 'Fevereiro', mes: 2 },
  { name: 'Março', mes: 3 },
  { name: 'Abril', mes: 4 },
  { name: 'Maio', mes: 5 },
  { name: 'Junho', mes: 6 },
  { name: 'Julho', mes: 7 },
  { name: 'Agosto', mes: 8 },
  { name: 'Setembro', mes: 9 },
  { name: 'Outubro', mes: 10 },
  { name: 'Novembro', mes: 11 },
  { name: 'Dezembro', mes: 12 },
];

const mesAtualNome = computed(() => {
  return months.find((x) => x.mes === selectedMonth.value)?.name;
});

// Emitir evento quando a data muda
const emit = defineEmits(['update:period']);

// Observar mudanças e emitir eventos
watch([selectedMonth, selectedYear], ([month, year]) => {
  if (showSelector.value === false) emit('update:period', { mes: month, ano: year });
});

// Métodos para navegação
const voltarMesAnterior = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
};

const passarParaProximoMes = () => {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
};

const selecionarDataAtual = () => {
  selectedMonth.value = currentDate.getMonth() + 1;
  selectedYear.value = currentDate.getFullYear();
};

const aplicarSelecao = () => {
  emit('update:period', { mes: selectedMonth.value, ano: selectedYear.value });
  showSelector.value = false;
};
</script>
