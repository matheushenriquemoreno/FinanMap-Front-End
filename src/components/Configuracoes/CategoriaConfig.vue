<template>
  <div class="categoria-principal column full-height">
    <!-- Header / Description -->
    <div class="q-mb-md">
      <p class="descricao q-mt-sm q-mb-none">
        A categorização é essencial para organizar e classificar nossos gastos diários,
        proporcionando uma visão clara e estruturada das despesas.
      </p>
    </div>

    <!-- Controls Toolbar -->
    <div class="row items-center q-mb-md justify-between wrap q-gutter-y-sm">
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

    <!-- Table -->
    <div class="col">
      <q-table
        flat
        :rows="categorias || []"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 7 }"
        :filter="filter"
        no-data-label="Nenhuma categoria encontrada"
        class="sticky-header-table"
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
                @click="() => modalEditarCategoria(props.row)"
              />
              <q-btn
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click="() => excluirCategoria(props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>

  <!-- modal Cadastro Categoria -->
  <q-dialog v-model="openModalCreateCategoria">
    <q-card style="width: 330px">
      <q-form @submit="criarCategoria">
        <q-card-section>
          <section class="q-mb-sm">
            <span class="text-subtitle1">Nova categoria</span>
          </section>
          <q-input
            filled
            v-model="categoriaCreate.nome"
            label="Nome"
            autogrow
            :rules="[(val:any) => (val && val.length > 0) || 'Nome é obrigatório!']"
          />
          <div
            class="q-pa-sm rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
          >
            Tipo da Categoria:
            <q-option-group
              v-model="categoriaCreate.tipo"
              :options="options"
              color="primary"
              right-label
            />
          </div>
        </q-card-section>
        <q-card-actions align="between" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
          <q-btn label="Fechar" no-caps flat dense v-close-popup />
          <q-btn flat no-caps label="Adicionar" type="submit" :loading="loading" />
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
/* Conteúdo principal */
.categoria-principal {
  flex: 1;
  overflow-y: auto;
}

.categoria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.categoria-titulo {
  font-size: 22px;
  font-weight: 500;
  color: var(--text-primary);
}

.descricao {
  color: var(--text-secondary);
}

.tabela-header {
  color: var(--text-primary);
}
</style>
