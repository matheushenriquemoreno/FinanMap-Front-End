import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import type {
  CategoriaDashboardModel,
  EvolucaoPeriodoModel,
  ResumoFinanceiroModel,
} from 'src/models/Dashboard';
import obterDashboardService from 'src/services/DashboardService';
import { createDashboardCategoryRegistry } from './dashboardCategoryRegistry.mjs';
import { createAsyncKeyedCache } from './dashboardRequestCache.mjs';
import { createDashboardSnapshotLoader } from './dashboardSnapshotLoader.mjs';

type CategoriasPorTipo = Partial<Record<TipoCategoriaETransacao, CategoriaDashboardModel[]>>;

type LoadingCategorias = Partial<Record<TipoCategoriaETransacao, boolean>>;

export const useDashboardStore = defineStore('dashboard', () => {
  const mesInicial = ref(new Date().getMonth() + 1);
  const anoInicial = ref(new Date().getFullYear());
  const mesFinal = ref(new Date().getMonth() + 1);
  const anoFinal = ref(new Date().getFullYear());

  const resumo = ref<ResumoFinanceiroModel | null>(null);
  const evolucao = ref<EvolucaoPeriodoModel[]>([]);
  const categoriasPorTipo = ref<CategoriasPorTipo>({});
  const loadingCategorias = ref<LoadingCategorias>({});
  const isLoading = ref(false);
  const erro = ref<string | null>(null);
  const periodoCarregado = ref<string | null>(null);

  const service = obterDashboardService();
  const categoryRegistry = createDashboardCategoryRegistry<
    TipoCategoriaETransacao,
    CategoriaDashboardModel[]
  >([TipoCategoriaETransacao.Rendimento, TipoCategoriaETransacao.Despesa]);
  const snapshotLoader = createDashboardSnapshotLoader<
    ResumoFinanceiroModel,
    EvolucaoPeriodoModel[],
    TipoCategoriaETransacao,
    CategoriaDashboardModel
  >({
    dashboardCache: createAsyncKeyedCache(),
    categoryCache: createAsyncKeyedCache<CategoriaDashboardModel[]>(),
    categoryRegistry,
    loadSummary: (inicio: string, fim: string) => service.obterResumo(inicio, fim),
    loadEvolution: (inicio: string, fim: string) => service.obterEvolucao(inicio, fim),
    loadCategories: (inicio: string, fim: string, tipo: TipoCategoriaETransacao) =>
      service.obterCategorias(inicio, fim, tipo),
  });
  let sequenciaRequisicao = 0;

  const dataInicial = computed(
    () => `${anoInicial.value}-${String(mesInicial.value).padStart(2, '0')}`,
  );
  const dataFinal = computed(() => `${anoFinal.value}-${String(mesFinal.value).padStart(2, '0')}`);
  const periodoAtual = computed(() => `${dataInicial.value}|${dataFinal.value}`);

  function setFiltros(
    novoMesInicial: number,
    novoAnoInicial: number,
    novoMesFinal: number,
    novoAnoFinal: number,
  ) {
    mesInicial.value = novoMesInicial;
    anoInicial.value = novoAnoInicial;
    mesFinal.value = novoMesFinal;
    anoFinal.value = novoAnoFinal;
  }

  function limparDadosDoPeriodoAnterior(chavePeriodo: string) {
    if (periodoCarregado.value === chavePeriodo) return;

    resumo.value = null;
    evolucao.value = [];
    categoriasPorTipo.value = {};
    loadingCategorias.value = {};
  }

  function aplicarSnapshot(
    chavePeriodo: string,
    snapshot: Awaited<ReturnType<typeof snapshotLoader.load>>,
  ) {
    resumo.value = snapshot.summary;
    evolucao.value = snapshot.evolution;
    categoriasPorTipo.value = { ...snapshot.categories };
    periodoCarregado.value = chavePeriodo;
  }

  function invalidarPeriodo(chavePeriodo: string) {
    snapshotLoader.invalidate(chavePeriodo);
  }

  async function carregarDashboard(force = false) {
    const inicio = dataInicial.value;
    const fim = dataFinal.value;
    const chavePeriodo = `${inicio}|${fim}`;

    if (force) invalidarPeriodo(chavePeriodo);

    const idRequisicao = ++sequenciaRequisicao;
    limparDadosDoPeriodoAnterior(chavePeriodo);
    isLoading.value = true;
    erro.value = null;

    try {
      const snapshot = await snapshotLoader.load(chavePeriodo, inicio, fim);

      if (idRequisicao !== sequenciaRequisicao || chavePeriodo !== periodoAtual.value) {
        return;
      }

      aplicarSnapshot(chavePeriodo, snapshot);
    } catch {
      if (idRequisicao === sequenciaRequisicao) {
        erro.value = 'Não foi possível carregar os dados do dashboard.';
      }
    } finally {
      if (idRequisicao === sequenciaRequisicao) {
        isLoading.value = false;
      }
    }
  }

  async function carregarCategorias(tipo: TipoCategoriaETransacao) {
    categoryRegistry.request(tipo);
    const inicio = dataInicial.value;
    const fim = dataFinal.value;
    const chavePeriodo = `${inicio}|${fim}`;
    if (categoriasPorTipo.value[tipo] !== undefined) return;

    loadingCategorias.value = { ...loadingCategorias.value, [tipo]: true };

    try {
      const dados = await snapshotLoader.loadCategory(chavePeriodo, inicio, fim, tipo);

      if (chavePeriodo === periodoAtual.value) {
        categoriasPorTipo.value = { ...categoriasPorTipo.value, [tipo]: dados };
      }
    } catch {
      if (chavePeriodo === periodoAtual.value) {
        erro.value = 'Não foi possível carregar as categorias do dashboard.';
      }
    } finally {
      if (chavePeriodo === periodoAtual.value) {
        loadingCategorias.value = { ...loadingCategorias.value, [tipo]: false };
      }
    }
  }

  function obterCategoriasPorTipo(tipo: TipoCategoriaETransacao) {
    return categoriasPorTipo.value[tipo] ?? [];
  }

  function categoriaEstaCarregando(tipo: TipoCategoriaETransacao) {
    return loadingCategorias.value[tipo] ?? false;
  }

  return {
    mesInicial,
    anoInicial,
    mesFinal,
    anoFinal,
    dataInicial,
    dataFinal,
    resumo,
    evolucao,
    isLoading,
    erro,
    periodoCarregado,
    setFiltros,
    carregarDashboard,
    carregarCategorias,
    obterCategoriasPorTipo,
    categoriaEstaCarregando,
  };
});
