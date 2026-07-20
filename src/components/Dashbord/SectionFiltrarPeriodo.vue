<template>
  <section
    class="q-mb-md filter-section"
    :class="$q.dark.isActive ? 'filter-section--dark' : 'filter-section--light'"
    aria-labelledby="dashboard-period-title"
  >
    <div class="filter-inner">
      <div class="filter-header">
        <div class="filter-period">
          <div id="dashboard-period-title" class="filter-eyebrow">
            <q-icon name="calendar_month" size="18px" />
            <span>Período do dashboard</span>
          </div>
          <div class="filter-summary" aria-live="polite">{{ periodoAplicadoFormatado }}</div>
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
                  class="period-select period-select--mes"
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
                  class="period-select period-select--mes"
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
import InputSelectAno from 'src/components/Inputs/InputSelectAno.vue';
import InputSelectMes from 'src/components/Inputs/InputSelectMes.vue';
import { useDashboardPeriodFilter } from 'src/composables/useDashboardPeriodFilter';

const {
  $q,
  inputStyled,
  isEditorOpen,
  prefersReducedMotion,
  localPeriodoInicial,
  localPeriodoFinal,
  presets,
  hasValidationError,
  validationErrorMessage,
  activePreset,
  periodoAplicadoFormatado,
  alternarEditor,
  cancelarEdicao,
  aplicarPreset,
  aplicarFiltroManual,
} = useDashboardPeriodFilter();
</script>

<style scoped src="./SectionFiltrarPeriodo.styles.css"></style>
