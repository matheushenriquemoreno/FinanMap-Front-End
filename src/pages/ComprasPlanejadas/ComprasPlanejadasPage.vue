<template>
  <q-page class="compras-page q-pa-lg">
    <PageHeaderBanner
      icon="shopping_cart"
      title="Compras Planejadas"
      subtitle="Dê forma aos próximos planos sem perder o controle do seu dinheiro"
      button-label="Nova compra"
      gradient="linear-gradient(135deg, #102a43 0%, #1d169c 62%, #0e7490 100%)"
      @action="emit('novo-item')"
    />

    <section class="compras-total" aria-label="Resumo das compras pendentes">
      <div class="compras-total__eyebrow">
        <q-icon name="track_changes" size="18px" />
        <span>Seu próximo movimento</span>
      </div>
      <div class="row items-end justify-between q-col-gutter-md">
        <div>
          <h2 class="compras-total__title">Total estimado</h2>
          <p class="compras-total__hint">{{ compras.length }} {{ compras.length === 1 ? 'item pendente' : 'itens pendentes' }}</p>
        </div>
        <strong class="compras-total__value">R$ {{ formatarValor(totalEstimado) }}</strong>
      </div>
    </section>

    <div v-if="service.loading.value" class="compras-grid" aria-label="Carregando compras planejadas">
      <q-card v-for="i in 3" :key="`skeleton-${i}`" flat bordered class="compra-skeleton">
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <q-skeleton type="QAvatar" size="42px" />
            <div class="col">
              <q-skeleton type="text" width="65%" />
              <q-skeleton type="text" width="42%" />
            </div>
          </div>
          <q-skeleton type="text" width="45%" class="q-mt-xl" />
          <q-skeleton type="text" width="80%" />
        </q-card-section>
      </q-card>
    </div>

    <template v-else-if="erroCarregamento">
      <div class="compras-state text-center q-pa-xl">
        <q-icon name="cloud_off" size="72px" color="grey-5" />
        <h2 class="text-h6 q-mt-md q-mb-sm">Não foi possível carregar seus planos</h2>
        <p class="text-body2 text-grey-6 q-mb-lg">Tente novamente sem perder o que já estava salvo.</p>
        <q-btn color="primary" outline rounded label="Tentar novamente" icon="refresh" @click="carregarDados" />
      </div>
    </template>

    <template v-else-if="compras.length > 0">
      <transition-group name="compras-list" tag="div" class="compras-grid">
        <CompraPlanejadaCard v-for="compra in compras" :key="compra.id" :compra="compra" />
      </transition-group>
    </template>

    <div v-else class="compras-state text-center q-pa-xl">
      <div class="compras-state__illustration" aria-hidden="true">
        <q-icon name="format_list_bulleted" size="56px" />
      </div>
      <h2 class="text-h6 q-mt-lg q-mb-sm">Sua lista começa com um plano</h2>
      <p class="text-body2 text-grey-6 q-mb-lg">
        Registre uma compra futura e acompanhe o valor antes de decidir.
      </p>
      <q-btn color="primary" rounded unelevated label="Adicionar primeira compra" icon="add" @click="emit('novo-item')" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeaderBanner from 'src/components/PageHeaderBanner.vue';
import CompraPlanejadaCard from 'src/components/ComprasPlanejadas/CompraPlanejadaCard.vue';
import getCompraPlanejadaService from 'src/services/CompraPlanejadaService';
import type { CompraPlanejadaResult } from 'src/Model/CompraPlanejada';
import { formatarValor } from 'src/helpers/FormatUtils';

const emit = defineEmits<{
  (event: 'novo-item'): void;
}>();

const service = getCompraPlanejadaService();
const compras = ref<CompraPlanejadaResult[]>([]);
const totalEstimado = ref(0);
const erroCarregamento = ref(false);

async function carregarDados() {
  erroCarregamento.value = false;

  try {
    const resultado = await service.obterPendentes();
    compras.value = resultado.itens;
    totalEstimado.value = resultado.totalEstimado;
  } catch (error) {
    console.error('Erro ao carregar compras planejadas:', error);
    erroCarregamento.value = true;
  }
}

onMounted(carregarDados);

defineExpose({ carregarDados });
</script>

<style lang="scss" scoped>
.compras-page {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.compras-total {
  margin: 0 0 28px;
  padding: 24px 28px;
  color: white;
  background: linear-gradient(120deg, #082f49 0%, #155e75 100%);
  border-radius: 18px;
  box-shadow: 0 14px 28px rgba(8, 47, 73, 0.18);

  &__eyebrow {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__title {
    margin: 18px 0 4px;
    font-size: 1.2rem;
    font-weight: 600;
  }

  &__hint {
    margin: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.88rem;
  }

  &__value {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    letter-spacing: -0.03em;
    white-space: nowrap;
  }
}

.compras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.compra-skeleton {
  min-height: 238px;
  border-radius: 16px;
}

.compras-state {
  margin-top: 56px;
  color: var(--text-primary);

  &__illustration {
    display: grid;
    width: 104px;
    height: 104px;
    margin: 0 auto;
    place-items: center;
    color: #155e75;
    background: rgba(21, 94, 117, 0.1);
    border: 1px solid rgba(21, 94, 117, 0.16);
    border-radius: 32px;
  }
}

.compras-list-enter-active,
.compras-list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.compras-list-enter-from,
.compras-list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 600px) {
  .compras-page {
    padding: 16px !important;
  }

  .compras-total {
    padding: 20px;

    &__value {
      font-size: 1.7rem;
    }
  }

  .compras-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
