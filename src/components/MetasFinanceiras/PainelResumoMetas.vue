<template>
    <div class="resumo-grid">
        <!-- Skeleton Loaders -->
        <template v-if="loading">
            <q-card v-for="i in 3" :key="'skel-' + i" flat bordered class="resumo-card">
                <q-card-section horizontal class="items-center q-pa-md">
                    <q-skeleton type="QAvatar" size="48px" />
                    <div class="q-ml-md" style="flex: 1">
                        <q-skeleton type="text" width="50%" />
                        <q-skeleton type="text" width="70%" class="q-mt-xs" />
                    </div>
                </q-card-section>
            </q-card>
        </template>

        <template v-else>
            <!-- Card: Total das Metas -->
            <q-card flat bordered class="resumo-card">
                <q-card-section horizontal class="items-center q-pa-md">
                    <q-avatar size="48px" color="blue-1" text-color="blue" icon="gps_fixed" />
                    <div class="q-ml-md">
                        <div class="text-caption text-grey-6">Total das Metas</div>
                        <div class="text-h6 text-bold">R$ {{ formatarValor(resumo?.totalMetas || 0) }}</div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Card: Total Investido -->
            <q-card flat bordered class="resumo-card">
                <q-card-section horizontal class="items-center q-pa-md">
                    <q-avatar size="48px" color="green-1" text-color="green" icon="trending_up" />
                    <div class="q-ml-md">
                        <div class="text-caption text-grey-6">Total Investido</div>
                        <div class="text-h6 text-bold">R$ {{ formatarValor(resumo?.totalInvestido || 0) }}</div>
                        <div class="text-caption text-grey-5">{{ Math.round(resumo?.percentualGeral || 0) }}% do total
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <!-- Card: Metas Concluídas -->
            <q-card flat bordered class="resumo-card">
                <q-card-section horizontal class="items-center q-pa-md">
                    <q-avatar size="48px" color="amber-1" text-color="amber-9" icon="check_circle" />
                    <div class="q-ml-md">
                        <div class="text-caption text-grey-6">Metas Concluídas</div>
                        <div class="text-h6 text-bold">{{ resumo?.metasConcluidas || 0 }} de {{
                            resumo?.totalDeMetasAtivas || 0 }}</div>
                    </div>
                </q-card-section>
            </q-card>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { ResumoMetasDTO } from 'src/Model/MetaFinanceira';

import { formatarValor } from 'src/helpers/FormatUtils';

defineProps<{
    resumo?: ResumoMetasDTO;
    loading?: boolean;
}>();
</script>

<style lang="scss" scoped>
.resumo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.resumo-card {
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
}
</style>
