<template>
  <q-select
    v-model="localModelValue"
    :options="optionsLocal"
    options-selected-class="text-green"
    :option-value="configuracoes?.valueObjeto ?? 'value'"
    :option-label="configuracoes?.labelObjeto ?? 'label'"
    filled
    clearable
    rounded
    use-input
    :emit-value="configuracoes?.emitirSomenteValor ?? true"
    map-options
    :label="label"
    :multiple="configuracoes?.multiselect ?? false"
    @filter="filtrarPesquisa"
    :rules="rules"
    :disable="disable"
    options-cover
    transition-show="scale"
    transition-hide="scale"
    behavior="menu"
  >
    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
      <q-item v-if="configuracoes?.multiselect ?? false" v-bind="itemProps">
        <q-item-section>
          <q-item-label>{{ opt[configuracoes?.labelObjeto ?? 'label'] }} </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
        </q-item-section>
      </q-item>

      <q-item v-else v-bind="itemProps">
        <q-item-section avatar>
          <q-icon :name="selected ? 'check' : 'chevron_right'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt[configuracoes?.labelObjeto ?? 'label'] }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> Nenhum resultado encontrado </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { ref, computed } from 'vue';
import type { ValidationRule } from 'quasar';
import type { PropsSelectServer } from './types';

// Define props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  configuracoes: {
    type: Object as PropType<PropsSelectServer>,
    required: false,
  },
  modelValue: {
    type: Object as PropType<any>,
    required: true,
  },
  rules: {
    type: Array as PropType<ValidationRule[]>,
    required: false,
    default: () => [],
  },
  disable: {
    type: Boolean,
    default: false,
    required: false,
  },
});

// Define emits
const emit = defineEmits(['update:modelValue', 'modelAlterado']);

// Estado
const opcoes = ref<Array<any>>([]);

// Métodos
const preencherdados = async (filtro?: string) => {
  const dados = (await props.configuracoes?.obterDados(filtro ?? '')) ?? [];
  opcoes.value = dados;
};

const filtrarPesquisa = (val: string, update: any, abort: any) => {
  update(async () => {
    if (val === '') {
      await preencherdados();
    } else {
      const pesquisa = val.toLowerCase();
      await preencherdados(pesquisa);
    }
  });
};

// Computed properties
const optionsLocal = computed(() => {
  return [...opcoes.value, ...(props.configuracoes?.defaultOptions ?? [])];
});

const localModelValue = computed({
  get: () => props.modelValue,
  set: (newValue: any) => {
    emit('update:modelValue', newValue);
    emit('modelAlterado', newValue);
  },
});

defineExpose({
  preencherdados,
  filtrarPesquisa,
});
</script>
