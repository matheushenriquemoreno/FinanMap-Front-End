<template>
    <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
        <q-card style="width: 380px; border-radius: 16px;">
            <q-card-section class="q-pb-none">
                <div class="row items-center justify-between">
                    <div>
                        <div class="text-h6 text-bold">Editar Contribuição</div>
                        <div class="text-caption text-grey-6" v-if="contribuicao">
                            {{ formatarData(contribuicao.data) }}
                            <span v-if="contribuicao.origem === 'Investimento'" class="text-primary">
                                · {{ contribuicao.nomeInvestimento }}
                            </span>
                        </div>
                    </div>
                    <q-btn icon="close" flat round dense v-close-popup />
                </div>
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="submeter" class="q-gutter-md">
                    <MoneyInputBR v-model="valorEditado" label="Valor da Contribuição (R$)"
                        :rules="[val => val > 0 || 'Valor deve ser positivo']" autofocus />

                    <q-input v-model="descricaoEditada" outlined rounded dense type="text" label="Descrição (opcional)"
                        maxlength="200" hint="Ex: Salário de Janeiro, Freelance, Bônus..." />

                    <div class="q-mt-md">
                        <q-btn type="submit" label="Salvar Alterações" color="primary" rounded unelevated
                            class="full-width" icon="save" />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ContribuicaoResult, UpdateContribuicaoDTO } from 'src/Model/MetaFinanceira';
import { formatarData } from 'src/helpers/FormatUtils';
import MoneyInputBR from 'src/components/Inputs/MoneyInputBR.vue';

const props = defineProps<{
    modelValue: boolean;
    contribuicao: ContribuicaoResult | null;
}>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'salvar', dto: UpdateContribuicaoDTO): void;
}>();

const valorEditado = ref<number | null>(null);
const descricaoEditada = ref('');

watch(() => props.modelValue, (aberto) => {
    if (aberto && props.contribuicao) {
        valorEditado.value = props.contribuicao.valor;
        descricaoEditada.value = props.contribuicao.descricao || '';
    }
});

function submeter() {
    if (!valorEditado.value || valorEditado.value <= 0 || !props.contribuicao) return;

    const dto: UpdateContribuicaoDTO = {
        contribuicaoId: props.contribuicao.id,
        valor: valorEditado.value,
    };

    if (descricaoEditada.value.trim()) {
        dto.descricao = descricaoEditada.value.trim();
    }

    emit('salvar', dto);
}
</script>
