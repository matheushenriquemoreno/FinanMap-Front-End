<template>
  <q-page class="compras-page q-pa-lg">
    <PageHeaderBanner
      icon="shopping_cart"
      title="Compras Planejadas"
      subtitle="Dê forma aos próximos planos sem perder o controle do seu dinheiro"
      button-label="Nova Compra"
      :show-action="compartilhamentoStore.podeEditar"
      @action="abrirModalCriar"
    />

    <PainelResumoCompras
      :total-pendentes="totalEstimado"
      :quantidade-pendentes="compras.length"
      :total-estimado-compradas="totalEstimadoComprados"
      :quantidade-compradas="comprasCompradas.length"
      :total-real-compradas="totalRealComprados"
      :loading="carregandoInicial"
      :erro-pendentes="erroPendentes"
      :erro-compradas="erroCompradas"
    />

    <div class="filters-row row q-col-gutter-md q-mt-lg q-mb-lg items-center">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="filtroNome"
          dense
          outlined
          clearable
          color="primary"
          class="buscar-input"
          placeholder="Buscar compra planejada pelo nome..."
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="status-filter-column col-12 col-sm-6 flex justify-end-sm">
        <q-btn-toggle
          v-model="filtroStatus"
          toggle-color="primary"
          :color="$q.dark.isActive ? 'dark' : 'white'"
          :text-color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
          rounded
          unelevated
          size="13px"
          class="status-toggle-premium border-sutil"
          :options="[
            { value: 'pendentes', slot: 'pendentes' },
            { value: 'compradas', slot: 'compradas' },
          ]"
        >
          <template #pendentes>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon
                name="schedule"
                class="q-mr-xs"
                size="18px"
                :color="filtroStatus === 'pendentes' ? 'white' : 'primary'"
              />
              <span>Pendentes</span>
              <q-badge
                :color="
                  filtroStatus === 'pendentes' ? 'white' : $q.dark.isActive ? 'grey-8' : 'grey-3'
                "
                :text-color="
                  filtroStatus === 'pendentes' ? 'primary' : $q.dark.isActive ? 'grey-3' : 'grey-8'
                "
                class="q-ml-xs text-bold badge-contador"
              >
                {{ compras.length }}
              </q-badge>
            </div>
          </template>

          <template #compradas>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon
                name="task_alt"
                class="q-mr-xs"
                size="18px"
                :color="filtroStatus === 'compradas' ? 'white' : 'green'"
              />
              <span>Compradas</span>
              <q-badge
                :color="
                  filtroStatus === 'compradas' ? 'white' : $q.dark.isActive ? 'grey-8' : 'grey-3'
                "
                :text-color="
                  filtroStatus === 'compradas' ? 'green-9' : $q.dark.isActive ? 'grey-3' : 'grey-8'
                "
                class="q-ml-xs text-bold badge-contador"
              >
                {{ comprasCompradas.length }}
              </q-badge>
            </div>
          </template>
        </q-btn-toggle>
      </div>
    </div>

    <div
      v-if="carregandoInicial || (carregandoAba && comprasAtuais.length === 0)"
      class="compras-grid"
      aria-label="Carregando compras planejadas"
    >
      <q-card v-for="i in 3" :key="`skeleton-${i}`" flat bordered class="q-pa-md skeleton-card">
        <div class="row items-center q-mb-md">
          <q-skeleton type="QAvatar" size="42px" class="q-mr-sm" />
          <div class="col">
            <q-skeleton type="text" width="60%" class="q-mb-xs" />
            <q-skeleton type="text" width="40%" />
          </div>
        </div>
        <q-skeleton type="text" width="80%" class="q-mb-md" />
        <div class="row justify-end q-gutter-sm">
          <q-skeleton type="QBtn" width="80px" />
          <q-skeleton type="QBtn" width="110px" />
        </div>
      </q-card>
    </div>

    <template v-else>
      <template v-if="erroAba && comprasAtuais.length === 0">
        <div class="compras-empty text-center q-pa-xl">
          <q-icon name="cloud_off" size="80px" color="grey-4" />
          <p class="text-h6 text-grey-6 q-mt-md">Não foi possível carregar esta lista</p>
          <p class="text-body2 text-grey-5 q-mb-lg">
            Tente novamente sem perder o que já estava salvo.
          </p>
          <q-btn
            color="primary"
            outline
            rounded
            label="Tentar novamente"
            icon="refresh"
            @click="carregarAba"
          />
        </div>
      </template>

      <template v-else>
        <q-banner v-if="erroAba" rounded dense inline-actions icon="cloud_off" class="q-mb-md">
          Não foi possível atualizar esta lista. Os dados confirmados continuam visíveis.
          <template #action>
            <q-btn flat color="primary" label="Tentar novamente" @click="carregarAba" />
          </template>
        </q-banner>

        <transition-group
          v-if="comprasFiltradas.length > 0"
          name="list"
          tag="div"
          class="compras-grid"
        >
          <CompraPlanejadaCard
            v-for="compra in comprasFiltradas"
            :key="compra.id"
            :compra="compra"
            :comprado="filtroStatus === 'compradas'"
            :pode-editar="compartilhamentoStore.podeEditar"
            @editar="abrirModalEditar"
            @excluir="confirmarExclusao"
            @comprar="abrirModalConclusao"
            @reverter="confirmarReversao"
          />
        </transition-group>

        <div v-else-if="comprasAtuais.length > 0" class="text-center q-pa-xl text-busca-vazia">
          <q-icon name="search_off" size="80px" color="grey-4" />
          <p class="text-h6 text-grey-6 q-mt-md">Nenhuma compra encontrada</p>
          <p class="text-body2 text-grey-5">Tente ajustar sua busca ou limpar o campo de texto.</p>
        </div>

        <div v-else class="compras-empty text-center q-pa-xl">
          <q-icon
            :name="filtroStatus === 'pendentes' ? 'shopping_cart' : 'task_alt'"
            size="80px"
            color="grey-4"
          />
          <p class="text-h6 text-grey-6 q-mt-md">
            {{
              filtroStatus === 'pendentes'
                ? 'Nenhuma compra planejada ainda'
                : 'Nenhuma compra concluída ainda'
            }}
          </p>
          <p class="text-body2 text-grey-5">
            {{
              filtroStatus === 'pendentes'
                ? 'Clique em "Nova Compra" para começar a planejar seus próximos gastos.'
                : 'Quando você concluir um plano, ele aparecerá nesta lista.'
            }}
          </p>
        </div>
      </template>
    </template>

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
import PainelResumoCompras from 'src/components/ComprasPlanejadas/PainelResumoCompras.vue';
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
import { notificarErro } from 'src/helpers/Notificacao';
import {
  calcularTotalEstimado,
  filtrarComprasPlanejadas,
  ordenarComprasPlanejadas,
} from 'src/helpers/CompraPlanejadaPresentation.mjs';

const $q = useQuasar();
const compartilhamentoStore = useCompartilhamentoStore();
const service = getCompraPlanejadaService();

const compras = ref<CompraPlanejadaResult[]>([]);
const totalEstimado = ref(0);
const erroPendentes = ref(false);
const carregandoPendentes = ref(false);

const comprasCompradas = ref<CompraPlanejadaResult[]>([]);
const totalEstimadoComprados = ref(0);
const totalRealComprados = ref(0);
const erroCompradas = ref(false);
const carregandoCompradas = ref(false);
const compradasCarregadas = ref(false);

const carregandoInicial = ref(false);
type FiltroStatus = 'pendentes' | 'compradas';
const filtroStatus = ref<FiltroStatus>('pendentes');
const filtroNome = ref('');

const modalCompraAberto = ref(false);
const compraEmEdicao = ref<CompraPlanejadaResult | null>(null);
const modalConclusaoAberto = ref(false);
const compraParaConcluir = ref<CompraPlanejadaResult | null>(null);

const comprasAtuais = computed(() =>
  filtroStatus.value === 'pendentes' ? compras.value : comprasCompradas.value,
);
const comprasFiltradas = computed(() =>
  filtrarComprasPlanejadas(comprasAtuais.value, filtroNome.value),
);
const erroAba = computed(() =>
  filtroStatus.value === 'pendentes' ? erroPendentes.value : erroCompradas.value,
);
const carregandoAba = computed(() =>
  filtroStatus.value === 'pendentes' ? carregandoPendentes.value : carregandoCompradas.value,
);

function abrirModalCriar() {
  compraEmEdicao.value = null;
  modalCompraAberto.value = true;
}

function abrirModalEditar(compra: CompraPlanejadaResult) {
  compraEmEdicao.value = compra;
  modalCompraAberto.value = true;
}

function aplicarLista(resultado: ListaComprasPlanejadasResult) {
  compras.value = ordenarComprasPlanejadas(resultado.itens);
  totalEstimado.value = resultado.totalEstimado;
  erroPendentes.value = false;
}

function aplicarListaComprados(resultado: ListaComprasCompradasResult) {
  comprasCompradas.value = resultado.itens;
  totalEstimadoComprados.value = resultado.totalEstimado;
  totalRealComprados.value = resultado.totalReal;
  erroCompradas.value = false;
  compradasCarregadas.value = true;
}

async function carregarDados(): Promise<boolean> {
  erroPendentes.value = false;
  carregandoPendentes.value = true;

  try {
    aplicarLista(await service.obterPendentes());
    return true;
  } catch (error) {
    console.error('Erro ao carregar compras planejadas:', error);
    erroPendentes.value = true;
    return false;
  } finally {
    carregandoPendentes.value = false;
  }
}

async function carregarComprados(): Promise<boolean> {
  erroCompradas.value = false;
  carregandoCompradas.value = true;

  try {
    aplicarListaComprados(await service.obterComprados());
    return true;
  } catch (error) {
    console.error('Erro ao carregar compras concluídas:', error);
    erroCompradas.value = true;
    return false;
  } finally {
    carregandoCompradas.value = false;
  }
}

async function carregarTudo() {
  carregandoInicial.value = true;
  await Promise.all([carregarDados(), carregarComprados()]);
  carregandoInicial.value = false;
}

function carregarAba() {
  return filtroStatus.value === 'pendentes' ? carregarDados() : carregarComprados();
}

function inserirCompraLocal(compra: CompraPlanejadaResult) {
  compras.value = ordenarComprasPlanejadas([...compras.value, compra]);
  totalEstimado.value = calcularTotalEstimado(compras.value);
  erroPendentes.value = false;
}

function substituirCompraLocal(compra: CompraPlanejadaResult) {
  const index = compras.value.findIndex((item) => item.id === compra.id);
  if (index === -1) return;

  const atualizadas = [...compras.value];
  atualizadas[index] = compra;
  compras.value = ordenarComprasPlanejadas(atualizadas);
  totalEstimado.value = calcularTotalEstimado(compras.value);
  erroPendentes.value = false;
}

function removerCompraLocal(id: string) {
  compras.value = compras.value.filter((item) => item.id !== id);
  totalEstimado.value = calcularTotalEstimado(compras.value);
  erroPendentes.value = false;
}

function inserirCompraCompradaLocal(compra: CompraPlanejadaResult) {
  const semDuplicata = comprasCompradas.value.filter((item) => item.id !== compra.id);
  comprasCompradas.value = [...semDuplicata, compra];
  totalEstimadoComprados.value = comprasCompradas.value.reduce(
    (total, item) => total + item.valorEstimado,
    0,
  );
  totalRealComprados.value = comprasCompradas.value.reduce(
    (total, item) => total + (item.valorReal ?? 0),
    0,
  );
  erroCompradas.value = false;
  compradasCarregadas.value = true;
}

function removerCompraCompradaLocal(id: string) {
  comprasCompradas.value = comprasCompradas.value.filter((item) => item.id !== id);
  totalEstimadoComprados.value = comprasCompradas.value.reduce(
    (total, item) => total + item.valorEstimado,
    0,
  );
  totalRealComprados.value = comprasCompradas.value.reduce(
    (total, item) => total + (item.valorReal ?? 0),
    0,
  );
  erroCompradas.value = false;
}

async function salvarCompra(dto: CompraPlanejadaCreate) {
  const editando = compraEmEdicao.value;
  let confirmada: CompraPlanejadaResult;

  try {
    confirmada = editando ? await service.atualizar(editando.id, dto) : await service.criar(dto);
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      notificarErro('Não foi possível salvar o plano. Verifique os dados e tente novamente.');
    }
    return;
  }

  if (!(await carregarDados())) {
    if (editando) substituirCompraLocal(confirmada);
    else inserirCompraLocal(confirmada);
  }

  modalCompraAberto.value = false;
  compraEmEdicao.value = null;
  $q.notify({
    type: 'positive',
    message: editando
      ? 'Compra planejada atualizada com sucesso!'
      : 'Compra planejada salva com sucesso!',
    position: 'top-right',
  });
}

function confirmarExclusao(compra: CompraPlanejadaResult) {
  $q.dialog({
    title: 'Excluir compra planejada',
    message:
      compra.estado === 'Comprado'
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
    if (filtroStatus.value === 'pendentes') {
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
    if (!axios.isAxiosError(error))
      notificarErro('Não foi possível confirmar a compra. Tente novamente.');
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
    ...(possuiDespesa
      ? {
          options: {
            type: 'radio' as const,
            model: 'preservar',
            items: [
              { label: 'Preservar despesa no Mês a Mês', value: 'preservar' },
              { label: 'Excluir também a despesa', value: 'excluir' },
            ],
          },
        }
      : {}),
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
    if (!axios.isAxiosError(error))
      notificarErro('Não foi possível reverter a compra. Tente novamente.');
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

onMounted(() => {
  void carregarTudo();
});

watch(
  () => compartilhamentoStore.contextoAtivo?.proprietarioId ?? null,
  () => {
    compras.value = [];
    totalEstimado.value = 0;
    comprasCompradas.value = [];
    totalEstimadoComprados.value = 0;
    totalRealComprados.value = 0;
    compradasCarregadas.value = false;
    filtroNome.value = '';
    void carregarTudo();
  },
);

defineExpose({ carregarDados, carregarComprados, carregarTudo });
</script>

<style lang="scss" scoped>
.compras-page {
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 16px !important;
  }
}

.filters-row {
  align-items: center;
}

.buscar-input {
  width: 100%;
  max-width: 450px;

  @media (max-width: 599px) {
    max-width: 100%;
  }
}

.status-filter-column {
  @media (max-width: 599px) {
    display: block;
  }
}

.flex.justify-end-sm {
  @media (min-width: 600px) {
    display: flex;
    justify-content: flex-end;
  }
}

.status-toggle-premium {
  max-width: 100%;

  :deep(.q-btn-group) {
    max-width: 100%;
  }

  :deep(.q-btn) {
    min-height: 40px;
  }

  @media (max-width: 599px) {
    width: 100%;

    :deep(.q-btn-group) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    :deep(.q-btn) {
      min-width: 0;
      width: 100%;
      padding-left: 4px;
      padding-right: 4px;
    }
  }
}

.status-toggle-option {
  min-width: 0;
  justify-content: center;
  white-space: nowrap;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 420px) {
    padding-left: 2px;
    padding-right: 2px;

    .q-icon {
      margin-right: 2px;
      font-size: 16px !important;
    }
  }
}

.border-sutil {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;

  .body--dark & {
    border-color: rgba(255, 255, 255, 0.12) !important;
  }
}

.badge-contador {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.compras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  width: 100%;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.skeleton-card {
  min-height: 238px;
  border-radius: 16px;
}

.compras-empty,
.text-busca-vazia {
  margin-top: 80px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}
</style>
