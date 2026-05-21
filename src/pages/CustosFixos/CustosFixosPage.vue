<template>
  <q-page class="custos-page q-pa-lg">
    <!-- ===== HEADER ===== -->
    <div class="custos-header q-mb-lg">
      <div class="custos-header__info">
        <q-icon name="receipt_long" size="40px" color="white" />
        <div>
          <h4 class="text-h4 text-bold text-white q-mb-none" style="line-height: 1;">Custos Fixos</h4>
          <span class="text-subtitle1 text-white-70">Gerencie seus compromissos financeiros recorrentes</span>
        </div>
      </div>
      <q-btn color="white" text-color="primary" icon="add" label="Novo Custo Fixo" rounded unelevated
        @click="abrirModalCriar" />
    </div>

    <!-- ===== LISTAGEM DE CUSTOS FIXOS ===== -->
    <div class="custos-grid q-mt-lg" v-if="custosFixos.length > 0 || loading">
      <template v-if="loading">
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
      </template>

      <template v-else>
        <CustoFixoCard
          v-for="custo in custosFixos"
          :key="custo.id"
          :custo="custo"
          @excluir="excluirCustoFixo"
          @editar="abrirModalEditar"
          @status-alterado="carregarDados"
        />
      </template>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && custosFixos.length === 0" class="custos-empty text-center q-pa-xl">
      <q-icon name="receipt_long" size="80px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">Nenhum custo fixo cadastrado ainda</p>
      <p class="text-body2 text-grey-5">Clique em "Novo Custo Fixo" para registrar suas despesas recorrentes!</p>
    </div>

    <!-- ===== MODAIS ===== -->
    <ModalCriarCustoFixo v-model="modalCriarAberto" @criar="criarCustoFixo" />
    <ModalEditarCustoFixo v-model="modalEditarAberto" :custo="custoSelecionado" @salvar="atualizarCustoFixo" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import getCustoFixoService from 'src/services/CustoFixoService';
import type { CustoFixoResult, CustoFixoCreate, UpdateCustoFixoDTO } from 'src/Model/CustoFixo';
import CustoFixoCard from 'src/components/CustosFixos/CustoFixoCard.vue';
import ModalCriarCustoFixo from 'src/components/CustosFixos/ModalCriarCustoFixo.vue';
import ModalEditarCustoFixo from 'src/components/CustosFixos/ModalEditarCustoFixo.vue';
import { notificarErro } from 'src/helpers/Notificacao';

const $q = useQuasar();
const service = getCustoFixoService();

const custosFixos = ref<CustoFixoResult[]>([]);
const loading = ref(false);
const modalCriarAberto = ref(false);
const modalEditarAberto = ref(false);
const custoSelecionado = ref<CustoFixoResult | null>(null);

onMounted(() => {
  carregarDados();
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
    $q.notify({ type: 'positive', message: 'Custo fixo criado com sucesso! 🎯' });
    carregarDados();
  } catch (error: any) {
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
    $q.notify({ type: 'positive', message: 'Custo fixo atualizado com sucesso! 🎯' });
    carregarDados();
  } catch (error: any) {
    notificarErro('Erro ao atualizar o custo fixo. Verifique os campos.');
  }
}

function excluirCustoFixo(id: string) {
  $q.dialog({
    title: 'Excluir Custo Fixo',
    message: 'Deseja realmente excluir este custo fixo?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    void (async () => {
      try {
        await service.excluir(id);
        $q.notify({ type: 'positive', message: 'Custo fixo excluído com sucesso!' });
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
    align-items: flex-start;
    gap: 16px;
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

.custos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.custos-empty {
  margin-top: 80px;
}

.skeleton-card {
  border-radius: 16px;
}
</style>
