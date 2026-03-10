<template>
    <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
        <q-card style="min-width: 420px; border-radius: 16px;">
            <q-card-section class="row items-center q-pb-none">
                <div class="text-h6 text-bold">Criar Nova Meta</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
                <q-form @submit.prevent="submeter" class="q-gutter-md">
                    <!-- Nome da Meta -->
                    <div>
                        <label class="text-subtitle2 text-bold q-mb-xs">Nome da Meta</label>
                        <q-input v-model="form.nome" outlined rounded dense placeholder='Ex: "Viagem para Europa"'
                            :rules="[val => !!val || 'Nome é obrigatório']" />
                    </div>

                    <!-- Valor Alvo -->
                    <div>
                        <label class="text-subtitle2 text-bold q-mb-xs">Valor Alvo (R$)</label>
                        <MoneyInputBR v-model="form.valorAlvo" label="" placeholder="10.000,00"
                            :rules="[val => val > 0 || 'Valor deve ser positivo']" />
                    </div>

                    <!-- Data Limite -->
                    <div>
                        <label class="text-subtitle2 text-bold q-mb-xs">Data Limite</label>
                        <ModernDateInput v-model="form.dataLimite" dialogTitle="Data Limite"
                            :rules="[(val: any) => !!val || 'Data é obrigatória']" />
                    </div>

                    <!-- Categoria (seleção visual com ícones) -->
                    <div>
                        <label class="text-subtitle2 text-bold q-mb-sm">Categoria</label>
                        <div class="categoria-grid">
                            <div v-for="(config, key) in CATEGORIA_META_CONFIG" :key="key" class="categoria-item"
                                :class="{ 'categoria-item--selecionada': form.categoria === Number(key) }"
                                @click="form.categoria = Number(key)">
                                <q-icon :name="config.icon" size="28px" :color="config.color" />
                                <span class="text-caption">{{ config.label }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botão Criar -->
                    <div class="q-mt-md">
                        <q-btn type="submit" label="Criar Meta 🎯" color="primary" rounded unelevated class="full-width"
                            size="lg" dense />
                    </div>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ModernDateInput from 'src/components/Inputs/ModernDateInput.vue';
import MoneyInputBR from 'src/components/Inputs/MoneyInputBR.vue';
import {
    CategoriaIconeMeta,
    CATEGORIA_META_CONFIG,
    type CreateMetaFinanceiraDTO,
} from 'src/Model/MetaFinanceira';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'criar', dto: CreateMetaFinanceiraDTO): void;
}>();

const form = ref<CreateMetaFinanceiraDTO>({
    nome: '',
    valorAlvo: 0,
    dataLimite: '',
    categoria: CategoriaIconeMeta.Outro,
});

// Reset ao abrir
watch(() => props.modelValue, (aberto) => {
    if (aberto) {
        form.value = {
            nome: '',
            valorAlvo: null as unknown as number,
            dataLimite: '',
            categoria: CategoriaIconeMeta.Outro,
        };
    }
});

function submeter() {
    emit('criar', {
        nome: form.value.nome,
        valorAlvo: Number(form.value.valorAlvo),
        dataLimite: form.value.dataLimite,
        categoria: form.value.categoria,
    });
}
</script>

<style lang="scss" scoped>
.categoria-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.categoria-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
    border-radius: 12px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;

    &:hover {
        background: rgba(0, 0, 0, 0.03);
    }

    &--selecionada {
        border-color: #2ECC71;
        background: rgba(46, 204, 113, 0.06);
    }
}
</style>
