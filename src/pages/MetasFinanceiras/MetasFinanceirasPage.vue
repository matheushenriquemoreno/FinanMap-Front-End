<template>
    <q-page class="metas-page q-pa-lg">
        <!-- ===== HEADER ===== -->
        <PageHeaderBanner
            icon="emoji_events"
            title="Metas Financeiras"
            subtitle="Transforme seus sonhos em conquistas"
            button-label="Nova Meta"
            @action="abrirModalCriar"
        />

        <!-- ===== PAINEL DE RESUMO (3 Cards) ===== -->
        <PainelResumoMetas :resumo="resumo" :loading="loading" :filtro-status="filtroStatus" />

        <!-- ===== FILTRO DE STATUS (Ativas / Arquivadas / Todas) ===== -->
        <div class="row justify-center q-mt-lg">
            <q-btn-toggle v-model="filtroStatus" toggle-color="primary" :color="$q.dark.isActive ? 'dark' : 'white'"
                :text-color="$q.dark.isActive ? 'grey-4' : 'grey-8'" rounded unelevated size="13px"
                class="status-toggle-premium border-sutil" :options="[
                    { value: 'ativas', slot: 'ativas' },
                    { value: 'arquivadas', slot: 'arquivadas' },
                    { value: 'todas', slot: 'todas' },
                ]">
                <template v-slot:ativas>
                    <div class="status-toggle-option row items-center q-px-sm">
                        <q-icon name="flag" class="q-mr-xs" size="18px"
                            :color="filtroStatus === 'ativas' ? 'white' : 'green'" />
                        <span>Ativas</span>
                        <q-badge :color="filtroStatus === 'ativas' ? 'white' : ($q.dark.isActive ? 'grey-8' : 'grey-3')"
                            :text-color="filtroStatus === 'ativas' ? 'green-9' : ($q.dark.isActive ? 'grey-3' : 'grey-8')"
                            class="q-ml-xs text-bold badge-contador">
                            {{ contagens.ativas ?? '···' }}
                        </q-badge>
                    </div>
                </template>

                <template v-slot:arquivadas>
                    <div class="status-toggle-option row items-center q-px-sm">
                        <q-icon name="archive" class="q-mr-xs" size="18px"
                            :color="filtroStatus === 'arquivadas' ? 'white' : 'grey-7'" />
                        <span>Arquivadas</span>
                        <q-badge :color="filtroStatus === 'arquivadas' ? 'white' : ($q.dark.isActive ? 'grey-8' : 'grey-3')"
                            :text-color="filtroStatus === 'arquivadas' ? 'grey-9' : ($q.dark.isActive ? 'grey-3' : 'grey-8')"
                            class="q-ml-xs text-bold badge-contador">
                            {{ contagens.arquivadas ?? '···' }}
                        </q-badge>
                    </div>
                </template>

                <template v-slot:todas>
                    <div class="status-toggle-option row items-center q-px-sm">
                        <q-icon name="apps" class="q-mr-xs" size="18px" />
                        <span>Todas</span>
                        <q-badge :color="filtroStatus === 'todas' ? 'white' : ($q.dark.isActive ? 'grey-8' : 'grey-3')"
                            :text-color="filtroStatus === 'todas' ? 'primary' : ($q.dark.isActive ? 'grey-3' : 'grey-8')"
                            class="q-ml-xs text-bold badge-contador">
                            {{ contagens.todas ?? '···' }}
                        </q-badge>
                    </div>
                </template>
            </q-btn-toggle>
        </div>

        <!-- ===== LISTAGEM DE METAS ===== -->
        <div class="metas-grid q-mt-lg" v-if="metas.length > 0 || loading">
            <template v-if="loading">
                <!-- Skeleton Loaders -->
                <q-card v-for="i in 3" :key="'skeleton-' + i" flat bordered class="q-pa-md skeleton-card">
                    <q-skeleton type="QAvatar" size="42px" class="q-mb-md" />
                    <q-skeleton type="text" width="60%" class="q-mb-sm" />
                    <q-skeleton type="text" width="40%" class="q-mb-md" />
                    <q-skeleton type="QSlider" class="q-mb-md" />
                    <q-skeleton type="QBtn" width="100%" />
                </q-card>
            </template>

            <template v-else>
                <MetaCard v-for="meta in metas" :key="meta.id" :meta="meta" @contribuir="abrirModalContribuir(meta)"
                    @detalhes="abrirModalDetalhes(meta)" @excluir="excluirMeta(meta.id)"
                    @arquivar="arquivarMeta(meta)" @desarquivar="desarquivarMeta(meta)" />
            </template>
        </div>

        <!-- Empty state -->
        <div v-if="!loading && metas.length === 0" class="metas-empty text-center q-pa-xl">
            <q-icon name="flag" size="80px" color="grey-4" />
            <p class="text-h6 text-grey-6 q-mt-md">{{ emptyStateTitulo }}</p>
            <p class="text-body2 text-grey-5">{{ emptyStateSubtitulo }}</p>
        </div>

        <!-- ===== MODAIS ===== -->
        <ModalCriarMeta v-model="modalCriarAberto" @criar="criarMeta" />

        <ModalContribuir v-model="modalContribuirAberto" :meta="metaSelecionada" @contribuir="contribuir" />

        <ModalDetalhesMeta v-model="modalDetalhesAberto" :meta="metaSelecionada"
            @remover-contribuicao="removerContribuicao" @editar-contribuicao="abrirModalEditar" />

        <ModalEditarContribuicao v-model="modalEditarAberto" :contribuicao="contribuicaoSelecionada"
            @salvar="salvarEdicaoContribuicao" />
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import getMetaFinanceiraService from 'src/services/MetaFinanceiraService';
import type {
    MetaFinanceiraResult,
    ResumoMetasDTO,
    CreateMetaFinanceiraDTO,
    ContribuicaoDTO,
    ContribuicaoResult,
    UpdateContribuicaoDTO,
} from 'src/Model/MetaFinanceira';
import PainelResumoMetas from 'src/components/MetasFinanceiras/PainelResumoMetas.vue';
import PageHeaderBanner from 'src/components/PageHeaderBanner.vue';
import MetaCard from 'src/components/MetasFinanceiras/MetaCard.vue';
import ModalCriarMeta from 'src/components/MetasFinanceiras/ModalCriarMeta.vue';
import ModalContribuir from 'src/components/MetasFinanceiras/ModalContribuir.vue';
import ModalDetalhesMeta from 'src/components/MetasFinanceiras/ModalDetalhesMeta.vue';
import ModalEditarContribuicao from 'src/components/MetasFinanceiras/ModalEditarContribuicao.vue';
import { notificarErro } from 'src/helpers/Notificacao';

/** Estados do filtro de arquivamento exibidos na tela. */
type FiltroStatus = 'ativas' | 'arquivadas' | 'todas';

const $q = useQuasar();
const service = getMetaFinanceiraService();

const metas = ref<MetaFinanceiraResult[]>([]);
const resumo = ref<ResumoMetasDTO>({
    totalMetas: 0, totalInvestido: 0, percentualGeral: 0,
    metasConcluidas: 0, totalDeMetasAtivas: 0,
});
const loading = ref(false);

/** Filtro de arquivamento; estado inicial "Ativas" (fluxo principal). */
const filtroStatus = ref<FiltroStatus>('ativas');
/** Contagens por filtro carregadas sob demanda (badge dos demais estados). */
const contagens = ref<Record<FiltroStatus, number | null>>({
    ativas: null,
    arquivadas: null,
    todas: null,
});

const modalCriarAberto = ref(false);
const modalContribuirAberto = ref(false);
const modalDetalhesAberto = ref(false);
const modalEditarAberto = ref(false);
const metaSelecionada = ref<MetaFinanceiraResult | null>(null);
const contribuicaoSelecionada = ref<ContribuicaoResult | null>(null);

const emptyStateTitulo = computed(() => {
    if (filtroStatus.value === 'arquivadas') return 'Nenhuma meta arquivada';
    if (filtroStatus.value === 'todas') return 'Nenhuma meta encontrada';
    return 'Nenhuma meta criada ainda';
});

const emptyStateSubtitulo = computed(() => {
    if (filtroStatus.value === 'arquivadas') return 'Metas arquivadas aparecerão aqui para consulta.';
    if (filtroStatus.value === 'todas') return 'Clique em "Nova Meta" para começar a planejar seus objetivos!';
    return 'Clique em "Nova Meta" para começar a planejar seus objetivos!';
});

// Mapeia o filtro da tela para o parâmetro `arquivadas` da API (omitido = todas).
function paramDoFiltro(filtro: FiltroStatus): boolean | undefined {
    if (filtro === 'ativas') return false;
    if (filtro === 'arquivadas') return true;
    return undefined;
}

onMounted(() => {
    carregarDados();
});

// Cada mudança de filtro recarrega listagem e resumo no back-end com o mesmo filtro.
watch(filtroStatus, () => {
    void carregarDados();
});

async function carregarDados() {
    loading.value = true;
    const filtro = filtroStatus.value;
    try {
        const [metasRes, resumoRes] = await Promise.all([
            service.obterTodas(paramDoFiltro(filtro)),
            service.obterResumo(paramDoFiltro(filtro)),
        ]);
        metas.value = metasRes || [];
        resumo.value = resumoRes || {
            totalMetas: 0, totalInvestido: 0, percentualGeral: 0, metasConcluidas: 0, totalDeMetasAtivas: 0,
        };
        contagens.value[filtro] = metas.value.length;
        await carregarContagensFaltantes();
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
}

/** Carrega contagens dos filtros ainda não visitados (badges dos outros estados). */
async function carregarContagensFaltantes() {
    const faltantes = (['ativas', 'arquivadas', 'todas'] as FiltroStatus[]).filter(
        (f) => f !== filtroStatus.value && contagens.value[f] === null
    );
    if (faltantes.length === 0) return;

    const resultados = await Promise.allSettled(
        faltantes.map(async (f) => ({
            filtro: f,
            total: (await service.obterTodas(paramDoFiltro(f)))?.length || 0,
        }))
    );
    for (const resultado of resultados) {
        if (resultado.status === 'fulfilled') {
            contagens.value[resultado.value.filtro] = resultado.value.total;
        }
    }
}

/** Invalida contagens (arquivamento altera todos os filtros) e recarrega a tela. */
async function recarregarAposArquivamento() {
    contagens.value = { ativas: null, arquivadas: null, todas: null };
    await carregarDados();
}

// ===== Utilitário de atualização local =====
function atualizarEstadoAposOperacao(metaAtualizada: MetaFinanceiraResult) {
    metaSelecionada.value = metaAtualizada;
    const index = metas.value.findIndex(m => m.id === metaAtualizada.id);
    if (index !== -1) {
        metas.value[index] = metaAtualizada;
    }
    service.obterResumo(paramDoFiltro(filtroStatus.value)).then(resResumo => {
        if (resResumo) resumo.value = resResumo;
    });
}

function abrirModalCriar() {
    modalCriarAberto.value = true;
}

function abrirModalContribuir(meta: MetaFinanceiraResult) {
    metaSelecionada.value = meta;
    modalContribuirAberto.value = true;
}

function abrirModalDetalhes(meta: MetaFinanceiraResult) {
    metaSelecionada.value = meta;
    modalDetalhesAberto.value = true;
}

function abrirModalEditar(contribuicao: ContribuicaoResult) {
    contribuicaoSelecionada.value = contribuicao;
    modalEditarAberto.value = true;
}

async function criarMeta(dto: CreateMetaFinanceiraDTO) {
    try {
        await service.criar(dto);
        modalCriarAberto.value = false;
        $q.notify({ type: 'positive', message: 'Meta criada com sucesso! 🎯' });
        carregarDados();
    } catch (error: any) {
        notificarErro('Erro ao criar a meta. Verifique os campos.');
    }
}

async function contribuir(dto: ContribuicaoDTO) {
    if (!metaSelecionada.value) return;

    try {
        const resultado = await service.adicionarContribuicao(metaSelecionada.value.id, dto);

        modalContribuirAberto.value = false;

        if (resultado.metaAtualizada) {
            atualizarEstadoAposOperacao(resultado.metaAtualizada);
        }

        // Exibir notificação de incentivo se houve marco
        if (resultado.notificacao) {
            $q.notify({
                type: 'positive',
                message: resultado.notificacao.mensagem,
                timeout: 10000,
                position: 'center',
                icon: 'emoji_events',
                progress: true,
                actions: [{ icon: 'close', color: 'dark' }]
            });
        } else {
            $q.notify({ type: 'positive', message: 'Contribuição registrada!' });
        }
    } catch (error: any) {
        // Apenas console, notificação já é exibida no AxiosHelper
    }
}

function removerContribuicao(contribuicaoId: string) {
    if (!metaSelecionada.value) return;

    $q.dialog({
        title: 'Remover Contribuição',
        message: 'Deseja remover o valor desta contribuição da meta?',
        cancel: true,
        persistent: false,
    }).onOk(() => {
        void (async () => {
            try {
                if (!metaSelecionada.value) return;
                await service.removerContribuicao(metaSelecionada.value.id, contribuicaoId);
                $q.notify({ type: 'positive', message: 'Contribuição removida.' });

                const metaAtualizada = await service.obterPorId(metaSelecionada.value.id);
                atualizarEstadoAposOperacao(metaAtualizada);
            } catch (error) {
                // AxiosHelper handles the errors
            }
        })();
    });
}

async function salvarEdicaoContribuicao(dto: UpdateContribuicaoDTO) {
    if (!metaSelecionada.value) return;

    try {
        const resultado = await service.editarContribuicao(metaSelecionada.value.id, dto);
        modalEditarAberto.value = false;

        if (resultado.metaAtualizada) {
            atualizarEstadoAposOperacao(resultado.metaAtualizada);
        }

        $q.notify({ type: 'positive', message: 'Contribuição atualizada!' });
    } catch (error) {
        // AxiosHelper handles the errors
    }
}

function excluirMeta(id: string) {
    $q.dialog({
        title: 'Excluir Meta',
        message: 'Deseja realmente excluir esta meta e todas as suas contribuições?',
        cancel: true,
        persistent: false,
    }).onOk(() => {
        void (async () => {
            try {
                await service.excluir(id);
                $q.notify({ type: 'positive', message: 'Meta excluída.' });
                await carregarDados();
            } catch (error) {
                // Handle via AxiosHelper
            }
        })();
    });
}

function arquivarMeta(meta: MetaFinanceiraResult) {
    $q.dialog({
        title: 'Arquivar Meta',
        message: `Deseja arquivar a meta "${meta.nome}"? Ela sairá do fluxo ativo, mas o histórico de contribuições será preservado.`,
        cancel: true,
        persistent: false,
    }).onOk(() => {
        void (async () => {
            try {
                await service.arquivar(meta.id);
                $q.notify({ type: 'positive', message: 'Meta arquivada com sucesso! 📦' });
                await recarregarAposArquivamento();
            } catch (error) {
                // Handle via AxiosHelper
            }
        })();
    });
}

function desarquivarMeta(meta: MetaFinanceiraResult) {
    $q.dialog({
        title: 'Desarquivar Meta',
        message: `Deseja desarquivar a meta "${meta.nome}"? Ela voltará ao fluxo ativo de metas.`,
        cancel: true,
        persistent: false,
    }).onOk(() => {
        void (async () => {
            try {
                await service.desarquivar(meta.id);
                $q.notify({ type: 'positive', message: 'Meta desarquivada com sucesso! ✨' });
                await recarregarAposArquivamento();
            } catch (error) {
                // Handle via AxiosHelper
            }
        })();
    });
}

</script>

<style lang="scss" scoped>
.metas-page {
    max-width: 1200px;
    margin: 0 auto;
}



.metas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.metas-empty {
    margin-top: 80px;
}

.skeleton-card {
    border-radius: 16px;
}

.status-toggle-premium {
    max-width: 100%;

    :deep(.q-btn-group) {
        max-width: 100%;
    }

    :deep(.q-btn) {
        min-height: 40px;
    }

    @media (max-width: 599px) {
        width: 100%;

        :deep(.q-btn-group) {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            width: 100%;
        }

        :deep(.q-btn) {
            min-width: 0;
            width: 100%;
            padding-left: 4px;
            padding-right: 4px;
        }
    }
}

.status-toggle-option {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 420px) {
        padding-left: 2px;
        padding-right: 2px;

        .q-icon {
            margin-right: 2px;
            font-size: 16px !important;
        }
    }
}

.border-sutil {
    border: 1px solid rgba(0, 0, 0, 0.08) !important;

    .body--dark & {
        border-color: rgba(255, 255, 255, 0.12) !important;
    }
}

.badge-contador {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 8px;
}
</style>
