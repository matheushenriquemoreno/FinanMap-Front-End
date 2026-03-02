<template>
    <q-card flat bordered class="meta-card">
        <q-btn class="meta-card__delete-btn" flat round dense icon="delete_outline" color="red-4"
            @click.stop="emit('excluir')">
            <q-tooltip>Excluir meta</q-tooltip>
        </q-btn>

        <q-card-section>
            <div class="meta-card__header">
                <q-avatar size="42px" :style="{ backgroundColor: categoriaConfig.color + '20' }">
                    <q-icon :name="categoriaConfig.icon" :color="categoriaConfig.color" />
                </q-avatar>
                <div class="q-ml-md">
                    <div class="text-subtitle1 text-bold">{{ meta.nome }}</div>
                    <div class="text-caption" :style="{ color: categoriaConfig.color }">
                        {{ categoriaConfig.label }}
                    </div>
                </div>
            </div>

            <div class="meta-card__valores q-mt-md">
                <span class="text-body2 text-bold">R$ {{ formatarValor(meta.valorAtual) }}</span>
                <span class="text-body2" style="opacity: 0.7">R$ {{ formatarValor(meta.valorAlvo) }}</span>
            </div>

            <q-linear-progress :value="meta.percentualProgresso / 100" :color="corProgresso" track-color="grey-3"
                rounded size="10px" class="q-mt-sm" />

            <div class="meta-card__info q-mt-xs">
                <span class="text-caption" style="opacity: 0.7">{{ meta.percentualProgresso?.toFixed(0) || 0 }}%</span>
                <span class="text-caption" style="opacity: 0.7">
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
        </q-card-section>

        <q-separator />
        <q-card-actions align="center">
            <q-btn v-if="!meta.concluida" flat no-caps icon="add" label="Contribuir" color="primary"
                @click="emit('contribuir')" />
            <q-btn flat no-caps icon="visibility" label="Detalhes" color="secondary" @click="emit('detalhes')" />
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MetaFinanceiraResult } from 'src/Model/MetaFinanceira';
import { CATEGORIA_META_CONFIG, CategoriaIconeMeta } from 'src/Model/MetaFinanceira';
import { formatarValor } from 'src/helpers/FormatUtils';

const props = defineProps<{ meta: MetaFinanceiraResult }>();
const emit = defineEmits<{
    (e: 'contribuir'): void;
    (e: 'detalhes'): void;
    (e: 'excluir'): void;
}>();

const categoriaConfig = computed(() => {
    return CATEGORIA_META_CONFIG[props.meta.categoria] || CATEGORIA_META_CONFIG[CategoriaIconeMeta.Outro];
});

const corProgresso = computed(() => {
    if (props.meta.percentualProgresso >= 100) return 'green';
    if (props.meta.percentualProgresso >= 80) return 'orange';
    if (props.meta.percentualProgresso >= 50) return 'blue';
    return 'light-blue';
});


</script>

<style lang="scss" scoped>
.meta-card {
    border-radius: 16px;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    }

    &:hover &__delete-btn {
        opacity: 1;
    }

    &__delete-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1;
    }

    &__header {
        display: flex;
        align-items: center;
    }

    &__valores {
        display: flex;
        justify-content: space-between;
    }

    &__info {
        display: flex;
        justify-content: space-between;
    }
}

.q-card__section {
    flex-grow: 1;
}
</style>
