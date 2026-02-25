<template>
  <q-banner
    v-if="compartilhamentoStore.emModoCompartilhado"
    rounded
    class="q-mb-md banner-compartilhado"
    :class="$q.dark.isActive ? 'bg-blue-9' : 'bg-blue-1'"
  >
    <template v-slot:avatar>
      <q-icon name="share" :color="$q.dark.isActive ? 'blue-3' : 'primary'" />
    </template>
    <div>
      <span class="text-weight-medium">Modo Compartilhado</span>
      <span class="text-caption q-ml-xs">
        — Visualizando dados de
        <strong>{{ compartilhamentoStore.contextoAtivo?.proprietarioNome }}</strong>
        ({{ permissaoLabel }})
      </span>
    </div>
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { NivelPermissao } from 'src/models/Compartilhamento';

const compartilhamentoStore = useCompartilhamentoStore();

const permissaoLabel = computed(() =>
  compartilhamentoStore.contextoAtivo?.permissao === NivelPermissao.Editar
    ? 'Edição'
    : 'Somente leitura'
);
</script>

<style scoped>
.banner-compartilhado {
  border-left: 4px solid #1976d2;
}
</style>
