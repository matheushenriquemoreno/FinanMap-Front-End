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
          label="Pesquisar custos fixos"
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
                :color="filtroStatus === 'todos' ? 'white' : $q.dark.isActive ? 'grey-8' : 'grey-3'"
                :text-color="
                  filtroStatus === 'todos' ? 'primary' : $q.dark.isActive ? 'grey-3' : 'grey-8'
                "
                class="q-ml-xs text-bold badge-contador"
              >
                {{ totalCustos }}
              </q-badge>
            </div>
          </template>

          <template v-slot:ativos>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon
                name="check_circle"
                class="q-mr-xs"
                size="18px"
                :color="filtroStatus === 'ativos' ? 'white' : 'green'"
              />
              <span>Ativos</span>
              <q-badge
                :color="
                  filtroStatus === 'ativos' ? 'white' : $q.dark.isActive ? 'grey-8' : 'grey-3'
                "
                :text-color="
                  filtroStatus === 'ativos' ? 'green-9' : $q.dark.isActive ? 'grey-3' : 'grey-8'
                "
                class="q-ml-xs text-bold badge-contador"
              >
                {{ totalAtivos }}
              </q-badge>
            </div>
          </template>

          <template v-slot:inativos>
            <div class="status-toggle-option row items-center q-px-sm">
              <q-icon
                name="unpublished"
                class="q-mr-xs"
                size="18px"
                :color="filtroStatus === 'inativos' ? 'white' : 'red'"
              />
              <span>Inativos</span>
              <q-badge
                :color="
                  filtroStatus === 'inativos' ? 'white' : $q.dark.isActive ? 'grey-8' : 'grey-3'
                "
                :text-color="
                  filtroStatus === 'inativos' ? 'red-9' : $q.dark.isActive ? 'grey-3' : 'grey-8'
                "
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
      titulo-add="Cadastrar despesa apartir do custo fixo"
      titulo-edit="Editar Despesa"
      label-submit-add="Cadastrar"
      :dados-iniciais="dadosIniciaisDespesa"
      :loading="despesaService.loading.value"
      :ano="useGerenciamentoMensal.mesAtual.ano"
      :mes="useGerenciamentoMensal.mesAtual.mes"
      @on-submit-add="cadastrarDespesa"
      @on-submit-add-lote="cadastrarDespesaEmLote"
      @close-modal="fecharModalDespesa"
    />
  </q-page>
</template>

<script setup lang="ts">
import PageHeaderBanner from 'src/components/PageHeaderBanner.vue';
import CustoFixoCard from 'src/components/CustosFixos/CustoFixoCard.vue';
import ModalCriarCustoFixo from 'src/components/CustosFixos/ModalCriarCustoFixo.vue';
import ModalEditarCustoFixo from 'src/components/CustosFixos/ModalEditarCustoFixo.vue';
import ModalDespesa from 'src/components/Despesa/ModalCreateUpdateDespesa.vue';
import { useCustosFixosPage } from 'src/composables/useCustosFixosPage';

const {
  $q,
  custosFixos,
  loading,
  modalCriarAberto,
  modalEditarAberto,
  modalDespesaAberto,
  custoSelecionado,
  dadosIniciaisDespesa,
  filtroNome,
  filtroStatus,
  totalCustos,
  totalAtivos,
  totalInativos,
  custosFixosFiltrados,
  despesaService,
  useGerenciamentoMensal,
  atualizarStatusLocal,
  abrirModalCriar,
  criarCustoFixo,
  abrirModalEditar,
  abrirModalCadastrarDespesa,
  fecharModalDespesa,
  cadastrarDespesa,
  cadastrarDespesaEmLote,
  atualizarCustoFixo,
  excluirCustoFixo,
} = useCustosFixosPage();
</script>

<style lang="scss" scoped src="./CustosFixosPage.styles.scss"></style>
