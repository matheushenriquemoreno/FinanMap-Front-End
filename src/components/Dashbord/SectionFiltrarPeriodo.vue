<template>
  <section
    class="q-mb-md filter-section"
    :class="$q.dark.isActive ? 'filter-section--dark' : 'filter-section--light'"
  >
    <div class="filter-inner">
      <div class="filter-header">
        <div>
          <div class="filter-eyebrow">
            <q-icon name="calendar_month" size="18px" />
            <span>Período do dashboard</span>
          </div>
          <div class="filter-summary">{{ periodoAplicadoFormatado }}</div>
        </div>

        <q-btn
          flat
          no-caps
          :icon="isEditorOpen ? 'close' : 'edit_calendar'"
          :label="isEditorOpen ? 'Fechar' : 'Personalizar período'"
          class="customize-btn"
          @click="alternarEditor"
        />
      </div>

      <div class="preset-group" aria-label="Atalhos de período">
        <q-btn
          v-for="preset in presets"
          :key="preset.id"
          unelevated
          no-caps
          :icon="activePreset === preset.id ? 'check' : preset.icon"
          :label="preset.label"
          class="preset-btn"
          :class="{ 'preset-btn--active': activePreset === preset.id }"
          :aria-pressed="activePreset === preset.id"
          @click="aplicarPreset(preset.id)"
        />
      </div>

      <q-slide-transition>
        <div v-show="isEditorOpen" class="manual-editor">
          <div class="period-fields">
            <div class="period-field-group">
              <span class="period-label">De</span>
              <div class="period-selects">
                <InputSelectMes
                  v-model:model-value="localPeriodoInicial.mes"
                  label="Mês"
                  :styled="inputStyled"
                  class="period-select"
                />
                <InputSelectAno
                  v-model:model-value="localPeriodoInicial.ano"
                  label="Ano"
                  :styled="inputStyled"
                  class="period-select period-select--ano"
                />
              </div>
            </div>

            <q-icon name="arrow_forward" size="20px" class="period-separator" />

            <div class="period-field-group">
              <span class="period-label">Até</span>
              <div class="period-selects">
                <InputSelectMes
                  v-model:model-value="localPeriodoFinal.mes"
                  label="Mês"
                  :styled="inputStyled"
                  class="period-select"
                />
                <InputSelectAno
                  v-model:model-value="localPeriodoFinal.ano"
                  label="Ano"
                  :styled="inputStyled"
                  class="period-select period-select--ano"
                />
              </div>
            </div>
          </div>

          <div class="editor-actions">
            <q-btn flat no-caps label="Cancelar" class="cancel-btn" @click="cancelarEdicao" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              icon="check"
              label="Aplicar período"
              :disable="hasValidationError"
              @click="aplicarFiltroManual"
            />
          </div>

          <div v-if="hasValidationError" class="validation-message" role="alert">
            <q-icon name="error_outline" size="18px" />
            {{ validationErrorMessage }}
          </div>
        </div>
      </q-slide-transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
import InputSelectAno from 'src/components/Inputs/InputSelectAno.vue';
import InputSelectMes from 'src/components/Inputs/InputSelectMes.vue';
import { useQuasar } from 'quasar';

type Periodo = { mes: number; ano: number };
type PresetId = 'mes-atual' | 'ultimos-tres-meses' | 'este-ano';

const $q = useQuasar();
const dashboardStore = useDashboardStore();

const inputStyled = { dense: true, filled: false, rounded: false, borderless: false };
const isEditorOpen = ref(false);

const localPeriodoInicial = ref<Periodo>({
  mes: dashboardStore.mesInicial,
  ano: dashboardStore.anoInicial,
});
const localPeriodoFinal = ref<Periodo>({
  mes: dashboardStore.mesFinal,
  ano: dashboardStore.anoFinal,
});

const presets: Array<{ id: PresetId; label: string; icon: string }> = [
  { id: 'mes-atual', label: 'Mês atual', icon: 'today' },
  { id: 'ultimos-tres-meses', label: 'Últimos 3 meses', icon: 'date_range' },
  { id: 'este-ano', label: 'Este ano', icon: 'calendar_today' },
];

const periodoAplicadoInicial = computed<Periodo>(() => ({
  mes: dashboardStore.mesInicial,
  ano: dashboardStore.anoInicial,
}));

const periodoAplicadoFinal = computed<Periodo>(() => ({
  mes: dashboardStore.mesFinal,
  ano: dashboardStore.anoFinal,
}));

const hasValidationError = computed(() => {
  const pIni = localPeriodoInicial.value.ano * 100 + localPeriodoInicial.value.mes;
  const pFim = localPeriodoFinal.value.ano * 100 + localPeriodoFinal.value.mes;
  return pIni > pFim;
});

const validationErrorMessage = computed(() =>
  hasValidationError.value ? 'O período inicial não pode ser posterior ao período final.' : ''
);

const activePreset = computed<PresetId | null>(() => {
  const inicio = periodoAplicadoInicial.value;
  const fim = periodoAplicadoFinal.value;

  for (const preset of presets) {
    const periodoPreset = obterPeriodoPreset(preset.id);
    if (periodosIguais(inicio, periodoPreset.inicio) && periodosIguais(fim, periodoPreset.fim)) {
      return preset.id;
    }
  }

  return null;
});

const periodoAplicadoFormatado = computed(() => {
  const inicio = periodoAplicadoInicial.value;
  const fim = periodoAplicadoFinal.value;
  const inicioFormatado = formatarMesAno(inicio);

  if (periodosIguais(inicio, fim)) {
    return capitalizar(inicioFormatado);
  }

  if (inicio.ano === fim.ano) {
    const mesInicial = formatarMes(inicio);
    return `${capitalizar(mesInicial)} a ${capitalizar(formatarMesAno(fim))}`;
  }

  return `${capitalizar(inicioFormatado)} a ${capitalizar(formatarMesAno(fim))}`;
});

watch(
  () => [
    dashboardStore.mesInicial,
    dashboardStore.anoInicial,
    dashboardStore.mesFinal,
    dashboardStore.anoFinal,
  ],
  () => restaurarRascunho()
);

function periodosIguais(periodoA: Periodo, periodoB: Periodo) {
  return periodoA.mes === periodoB.mes && periodoA.ano === periodoB.ano;
}

function dataDoPeriodo(periodo: Periodo) {
  return new Date(periodo.ano, periodo.mes - 1, 1);
}

function formatarMes(periodo: Periodo) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataDoPeriodo(periodo));
}

function formatarMesAno(periodo: Periodo) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    dataDoPeriodo(periodo)
  );
}

function capitalizar(valor: string) {
  return valor.charAt(0).toLocaleUpperCase('pt-BR') + valor.slice(1);
}

function obterPeriodoPreset(preset: PresetId): { inicio: Periodo; fim: Periodo } {
  const atual = new Date();
  const fim = { mes: atual.getMonth() + 1, ano: atual.getFullYear() };

  if (preset === 'mes-atual') {
    return { inicio: { ...fim }, fim };
  }

  if (preset === 'este-ano') {
    return { inicio: { mes: 1, ano: atual.getFullYear() }, fim };
  }

  const inicio = new Date(atual.getFullYear(), atual.getMonth() - 2, 1);
  return {
    inicio: { mes: inicio.getMonth() + 1, ano: inicio.getFullYear() },
    fim,
  };
}

function restaurarRascunho() {
  localPeriodoInicial.value = { ...periodoAplicadoInicial.value };
  localPeriodoFinal.value = { ...periodoAplicadoFinal.value };
}

function alternarEditor() {
  if (isEditorOpen.value) {
    cancelarEdicao();
    return;
  }

  restaurarRascunho();
  isEditorOpen.value = true;
}

function cancelarEdicao() {
  restaurarRascunho();
  isEditorOpen.value = false;
}

function aplicarPeriodo(inicio: Periodo, fim: Periodo) {
  dashboardStore.setFiltros(inicio.mes, inicio.ano, fim.mes, fim.ano);
}

function aplicarPreset(preset: PresetId) {
  const periodo = obterPeriodoPreset(preset);
  aplicarPeriodo(periodo.inicio, periodo.fim);
}

function aplicarFiltroManual() {
  if (hasValidationError.value) return;

  aplicarPeriodo(localPeriodoInicial.value, localPeriodoFinal.value);
  isEditorOpen.value = false;
}
</script>

<style scoped>
.filter-section {
  border-radius: 16px;
  overflow: hidden;
}

.filter-section--light {
  background: #ffffff;
  border: 1px solid rgba(45, 55, 72, 0.1);
  box-shadow: 0 8px 24px rgba(45, 55, 72, 0.06);
}

.filter-section--dark {
  background: #1d1e22;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.filter-inner {
  padding: 18px 20px;
}

.filter-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.filter-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #77808f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.filter-section--dark .filter-eyebrow {
  color: #a7afbd;
}

.filter-summary {
  margin-top: 3px;
  color: #263248;
  font-size: clamp(20px, 2.2vw, 28px);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.filter-section--dark .filter-summary {
  color: #f1f3f7;
}

.customize-btn {
  color: var(--q-primary);
  border-radius: 9px;
  font-weight: 600;
}

.preset-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.preset-btn {
  min-height: 38px;
  padding: 0 14px;
  color: #5e6878;
  background: rgba(96, 107, 125, 0.08);
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.filter-section--dark .preset-btn {
  color: #c2c8d2;
  background: rgba(255, 255, 255, 0.06);
}

.preset-btn--active {
  color: var(--q-primary);
  background: rgba(63, 81, 181, 0.1);
  border-color: rgba(63, 81, 181, 0.28);
}

.filter-section--dark .preset-btn--active {
  color: #aeb9ff;
  background: rgba(120, 136, 255, 0.13);
  border-color: rgba(151, 163, 255, 0.34);
}

.manual-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px 20px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(96, 107, 125, 0.15);
}

.filter-section--dark .manual-editor {
  border-top-color: rgba(255, 255, 255, 0.09);
}

.period-fields,
.period-selects,
.editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.period-fields {
  gap: 12px;
  flex-wrap: wrap;
}

.period-field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.period-label {
  color: #6d7685;
  font-size: 12px;
  font-weight: 700;
}

.filter-section--dark .period-label {
  color: #adb4c0;
}

.period-select {
  width: 140px;
}

.period-select--ano {
  width: 96px;
}

.period-separator {
  margin-top: 20px;
  color: #8b94a3;
}

.editor-actions {
  align-self: end;
  justify-self: end;
}

.cancel-btn {
  color: #657083;
}

.validation-message {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--q-negative);
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 700px) {
  .filter-header {
    align-items: stretch;
    flex-direction: column;
  }

  .customize-btn {
    align-self: flex-start;
  }

  .manual-editor {
    grid-template-columns: 1fr;
  }

  .period-separator {
    display: none;
  }

  .editor-actions {
    justify-self: stretch;
  }
}
</style>
