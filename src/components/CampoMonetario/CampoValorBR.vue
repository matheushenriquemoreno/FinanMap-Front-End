<template>
  <q-input
    v-model="displayValue"
    :label="label"
    prefix="R$ "
    @update:model-value="updateValue"
    rounded
    filled
  >
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

// Definição das props
const props = defineProps({
  modelValue: {
    type: [Number],
    default: null,
  },
  label: {
    type: String,
    default: 'Valor',
  },
});

// Definição dos emits
const emit = defineEmits(['update:modelValue']);

// Formatar número para display (R$ 10.555,28)
const formatarParaExibicao = (valor: number | null | undefined): string => {
  if (valor === null || valor === undefined) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

// Estado local
const displayValue = ref<string>(formatarParaExibicao(props.modelValue));
const isInitialized = ref(false);

// Converter string formatada para número
const converterParaNumero = (valorFormatado: string): number => {
  // Remove R$, pontos e substitui vírgula por ponto
  const valorLimpo = valorFormatado
    .replace(/R\$\s*/g, '') // Remove R$ e espaços depois dele
    .replace(/\./g, '') // Remove pontos de milhar
    .replace(',', '.'); // Substitui vírgula decimal por ponto

  console.log('Valor limpo:', valorLimpo);
  return parseFloat(valorLimpo) || 0;
};

// Quando o usuário modifica o input
const updateValue = (value: string | number | null) => {
  let numeroValue = 0;
  if (typeof value === 'string') numeroValue = converterParaNumero(value);
  if (typeof value === 'number') numeroValue = value;
  emit('update:modelValue', numeroValue);
};

// Eventos de foco e blur para melhorar a experiência do usuário
const onBlur = () => {
  if (props.modelValue !== null && props.modelValue !== undefined) {
    displayValue.value = formatarParaExibicao(Number(props.modelValue));
  } else {
    displayValue.value = '';
  }
};

const onFocus = () => {
  if (displayValue.value) {
    // Ao focar, podemos mostrar o valor sem formatação para facilitar a edição
    const numeroValue = converterParaNumero(displayValue.value);
    displayValue.value = numeroValue.toString().replace('.', ',');
  }
};

// Observar mudanças no modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    console.log('modelValue changed:', newValue);
    if (newValue !== null && newValue !== undefined) {
      displayValue.value = formatarParaExibicao(Number(newValue));
    } else {
      displayValue.value = '';
    }
  },
);

// Inicialização
onMounted(() => {
  if (props.modelValue !== null && props.modelValue !== undefined) {
    displayValue.value = formatarParaExibicao(Number(props.modelValue));
  }
  isInitialized.value = true;
});

// Expor métodos que podem ser úteis externamente
defineExpose({
  formatarParaExibicao,
  converterParaNumero,
});
</script>
