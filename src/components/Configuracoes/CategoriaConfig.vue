<template>
  <div class="categoria-principal">
    <div class="categoria-header row">
      <div class="col-md-10 col-xs-12">
        <h2 class="categoria-titulo">Categorias</h2>
        <p class="descricao">
          A categorização é essencial para organizar e classificar nossos gastos diários,
          proporcionando uma visão clara e estruturada das despesas, facilitando o controle
          financeiro e a tomada de decisões.
        </p>
      </div>
      <div class="col-md-2 col-xs-12 text-right">
        <q-btn
          color="secondary"
          label="Criar Nova"
          no-caps
          icon="add"
          size="13px"
          dense
          flat
          @click="openModalCriarCategoria"
        />
      </div>
    </div>

    <q-separator />
    <div class="categorias-container">
      <div class="q-pa-sm">
        <div class="tabela-header">Tipo da categoria</div>
        <q-option-group
          v-model="tipoCategoriaSelecionada"
          :options="options"
          color="primary"
          inline
          @update:model-value="() => obterCategorias()"
        />
      </div>
      <div v-if="loading" class="q-pa-md"><q-spinner color="primary" /> Carregando...</div>
      <div v-else-if="categorias?.length === 0" class="q-pa-md">
        <q-badge color="grey" rounded class="q-mr-sm" />Nenhuma categoria ainda não foi cadastrada.
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="categoria in categorias" :key="categoria.id">
          <q-item-section avatar top>
            <q-icon
              :name="obterIconeCategoria(categoria.tipo).icone"
              :color="obterIconeCategoria(categoria.tipo).cor"
              size="34px"
            />
          </q-item-section>

          <q-item-section top class="col-2 gt-sm">
            <q-item-label class="q-mt-sm">{{
              obterIconeCategoria(categoria.tipo).descricao
            }}</q-item-label>
          </q-item-section>

          <q-item-section center>
            <q-item-label lines="2" class="text-center"> {{ categoria.nome }} </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="edit"
                @click="() => modalEditarCategoria(categoria)"
              />

              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click="() => excluirCategoria(categoria)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
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
            :rules="[(val) => (val && val.length > 0) || 'Nome é obrigatório!']"
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
        <q-card-actions align="between" class="bg-white text-teal">
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
}
</style>
