<template>
  <section
    class="q-mb-md filter-section"
    :class="$q.dark.isActive ? 'filter-section--dark' : 'filter-section--light'"
    aria-labelledby="dashboard-period-title"
  >
    <div class="filter-inner">
      <div class="filter-header">
        <div>
          <div id="dashboard-period-title" class="filter-eyebrow">
            <q-icon name="calendar_month" size="18px" />
            <span>Período do dashboard</span>
          </div>
          <div class="filter-summary" aria-live="polite">{{ periodoAplicadoFormatado }}</div>
        </div>

        <q-btn
          flat
          no-caps
          :icon="isEditorOpen ? 'close' : 'edit_calendar'"
          :label="isEditorOpen ? 'Fechar' : 'Personalizar período'"
          class="customize-btn"
          :aria-expanded="isEditorOpen"
          aria-controls="dashboard-period-editor"
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

      <q-slide-transition :duration="prefersReducedMotion ? 0 : 300">
        <div
          id="dashboard-period-editor"
          v-show="isEditorOpen"
          class="manual-editor"
          v-bind="hasValidationError ? { 'aria-describedby': 'dashboard-period-error' } : {}"
        >
          <div class="period-fields">
            <div class="period-field-group">
              <span class="period-label">De</span>
              <div class="period-selects">
                <InputSelectMes
                  v-model:model-value="localPeriodoInicial.mes"
                  label="Mês"
                  aria-label="Mês inicial"
                  :styled="inputStyled"
                  class="period-select"
                />
                <InputSelectAno
                  v-model:model-value="localPeriodoInicial.ano"
                  label="Ano"
                  aria-label="Ano inicial"
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
                  aria-label="Mês final"
                  :styled="inputStyled"
                  class="period-select"
                />
                <InputSelectAno
                  v-model:model-value="localPeriodoFinal.ano"
                  label="Ano"
                  aria-label="Ano final"
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

          <div
            v-if="hasValidationError"
            id="dashboard-period-error"
            class="validation-message"
            role="status"
            aria-live="polite"
          >
            <q-icon name="error_outline" size="18px" />
            {{ validationErrorMessage }}
          </div>
        </div>
      </q-slide-transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
const prefersReducedMotion = ref(false);
let reducedMotionMediaQuery: MediaQueryList | undefined;

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

onMounted(() => {
  reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion.value = reducedMotionMediaQuery.matches;
  reducedMotionMediaQuery.addEventListener('change', atualizarPreferenciaDeMovimento);
});

onBeforeUnmount(() => {
  reducedMotionMediaQuery?.removeEventListener('change', atualizarPreferenciaDeMovimento);
});

function atualizarPreferenciaDeMovimento(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;
}

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
  min-height: 44px;
  color: var(--q-primary);
  border-radius: 9px;
  font-weight: 600;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.preset-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.preset-btn {
  min-height: 44px;
  padding: 0 14px;
  color: #5e6878;
  background: rgba(96, 107, 125, 0.08);
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
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
  min-width: 0;
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

.editor-actions :deep(.q-btn) {
  min-height: 44px;
}

.cancel-btn {
  color: #657083;
}

.filter-section--dark .cancel-btn {
  color: #c1c7d0;
}

.customize-btn:focus-visible,
.preset-btn:focus-visible,
.editor-actions :deep(.q-btn:focus-visible),
.period-select :deep(.q-field__native:focus-visible) {
  outline: 3px solid rgba(63, 81, 181, 0.42);
  outline-offset: 3px;
}

.filter-section--dark .customize-btn:focus-visible,
.filter-section--dark .preset-btn:focus-visible,
.filter-section--dark .editor-actions :deep(.q-btn:focus-visible),
.filter-section--dark .period-select :deep(.q-field__native:focus-visible) {
  outline-color: rgba(174, 185, 255, 0.72);
}

.customize-btn:hover,
.preset-btn:hover {
  background-color: rgba(63, 81, 181, 0.12);
}

.preset-btn:active {
  background-color: rgba(63, 81, 181, 0.18);
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
  .filter-inner {
    padding: 16px;
  }

  .filter-header {
    align-items: stretch;
    flex-direction: column;
  }

  .customize-btn {
    align-self: stretch;
  }

  .manual-editor {
    grid-template-columns: 1fr;
  }

  .period-fields,
  .period-field-group,
  .period-selects {
    width: 100%;
  }

  .period-field-group {
    min-width: 0;
  }

  .period-select {
    flex: 1 1 0;
    width: auto;
  }

  .period-select--ano {
    flex: 0 1 110px;
    width: auto;
  }

  .period-separator {
    display: none;
  }

  .editor-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-self: stretch;
  }
}

@media (max-width: 380px) {
  .filter-inner {
    padding: 14px 12px;
  }

  .preset-group,
  .editor-actions,
  .period-selects {
    display: grid;
    grid-template-columns: 1fr;
  }

  .preset-btn,
  .period-select,
  .period-select--ano {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .customize-btn,
  .preset-btn {
    transition-duration: 0.01ms;
  }
}
</style>
