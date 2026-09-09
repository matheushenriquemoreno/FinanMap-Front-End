<template>
  <q-page class="compras-page q-pa-lg">
    <PageHeaderBanner
      icon="shopping_cart"
      title="Compras Planejadas"
      subtitle="Dê forma aos próximos planos sem perder o controle do seu dinheiro"
      button-label="Nova compra"
      :show-action="compartilhamentoStore.podeEditar"
      gradient="linear-gradient(135deg, #102a43 0%, #1d169c 62%, #0e7490 100%)"
      @action="abrirModalCriar"
    />

    <q-tabs
      v-model="abaAtiva"
      class="compras-tabs q-mb-lg"
      active-color="primary"
      indicator-color="primary"
      align="left"
      @update:model-value="trocarAba"
    >
      <q-tab name="pendentes" icon="schedule" label="Pendentes" />
      <q-tab name="compradas" icon="task_alt" label="Compradas" />
    </q-tabs>

    <section class="compras-total" :aria-label="`Resumo das compras ${abaAtiva}`">
      <div class="compras-total__eyebrow">
        <q-icon :name="abaAtiva === 'pendentes' ? 'track_changes' : 'task_alt'" size="18px" />
        <span>{{ abaAtiva === 'pendentes' ? 'Seu próximo movimento' : 'O que já saiu do plano' }}</span>
      </div>
      <div class="row items-end justify-between q-col-gutter-md">
        <div>
          <h2 class="compras-total__title">{{ abaAtiva === 'pendentes' ? 'Total estimado' : 'Comparativo realizado' }}</h2>
          <p class="compras-total__hint">
            {{ comprasAtuais.length }} {{ comprasAtuais.length === 1 ? 'item' : 'itens' }}
            {{ abaAtiva === 'pendentes' ? 'pendente' : 'comprado' }}{{ comprasAtuais.length === 1 ? '' : 's' }}
          </p>
        </div>
        <strong class="compras-total__value">R$ {{ formatarValor(totalAtual) }}</strong>
      </div>
      <div v-if="abaAtiva === 'compradas'" class="compras-total__comparison row q-col-gutter-md q-mt-md">
        <div class="col">
          <span class="text-caption">Estimado</span>
          <strong>R$ {{ formatarValor(totalEstimadoComprados) }}</strong>
        </div>
        <div class="col">
          <span class="text-caption">Real</span>
          <strong>R$ {{ formatarValor(totalRealComprados) }}</strong>
        </div>
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

    <template v-else-if="erroAba">
      <div class="compras-state text-center q-pa-xl">
        <q-icon name="cloud_off" size="72px" color="grey-5" />
        <h2 class="text-h6 q-mt-md q-mb-sm">Não foi possível carregar esta lista</h2>
        <p class="text-body2 text-grey-6 q-mb-lg">Tente novamente sem perder o que já estava salvo.</p>
        <q-btn color="primary" outline rounded label="Tentar novamente" icon="refresh" @click="carregarAba" />
      </div>
    </template>

    <template v-else-if="comprasAtuais.length > 0">
      <transition-group name="compras-list" tag="div" class="compras-grid">
        <CompraPlanejadaCard
          v-for="compra in comprasAtuais"
          :key="compra.id"
          :compra="compra"
          :comprado="abaAtiva === 'compradas'"
          :pode-editar="compartilhamentoStore.podeEditar"
          @editar="abrirModalEditar"
          @excluir="confirmarExclusao"
          @comprar="abrirModalConclusao"
          @reverter="confirmarReversao"
        />
      </transition-group>
    </template>

    <div v-else class="compras-state text-center q-pa-xl">
      <div class="compras-state__illustration" aria-hidden="true">
        <q-icon name="format_list_bulleted" size="56px" />
      </div>
      <h2 class="text-h6 q-mt-lg q-mb-sm">{{ abaAtiva === 'pendentes' ? 'Sua lista começa com um plano' : 'Nenhuma compra concluída ainda' }}</h2>
      <p class="text-body2 text-grey-6 q-mb-lg">
        {{ abaAtiva === 'pendentes' ? 'Registre uma compra futura e acompanhe o valor antes de decidir.' : 'Quando você concluir um plano, ele aparecerá aqui com o comparativo realizado.' }}
      </p>
      <q-btn v-if="abaAtiva === 'pendentes'" color="primary" rounded unelevated label="Adicionar primeira compra" icon="add" @click="abrirModalCriar" />
    </div>

    <CompraPlanejadaFormModal
      v-model="modalCompraAberto"
      :compra="compraEmEdicao"
      :loading="service.saving.value"
      @salvar="salvarCompra"
    />
    <CompraPlanejadaConclusaoModal
      v-model="modalConclusaoAberto"
      :compra="compraParaConcluir"
      :loading="service.saving.value"
      @confirmar="concluirCompra"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import PageHeaderBanner from 'src/components/PageHeaderBanner.vue';
import CompraPlanejadaCard from 'src/components/ComprasPlanejadas/CompraPlanejadaCard.vue';
import CompraPlanejadaFormModal from 'src/components/ComprasPlanejadas/CompraPlanejadaFormModal.vue';
import CompraPlanejadaConclusaoModal from 'src/components/ComprasPlanejadas/CompraPlanejadaConclusaoModal.vue';
import getCompraPlanejadaService from 'src/services/CompraPlanejadaService';
import type {
  CompraPlanejadaCreate,
  CompraPlanejadaResult,
  ListaComprasPlanejadasResult,
  CompraPlanejadaConcluir,
  ListaComprasCompradasResult,
} from 'src/Model/CompraPlanejada';
import { formatarValor } from 'src/helpers/FormatUtils';
import { notificarErro } from 'src/helpers/Notificacao';
import { calcularTotalEstimado, ordenarComprasPlanejadas } from 'src/helpers/CompraPlanejadaPresentation.mjs';

const $q = useQuasar();
const compartilhamentoStore = useCompartilhamentoStore();
const service = getCompraPlanejadaService();
const compras = ref<CompraPlanejadaResult[]>([]);
const totalEstimado = ref(0);
const erroCarregamento = ref(false);
const comprasCompradas = ref<CompraPlanejadaResult[]>([]);
const totalEstimadoComprados = ref(0);
const totalRealComprados = ref(0);
const erroComprados = ref(false);
const compradasCarregadas = ref(false);
type AbaCompras = 'pendentes' | 'compradas';
const abaAtiva = ref<AbaCompras>('pendentes');
const modalCompraAberto = ref(false);
const compraEmEdicao = ref<CompraPlanejadaResult | null>(null);
const modalConclusaoAberto = ref(false);
const compraParaConcluir = ref<CompraPlanejadaResult | null>(null);

const comprasAtuais = computed(() => abaAtiva.value === 'pendentes' ? compras.value : comprasCompradas.value);
const totalAtual = computed(() => abaAtiva.value === 'pendentes' ? totalEstimado.value : totalRealComprados.value);
const erroAba = computed(() => abaAtiva.value === 'pendentes' ? erroCarregamento.value : erroComprados.value);

function abrirModalCriar() {
  compraEmEdicao.value = null;
  modalCompraAberto.value = true;
}

function abrirModalEditar(compra: CompraPlanejadaResult) {
  compraEmEdicao.value = compra;
  modalCompraAberto.value = true;
}

function aplicarLista(resultado: ListaComprasPlanejadasResult) {
  compras.value = resultado.itens;
  totalEstimado.value = resultado.totalEstimado;
  erroCarregamento.value = false;
}

function aplicarListaComprados(resultado: ListaComprasCompradasResult) {
  comprasCompradas.value = resultado.itens;
  totalEstimadoComprados.value = resultado.totalEstimado;
  totalRealComprados.value = resultado.totalReal;
  erroComprados.value = false;
  compradasCarregadas.value = true;
}

async function carregarDados(): Promise<boolean> {
  erroCarregamento.value = false;

  try {
    aplicarLista(await service.obterPendentes());
    return true;
  } catch (error) {
    console.error('Erro ao carregar compras planejadas:', error);
    erroCarregamento.value = true;
    return false;
  }
}

async function carregarComprados(): Promise<boolean> {
  erroComprados.value = false;

  try {
    aplicarListaComprados(await service.obterComprados());
    return true;
  } catch (error) {
    console.error('Erro ao carregar compras concluídas:', error);
    erroComprados.value = true;
    return false;
  }
}

async function trocarAba(aba: string | number | null) {
  if (aba !== 'pendentes' && aba !== 'compradas') return;
  abaAtiva.value = aba;
  if (aba === 'compradas' && !compradasCarregadas.value) await carregarComprados();
}

function carregarAba() {
  return abaAtiva.value === 'pendentes' ? carregarDados() : carregarComprados();
}

function inserirCompraLocal(compra: CompraPlanejadaResult) {
  compras.value = ordenarComprasPlanejadas([...compras.value, compra]);
  totalEstimado.value = calcularTotalEstimado(compras.value);
  erroCarregamento.value = false;
}

function substituirCompraLocal(compra: CompraPlanejadaResult) {
  const index = compras.value.findIndex((item) => item.id === compra.id);
  if (index === -1) return;

  const atualizadas = [...compras.value];
  atualizadas[index] = compra;
  compras.value = ordenarComprasPlanejadas(atualizadas);
  totalEstimado.value = calcularTotalEstimado(compras.value);
  erroCarregamento.value = false;
}

function removerCompraLocal(id: string) {
  compras.value = compras.value.filter((item) => item.id !== id);
  totalEstimado.value = calcularTotalEstimado(compras.value);
  erroCarregamento.value = false;
}

function inserirCompraCompradaLocal(compra: CompraPlanejadaResult) {
  const semDuplicata = comprasCompradas.value.filter((item) => item.id !== compra.id);
  comprasCompradas.value = [...semDuplicata, compra];
  totalEstimadoComprados.value = comprasCompradas.value.reduce((total, item) => total + item.valorEstimado, 0);
  totalRealComprados.value = comprasCompradas.value.reduce((total, item) => total + (item.valorReal ?? 0), 0);
  erroComprados.value = false;
  compradasCarregadas.value = true;
}

function removerCompraCompradaLocal(id: string) {
  comprasCompradas.value = comprasCompradas.value.filter((item) => item.id !== id);
  totalEstimadoComprados.value = comprasCompradas.value.reduce((total, item) => total + item.valorEstimado, 0);
  totalRealComprados.value = comprasCompradas.value.reduce((total, item) => total + (item.valorReal ?? 0), 0);
  erroComprados.value = false;
}

async function salvarCompra(dto: CompraPlanejadaCreate) {
  const editando = compraEmEdicao.value;
  let confirmada: CompraPlanejadaResult;

  try {
    confirmada = editando
      ? await service.atualizar(editando.id, dto)
      : await service.criar(dto);
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      notificarErro('Não foi possível salvar o plano. Verifique os dados e tente novamente.');
    }
    return;
  }

  // A resposta da lista é a fonte de ordenação e total. O fallback evita deixar a tela
  // desatualizada se o POST confirmou, mas a consulta seguinte falhar.
  if (!(await carregarDados())) {
    if (editando) substituirCompraLocal(confirmada);
    else inserirCompraLocal(confirmada);
  }

  modalCompraAberto.value = false;
  compraEmEdicao.value = null;
  $q.notify({
    type: 'positive',
    message: editando ? 'Compra planejada atualizada com sucesso!' : 'Compra planejada salva com sucesso!',
    position: 'top-right',
  });
}

function confirmarExclusao(compra: CompraPlanejadaResult) {
  $q.dialog({
    title: 'Excluir compra planejada',
    message: compra.estado === 'Comprado'
      ? `Deseja excluir “${compra.nome}”? A despesa vinculada, se existir, permanecerá no Mês a Mês.`
      : `Deseja realmente excluir “${compra.nome}”? Essa ação não pode ser desfeita.`,
    persistent: false,
    ok: {
      flat: true,
      color: 'negative',
      label: 'Excluir',
    },
    cancel: {
      flat: true,
      color: 'primary',
      label: 'Cancelar',
    },
  }).onOk(() => {
    void excluirCompra(compra.id);
  });
}

async function excluirCompra(id: string) {
  try {
    await service.excluir(id);
    if (abaAtiva.value === 'pendentes') {
      if (!(await carregarDados())) removerCompraLocal(id);
    } else if (!(await carregarComprados())) {
      removerCompraCompradaLocal(id);
    }
    $q.notify({
      type: 'positive',
      message: 'Compra planejada excluída com sucesso!',
      position: 'top-right',
    });
  } catch {
    // O AxiosHelper já apresenta o erro e o item confirmado permanece na lista.
  }
}

function abrirModalConclusao(compra: CompraPlanejadaResult) {
  compraParaConcluir.value = compra;
  modalConclusaoAberto.value = true;
}

async function concluirCompra(dto: CompraPlanejadaConcluir) {
  const compra = compraParaConcluir.value;
  if (!compra) return;

  let confirmada: CompraPlanejadaResult;
  try {
    confirmada = await service.concluir(compra.id, dto);
  } catch (error) {
    if (!axios.isAxiosError(error)) notificarErro('Não foi possível confirmar a compra. Tente novamente.');
    return;
  }

  if (!(await carregarDados())) removerCompraLocal(compra.id);
  if (compradasCarregadas.value) inserirCompraCompradaLocal(confirmada);

  modalConclusaoAberto.value = false;
  compraParaConcluir.value = null;
  $q.notify({
    type: 'positive',
    message: 'Compra marcada como realizada!',
    position: 'top-right',
  });
}

function confirmarReversao(compra: CompraPlanejadaResult) {
  const possuiDespesa = Boolean(compra.despesaId);
  $q.dialog({
    title: 'Reverter compra',
    message: possuiDespesa
      ? 'Esta compra possui uma despesa vinculada. Escolha o que fazer com ela.'
      : 'O item voltará para a lista de pendentes.',
    ...(possuiDespesa ? {
      options: {
        type: 'radio' as const,
        model: 'preservar',
        items: [
          { label: 'Preservar despesa no Mês a Mês', value: 'preservar' },
          { label: 'Excluir também a despesa', value: 'excluir' },
        ],
      },
    } : {}),
    persistent: true,
    ok: {
      flat: true,
      color: 'primary',
      label: 'Confirmar reversão',
    },
    cancel: {
      flat: true,
      color: 'grey-7',
      label: 'Cancelar',
    },
  }).onOk((escolha) => {
    void reverterCompra(compra, possuiDespesa && escolha === 'excluir');
  });
}

async function reverterCompra(compra: CompraPlanejadaResult, excluirDespesa: boolean) {
  let revertida: CompraPlanejadaResult;
  try {
    revertida = await service.reverter(compra.id, excluirDespesa);
  } catch (error) {
    if (!axios.isAxiosError(error)) notificarErro('Não foi possível reverter a compra. Tente novamente.');
    return;
  }

  if (!(await carregarDados())) inserirCompraLocal(revertida);
  if (compradasCarregadas.value) removerCompraCompradaLocal(compra.id);
  $q.notify({
    type: 'positive',
    message: excluirDespesa ? 'Compra e despesa revertidas.' : 'Compra devolvida aos pendentes.',
    position: 'top-right',
  });
}

onMounted(carregarDados);

watch(
  () => compartilhamentoStore.contextoAtivo?.proprietarioId ?? null,
  () => {
    compras.value = [];
    totalEstimado.value = 0;
    comprasCompradas.value = [];
    totalEstimadoComprados.value = 0;
    totalRealComprados.value = 0;
    compradasCarregadas.value = false;
    void carregarAba();
  },
);

defineExpose({ carregarDados, carregarComprados });
</script>

<style lang="scss" scoped>
.compras-page {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.compras-tabs {
  min-height: 48px;
  background: var(--bg-card);
  border-radius: 12px;
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

  &__comparison {
    color: rgba(255, 255, 255, 0.82);

    span,
    strong {
      display: block;
    }

    strong {
      margin-top: 3px;
      color: white;
      font-size: 1.05rem;
    }
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
