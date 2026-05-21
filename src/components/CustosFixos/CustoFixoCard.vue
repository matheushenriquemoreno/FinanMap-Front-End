<template>
  <q-card flat bordered class="custo-card" :class="{ 'custo-card--inativo': !custo.ativo }">
    <q-btn class="custo-card__delete-btn" flat round dense icon="delete_outline" color="red-4"
      @click.stop="emit('excluir', custo.id)">
      <q-tooltip>Excluir custo fixo</q-tooltip>
    </q-btn>

    <q-card-section>
      <div class="custo-card__header">
        <q-avatar size="42px" class="bg-indigo-1">
          <q-icon name="receipt_long" color="primary" />
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-subtitle1 text-bold">{{ custo.nome }}</div>
          <div class="text-caption text-grey-6" v-if="custo.categoriaNome">
            <q-icon name="label" size="14px" class="q-mr-xs" />
            {{ custo.categoriaNome }}
          </div>
          <div class="text-caption text-grey-5" v-else>
            Sem categoria
          </div>
        </div>
      </div>

      <div class="custo-card__details q-mt-md">
        <div class="row items-center justify-between">
          <div class="text-body2 text-grey-7">
            <q-icon name="calendar_today" size="16px" class="q-mr-xs" />
            Vence dia <strong>{{ custo.diaVencimento }}</strong>
          </div>
          <q-badge :color="custo.ativo ? 'green' : 'grey'" class="q-py-xs q-px-sm text-bold">
            {{ custo.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="center">
      <q-btn flat no-caps icon="edit" label="Editar" color="primary" @click="emit('editar', custo)" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { CustoFixoResult } from 'src/Model/CustoFixo';

defineProps<{ custo: CustoFixoResult }>();
const emit = defineEmits<{
  (e: 'excluir', id: string): void;
  (e: 'editar', custo: CustoFixoResult): void;
}>();
</script>

<style lang="scss" scoped>
.custo-card {
  border-radius: 16px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }

  &--inativo {
    opacity: 0.65;
  }

  &:hover &__delete-btn {
    opacity: 1;
  }

  &__delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 1;

    @media (max-width: 600px) {
      opacity: 1;
    }
  }

  &__header {
    display: flex;
    align-items: center;
  }

  &__details {
    padding: 8px 0;
  }
}

.q-card__section {
  flex-grow: 1;
}
</style>
