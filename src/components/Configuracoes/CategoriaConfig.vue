<template>
  <div class="categoria-principal column full-height">
    <!-- Cabeçalho Padronizado -->
    <div class="q-mb-md flex items-center q-gutter-x-sm">
      <q-avatar color="primary" text-color="white" icon="category" size="48px" font-size="24px" />
      <div>
        <div class="text-h5 text-weight-bold">Categorias</div>
        <div class="text-caption text-grey-7">
          Gerencie as categorias de rendimentos, despesas e investimentos para classificar seu orçamento.
        </div>
      </div>
    </div>

    <!-- Banner Modo Compartilhado -->
    <BannerModoCompartilhado class="q-mb-md" />

    <!-- Card de Conteúdo -->
    <q-card flat bordered class="rounded-borders-xl shadow-1 col column overflow-hidden">
      <q-card-section class="q-pa-md">
        <!-- Controls Toolbar -->
        <div class="row items-center justify-between wrap q-gutter-y-sm">
          <!-- Tabs for Category Type -->
          <q-tabs
            v-model="tipoCategoriaSelecionada"
            dense
            class="categoria-tabs"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            @update:model-value="() => obterCategorias()"
          >
            <q-tab
              v-for="opt in options"
              :key="opt.value"
              :name="opt.value"
              :label="opt.label"
              class="text-weight-bold"
              no-caps
            />
          </q-tabs>

          <!-- Actions -->
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="filter"
              dense
              outlined
              placeholder="Pesquisar"
              class="rounded-borders"
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
              :dark="$q.dark.isActive"
              style="min-width: 200px"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              label="Criar Nova"
              no-caps
              icon="add"
              unelevated
              @click="openModalCriarCategoria"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Table Section -->
      <div class="col overflow-auto">
        <q-table
          flat
          :rows="categorias || []"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 7 }"
          :filter="filter"
          no-data-label="Nenhuma categoria encontrada"
          class="sticky-header-table no-border"
          :card-class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props" auto-width>
              <q-icon
                :name="obterIconeCategoria(props.value).icone"
                :color="obterIconeCategoria(props.value).cor"
                size="24px"
              />
              <span class="q-ml-sm">{{ obterIconeCategoria(props.value).descricao }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" auto-width>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  size="12px"
                  flat
                  dense
                  round
                  icon="edit"
                  :color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
                  @click="() => modalEditarCategoria(props.row)"
                />
                <q-btn
                  size="12px"
                  flat
                  dense
                  round
                  icon="delete"
                  :color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
                  @click="() => excluirCategoria(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>
  </div>

  <!-- Modal de cadastro e edição de categoria -->
  <q-dialog v-model="openModalCategoria" @hide="resetarFormularioCategoria">
    <q-card class="categoria-modal">
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6 text-bold">
            {{ modalEdicao ? 'Editar categoria' : 'Criar nova categoria' }}
          </div>
          <div class="text-caption text-grey-7">
            {{
              modalEdicao
                ? 'Altere o nome da categoria selecionada.'
                : 'Adicione uma categoria para organizar seus lançamentos.'
            }}
          </div>
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" aria-label="Fechar modal" />
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit="salvarCategoria">
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs block">Nome da categoria</label>
            <q-input
              v-model="categoriaForm.nome"
              outlined
              rounded
              dense
              autofocus
              maxlength="60"
              placeholder="Ex: Salário, Mercado, Reserva"
              :rules="[(val: string) => !!val?.trim() || 'Informe o nome da categoria']"
            >
              <template #prepend>
                <q-icon name="label_outline" size="20px" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="row items-center justify-between q-mb-sm">
              <label class="text-subtitle2 text-bold">Tipo da categoria</label>
              <span v-if="modalEdicao" class="text-caption text-grey-7">Não pode ser alterado</span>
            </div>

            <div class="categoria-type-grid">
              <div
                v-for="option in categoryOptions"
                :key="option.value"
                class="categoria-type-option"
                :class="{
                  'categoria-type-option--selected': categoriaForm.tipo === option.value,
                  'categoria-type-option--disabled': modalEdicao,
                }"
                role="button"
                tabindex="0"
                :aria-pressed="categoriaForm.tipo === option.value"
                :aria-disabled="modalEdicao"
                @click="selecionarTipoCategoria(option.value)"
                @keydown.enter="selecionarTipoCategoria(option.value)"
                @keydown.space.prevent="selecionarTipoCategoria(option.value)"
              >
                <q-icon :name="option.icone" :color="option.cor" size="24px" />
                <span class="text-caption text-weight-medium">{{ option.label }}</span>
                <span
                  v-if="categoriaForm.tipo === option.value"
                  class="categoria-type-option__check"
                >
                  <q-icon name="check" color="white" size="13px" />
                </span>
              </div>
            </div>
          </div>

          <div class="categoria-modal__actions row justify-end q-gutter-sm q-mt-lg">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="grey-7" />
            <q-btn
              unelevated
              rounded
              no-caps
              type="submit"
              color="primary"
              :icon="modalEdicao ? 'save' : 'add'"
              :label="modalEdicao ? 'Salvar' : 'Criar categoria'"
              :loading="modalLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import type { CategoriaResult, CreateCategoriaDTO } from 'src/Model/Categoria';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import obterCategoriaService from 'src/services/CategoriaService';
import BannerModoCompartilhado from 'src/components/Compartilhamento/BannerModoCompartilhado.vue';
import { computed, onMounted, ref } from 'vue';

// Variaveis
const categoriaService = obterCategoriaService();
const categorias = ref<CategoriaResult[]>();
const $q = useQuasar();
const openModalCategoria = ref(false);
const categoriaEmEdicao = ref<CategoriaResult>();
const loading = ref(false);
const modalLoading = ref(false);
const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
const categoriaForm = ref<CreateCategoriaDTO>({
  nome: '',
  tipo: tipoCategoriaSelecionada.value,
});
const filter = ref('');

const categoryOptions = [
  {
    label: 'Rendimentos',
    value: TipoCategoriaETransacao.Rendimento,
    icone: 'trending_up',
    cor: 'green',
  },
  {
    label: 'Despesas',
    value: TipoCategoriaETransacao.Despesa,
    icone: 'trending_down',
    cor: 'red',
  },
  {
    label: 'Investimentos',
    value: TipoCategoriaETransacao.Investimento,
    icone: 'show_chart',
    cor: 'primary',
  },
];

const options = categoryOptions.map(({ label, value }) => ({ label, value }));
const modalEdicao = computed(() => !!categoriaEmEdicao.value);

const columns: any[] = [
  {
    name: 'tipo',
    required: true,
    label: 'Tipo',
    align: 'left',
    field: 'tipo',
    sortable: true,
  },
  {
    name: 'nome',
    required: true,
    label: 'Nome',
    align: 'left',
    field: 'nome',
    sortable: true,
  },
  { name: 'actions', label: 'Ações', field: 'actions', align: 'right' },
];

onMounted(async () => {
  await obterCategorias();
});

async function obterCategorias() {
  loading.value = true;
  try {
    const result = await categoriaService.obterCategoria(tipoCategoriaSelecionada.value);
    categorias.value = result;
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
}

async function salvarCategoria() {
  modalLoading.value = true;
  try {
    if (categoriaEmEdicao.value) {
      const categoriaAtualizada = await categoriaService.atualizar({
        id: categoriaEmEdicao.value.id,
        nome: categoriaForm.value.nome.trim(),
      });
      categoriaEmEdicao.value.nome = categoriaAtualizada.nome;
    } else {
      await categoriaService.adicionar({
        nome: categoriaForm.value.nome.trim(),
        tipo: categoriaForm.value.tipo,
      });
      tipoCategoriaSelecionada.value = categoriaForm.value.tipo;
      await obterCategorias();
    }

    openModalCategoria.value = false;
  } finally {
    modalLoading.value = false;
  }
}

function excluirCategoria(categoria: CategoriaResult) {
  $q.dialog({
    message: `Deseja realmente excluir a categoria <b>${categoria.nome}</b> ?`,
    cancel: true,
    html: true,
    persistent: false,
  }).onOk(() => {
    categoriaService.excluir(categoria.id).then(() => {
      obterCategorias();
    });
  });
}

function obterIconeCategoria(tipoCategoria: TipoCategoriaETransacao) {
  switch (tipoCategoria) {
    case TipoCategoriaETransacao.Despesa:
      return {
        icone: 'sell',
        cor: 'red',
        descricao: 'Despesa',
      };
    case TipoCategoriaETransacao.Investimento:
      return {
        icone: 'timeline',
        cor: 'green',
        descricao: 'Investimento',
      };
    case TipoCategoriaETransacao.Rendimento:
      return {
        icone: 'sell',
        cor: 'green',
        descricao: 'Rendimento',
      };
    default:
      throw new Error('Tipo de categoria não encontrado!');
  }
}

function selecionarTipoCategoria(tipo: TipoCategoriaETransacao) {
  if (!modalEdicao.value) {
    categoriaForm.value.tipo = tipo;
  }
}

function modalEditarCategoria(categoria: CategoriaResult) {
  categoriaEmEdicao.value = categoria;
  categoriaForm.value = {
    nome: categoria.nome,
    tipo: categoria.tipo,
  };
  openModalCategoria.value = true;
}

function openModalCriarCategoria() {
  categoriaEmEdicao.value = undefined;
  categoriaForm.value = {
    nome: '',
    tipo: tipoCategoriaSelecionada.value,
  };
  openModalCategoria.value = true;
}

function resetarFormularioCategoria() {
  categoriaEmEdicao.value = undefined;
  categoriaForm.value = {
    nome: '',
    tipo: tipoCategoriaSelecionada.value,
  };
}
</script>

<style scoped>
.categoria-principal {
  flex: 1;
  overflow-y: auto;
}

.rounded-borders-xl {
  border-radius: 16px;
}

.shadow-1 {
  transition: box-shadow 0.3s ease;
}

.shadow-1:hover {
  box-shadow: 0 6px 20px v-bind('$q.dark.isActive ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)"') !important;
}

.no-border {
  border: none !important;
}

.categoria-tabs {
  color: v-bind('$q.dark.isActive ? "white" : "black"');
}

.categoria-tabs :deep(.q-tab--inactive) {
  opacity: 1;
}

.block {
  display: block;
}

.categoria-modal {
  width: min(460px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  border-radius: 16px;
}

.categoria-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.categoria-type-option {
  position: relative;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 76px;
  padding: 10px 6px;
  flex-direction: column;
  color: inherit;
  font: inherit;
  text-align: center;
  cursor: pointer;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: all 0.2s;
}

.categoria-type-option:hover {
  background: rgba(0, 0, 0, 0.06);
}

.categoria-type-option--selected {
  background: rgba(29, 22, 156, 0.05);
  border-color: var(--q-primary);
}

.categoria-type-option--disabled {
  cursor: default;
}

.categoria-type-option--disabled:hover {
  background: transparent;
}

.categoria-type-option--disabled.categoria-type-option--selected:hover {
  background: rgba(29, 22, 156, 0.05);
}

.categoria-type-option__check {
  position: absolute;
  top: 7px;
  right: 7px;
  display: grid;
  width: 18px;
  height: 18px;
  background: var(--q-primary);
  border-radius: 50%;
  place-items: center;
}

:global(body.body--dark .categoria-type-option:hover) {
  background: rgba(255, 255, 255, 0.08);
}

:global(body.body--dark .categoria-type-option--selected),
:global(body.body--dark .categoria-type-option--disabled.categoria-type-option--selected:hover) {
  background: rgba(76, 68, 231, 0.16);
}

:global(body.body--dark .categoria-type-option--disabled:hover) {
  background: transparent;
}

@media (max-width: 480px) {
  .categoria-modal__actions {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 8px;
  }

  .categoria-modal__actions :deep(.q-btn) {
    width: 100%;
    margin-left: 0;
  }
}
</style>
