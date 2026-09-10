<template>
  <q-card flat bordered class="compra-card">
    <q-btn
      v-if="podeEditar"
      class="compra-card__delete-btn"
      flat
      round
      dense
      icon="delete_outline"
      color="negative"
      aria-label="Excluir compra planejada"
      @click.stop="emit('excluir', compra)"
    >
      <q-tooltip>Excluir compra planejada</q-tooltip>
    </q-btn>

    <q-card-section class="compra-card__body">
      <div class="compra-card__header">
        <q-avatar
          size="42px"
          :color="prioridadeConfig.color"
          :text-color="prioridadeConfig.textColor"
          class="compra-card__priority-mark"
        >
          <q-icon :name="prioridadeConfig.icon" size="22px" />
        </q-avatar>
        <div class="compra-card__heading">
          <div class="text-subtitle1 text-bold ellipsis" :title="compra.nome">
            {{ compra.nome }}
          </div>
          <div class="text-caption text-grey-6">
            Planejada em {{ formatarData(compra.dataCriacao) }}
          </div>
        </div>
      </div>

      <q-badge
        :color="prioridadeConfig.color"
        :text-color="prioridadeConfig.textColor"
        rounded
        class="compra-card__priority-badge"
      >
        {{ prioridadeConfig.label }}
      </q-badge>

      <template v-if="comprado">
        <div class="compra-card__value-row">
          <span class="text-caption text-grey-6">Estimativa original</span>
          <strong class="compra-card__value">R$ {{ formatarValor(compra.valorEstimado) }}</strong>
        </div>
        <div class="compra-card__value-row compra-card__value-row--real">
          <span class="text-caption text-grey-6">Valor pago</span>
          <strong class="compra-card__value">R$ {{ formatarValor(compra.valorReal ?? 0) }}</strong>
        </div>
        <div v-if="compra.dataCompra" class="text-caption text-grey-6 q-mt-sm">
          Comprada em {{ formatarData(compra.dataCompra) }}
        </div>
        <q-badge
          v-if="compra.despesaId"
          color="teal-1"
          text-color="teal-9"
          class="q-mt-sm self-start"
        >
          Despesa registrada no Mês a Mês
        </q-badge>
      </template>
      <div v-else class="compra-card__estimate">
        <span class="text-caption text-grey-7">Estimativa</span>
        <strong class="compra-card__value">R$ {{ formatarValor(compra.valorEstimado) }}</strong>
      </div>

      <p v-if="compra.descricao" class="compra-card__description text-body2">
        {{ compra.descricao }}
      </p>

      <div v-if="compra.linksLojas.length > 0" class="compra-card__links">
        <span class="text-caption text-grey-6">Onde encontrar</span>
        <div class="row q-gutter-xs q-mt-xs">
          <q-btn
            v-for="link in compra.linksLojas"
            :key="link.url"
            :href="link.url"
            :label="link.nomeLoja"
            :aria-label="`Abrir oferta na ${link.nomeLoja}`"
            target="_blank"
            rel="noopener noreferrer"
            flat
            dense
            no-caps
            color="primary"
            icon="open_in_new"
            class="compra-card__link"
          />
        </div>
      </div>
    </q-card-section>

    <q-separator v-if="podeEditar" />
    <q-card-actions v-if="podeEditar" align="between" class="compra-card__actions">
      <q-btn
        v-if="!comprado && podeEditar"
        flat
        no-caps
        color="teal"
        icon="task_alt"
        label="Concluir compra"
        aria-label="Marcar compra como comprada"
        @click="emit('comprar', compra)"
      />
      <q-btn
        v-if="!comprado && podeEditar"
        flat
        no-caps
        color="primary"
        icon="edit"
        label="Editar"
        aria-label="Editar compra planejada"
        @click="emit('editar', compra)"
      />
      <q-btn
        v-else
        flat
        no-caps
        color="primary"
        icon="undo"
        label="Reverter"
        aria-label="Reverter compra"
        @click="emit('reverter', compra)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CompraPlanejadaResult } from 'src/Model/CompraPlanejada';
import { formatarData, formatarValor } from 'src/helpers/FormatUtils';

const props = withDefaults(
  defineProps<{
    compra: CompraPlanejadaResult;
    comprado?: boolean;
    podeEditar?: boolean;
  }>(),
  {
    comprado: false,
    podeEditar: true,
  },
);
const emit = defineEmits<{
  (event: 'editar', compra: CompraPlanejadaResult): void;
  (event: 'excluir', compra: CompraPlanejadaResult): void;
  (event: 'comprar', compra: CompraPlanejadaResult): void;
  (event: 'reverter', compra: CompraPlanejadaResult): void;
}>();

const comprado = computed(() => props.comprado);
const podeEditar = computed(() => props.podeEditar);

const prioridadeConfig = computed(() => {
  const configs = {
    Alta: {
      label: 'Alta',
      icon: 'priority_high',
      color: 'red-1',
      textColor: 'red-9',
    },
    Media: {
      label: 'Média',
      icon: 'remove',
      color: 'amber-2',
      textColor: 'brown-9',
    },
    Baixa: {
      label: 'Baixa',
      icon: 'south',
      color: 'blue-1',
      textColor: 'blue-9',
    },
  } as const;

  return configs[props.compra.prioridade] ?? configs.Media;
});
</script>

<style lang="scss" scoped>
.compra-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-right: 32px;
  }

  &__priority-mark {
    flex: 0 0 42px;
  }

  &__heading {
    min-width: 0;
    flex: 1;
  }

  &__priority-badge {
    align-self: flex-start;
    margin-top: 12px;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 700;
  }

  &__value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid rgba(100, 100, 100, 0.12);
  }

  &__estimate {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 20px;
    padding: 14px 16px;
    border-radius: 12px;
    background: rgba(29, 22, 156, 0.06);
  }

  &__value {
    flex: 0 0 auto;
    color: var(--q-primary);
    font-size: 1.35rem;
    line-height: 1.2;
    white-space: nowrap;
  }

  &__description {
    margin: 16px 0 0;
    color: var(--text-primary);
    line-height: 1.55;
  }

  &__links {
    margin-top: auto;
    padding-top: 18px;
  }

  &__link {
    min-height: 32px;
    padding: 0 8px;
    background: rgba(29, 22, 156, 0.06);
  }

  &__actions {
    gap: 8px;
    padding: 8px 12px;

    .q-btn {
      min-height: 40px;
    }
  }

  &__delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.2s ease;

    &:focus-visible {
      opacity: 1;
    }
  }

  &:hover &__delete-btn {
    opacity: 1;
  }
}

.body--dark .compra-card {
  &__estimate {
    background: rgba(255, 255, 255, 0.08);
  }

  &__value-row {
    border-top-color: rgba(255, 255, 255, 0.12);
  }

  &__link {
    background: rgba(255, 255, 255, 0.08);
  }
}

@media (max-width: 600px) {
  .compra-card__delete-btn {
    opacity: 1;
  }
}
</style>
