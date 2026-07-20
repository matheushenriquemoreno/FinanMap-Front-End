<template>
  <q-card
    bordered
    class="dashboard-card balance-card"
    :class="$q.dark.isActive ? 'bg-dark dashboard-card--dark' : 'bg-white dashboard-card--light'"
  >
    <q-card-section class="q-pb-none">
      <div class="row items-center justify-between">
        <div>
          <div
            class="text-caption text-weight-medium q-mb-xs"
            :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'"
          >
            SALDO DO PERÍODO
          </div>
          <div
            class="text-h5 text-weight-bold"
            :class="saldoPositivo ? 'text-positive' : 'text-negative'"
          >
            <q-skeleton v-if="loading" type="text" width="140px" />
            <span v-else>{{ formatarValor(saldo) }}</span>
          </div>
          <div
            class="text-caption q-mt-xs"
            :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-6'"
          >
            <span v-if="!loading">
              <q-icon :name="saldoPositivo ? 'trending_up' : 'trending_down'" size="14px" />
              {{ saldoPositivo ? 'Superávit' : 'Déficit' }} financeiro
            </span>
          </div>
        </div>
        <div
          class="balance-icon-wrapper"
          :class="
            saldoPositivo ? 'balance-icon-wrapper--positive' : 'balance-icon-wrapper--negative'
          "
        >
          <q-icon
            :name="saldoPositivo ? 'savings' : 'money_off'"
            size="28px"
            :color="saldoPositivo ? 'positive' : 'negative'"
          />
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-md dashboard-card__body">
      <div v-if="loading" class="dashboard-card__state dashboard-card__state--180">
        <q-spinner color="primary" size="2em" />
      </div>
      <div v-else class="balance-bars-wrapper q-py-sm">
        <!-- Rendimentos Bar -->
        <div class="balance-row q-mb-md">
          <div class="row justify-between q-mb-xs">
            <span class="text-caption text-weight-bold text-positive">Rendimentos</span>
            <span
              class="text-caption text-weight-bold"
              :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
              >{{ formatarValor(rendimento) }}</span
            >
          </div>
          <div
            class="balance-track"
            :class="$q.dark.isActive ? 'balance-track--dark' : 'balance-track--light'"
          >
            <div
              class="balance-fill bg-positive"
              :style="{ width: percentualRendimentoVisual + '%' }"
            ></div>
          </div>
        </div>

        <!-- Despesas Bar -->
        <div class="balance-row q-mb-md">
          <div class="row justify-between q-mb-xs">
            <span class="text-caption text-weight-bold text-negative">Despesas</span>
            <span
              class="text-caption text-weight-bold"
              :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
              >{{ formatarValor(despesa) }}</span
            >
          </div>
          <div
            class="balance-track"
            :class="$q.dark.isActive ? 'balance-track--dark' : 'balance-track--light'"
          >
            <div
              class="balance-fill bg-negative"
              :style="{ width: percentualDespesaVisual + '%' }"
            ></div>
          </div>
        </div>

        <!-- Resumo info -->
        <div class="balance-summary text-center q-mt-lg q-pt-md">
          <q-chip
            v-if="rendimento > 0"
            outline
            dense
            size="md"
            :color="saldoPositivo ? 'positive' : 'negative'"
            class="text-weight-bold"
          >
            Você gastou {{ percentualGasto }}% do seu rendimento
          </q-chip>
          <q-chip
            v-else-if="despesa > 0"
            outline
            dense
            size="md"
            color="negative"
            class="text-weight-bold"
          >
            Gastos sem rendimento no período
          </q-chip>
          <div
            v-else
            class="text-caption"
            :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-5'"
          >
            Nenhuma movimentação no período
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useDashboardStore } from 'src/stores/dashboardStore';

const $q = useQuasar();
const store = useDashboardStore();
const loading = computed(() => store.isLoading);

const rendimento = computed(() => store.resumo?.rendimento.total ?? 0);
const despesa = computed(() => store.resumo?.despesa.total ?? 0);

const saldo = computed(() => rendimento.value - despesa.value);
const saldoPositivo = computed(() => saldo.value >= 0);

const percentualGasto = computed(() => {
  if (rendimento.value === 0) return 0;
  const pct = Math.round((despesa.value / rendimento.value) * 100);
  return pct;
});

const percentualRendimentoVisual = computed(() => {
  const max = Math.max(rendimento.value, despesa.value);
  if (max === 0) return 0;
  return (rendimento.value / max) * 100;
});

const percentualDespesaVisual = computed(() => {
  const max = Math.max(rendimento.value, despesa.value);
  if (max === 0) return 0;
  return (despesa.value / max) * 100;
});

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
}
</script>

<style scoped>
.balance-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.balance-card:hover {
  transform: translateY(-2px);
}

.balance-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.balance-icon-wrapper--positive {
  background: var(--semantic-positive-soft-subtle);
}

.balance-icon-wrapper--negative {
  background: var(--semantic-negative-soft-subtle);
}

.balance-summary {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.dashboard-card--dark .balance-summary {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.balance-bars-wrapper {
  width: 100%;
}

.balance-row {
  width: 100%;
}

.balance-track {
  width: 100%;
  height: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.balance-track--light {
  background-color: #f0f0f0;
}

.balance-track--dark {
  background-color: #2a2a2a;
}

.balance-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.8s ease-in-out;
}
</style>
