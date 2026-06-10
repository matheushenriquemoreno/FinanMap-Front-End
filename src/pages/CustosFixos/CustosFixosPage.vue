<template>
  <q-page class="custos-page q-pa-lg">
    <!-- ===== HEADER ===== -->
    <PageHeaderBanner
      icon="receipt_long"
      title="Custos Fixos"
      subtitle="Gerencie seus compromissos financeiros recorrentes"
      button-label="Novo Custo Fixo"
      @action="abrirModalCriar"
    />

    <!-- ===== FILTROS ===== -->
    <div class="filters-row row q-col-gutter-md q-mb-lg items-center" v-if="custosFixos.length > 0">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="filtroNome"
          dense
          outlined
          placeholder="Buscar custo fixo pelo nome..."
          color="primary"
          clearable
          class="buscar-input"
        >
          <template v-slot:prepend>
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
            { value: 'todos', slot: 'todos' },
            { value: 'ativos', slot: 'ativos' },
            { value: 'inativos', slot: 'inativos' },
          ]"
        >
          <template v-slot:todos>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon name="apps" class="q-mr-xs" size="18px" />
              <span>Todos</span>
              <q-badge
                :color="filtroStatus === 'todos' ? 'white' : ($q.dark.isActive ? 'grey-8' : 'grey-3')"
                :text-color="filtroStatus === 'todos' ? 'primary' : ($q.dark.isActive ? 'grey-3' : 'grey-8')"
                class="q-ml-xs text-bold badge-contador"
              >
                {{ totalCustos }}
              </q-badge>
            </div>
          </template>

          <template v-slot:ativos>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon name="check_circle" class="q-mr-xs" size="18px" :color="filtroStatus === 'ativos' ? 'white' : 'green'" />
              <span>Ativos</span>
              <q-badge
                :color="filtroStatus === 'ativos' ? 'white' : ($q.dark.isActive ? 'grey-8' : 'grey-3')"
                :text-color="filtroStatus === 'ativos' ? 'green-9' : ($q.dark.isActive ? 'grey-3' : 'grey-8')"
                class="q-ml-xs text-bold badge-contador"
              >
                {{ totalAtivos }}
              </q-badge>
            </div>
          </template>

          <template v-slot:inativos>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon name="unpublished" class="q-mr-xs" size="18px" :color="filtroStatus === 'inativos' ? 'white' : 'red'" />
              <span>Inativos</span>
              <q-badge
                :color="filtroStatus === 'inativos' ? 'white' : ($q.dark.isActive ? 'grey-8' : 'grey-3')"
                :text-color="filtroStatus === 'inativos' ? 'red-9' : ($q.dark.isActive ? 'grey-3' : 'grey-8')"
                class="q-ml-xs text-bold badge-contador"
              >
                {{ totalInativos }}
              </q-badge>
            </div>
          </template>
        </q-btn-toggle>
      </div>
    </div>

    <!-- ===== LISTAGEM DE CUSTOS FIXOS ===== -->
    <div class="custos-container q-mt-lg">
      <div class="custos-grid-list" v-if="loading">
        <!-- Skeleton Loaders -->
        <q-card v-for="i in 3" :key="'skeleton-' + i" flat bordered class="q-pa-md skeleton-card">
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
            <q-skeleton type="QBtn" width="80px" />
          </div>
        </q-card>
      </div>

      <template v-else>
        <!-- Transições suaves na listagem dos cards -->
        <transition-group
          name="list"
          tag="div"
          class="custos-grid-list"
          v-if="custosFixosFiltrados.length > 0"
        >
          <CustoFixoCard
            v-for="custo in custosFixosFiltrados"
            :key="custo.id"
            :custo="custo"
            @excluir="excluirCustoFixo"
            @editar="abrirModalEditar"
            @cadastrar-despesa="abrirModalCadastrarDespesa"
            @status-alterado="atualizarStatusLocal"
          />
        </transition-group>

        <!-- Sem resultados da busca -->
        <div v-else-if="custosFixos.length > 0" class="text-center q-pa-xl text-busca-vazia">
          <q-icon name="search_off" size="80px" color="grey-4" />
          <p class="text-h6 text-grey-6 q-mt-md">Nenhum custo fixo encontrado</p>
          <p class="text-body2 text-grey-5">
            Tente ajustar seus filtros de busca ou limpar o campo de texto!
          </p>
        </div>

        <!-- Empty state original -->
        <div v-else class="custos-empty text-center q-pa-xl">
          <q-icon name="receipt_long" size="80px" color="grey-4" />
          <p class="text-h6 text-grey-6 q-mt-md">Nenhum custo fixo cadastrado ainda</p>
          <p class="text-body2 text-grey-5">
            Clique em "Novo Custo Fixo" para registrar suas despesas recorrentes!
          </p>
        </div>
      </template>
    </div>

    <!-- ===== MODAIS ===== -->
    <ModalCriarCustoFixo v-model="modalCriarAberto" @criar="criarCustoFixo" />
    <ModalEditarCustoFixo
      v-model="modalEditarAberto"
      :custo="custoSelecionado"
      @salvar="atualizarCustoFixo"
    />
    <ModalDespesa
      v-model:model-value="modalDespesaAberto"
      :eh-edicao="false"
      titulo-add="Cadastrar Despesa"
      titulo-edit="Editar Despesa"
      :dados-iniciais="dadosIniciaisDespesa"
      :loading="despesaService.loading.value"
      :ano="useGerenciamentoMensal.mesAtual.ano"
      :mes="useGerenciamentoMensal.mesAtual.mes"
      @on-submit-add="cadastrarDespesa"
      @close-modal="fecharModalDespesa"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import getCustoFixoService from 'src/services/CustoFixoService';
import getDespesaService from 'src/services/transacao/DespesaService';
import type { CustoFixoResult, CustoFixoCreate, UpdateCustoFixoDTO } from 'src/Model/CustoFixo';
import type { DespesaCreate } from 'src/Model/Transacao';
import PageHeaderBanner from 'src/components/PageHeaderBanner.vue';
import CustoFixoCard from 'src/components/CustosFixos/CustoFixoCard.vue';
import ModalCriarCustoFixo from 'src/components/CustosFixos/ModalCriarCustoFixo.vue';
import ModalEditarCustoFixo from 'src/components/CustosFixos/ModalEditarCustoFixo.vue';
import ModalDespesa from 'src/components/Despesa/ModalCreateUpdateDespesa.vue';
import { notificarErro } from 'src/helpers/Notificacao';

const $q = useQuasar();
const router = useRouter();
const compartilhamentoStore = useCompartilhamentoStore();
const useGerenciamentoMensal = useGerenciamentoMensalStore();
const service = getCustoFixoService();
const despesaService = getDespesaService();

const custosFixos = ref<CustoFixoResult[]>([]);
const loading = ref(false);
const modalCriarAberto = ref(false);
const modalEditarAberto = ref(false);
const modalDespesaAberto = ref(false);
const custoSelecionado = ref<CustoFixoResult | null>(null);
const dadosIniciaisDespesa = ref<DadosIniciaisDespesa | undefined>();

interface DadosIniciaisDespesa {
  descricao?: string | undefined;
  categoriaId?: string | undefined;
  categoriaNome?: string | undefined;
}

// Filtros locais
const filtroNome = ref('');
const filtroStatus = ref<'todos' | 'ativos' | 'inativos'>('todos');

// Verifica se o usuário está acessando os dados de forma compartilhada
function verificarModoCompartilhado() {
  if (compartilhamentoStore.emModoCompartilhado) {
    router.replace('/');
  }
}

onMounted(() => {
  verificarModoCompartilhado();
  carregarDados();
});

// Acompanha mudanças no modo compartilhado para redirecionar se o usuário alternar de contexto
watch(
  () => compartilhamentoStore.emModoCompartilhado,
  (novoValor) => {
    if (novoValor) {
      verificarModoCompartilhado();
    }
  },
);

const totalCustos = computed(() => custosFixos.value.length);
const totalAtivos = computed(() => custosFixos.value.filter((c) => c.ativo).length);
const totalInativos = computed(() => custosFixos.value.filter((c) => !c.ativo).length);

// Filtro em memória
const custosFixosFiltrados = computed(() => {
  return custosFixos.value.filter((custo) => {
    const nomeNormalizado = custo.nome.toLowerCase();
    const termoBusca = filtroNome.value ? filtroNome.value.toLowerCase().trim() : '';
    const bateNome = !termoBusca || nomeNormalizado.includes(termoBusca);

    const bateStatus =
      filtroStatus.value === 'todos' ||
      (filtroStatus.value === 'ativos' && custo.ativo) ||
      (filtroStatus.value === 'inativos' && !custo.ativo);

    return bateNome && bateStatus;
  });
});

async function carregarDados() {
  loading.value = true;
  try {
    const res = await service.obterTodos();
    custosFixos.value = res || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function atualizarStatusLocal(custoAtualizado: CustoFixoResult) {
  const index = custosFixos.value.findIndex((c) => c.id === custoAtualizado.id);
  if (index !== -1) {
    custosFixos.value[index] = custoAtualizado;
  }
}

function abrirModalCriar() {
  modalCriarAberto.value = true;
}

async function criarCustoFixo(dto: CustoFixoCreate) {
  try {
    await service.criar(dto);
    modalCriarAberto.value = false;
    $q.notify({
      type: 'positive',
      message: 'Custo fixo criado com sucesso! 🎯',
      position: 'top-right',
    });
    carregarDados();
  } catch {
    notificarErro('Erro ao criar o custo fixo. Verifique os campos.');
  }
}

function abrirModalEditar(custo: CustoFixoResult) {
  custoSelecionado.value = custo;
  modalEditarAberto.value = true;
}

function abrirModalCadastrarDespesa(custo: CustoFixoResult) {
  custoSelecionado.value = custo;
  dadosIniciaisDespesa.value = {
    descricao: custo.nome,
    categoriaId: custo.categoriaId,
    categoriaNome: custo.categoriaNome,
  };
  modalDespesaAberto.value = true;
}

function fecharModalDespesa() {
  modalDespesaAberto.value = false;
  dadosIniciaisDespesa.value = undefined;
  custoSelecionado.value = null;
}

async function cadastrarDespesa(despesa: DespesaCreate) {
  try {
    despesa.ano = useGerenciamentoMensal.mesAtual.ano;
    despesa.mes = useGerenciamentoMensal.mesAtual.mes;

    await despesaService.create(despesa);
    fecharModalDespesa();
    $q.notify({
      type: 'positive',
      message: 'Despesa cadastrada com sucesso! 🎯',
      position: 'top-right',
    });
  } catch {
    notificarErro('Erro ao cadastrar despesa a partir do custo fixo. Verifique os campos.');
  }
}

async function atualizarCustoFixo(dto: UpdateCustoFixoDTO) {
  try {
    await service.atualizar(dto);
    modalEditarAberto.value = false;
    $q.notify({
      type: 'positive',
      message: 'Custo fixo atualizado com sucesso! 🎯',
      position: 'top-right',
    });
    carregarDados();
  } catch {
    notificarErro('Erro ao atualizar o custo fixo. Verifique os campos.');
  }
}

function excluirCustoFixo(id: string) {
  $q.dialog({
    title: 'Excluir Custo Fixo',
    message: 'Deseja realmente excluir este custo fixo?',
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
    void (async () => {
      try {
        await service.excluir(id);
        $q.notify({
          type: 'positive',
          message: 'Custo fixo excluído com sucesso! 🎯',
          position: 'top-right',
        });
        await carregarDados();
      } catch (error) {
        // Tratos automáticos do AxiosHelper
      }
    })();
  });
}
</script>

<style lang="scss" scoped>
.custos-page {
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 16px !important;
  }
}



.custos-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  width: 100%;

  @media (max-width: 650px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.custos-empty,
.text-busca-vazia {
  margin-top: 80px;
}

.skeleton-card {
  border-radius: 16px;
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
      grid-template-columns: repeat(3, minmax(0, 1fr));
      width: 100%;
    }

    :deep(.q-btn) {
      min-width: 0;
      width: 100%;
      padding-left: 4px;
      padding-right: 4px;
    }
  }

  @media (max-width: 380px) {
    :deep(.q-btn-group) {
      grid-template-columns: 1fr;
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

  @media (max-width: 380px) {
    justify-content: flex-start;
    padding: 0 12px;
  }
}

.border-sutil {
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  .body--dark & {
    border-color: rgba(255, 255, 255, 0.12) !important;
  }
}

.badge-contador {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

/* Transições com TransitionGroup */
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
