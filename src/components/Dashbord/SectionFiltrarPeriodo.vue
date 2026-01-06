<template>
  <section
    class="q-mb-md transition-all duration-300"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-black'"
    style="
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.05);
    "
  >
    <div class="q-pa-md">
      <!-- Header / Title -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm">
          <q-icon name="tune" size="20px" :color="$q.dark.isActive ? 'primary' : 'grey-8'" />
          <span>Filtros do Período</span>
        </div>
        
        <!-- Quick Actions - Desktop -->
        <div class="row q-gutter-xs gt-sm">
          <q-chip
            v-if="showMesAtualShortcut"
            clickable
            @click="aplicarMesAtual"
            :color="$q.dark.isActive ? 'grey-9' : 'primary'"
            :text-color="$q.dark.isActive ? 'white' : 'white'"
            :outline="!$q.dark.isActive"
            icon="today"
            class="shortcut-chip"
          >
            Mês Atual
          </q-chip>
          <q-chip
            clickable
            @click="aplicarUltimosTresMeses"
            :color="$q.dark.isActive ? 'grey-9' : 'primary'"
            :text-color="$q.dark.isActive ? 'white' : 'white'"
            :outline="!$q.dark.isActive"
            icon="date_range"
            class="shortcut-chip"
          >
            Últimos 3 Meses
          </q-chip>
          <q-chip
            clickable
            @click="aplicarEsteAno"
            :color="$q.dark.isActive ? 'grey-9' : 'primary'"
            :text-color="$q.dark.isActive ? 'white' : 'white'"
            :outline="!$q.dark.isActive"
            icon="calendar_today"
            class="shortcut-chip"
          >
            Este Ano
          </q-chip>
        </div>
      </div>

      <q-form class="row q-col-gutter-md ">
        <!-- Mês Inicial -->
        <div class="col-12 col-sm-6 col-md-3">
          <InputSelectMes
            v-model:model-value="localMesInicial"
            label="Mês Inicial"
            dense
            outlined
            :dark="$q.dark.isActive"
            class="filter-input"
            :error="hasValidationError"
          />
        </div>
        
        <!-- Mês Final -->
        <div class="col-12 col-sm-6 col-md-3">
          <InputSelectMes
            v-model:model-value="localMesFinal"
            label="Mês Final"
            dense
            outlined
            :dark="$q.dark.isActive"
            class="filter-input"
            :error="hasValidationError"
            :error-message="validationErrorMessage"
          />
        </div>
        
        <!-- Ano -->
        <div class="col-12 col-sm-6 col-md-3">
          <InputSelectAno
            v-model:model-value="localAno"
            label="Ano"
            dense
            outlined
            :dark="$q.dark.isActive"
            class="filter-input"
          />
        </div>

        <!-- Filter Button -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-btn
            unelevated
            color="primary"
            icon="filter_list"
            label="Filtrar"
            class="q-px-lg rounded-borders full-width"
            @click="aplicarFiltroManual"
          />
        </div>

        <!-- Quick Actions - Mobile -->
        <div class="col-12 lt-md">
          <div class="row q-gutter-xs justify-center">
            <q-chip
              v-if="showMesAtualShortcut"
              clickable
              @click="aplicarMesAtual"
              :color="$q.dark.isActive ? 'grey-9' : 'primary'"
              :text-color="$q.dark.isActive ? 'white' : 'white'"
              :outline="!$q.dark.isActive"
              icon="today"
              class="shortcut-chip"
            >
              Mês Atual
            </q-chip>
            <q-chip
              clickable
              @click="aplicarUltimosTresMeses"
              :color="$q.dark.isActive ? 'grey-9' : 'primary'"
              :text-color="$q.dark.isActive ? 'white' : 'white'"
              :outline="!$q.dark.isActive"
              icon="date_range"
              class="shortcut-chip"
            >
              Últimos 3 Meses
            </q-chip>
            <q-chip
              clickable
              @click="aplicarEsteAno"
              :color="$q.dark.isActive ? 'grey-9' : 'primary'"
              :text-color="$q.dark.isActive ? 'white' : 'white'"
              :outline="!$q.dark.isActive"
              icon="calendar_today"
              class="shortcut-chip"
            >
              Este Ano
            </q-chip>
          </div>
        </div>
      </q-form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import InputSelectMes from 'src/components/Inputs/InputSelectMes.vue';
import InputSelectAno from 'src/components/Inputs/InputSelectAno.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const dashboardStore = useDashboardStore();

// Local state for inputs to allow manual filtering
const localMesInicial = ref<number>(dashboardStore.mesInicial);
const localMesFinal = ref<number>(dashboardStore.mesFinal);
const localAno = ref<number>(dashboardStore.ano);

// Validation
const hasValidationError = computed(() => {
  return localMesInicial.value > localMesFinal.value;
});

const validationErrorMessage = computed(() => {
  return hasValidationError.value ? 'O mês inicial não pode ser maior que o mês final' : '';
});

// Show "Mês Atual" shortcut only when not already viewing current month
const showMesAtualShortcut = computed(() => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();
  
  return !(localMesInicial.value === mesAtual && 
           localMesFinal.value === mesAtual && 
           localAno.value === anoAtual);
});

// Sync local state when store changes
watch(() => dashboardStore.mesInicial, (val) => localMesInicial.value = val);
watch(() => dashboardStore.mesFinal, (val) => localMesFinal.value = val);
watch(() => dashboardStore.ano, (val) => localAno.value = val);

const aplicarFiltroManual = () => {
  if (hasValidationError.value) {
    $q.notify({
      type: 'negative',
      message: 'O mês inicial não pode ser maior que o mês final',
      position: 'top',
      timeout: 3000,
      icon: 'warning'
    });
    return;
  }
  
  dashboardStore.setFiltros(localMesInicial.value, localMesFinal.value, localAno.value);
  
  $q.notify({
    type: 'positive',
    message: 'Filtros aplicados com sucesso',
    position: 'top',
    timeout: 2000,
    icon: 'check_circle'
  });
};

const aplicarMesAtual = () => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();
  
  localAno.value = anoAtual;
  localMesInicial.value = mesAtual;
  localMesFinal.value = mesAtual;
  
  aplicarFiltroManual();
};

const aplicarUltimosTresMeses = () => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();
  
  localAno.value = anoAtual;
  localMesFinal.value = mesAtual;

  if (mesAtual >= 3) {
    localMesInicial.value = mesAtual - 2;
  } else {
    localMesInicial.value = 1; 
  }
  
  aplicarFiltroManual();
};

const aplicarEsteAno = () => {
  const dataAtual = new Date();
  localAno.value = dataAtual.getFullYear();
  localMesInicial.value = 1;
  localMesFinal.value = dataAtual.getMonth() + 1;

  aplicarFiltroManual();
};

onMounted(() => {
  aplicarFiltroManual();
});
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.filter-input :deep(.q-field__control) {
  border-radius: 8px;
}

.full-width {
  width: 100%;
}

.shortcut-chip {
  font-weight: 500;
  transition: all 0.2s ease;
}

.shortcut-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>
