import { computed, onMounted, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import type { CategoriaResult, CreateCategoriaDTO } from 'src/Model/Categoria';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import obterCategoriaService from 'src/services/CategoriaService';

export function useCategoriaConfig() {
  const $q = useQuasar();
  const categoriaService = obterCategoriaService();
  const categorias = ref<CategoriaResult[]>();
  const openModalCategoria = ref(false);
  const categoriaEmEdicao = ref<CategoriaResult>();
  const loading = ref(false);
  const modalLoading = ref(false);
  const tipoCategoriaSelecionada = ref(TipoCategoriaETransacao.Rendimento);
  const categoriaForm = ref<CreateCategoriaDTO>({ nome: '', tipo: tipoCategoriaSelecionada.value });
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
  const modalEdicao = computed(() => Boolean(categoriaEmEdicao.value));
  const columns: QTableColumn<CategoriaResult>[] = [
    { name: 'tipo', required: true, label: 'Tipo', align: 'left', field: 'tipo', sortable: true },
    { name: 'nome', required: true, label: 'Nome', align: 'left', field: 'nome', sortable: true },
    { name: 'actions', label: 'Ações', field: () => 'actions', align: 'right' },
  ];

  async function obterCategorias() {
    loading.value = true;
    try {
      categorias.value = await categoriaService.obterCategoria(tipoCategoriaSelecionada.value);
    } finally {
      window.setTimeout(() => {
        loading.value = false;
      }, 500);
    }
  }

  onMounted(() => void obterCategorias());

  async function salvarCategoria() {
    modalLoading.value = true;
    try {
      if (categoriaEmEdicao.value) {
        const atualizada = await categoriaService.atualizar({
          id: categoriaEmEdicao.value.id,
          nome: categoriaForm.value.nome.trim(),
        });
        categoriaEmEdicao.value.nome = atualizada.nome;
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
      void categoriaService.excluir(categoria.id).then(obterCategorias);
    });
  }

  function obterIconeCategoria(tipo: TipoCategoriaETransacao) {
    switch (tipo) {
      case TipoCategoriaETransacao.Despesa:
        return { icone: 'sell', cor: 'red', descricao: 'Despesa' };
      case TipoCategoriaETransacao.Investimento:
        return { icone: 'timeline', cor: 'green', descricao: 'Investimento' };
      case TipoCategoriaETransacao.Rendimento:
        return { icone: 'sell', cor: 'green', descricao: 'Rendimento' };
      default:
        throw new Error('Tipo de categoria não encontrado!');
    }
  }

  function selecionarTipoCategoria(tipo: TipoCategoriaETransacao) {
    if (!modalEdicao.value) categoriaForm.value.tipo = tipo;
  }

  function modalEditarCategoria(categoria: CategoriaResult) {
    categoriaEmEdicao.value = categoria;
    categoriaForm.value = { nome: categoria.nome, tipo: categoria.tipo };
    openModalCategoria.value = true;
  }

  function openModalCriarCategoria() {
    categoriaEmEdicao.value = undefined;
    categoriaForm.value = { nome: '', tipo: tipoCategoriaSelecionada.value };
    openModalCategoria.value = true;
  }

  function resetarFormularioCategoria() {
    categoriaEmEdicao.value = undefined;
    categoriaForm.value = { nome: '', tipo: tipoCategoriaSelecionada.value };
  }

  return {
    $q,
    categorias,
    openModalCategoria,
    categoriaEmEdicao,
    loading,
    modalLoading,
    tipoCategoriaSelecionada,
    categoriaForm,
    filter,
    categoryOptions,
    options,
    modalEdicao,
    columns,
    obterCategorias,
    salvarCategoria,
    excluirCategoria,
    obterIconeCategoria,
    selecionarTipoCategoria,
    modalEditarCategoria,
    openModalCriarCategoria,
    resetarFormularioCategoria,
  };
}
