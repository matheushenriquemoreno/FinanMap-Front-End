import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import getCustoFixoService from 'src/services/CustoFixoService';
import getDespesaService from 'src/services/transacao/DespesaService';
import type { CustoFixoResult, CustoFixoCreate, UpdateCustoFixoDTO } from 'src/Model/CustoFixo';
import type { DespesaCreate, LancarDespesaLoteDTO } from 'src/Model/Transacao';
import { notificarErro } from 'src/helpers/Notificacao';

interface DadosIniciaisDespesa {
  descricao?: string | undefined;
  categoriaId?: string | undefined;
  categoriaNome?: string | undefined;
}

export function useCustosFixosPage() {
  const $q = useQuasar();
  const router = useRouter();
  const compartilhamentoStore = useCompartilhamentoStore();
  const gerenciamentoMensalStore = useGerenciamentoMensalStore();
  const service = getCustoFixoService();
  const despesaService = getDespesaService();

  const custosFixos = ref<CustoFixoResult[]>([]);
  const loading = ref(false);
  const modalCriarAberto = ref(false);
  const modalEditarAberto = ref(false);
  const modalDespesaAberto = ref(false);
  const custoSelecionado = ref<CustoFixoResult | null>(null);
  const dadosIniciaisDespesa = ref<DadosIniciaisDespesa>();
  const filtroNome = ref('');
  const filtroStatus = ref<'todos' | 'ativos' | 'inativos'>('todos');

  const totalCustos = computed(() => custosFixos.value.length);
  const totalAtivos = computed(() => custosFixos.value.filter((custo) => custo.ativo).length);
  const totalInativos = computed(() => custosFixos.value.filter((custo) => !custo.ativo).length);
  const custosFixosFiltrados = computed(() =>
    custosFixos.value.filter((custo) => {
      const termoBusca = filtroNome.value.toLowerCase().trim();
      const bateNome = !termoBusca || custo.nome.toLowerCase().includes(termoBusca);
      const bateStatus =
        filtroStatus.value === 'todos' ||
        (filtroStatus.value === 'ativos' && custo.ativo) ||
        (filtroStatus.value === 'inativos' && !custo.ativo);
      return bateNome && bateStatus;
    }),
  );

  function verificarModoCompartilhado() {
    if (compartilhamentoStore.emModoCompartilhado) void router.replace('/');
  }

  async function carregarDados() {
    loading.value = true;
    try {
      custosFixos.value = (await service.obterTodos()) || [];
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    verificarModoCompartilhado();
    void carregarDados();
  });

  watch(
    () => compartilhamentoStore.emModoCompartilhado,
    (emModoCompartilhado) => {
      if (emModoCompartilhado) verificarModoCompartilhado();
    },
  );

  function atualizarStatusLocal(custoAtualizado: CustoFixoResult) {
    const index = custosFixos.value.findIndex((custo) => custo.id === custoAtualizado.id);
    if (index !== -1) custosFixos.value[index] = custoAtualizado;
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
      await carregarDados();
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
      despesa.ano = gerenciamentoMensalStore.mesAtual.ano;
      despesa.mes = gerenciamentoMensalStore.mesAtual.mes;
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

  async function cadastrarDespesaEmLote(despesaLote: LancarDespesaLoteDTO) {
    try {
      await despesaService.criarEmLote(despesaLote);
      fecharModalDespesa();
      $q.notify({
        type: 'positive',
        message: 'Despesas cadastradas com sucesso!',
        position: 'top-right',
      });
    } catch {
      notificarErro(
        'Erro ao cadastrar despesas em lote a partir do custo fixo. Verifique os campos.',
      );
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
      await carregarDados();
    } catch {
      notificarErro('Erro ao atualizar o custo fixo. Verifique os campos.');
    }
  }

  function excluirCustoFixo(id: string) {
    $q.dialog({
      title: 'Excluir Custo Fixo',
      message: 'Deseja realmente excluir este custo fixo?',
      persistent: false,
      ok: { flat: true, color: 'negative', label: 'Excluir' },
      cancel: { flat: true, color: 'primary', label: 'Cancelar' },
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
        } catch {
          // O interceptor HTTP apresenta o erro ao usuário.
        }
      })();
    });
  }

  return {
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
    useGerenciamentoMensal: gerenciamentoMensalStore,
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
  };
}
