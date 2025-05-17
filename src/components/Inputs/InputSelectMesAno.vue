<template>
  <div class="text-start">
    <span class="periodo-label"> {{ label }} </span>
    <div class="flex justify-center items-center q-gutter-sm gap-1">
      <div style="width: 45%; min-width: 220px">
        <InputSelectMes label="Mês" v-model:model-value="modelLocal.mes" :styled="styled" />
      </div>

      <div style="width: 45%; min-width: 220px">
        <InputSelectAno
          v-bind="attrs"
          label="Ano"
          v-model:model-value="modelLocal.ano"
          :styled="styled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, defineProps, defineEmits } from 'vue';
import { useAttrs } from 'vue';
import type { styles } from './types';

import InputSelectAno from './InputSelectAno.vue';
import InputSelectMes from './InputSelectMes.vue';
import type { MesAno } from 'src/Model/Transacao';

const attrs = useAttrs();

// Definindo props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Object as PropType<MesAno>,
    required: true,
  },
  styled: {
    type: Object as PropType<styles>,
    required: false,
    default: () => ({
      dense: false,
      filled: false,
      rounded: false,
      borderless: false,
    }),
  },
});

// Definindo emits
const emit = defineEmits(['update:modelValue']);

const modelLocal = computed({
  get() {
    return props.modelValue;
  },
  set(value: any) {
    emit('update:modelValue', value);
  },
});
</script>

<style scoped>
.periodo-label {
  display: block;
  position: relative;
  font-weight: bold;
  margin-left: 15px;
}
</style>
