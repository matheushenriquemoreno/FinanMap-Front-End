<template>
  <div>
    <q-card-section class="q-pa-xs">
      <!-- Campo de seleção de meses -->
      <div class="row items-center justify-center">
        <div class="row items-center">
          <q-btn
            flat
            round
            dense
            icon="chevron_left"
            aria-label="Ir para o mês anterior"
            @click="voltarMesAnterior"
          />

          <q-btn
            flat
            no-caps
            class="text-body1 q-px-md"
            :aria-expanded="showSelector"
            aria-controls="period-selector-dialog"
            aria-haspopup="dialog"
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

          <q-btn
            flat
            round
            dense
            icon="chevron_right"
            aria-label="Ir para o próximo mês"
            @click="passarParaProximoMes"
          />
        </div>
      </div>

      <!-- Dialog de seleção de meses e anos - Modernizado -->
      <q-dialog v-model="showSelector">
        <q-card id="period-selector-dialog" class="period-selector-card">
          <!-- Header com título e botão de data atual -->
          <q-card-section class="q-pb-sm">
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-regular">Selecionar Período</div>
              <q-btn
                flat
                round
                icon="event_available"
                aria-label="Voltar para o período atual"
                @click="selecionarDataAtual"
                class="text-primary"
                size="16px"
              >
                <q-tooltip class="bg-grey-7" style="font-size: 14px"
                  >Voltar para data atual</q-tooltip
                >
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
                  aria-label="Exibir anos anteriores"
                  @click="voltarAnoAnterior"
                  class="year-nav-btn"
                />

                <div class="years-container" role="group" aria-label="Selecione o ano">
                  <q-btn
                    v-for="year in visibleYears"
                    :key="year"
                    flat
                    round
                    dense
                    no-caps
                    :label="String(year)"
                    :class="['year-item', { 'year-selected': selectedYear === year }]"
                    :aria-pressed="selectedYear === year"
                    @click="selectedYear = year"
                  />
                </div>

                <q-btn
                  flat
                  round
                  dense
                  icon="chevron_right"
                  aria-label="Exibir anos seguintes"
                  @click="passarParaProximoAno"
                  class="year-nav-btn"
                />
              </div>
            </div>

            <!-- Seletor de Mês -->
            <div>
              <div class="text-subtitle2 q-mb-md">Mês</div>
              <div class="months-grid" role="group" aria-label="Selecione o mês">
                <q-btn
                  v-for="month in months"
                  :key="month.mes"
                  flat
                  round
                  dense
                  no-caps
                  :label="month.name.substring(0, 3)"
                  :class="['month-item', { 'month-selected': selectedMonth === month.mes }]"
                  :aria-label="month.name"
                  :aria-pressed="selectedMonth === month.mes"
                  @click="selectedMonth = month.mes"
                />
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
import { useMonthYearSelector, type MonthYearPeriod } from 'src/composables/useMonthYearSelector';

interface Props {
  mes?: number;
  ano?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), { loading: false });
const emit = defineEmits<{ (event: 'update:period', periodo: MonthYearPeriod): void }>();

const {
  selectedMonth,
  selectedYear,
  showSelector,
  visibleYears,
  months,
  mesAtualNome,
  mesAnoSelecionadoEhAtual,
  voltarMesAnterior,
  passarParaProximoMes,
  voltarAnoAnterior,
  passarParaProximoAno,
  selecionarDataAtual,
  aplicarSelecao,
} = useMonthYearSelector(props, (periodo) => emit('update:period', periodo));
</script>

<style scoped src="./MothYearSelector.styles.css"></style>
