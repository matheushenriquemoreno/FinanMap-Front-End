<template>
    <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
        <q-card style="min-width: 380px; border-radius: 16px;">
            <q-card-section class="q-pb-none">
                <div class="row items-center justify-between">
                    <div>
                        <div class="text-h6 text-bold">Nova Contribuição</div>
                        <div class="text-caption text-grey-6" v-if="meta">{{ meta.nome }}</div>
                    </div>
                    <q-btn icon="close" flat round dense v-close-popup />
                </div>
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="submeter" class="q-gutter-md">
                    <!-- Vincular Investimento (no topo) -->
                    <div>
                        <q-toggle v-model="vincularInvestimento" label="Vincular a um investimento existente"
                            color="primary" />

                        <q-select v-if="vincularInvestimento" v-model="investimentoSelecionado"
                            :options="investimentosDisponiveis" option-label="descricao" option-value="id" outlined
                            rounded dense class="q-mt-sm" label="Selecionar Investimento"
                            :loading="loadingInvestimentos" @update:model-value="preencherValorInvestimento">
                            <template v-slot:option="{ opt, itemProps }">
                                <q-item v-bind="itemProps">
                                    <q-item-section>
                                        <q-item-label>{{ opt.descricao }}</q-item-label>
                                        <q-item-label caption>R$ {{ formatarValor(opt.valor) }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        Nenhum investimento disponível neste mês
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </div>

                    <!-- Valor: readonly do investimento OU input manual -->
                    <q-input v-if="vincularInvestimento && investimentoSelecionado" :model-value="valor" outlined
                        rounded dense type="number" label="Valor do Investimento (R$)" readonly prefix="R$ "
                        class="valor-readonly" />

                    <q-input v-if="!vincularInvestimento" v-model.number="valor" outlined rounded dense type="number"
                        label="Valor da Contribuição (R$)" :rules="[val => val > 0 || 'Valor deve ser positivo']"
                        autofocus />

                    <q-input v-model="data" outlined rounded dense type="date" label="Data da contribuição"
                        :rules="[val => !!val || 'Data é obrigatória']" />

                    <!-- Resumo visual -->
                    <q-banner v-if="meta && valor && valor > 0" class="bg-blue-1 text-blue-9" rounded dense>
                        Após esta contribuição, você terá
                        <strong>R$ {{ formatarValor((meta.valorAtual + (valor || 0))) }}</strong>
                        de R$ {{ formatarValor(meta.valorAlvo) }}
                        ({{ novoPercentual }}%)
                    </q-banner>

                    <q-btn type="submit" label="Confirmar Contribuição" color="primary" rounded unelevated
                        class="full-width" :disable="meta?.concluida" />
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { MetaFinanceiraResult, ContribuicaoDTO } from 'src/Model/MetaFinanceira';
import getInvestimentoService from 'src/services/transacao/InvestimentoService';
import type { InvestimentoResult } from 'src/Model/Transacao';
import { formatarValor } from 'src/helpers/FormatUtils';

const $q = useQuasar();

const props = defineProps<{
    modelValue: boolean;
    meta: MetaFinanceiraResult | null;
}>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'contribuir', dto: ContribuicaoDTO): void;
}>();

const valor = ref<number | null>(null);
const data = ref(new Date().toISOString().slice(0, 10));

const vincularInvestimento = ref(false);
const investimentoSelecionado = ref<InvestimentoResult | null>(null);
const investimentosDisponiveis = ref<InvestimentoResult[]>([]);
const loadingInvestimentos = ref(false);

const investService = getInvestimentoService();

async function carregarInvestimentosDoMes() {
    loadingInvestimentos.value = true;
    try {
        const hoje = new Date();
        const result = await investService.getByMesAndAno(hoje.getFullYear(), hoje.getMonth() + 1);
        investimentosDisponiveis.value = result || [];
    } catch (error) {
        console.error('Erro ao buscar investimentos', error);
    } finally {
        loadingInvestimentos.value = false;
    }
}

watch(() => props.modelValue, (aberto) => {
    if (aberto) {
        valor.value = null;
        data.value = new Date().toISOString().slice(0, 10);
        vincularInvestimento.value = false;
        investimentoSelecionado.value = null;
        carregarInvestimentosDoMes();
    }
});

watch(vincularInvestimento, (novoValor) => {
    if (!novoValor) {
        investimentoSelecionado.value = null;
    }
});

function preencherValorInvestimento(investimento: InvestimentoResult) {
    if (investimento && investimento.valor) {
        valor.value = investimento.valor;
    }
}

const novoPercentual = computed(() => {
    if (!props.meta || props.meta.valorAlvo <= 0) return 0;
    const contributionValue = valor.value || 0;
    return Math.min(100, Math.round(((props.meta.valorAtual + contributionValue) / props.meta.valorAlvo) * 100));
});

function submeter() {
    if (!valor.value || valor.value <= 0) return;

    const dto: ContribuicaoDTO = {
        valor: valor.value,
        data: data.value,
    };

    if (vincularInvestimento.value && investimentoSelecionado.value) {
        if (investimentoSelecionado.value.id) {
            // Bloqueio de duplicatas
            const jaVinculado = props.meta?.contribuicoes.some(c => c.investimentoId === investimentoSelecionado.value?.id);
            if (jaVinculado) {
                $q.notify({
                    type: 'warning',
                    message: 'Este investimento já foi vinculado como contribuição nesta meta.',
                });
                return;
            }
            dto.investimentoId = investimentoSelecionado.value.id;
        }
        dto.nomeInvestimento = investimentoSelecionado.value.descricao;
    }

    emit('contribuir', dto);
}
</script>
