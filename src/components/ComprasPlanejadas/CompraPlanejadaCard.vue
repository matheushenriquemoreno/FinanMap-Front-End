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

      <div class="compra-card__value-row">
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
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CompraPlanejadaResult } from 'src/Model/CompraPlanejada';
import { formatarData, formatarValor } from 'src/helpers/FormatUtils';

const props = defineProps<{ compra: CompraPlanejadaResult }>();

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
