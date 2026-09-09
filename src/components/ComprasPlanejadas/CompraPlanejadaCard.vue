<template>
  <q-card flat bordered class="compra-card" :class="`compra-card--${prioridadeConfig.slug}`">
    <q-card-section class="compra-card__body">
      <div class="compra-card__header">
        <div class="compra-card__priority-mark" aria-hidden="true">
          <q-icon :name="prioridadeConfig.icon" size="22px" />
        </div>
        <div class="compra-card__heading">
          <div class="text-subtitle1 text-bold ellipsis" :title="compra.nome">{{ compra.nome }}</div>
          <div class="text-caption text-grey-6">
            Planejada em {{ formatarData(compra.dataCriacao) }}
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
      </div>

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
        <q-badge v-if="compra.despesaId" color="teal-1" text-color="teal-9" class="q-mt-sm self-start">
          Despesa registrada no Mês a Mês
        </q-badge>
      </template>
      <div v-else class="compra-card__value-row">
        <span class="text-caption text-grey-6">Estimativa</span>
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

    <q-separator />
    <q-card-actions align="right" class="compra-card__actions">
      <q-btn
        v-if="!comprado && podeEditar"
        flat
        dense
        no-caps
        color="primary"
        icon="edit"
        label="Editar"
        aria-label="Editar compra planejada"
        @click="emit('editar', compra)"
      />
      <q-btn
        v-if="!comprado && podeEditar"
        flat
        dense
        no-caps
        color="negative"
        icon="delete_outline"
        label="Excluir"
        aria-label="Excluir compra planejada"
        @click="emit('excluir', compra)"
      />
      <q-btn
        v-if="!comprado && podeEditar"
        flat
        dense
        no-caps
        color="teal"
        icon="done"
        label="Marcar como comprado"
        aria-label="Marcar compra como comprada"
        @click="emit('comprar', compra)"
      />
      <template v-else>
        <q-btn
          v-if="podeEditar"
          flat
          dense
          no-caps
          color="primary"
          icon="undo"
          label="Reverter"
          aria-label="Reverter compra"
          @click="emit('reverter', compra)"
        />
        <q-btn
          v-if="podeEditar"
          flat
          dense
          no-caps
          color="negative"
          icon="delete_outline"
          label="Excluir"
          aria-label="Excluir compra comprada"
          @click="emit('excluir', compra)"
        />
      </template>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CompraPlanejadaResult } from 'src/Model/CompraPlanejada';
import { formatarData, formatarValor } from 'src/helpers/FormatUtils';

const props = withDefaults(defineProps<{
  compra: CompraPlanejadaResult;
  comprado?: boolean;
  podeEditar?: boolean;
}>(), {
  comprado: false,
  podeEditar: true,
});
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
      slug: 'alta',
      icon: 'priority_high',
      color: 'red-1',
      textColor: 'red-9',
    },
    Media: {
      label: 'Média',
      slug: 'media',
      icon: 'remove',
      color: 'amber-2',
      textColor: 'brown-9',
    },
    Baixa: {
      label: 'Baixa',
      slug: 'baixa',
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
  height: 100%;
  border-radius: 16px;
  border-top: 3px solid var(--compra-accent);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(17, 24, 39, 0.1);
  }

  &--alta {
    --compra-accent: #c62828;
  }

  &--media {
    --compra-accent: #c17a00;
  }

  &--baixa {
    --compra-accent: #1565c0;
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
  }

  &__priority-mark {
    display: grid;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    place-items: center;
    color: var(--compra-accent);
    background: color-mix(in srgb, var(--compra-accent) 12%, transparent);
    border-radius: 12px;
  }

  &__heading {
    min-width: 0;
    flex: 1;
  }

  &__priority-badge {
    flex: 0 0 auto;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 700;
  }

  &__value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid rgba(100, 100, 100, 0.12);
  }

  &__value {
    color: var(--compra-accent);
    font-size: 1.35rem;
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
    padding: 8px 16px 14px;
  }
}

.body--dark .compra-card {
  &__value-row {
    border-top-color: rgba(255, 255, 255, 0.12);
  }

  &__link {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
