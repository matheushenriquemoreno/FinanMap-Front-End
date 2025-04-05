<template>
  <q-dialog v-model="localModelValue" position="top">
    <q-card
      style="
        width: 1200px;
        max-width: 90vw;
        margin-top: 40px;
        border-radius: 15px;
        min-height: 450px;
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Configurações</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />
      <q-card-section>
        <q-splitter v-model="splitterModel" :limits="[20]" style="max-width: 100vw">
          <template v-slot:before>
            <div>
              <q-tabs v-model="tab" vertical class="text-dark" inline-label>
                <q-tab name="categoria" icon="category" label="Categorias" />
                <q-tab name="conta" icon="manage_accounts" label="Conta" />
              </q-tabs>
            </div>
          </template>

          <template v-slot:after>
            <q-tab-panels
              v-model="tab"
              animated
              swipeable
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel name="categoria">
                <CategoriaConfig />
              </q-tab-panel>

              <q-tab-panel name="conta">
                <UsuarioVisualizacao />
              </q-tab-panel>
            </q-tab-panels>
          </template>
        </q-splitter>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CategoriaConfig from './CategoriaConfig.vue';
import UsuarioVisualizacao from './UsuarioVisualizacao.vue';
// props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

// Emits do componente
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// Variaveis
const localModelValue = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
});

const splitterModel = ref(15);

const tab = ref('categoria');
</script>
