<template>
  <div class="resumo-grid">
    <template v-if="loading">
      <q-card v-for="i in 3" :key="`skel-${i}`" flat bordered class="resumo-card">
        <q-card-section horizontal class="items-center q-pa-md">
          <q-skeleton type="QAvatar" size="48px" />
          <div class="q-ml-md" style="flex: 1">
            <q-skeleton type="text" width="58%" />
            <q-skeleton type="text" width="72%" class="q-mt-xs" />
          </div>
        </q-card-section>
      </q-card>
    </template>

    <template v-else>
      <q-card flat bordered class="resumo-card">
        <q-card-section horizontal class="items-center q-pa-md">
          <q-avatar size="48px" color="blue-1" text-color="blue" icon="schedule" />
          <div class="q-ml-md">
            <div class="text-caption text-grey-6">Total pendente</div>
            <div v-if="erroPendentes" class="text-body1 text-bold text-grey-6">Indisponível</div>
            <template v-else>
              <div class="text-h6 text-bold">R$ {{ formatarValor(totalPendentes) }}</div>
              <div class="text-caption text-grey-5">
                {{ quantidadePendentes }} {{ quantidadePendentes === 1 ? 'item' : 'itens' }}
              </div>
            </template>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumo-card">
        <q-card-section horizontal class="items-center q-pa-md">
          <q-avatar size="48px" color="amber-1" text-color="amber-9" icon="task_alt" />
          <div class="q-ml-md">
            <div class="text-caption text-grey-6">Estimado nas compradas</div>
            <div v-if="erroCompradas" class="text-body1 text-bold text-grey-6">Indisponível</div>
            <template v-else>
              <div class="text-h6 text-bold">R$ {{ formatarValor(totalEstimadoCompradas) }}</div>
              <div class="text-caption text-grey-5">
                {{ quantidadeCompradas }} {{ quantidadeCompradas === 1 ? 'item' : 'itens' }}
              </div>
            </template>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumo-card">
        <q-card-section horizontal class="items-center q-pa-md">
          <q-avatar size="48px" color="green-1" text-color="green" icon="payments" />
          <div class="q-ml-md">
            <div class="text-caption text-grey-6">Total realizado</div>
            <div v-if="erroCompradas" class="text-body1 text-bold text-grey-6">Indisponível</div>
            <template v-else>
              <div class="text-h6 text-bold">R$ {{ formatarValor(totalRealCompradas) }}</div>
              <div class="text-caption text-grey-5">Compras concluídas</div>
            </template>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatarValor } from 'src/helpers/FormatUtils';

withDefaults(
  defineProps<{
    totalPendentes: number;
    quantidadePendentes: number;
    totalEstimadoCompradas: number;
    quantidadeCompradas: number;
    totalRealCompradas: number;
    loading?: boolean;
    erroPendentes?: boolean;
    erroCompradas?: boolean;
  }>(),
  {
    loading: false,
    erroPendentes: false,
    erroCompradas: false,
  },
);
</script>

<style lang="scss" scoped>
.resumo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.resumo-card {
  border-radius: 12px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}
</style>
