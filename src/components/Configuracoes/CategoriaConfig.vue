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
            class="text-grey"
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

  <!-- modal Cadastro Categoria -->
  <q-dialog v-model="openModalCreateCategoria">
    <q-card style="width: 330px" class="rounded-borders-xl">
      <q-form @submit="criarCategoria">
        <q-card-section>
          <section class="q-mb-md">
            <span class="text-subtitle1 text-weight-bold">Nova Categoria</span>
          </section>
          <q-input
            filled
            v-model="categoriaCreate.nome"
            label="Nome"
            autogrow
            :rules="[(val:any) => (val && val.length > 0) || 'Nome é obrigatório!']"
            class="q-mb-sm"
          />
          <div
            class="q-pa-sm rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
          >
            <div class="text-caption text-weight-medium q-mb-xs">Tipo da Categoria:</div>
            <q-option-group
              v-model="categoriaCreate.tipo"
              :options="options"
              color="primary"
              right-label
            />
          </div>
        </q-card-section>
        <q-card-actions align="between" class="q-px-md q-pb-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
          <q-btn label="Fechar" no-caps flat dense v-close-popup color="grey-7" />
          <q-btn unelevated no-caps label="Adicionar" type="submit" color="primary" :loading="loading" style="border-radius: 8px;" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import type { CategoriaResult, CreateCategoriaDTO } from 'src/Model/Categoria';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import obterCategoriaService from 'src/services/CategoriaService';
import BannerModoCompartilhado from 'src/components/Compartilhamento/BannerModoCompartilhado.vue';
import { onMounted, ref } from 'vue';

// Variaveis
const categoriaService = obterCategoriaService();
const categorias = ref<CategoriaResult[]>();
const $q = useQuasar();
const openModalCreateCategoria = ref(false);
const loading = ref(false);
const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
const categoriaCreate = ref<CreateCategoriaDTO>({
  nome: '',
  tipo: tipoCategoriaSelecionada.value,
});
const filter = ref('');

const options = [
  {
    label: 'Rendimentos',
    value: TipoCategoriaETransacao.Rendimento,
  },
  {
    label: 'Despesas',
    value: TipoCategoriaETransacao.Despesa,
  },
  {
    label: 'Investimentos',
    value: TipoCategoriaETransacao.Investimento,
  },
];

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

async function criarCategoria() {
  await categoriaService.adicionar(categoriaCreate.value);
  tipoCategoriaSelecionada.value = categoriaCreate.value.tipo;
  categoriaCreate.value.nome = '';
  openModalCreateCategoria.value = false;
  await obterCategorias();
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

function modalEditarCategoria(categoria: CategoriaResult) {
  $q.dialog({
    title: 'Editar categoria',
    prompt: {
      model: categoria.nome,
      type: 'text',
      isValid: (val) => val != null && val.length > 0,
    },
    cancel: true,
    persistent: false,
  }).onOk((nomeNovo: string) => {
    if (nomeNovo === categoria.nome) return;
    categoriaService
      .atualizar({
        id: categoria.id,
        nome: nomeNovo,
      })
      .then((catecoriaResult: CategoriaResult) => {
        categoria.nome = catecoriaResult.nome;
      });
  });
}

function openModalCriarCategoria() {
  categoriaCreate.value.tipo = tipoCategoriaSelecionada.value;
  openModalCreateCategoria.value = true;
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
</style>
