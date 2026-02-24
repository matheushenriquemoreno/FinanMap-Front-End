<template>
  <section
    class="q-mb-md filter-section"
    :class="$q.dark.isActive ? 'filter-section--dark' : 'filter-section--light'"
  >
    <div class="filter-inner q-pa-sm q-px-md">
      <!-- Row with all controls in one line -->
      <div class="filter-row">

        <!-- Left: Title + Inputs -->
        <div class="filter-left">
          <!-- Title -->
          <div class="filter-title" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
            <q-icon name="tune" size="16px" />
            <span>Filtros do Período</span>
          </div>

          <!-- Period inputs inline -->
          <div class="filter-inputs-group">
            <!-- Initial Period -->
            <div class="filter-period-block">
              <span class="period-label" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
                Período Inicial
              </span>
              <div class="period-selects">
                <InputSelectMes
                  label="Mês"
                  v-model:model-value="localPeriodoInicial.mes"
                  :styled="inputStyled"
                  class="period-select"
                />
                <InputSelectAno
                  label="Ano"
                  v-model:model-value="localPeriodoInicial.ano"
                  :styled="inputStyled"
                  class="period-select period-select--ano"
                />
              </div>
            </div>

            <!-- Separator -->
            <div class="period-separator" :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'">
              <q-icon name="arrow_forward" size="18px" />
            </div>

            <!-- Final Period -->
            <div class="filter-period-block">
              <span class="period-label" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-6'">
                Período Final
              </span>
              <div class="period-selects">
                <InputSelectMes
                  label="Mês"
                  v-model:model-value="localPeriodoFinal.mes"
                  :styled="inputStyled"
                  class="period-select"
                />
                <InputSelectAno
                  label="Ano"
                  v-model:model-value="localPeriodoFinal.ano"
                  :styled="inputStyled"
                  class="period-select period-select--ano"
                />
              </div>
            </div>

            <!-- Filter Button -->
            <q-btn
              unelevated
              color="primary"
              icon="filter_list"
              label="Filtrar"
              class="filter-btn"
              :class="{ 'filter-btn--error': hasValidationError }"
              @click="aplicarFiltroManual"
            >
              <q-tooltip v-if="hasValidationError" class="bg-negative">
                {{ validationErrorMessage }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Right: Shortcuts -->
        <div class="filter-shortcuts gt-sm">
          <q-btn
            v-if="showMesAtualShortcut"
            flat
            dense
            no-caps
            icon="today"
            label="Mês Atual"
            :color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
            class="shortcut-btn"
            @click="aplicarMesAtual"
          />
          <q-btn
            flat
            dense
            no-caps
            icon="date_range"
            label="Últimos 3 Meses"
            :color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
            class="shortcut-btn"
            @click="aplicarUltimosTresMeses"
          />
          <q-btn
            flat
            dense
            no-caps
            icon="calendar_today"
            label="Este Ano"
            :color="$q.dark.isActive ? 'grey-4' : 'grey-7'"
            class="shortcut-btn"
            @click="aplicarEsteAno"
          />
        </div>
      </div>

      <!-- Mobile shortcuts -->
      <div class="lt-md q-mt-sm">
        <div class="row q-gutter-xs justify-center">
          <q-chip
            v-if="showMesAtualShortcut"
            clickable
            @click="aplicarMesAtual"
            :color="$q.dark.isActive ? 'grey-9' : 'primary'"
            text-color="white"
            :outline="!$q.dark.isActive"
            icon="today"
            dense
          >
            Mês Atual
          </q-chip>
          <q-chip
            clickable
            @click="aplicarUltimosTresMeses"
            :color="$q.dark.isActive ? 'grey-9' : 'primary'"
            text-color="white"
            :outline="!$q.dark.isActive"
            icon="date_range"
            dense
          >
            Últimos 3 Meses
          </q-chip>
          <q-chip
            clickable
            @click="aplicarEsteAno"
            :color="$q.dark.isActive ? 'grey-9' : 'primary'"
            text-color="white"
            :outline="!$q.dark.isActive"
            icon="calendar_today"
            dense
          >
            Este Ano
          </q-chip>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import InputSelectAno from 'src/components/Inputs/InputSelectAno.vue';
import InputSelectMes from 'src/components/Inputs/InputSelectMes.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const dashboardStore = useDashboardStore();

const inputStyled = { dense: true, filled: false, rounded: false, borderless: false };

// Local state for inputs to allow manual filtering
const localPeriodoInicial = ref<{ mes: number; ano: number }>({
  mes: dashboardStore.mesInicial,
  ano: dashboardStore.anoInicial,
});
const localPeriodoFinal = ref<{ mes: number; ano: number }>({
  mes: dashboardStore.mesFinal,
  ano: dashboardStore.anoFinal,
});

// Validation
const hasValidationError = computed(() => {
  const pIni = localPeriodoInicial.value.ano * 100 + localPeriodoInicial.value.mes;
  const pFim = localPeriodoFinal.value.ano * 100 + localPeriodoFinal.value.mes;
  return pIni > pFim;
});

const validationErrorMessage = computed(() => {
  return hasValidationError.value ? 'O período inicial não pode ser posterior ao final' : '';
});

// Show "Mês Atual" shortcut only when not already viewing current month
const showMesAtualShortcut = computed(() => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  return !(localPeriodoInicial.value.mes === mesAtual &&
           localPeriodoInicial.value.ano === anoAtual &&
           localPeriodoFinal.value.mes === mesAtual &&
           localPeriodoFinal.value.ano === anoAtual);
});

// Sync local state when store changes
watch(() => dashboardStore.mesInicial, (val) => localPeriodoInicial.value.mes = val);
watch(() => dashboardStore.anoInicial, (val) => localPeriodoInicial.value.ano = val);
watch(() => dashboardStore.mesFinal, (val) => localPeriodoFinal.value.mes = val);
watch(() => dashboardStore.anoFinal, (val) => localPeriodoFinal.value.ano = val);

const aplicarFiltroManual = () => {
  if (hasValidationError.value) {
    $q.notify({
      type: 'negative',
      message: 'O período inicial não pode ser maior que o período final',
      position: 'top',
      timeout: 3000,
      icon: 'warning'
    });
    return;
  }

  dashboardStore.setFiltros(
    localPeriodoInicial.value.mes,
    localPeriodoInicial.value.ano,
    localPeriodoFinal.value.mes,
    localPeriodoFinal.value.ano
  );

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

  localPeriodoInicial.value = { mes: mesAtual, ano: anoAtual };
  localPeriodoFinal.value = { mes: mesAtual, ano: anoAtual };

  aplicarFiltroManual();
};

const aplicarUltimosTresMeses = () => {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  localPeriodoFinal.value = { mes: mesAtual, ano: anoAtual };

  let mesIni = mesAtual - 2;
  let anoIni = anoAtual;

  if (mesIni <= 0) {
    mesIni += 12;
    anoIni -= 1;
  }

  localPeriodoInicial.value = { mes: mesIni, ano: anoIni };

  aplicarFiltroManual();
};

const aplicarEsteAno = () => {
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();

  localPeriodoInicial.value = { mes: 1, ano: anoAtual };
  localPeriodoFinal.value = { mes: dataAtual.getMonth() + 1, ano: anoAtual };

  aplicarFiltroManual();
};

onMounted(() => {
  aplicarFiltroManual();
});
</script>

<style scoped>
/* Section wrapper */
.filter-section {
  border-radius: 12px;
  overflow: hidden;
}

.filter-section--light {
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.filter-section--dark {
  background: #1d1d1d;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Main row: left inputs + right shortcuts */
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* Left: title + inputs inline */
.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

/* Group of period selectors + button */
.filter-inputs-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* Individual period block (label + selects) */
.filter-period-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.period-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding-left: 2px;
  opacity: 0.8;
}

.period-selects {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Individual select fields */
.period-select {
  width: 130px;
}

.period-select--ano {
  width: 90px;
}

/* Arrow separator between periods */
.period-separator {
  display: flex;
  align-items: flex-end;
  padding-bottom: 6px;
  opacity: 0.5;
}

/* Filter button */
.filter-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-top: 14px;
  transition: all 0.2s ease;
}

.filter-btn--error {
  background-color: var(--q-negative) !important;
}

.filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.35);
}

/* Right shortcuts */
.filter-shortcuts {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.shortcut-btn {
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  transition: all 0.18s ease;
  opacity: 0.75;
}

.shortcut-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}
</style>
