<template>
  <div>
    <q-card-section class="q-pa-xs">
      <!-- Campo de seleção de meses -->
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
            <div
              :class="
                'row items-center text-center text-weight-bold ' +
                (mesAnoSelecionadoEhAtual ? 'text-primary' : 'text-dark')
              "
            >
              {{ mesAtualNome }} {{ selectedYear }}
              <q-icon
                :color="mesAnoSelecionadoEhAtual ? 'primary' : 'dark'"
                :name="mesAnoSelecionadoEhAtual ? 'event' : 'expand_more'"
                size="sm"
                class="q-ml-xs"
              />
            </div>
          </q-btn>

          <q-btn flat round dense icon="chevron_right" @click="passarParaProximoMes" />
        </div>
      </div>
      
      <!-- Dialog de seleção de meses e anos - Modernizado -->
      <q-dialog v-model="showSelector">
        <q-card class="period-selector-card">
          <!-- Header com título e botão de data atual -->
          <q-card-section class="q-pb-sm">
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-regular">Selecionar Período</div>
              <q-btn 
                flat 
                round 
                icon="event_available" 
                @click="selecionarDataAtual"
                class="text-primary"
                size="16px" 
              >
                <q-tooltip class="bg-grey-7" style="font-size: 14px;">Voltar para data atual</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <!-- Seletor de Ano -->
            <div class="q-mb-lg">
              <div class="text-subtitle2 q-mb-md">Ano</div>
              <div class="year-selector">
                <q-btn 
                  flat 
                  round 
                  dense 
                  icon="chevron_left" 
                  @click="voltarAnoAnterior"
                  class="year-nav-btn"
                />
                
                <div class="years-container">
                  <div
                    v-for="year in visibleYears"
                    :key="year"
                    :class="['year-item', { 'year-selected': selectedYear === year }]"
                    @click="selectedYear = year"
                  >
                    {{ year }}
                  </div>
                </div>
                
                <q-btn 
                  flat 
                  round 
                  dense 
                  icon="chevron_right" 
                  @click="passarParaProximoAno"
                  class="year-nav-btn"
                />
              </div>
            </div>

            <!-- Seletor de Mês -->
            <div>
              <div class="text-subtitle2 q-mb-md">Mês</div>
              <div class="months-grid">
                <div
                  v-for="month in months"
                  :key="month.mes"
                  :class="['month-item', { 'month-selected': selectedMonth === month.mes }]"
                  @click="selectedMonth = month.mes"
                >
                  {{ month.name.substring(0, 3) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Ações -->
          <q-card-actions class="q-px-md q-pb-md" align="right">
            <q-btn 
              unelevated
              label="APLICAR" 
              color="primary"
              class="apply-btn"
              @click="aplicarSelecao" 
              v-close-popup 
            />
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

// Ano base para navegação (controla qual conjunto de anos é exibido)
const baseYear = ref(selectedYear.value);

// Mostra 5 anos: baseYear-2, baseYear-1, baseYear, baseYear+1, baseYear+2
const visibleYears = computed(() => {
  return Array.from({ length: 5 }, (_, i) => baseYear.value - 2 + i);
});

// Mantém compatibilidade com código antigo (não usado no novo template)
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

watch([showSelector], ([value]) => {
  if (value === false && (selectedMonth.value != props.mes || selectedYear.value != props.ano)) {
    selectedMonth.value = props.mes!;
    selectedYear.value = props.ano!;
  }
  // Quando abrir o seletor, centralizar os anos visíveis no ano selecionado
  if (value === true) {
    baseYear.value = selectedYear.value;
  }
});

// Métodos para navegação de meses
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

// Métodos para navegação de anos
const voltarAnoAnterior = () => {
  baseYear.value--;
};

const passarParaProximoAno = () => {
  baseYear.value++;
};

const selecionarDataAtual = () => {
  selectedMonth.value = currentDate.getMonth() + 1;
  selectedYear.value = currentDate.getFullYear();
  baseYear.value = currentDate.getFullYear();
  aplicarSelecao();
};

const mesAnoSelecionadoEhAtual = computed(() => {
  return (
    selectedMonth.value === currentDate.getMonth() + 1 &&
    selectedYear.value === currentDate.getFullYear()
  );
});

const aplicarSelecao = () => {
  emit('update:period', { mes: selectedMonth.value, ano: selectedYear.value });
  showSelector.value = false;
};
</script>

<style scoped>
/* ===== CARD STYLES ===== */
.period-selector-card {
  min-width: 350px;
  max-width: 550px;
  border-radius: 16px;
}

/* ===== YEAR SELECTOR ===== */
.year-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.year-nav-btn {
  color: #9e9e9e;
}

.years-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
}

.year-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #757575;
}

.year-item:hover {
  background-color: rgba(76, 175, 80, 0.1);
  color: #2f6531;
}

.year-selected {
  background-color: #2f6531 !important;
  color: white !important;
  font-size: 20px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* ===== MONTH SELECTOR ===== */
.months-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.month-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #424242;
  background-color: transparent;
}

.month-item:hover {
  border-color: #2f6531;
  background-color: rgba(76, 175, 80, 0.1);
  color: #2f6531;
}

.month-selected {
  background-color: #2f6531 !important;
  border-color: #2f6531 !important;
  color: white !important;
  box-shadow: 0 2px 5px rgba(76, 175, 80, 0.3);
}

/* ===== ACTION BUTTON ===== */
.apply-btn {
  border-radius: 24px;
  padding: 8px 32px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .period-selector-card {
    min-width: 300px;
  }
  
  .months-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  
  .month-item {
    width: 50px;
    height: 50px;
    font-size: 12px;
  }
  
  .year-item {
    min-width: 50px;
    height: 50px;
    font-size: 14px;
  }
  
  .year-selected {
    width: 65px;
    height: 65px;
    font-size: 18px;
  }
}

/* ===== DARK MODE STYLES ===== */
body.body--dark .text-dark {
  color: #e0e0e0 !important;
}

body.body--dark .text-primary {
  color: #5ab6ff !important;
}

body.body--dark .period-selector-card {
  background-color: #1e1e1e;
}

body.body--dark .year-item {
  color: #b0b0b0;
}

body.body--dark .year-item:hover {
  background-color: rgba(76, 175, 80, 0.2);
  color: #66bb6a;
}

body.body--dark .month-item {
  border-color: #424242;
  color: #e0e0e0;
}

body.body--dark .month-item:hover {
  border-color: #66bb6a;
  background-color: rgba(76, 175, 80, 0.2);
  color: #66bb6a;
}

body.body--dark .month-selected {
  background-color: #4caf50 !important;
  border-color: #4caf50 !important;
  color: white !important;
}

body.body--dark .year-selected {
  background-color: #4caf50 !important;
  color: white !important;
}

body.body--dark .year-nav-btn {
  color: #757575;
}
</style>
