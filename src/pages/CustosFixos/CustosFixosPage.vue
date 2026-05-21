<template>
  <q-page class="custos-page q-pa-lg">
    <!-- ===== HEADER ===== -->
    <div class="custos-header q-mb-lg">
      <div class="custos-header__info">
        <q-icon name="receipt_long" size="40px" color="white" />
        <div>
          <h4 class="text-h4 text-bold text-white q-mb-none" style="line-height: 1">
            Custos Fixos
          </h4>
          <span class="text-subtitle1 text-white-70"
            >Gerencie seus compromissos financeiros recorrentes</span
          >
        </div>
      </div>
      <q-btn
        color="white"
        text-color="primary"
        icon="add"
        label="Novo Custo Fixo"
        rounded
        unelevated
        @click="abrirModalCriar"
      />
    </div>

    <!-- ===== FILTROS ===== -->
    <div class="row q-col-gutter-md q-mb-lg items-center" v-if="custosFixos.length > 0">
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
      <div class="col-12 col-sm-6 flex justify-end-sm">
        <q-btn-toggle
          v-model="filtroStatus"
          toggle-color="primary"
          color="grey-2"
          text-color="grey-7"
          toggle-text-color="white"
          unelevated
          rounded
          dense
          class="status-toggle"
          :options="[
            { label: 'Todos', value: 'todos' },
            { label: 'Ativos', value: 'ativos' },
            { label: 'Inativos', value: 'inativos' },
          ]"
        />
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
            @status-alterado="carregarDados"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import getCustoFixoService from 'src/services/CustoFixoService';
import type { CustoFixoResult, CustoFixoCreate, UpdateCustoFixoDTO } from 'src/Model/CustoFixo';
import CustoFixoCard from 'src/components/CustosFixos/CustoFixoCard.vue';
import ModalCriarCustoFixo from 'src/components/CustosFixos/ModalCriarCustoFixo.vue';
import ModalEditarCustoFixo from 'src/components/CustosFixos/ModalEditarCustoFixo.vue';
import { notificarErro } from 'src/helpers/Notificacao';

const $q = useQuasar();
const router = useRouter();
const compartilhamentoStore = useCompartilhamentoStore();
const service = getCustoFixoService();

const custosFixos = ref<CustoFixoResult[]>([]);
const loading = ref(false);
const modalCriarAberto = ref(false);
const modalEditarAberto = ref(false);
const custoSelecionado = ref<CustoFixoResult | null>(null);

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

.custos-header {
  background: linear-gradient(135deg, #1a237e 0%, #4a148c 100%);
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
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

.flex.justify-end-sm {
  @media (min-width: 600px) {
    display: flex;
    justify-content: flex-end;
  }
}

.status-toggle {
  @media (max-width: 599px) {
    width: 100%;
    :deep(.q-btn) {
      flex: 1;
    }
  }
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
