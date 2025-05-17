<template>
  <q-select
    v-bind="attrs"
    :dense="styled?.dense ?? false"
    :filled="styled?.filled ?? false"
    :rounded="styled?.rounded ?? false"
    :borderless="styled?.borderless ?? false"
    v-model="modelLocal"
    :options="optionsMes"
    emit-value
    map-options
    :label="label"
    behavior="menu"
  >
    <template v-slot:option="{ itemProps, opt, selected }">
      <q-item v-bind="itemProps">
        <q-item-section avatar>
          <q-icon :name="selected ? 'check' : 'chevron_right'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt['label'] }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, defineProps, defineEmits, ref } from 'vue';
import { useAttrs } from 'vue';
import type { styles } from './types';
const attrs = useAttrs();

// Definindo props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Number,
    required: true,
  },
  styled: {
    type: Object as PropType<styles>,
    required: false,
  },
});

// Definindo emits
const emit = defineEmits(['update:modelValue']);

const optionsMes = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
];

const modelLocal = computed({
  get(): number {
    return props.modelValue;
  },
  set(value: number) {
    emit('update:modelValue', value);
  },
});
</script>
