<template>
    <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
        <q-card style="min-width: 480px; max-width: 600px; border-radius: 16px;">
            <q-card-section class="q-pb-none">
                <div class="row items-center justify-between">
                    <div>
                        <div class="text-h6 text-bold">Detalhes da Meta</div>
                        <div class="text-caption text-grey-6" v-if="meta">{{ meta.nome }}</div>
                    </div>
                    <q-btn icon="close" flat round dense v-close-popup />
                </div>
            </q-card-section>

            <q-card-section v-if="meta">
                <!-- Resumo da meta -->
                <div class="detalhes-resumo q-mb-md">
                    <div class="row items-center q-mb-sm">
                        <q-avatar size="36px" :style="{ backgroundColor: categoriaConfig.color + '20' }">
                            <q-icon :name="categoriaConfig.icon" :color="categoriaConfig.color" />
                        </q-avatar>
                        <div class="q-ml-md">
                            <div class="text-subtitle1 text-bold">{{ meta.nome }}</div>
                            <div class="text-caption" :style="{ color: categoriaConfig.color }">
                                {{ categoriaConfig.label }}
                            </div>
                        </div>
                    </div>

                    <div class="row justify-between q-mt-sm">
                        <div>
                            <div class="text-caption text-grey-6">Valor Atual</div>
                            <div class="text-subtitle2 text-bold text-positive">R$ {{ formatarValor(meta.valorAtual) }}
                            </div>
                        </div>
                        <div class="text-center">
                            <div class="text-caption text-grey-6">Data Limite</div>
                            <div class="text-subtitle2 text-bold">{{ formatarData(meta.dataLimite) }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-caption text-grey-6">Valor Alvo</div>
                            <div class="text-subtitle2 text-bold">R$ {{ formatarValor(meta.valorAlvo) }}</div>
                        </div>
                    </div>

                    <q-linear-progress :value="meta.percentualProgresso / 100" :color="corProgresso"
                        track-color="grey-3" rounded size="10px" class="q-mt-sm" />

                    <div class="row justify-between q-mt-xs">
                        <span class="text-caption text-grey-6">{{ meta.percentualProgresso?.toFixed(1) || 0 }}%</span>
                        <span class="text-caption text-grey-6">
                            <q-icon name="calendar_today" size="12px" class="q-mr-xs" />
                            {{ meta.diasRestantes >= 0 ? `${meta.diasRestantes} dias restantes` :
                                `${Math.abs(meta.diasRestantes)} dias atrasada` }}
                        </span>
                    </div>

                    <q-banner v-if="!meta.concluida" class="bg-amber-1 text-amber-9 q-mt-md" rounded dense>
                        Faltam <strong>R$ {{ formatarValor(meta.valorFaltante) }}</strong> para atingir sua meta
                    </q-banner>
                    <q-banner v-else class="bg-green-1 text-green-9 q-mt-md" rounded dense>
                        <q-icon name="celebration" class="q-mr-xs" /> Meta alcançada! 🎉
                    </q-banner>
                </div>
            </q-card-section>

            <!-- Lista de Contribuições -->
            <template v-if="meta && meta.contribuicoes && meta.contribuicoes.length > 0">
                <q-separator />
                <q-card-section>
                    <div class="text-subtitle2 text-bold q-mb-sm">
                        Histórico de Contribuições ({{ meta.contribuicoes.length }})
                    </div>
                    <q-list separator class="historico-list">
                        <q-item v-for="contribuicao in meta.contribuicoes" :key="contribuicao.id" class="q-py-md">
                            <q-item-section avatar top>
                                <q-avatar :color="contribuicao.origem === 'Investimento' ? 'primary' : 'positive'"
                                    text-color="white" size="42px">
                                    <q-icon
                                        :name="contribuicao.origem === 'Investimento' ? 'show_chart' : 'arrow_outward'" />
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-subtitle2 text-bold">
                                    R$ {{ formatarValor(contribuicao.valor) }}
                                </q-item-label>
                                <q-item-label caption class="row items-center q-mt-xs">
                                    <q-icon name="event" size="13px" class="q-mr-xs" />
                                    {{ formatarData(contribuicao.data) }}
                                </q-item-label>
                                <q-item-label v-if="contribuicao.origem === 'Investimento'" class="q-mt-sm">
                                    <q-badge color="primary" class="q-px-sm q-py-xs"
                                        style="border-radius: 6px; font-weight: normal; font-size: 11px;">
                                        <q-icon name="account_balance" size="13px" class="q-mr-xs" />
                                        <span>Investimento - <span class="text-bold">{{ contribuicao.nomeInvestimento
                                                }}</span></span>
                                    </q-badge>
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                                <q-btn flat round icon="delete_outline" color="red-5" size="sm"
                                    @click="emit('removerContribuicao', contribuicao.id)">
                                    <q-tooltip class="bg-red-5">Remover contribuição</q-tooltip>
                                </q-btn>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
            </template>

            <!-- State vazio para contribuições -->
            <template v-else-if="meta">
                <q-separator />
                <q-card-section class="text-center q-py-lg">
                    <q-icon name="savings" size="40px" color="grey-4" />
                    <div class="text-body2 text-grey-5 q-mt-sm">Nenhuma contribuição registrada ainda</div>
                </q-card-section>
            </template>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MetaFinanceiraResult } from 'src/Model/MetaFinanceira';
import { CATEGORIA_META_CONFIG, CategoriaIconeMeta } from 'src/Model/MetaFinanceira';
import { formatarValor, formatarData } from 'src/helpers/FormatUtils';

const props = defineProps<{
    modelValue: boolean;
    meta: MetaFinanceiraResult | null;
}>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'removerContribuicao', contribuicaoId: string): void;
}>();

const categoriaConfig = computed(() => {
    if (!props.meta) return CATEGORIA_META_CONFIG[CategoriaIconeMeta.Outro];
    return CATEGORIA_META_CONFIG[props.meta.categoria] || CATEGORIA_META_CONFIG[CategoriaIconeMeta.Outro];
});

const corProgresso = computed(() => {
    if (!props.meta) return 'light-blue';
    if (props.meta.percentualProgresso >= 100) return 'green';
    if (props.meta.percentualProgresso >= 80) return 'orange';
    if (props.meta.percentualProgresso >= 50) return 'blue';
    return 'light-blue';
});
</script>

<style lang="scss" scoped>
.historico-list {
    max-height: 300px;
    overflow-y: auto;
}
</style>
