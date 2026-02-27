<template>
    <q-page class="metas-page q-pa-lg">
        <!-- ===== HEADER ===== -->
        <div class="metas-header q-mb-lg">
            <div class="metas-header__info">
                <q-icon name="emoji_events" size="40px" color="white" />
                <div>
                    <h4 class="text-h4 text-bold text-white q-mb-none" style="line-height: 1;">Metas Financeiras</h4>
                    <span class="text-subtitle1 text-white-70">Transforme seus sonhos em conquistas</span>
                </div>
            </div>
            <q-btn color="white" text-color="primary" icon="add" label="Nova Meta" rounded unelevated
                @click="abrirModalCriar" />
        </div>

        <!-- ===== PAINEL DE RESUMO (3 Cards) ===== -->
        <PainelResumoMetas :resumo="resumo" :loading="loading" />

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
                    @detalhes="abrirModalDetalhes(meta)" @excluir="excluirMeta(meta.id)" />
            </template>
        </div>

        <!-- Empty state -->
        <div v-if="!loading && metas.length === 0" class="metas-empty text-center q-pa-xl">
            <q-icon name="flag" size="80px" color="grey-4" />
            <p class="text-h6 text-grey-6 q-mt-md">Nenhuma meta criada ainda</p>
            <p class="text-body2 text-grey-5">Clique em "Nova Meta" para começar a planejar seus objetivos!</p>
        </div>

        <!-- ===== MODAIS ===== -->
        <ModalCriarMeta v-model="modalCriarAberto" @criar="criarMeta" />

        <ModalContribuir v-model="modalContribuirAberto" :meta="metaSelecionada" @contribuir="contribuir" />

        <ModalDetalhesMeta v-model="modalDetalhesAberto" :meta="metaSelecionada"
            @remover-contribuicao="removerContribuicao" />
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import getMetaFinanceiraService from 'src/services/MetaFinanceiraService';
import type {
    MetaFinanceiraResult,
    ResumoMetasDTO,
    CreateMetaFinanceiraDTO,
    ContribuicaoDTO,
} from 'src/Model/MetaFinanceira';
import PainelResumoMetas from 'src/components/MetasFinanceiras/PainelResumoMetas.vue';
import MetaCard from 'src/components/MetasFinanceiras/MetaCard.vue';
import ModalCriarMeta from 'src/components/MetasFinanceiras/ModalCriarMeta.vue';
import ModalContribuir from 'src/components/MetasFinanceiras/ModalContribuir.vue';
import ModalDetalhesMeta from 'src/components/MetasFinanceiras/ModalDetalhesMeta.vue';
import { notificarErro } from 'src/helpers/Notificacao';

const $q = useQuasar();
const service = getMetaFinanceiraService();

const metas = ref<MetaFinanceiraResult[]>([]);
const resumo = ref<ResumoMetasDTO>({
    totalMetas: 0, totalInvestido: 0, percentualGeral: 0,
    metasConcluidas: 0, totalDeMetasAtivas: 0,
});
const loading = ref(false);

const modalCriarAberto = ref(false);
const modalContribuirAberto = ref(false);
const modalDetalhesAberto = ref(false);
const metaSelecionada = ref<MetaFinanceiraResult | null>(null);

onMounted(() => {
    carregarDados();
});

async function carregarDados() {
    loading.value = true;
    try {
        const [metasRes, resumoRes] = await Promise.all([
            service.obterTodas(),
            service.obterResumo(),
        ]);
        metas.value = metasRes || [];
        resumo.value = resumoRes || {
            totalMetas: 0, totalInvestido: 0, percentualGeral: 0, metasConcluidas: 0, totalDeMetasAtivas: 0,
        };
    } catch (err) {
        console.error(err);
    } finally {
        loading.value = false;
    }
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

        // Exibir notificação de incentivo se houve marco
        if (resultado.notificacao) {
            $q.notify({
                type: 'positive',
                message: resultado.notificacao.mensagem,
                timeout: 5000,
                position: 'top',
                icon: 'emoji_events'
            });
        } else {
            $q.notify({ type: 'positive', message: 'Contribuição registrada!' });
        }

        carregarDados();
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

                // Recarrega a meta selecionada para manter o modal de detalhes atualizado
                const [metaAtualizada] = await Promise.all([
                    service.obterPorId(metaSelecionada.value.id),
                    carregarDados(),
                ]);
                metaSelecionada.value = metaAtualizada;
            } catch (error) {
                // AxiosHelper handles the errors
            }
        })();
    });
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

</script>

<style lang="scss" scoped>
.metas-page {
    max-width: 1200px;
    margin: 0 auto;
}

.metas-header {
    background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
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
</style>
