<template>
  <q-select
    v-bind="attrs"
    map-options
    :dense="styled?.dense ?? false"
    :filled="styled?.filled ?? false"
    :rounded="styled?.rounded ?? false"
    :borderless="styled?.borderless ?? false"
    v-model="modelLocal"
    :options="optionsAno"
    emit-value
    :label="label"
    behavior="menu"
  >
    <template v-slot:option="{ itemProps, opt, selected }">
      <q-item v-bind="itemProps">
        <q-item-section avatar>
          <q-icon :name="selected ? 'check' : 'chevron_right'" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt }}</q-item-label>
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

const optionsAno = ref(Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i));

const modelLocal = computed({
  get(): number {
    return props.modelValue;
  },
  set(value: number) {
    emit('update:modelValue', value);
  },
});
</script>
