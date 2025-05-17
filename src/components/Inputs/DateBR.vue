<template>
  <q-input
    v-bind="attrs"
    :dense="styled?.dense ?? false"
    :filled="styled?.filled ?? false"
    :rounded="styled?.rounded ?? false"
    :borderless="styled?.borderless ?? false"
    :label="label"
    v-model="modelLocalDisplay"
    :rules="[(val) => validarData(val) || 'Digite uma data válida!']"
    :hint="hintDisplay"
  >
    <template v-slot:append>
      <q-icon name="event" color="black" class="cursor-pointer">
        <q-popup-proxy ref="proxyIten" cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="modelLocalDisplay"
            mask="DD/MM/YYYY"
            today-btn
            @update:model-value="() => proxyIten.hide()"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Fechar" icon="close" flat dense></q-btn>
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref } from 'vue';
import type { PropType } from 'vue';
import { useAttrs } from 'vue';
import type { styles } from './types';

const attrs = useAttrs();

// Definindo props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  styled: {
    type: Object as PropType<styles>,
    required: true,
  },
  modelValue: {
    type: Date,
    required: true,
  },
});

// Definindo emits
const emit = defineEmits(['update:modelValue']);

const modelLocalDisplay = computed({
  get(): string {
    return converterDateParaFormatoBR(props.modelValue);
  },
  set(value: string) {
    if (validarData(value)) {
      const date = converterDataBRParaDate(value);
      emit('update:modelValue', date);
    } else {
      emit('update:modelValue', null);
    }
  },
});

const hintDisplay = computed(() => {
  if (props.modelValue === null) return '';

  return props.modelValue.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const proxyIten = ref();

/**
 * Converte um objeto Date para string no formato brasileiro (DD/MM/YYYY)
 * @param data Objeto Date a ser convertido
 * @returns String contendo a data no formato DD/MM/YYYY
 */
function converterDateParaFormatoBR(data: Date): string {
  // Verifica se a data é válida
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    return '';
  }

  // Obtém dia, mês e ano
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() retorna 0-11
  const ano = data.getFullYear();

  // Formata a string no padrão brasileiro
  return `${dia}/${mes}/${ano}`;
}

/**
 * Valida uma data no formato brasileiro (DD/MM/YYYY)
 * @param inputString String contendo a data a ser validada
 * @returns boolean indicando se a data é válida
 */
function validarDataBR(inputString: string): boolean {
  // Verifica se está vazio e não é obrigatório
  if (!inputString && !props.required) {
    return true;
  }

  // Define o padrão de expressão regular para datas brasileiras (DD/MM/YYYY)
  const padrao = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

  if (!padrao.test(inputString)) {
    return false;
  }

  // Validação adicional: verifica se a data existe no calendário
  try {
    const data = converterDataBRParaDate(inputString);
    return !isNaN(data.getTime());
  } catch (e) {
    return false;
  }
}

/**
 * Converte uma string de data no formato brasileiro para um objeto Date
 * @param dataPadraoBR String contendo a data no formato DD/MM/YYYY
 * @returns Objeto Date correspondente à data informada
 */
function converterDataBRParaDate(dataPadraoBR: string): Date {
  const partes = dataPadraoBR.split('/');
  if (partes && partes.length === 3) {
    const dia = parseInt(partes[0] ?? '', 10);
    const mes = parseInt(partes[1] ?? '', 10) - 1; // Mês em JS começa em 0
    const ano = parseInt(partes[2] ?? '', 10);
    return new Date(ano, mes, dia);
  }
  throw new Error('Data inválida');
}

/**
 * Valida se a data digitada está correta
 * @param dataDigitada String contendo a data a ser validada
 * @returns boolean indicando se a data é válida
 */
function validarData(dataDigitada: string | undefined): boolean {
  if (!dataDigitada && !props.required) {
    return true;
  }

  return validarDataBR(dataDigitada || '');
}
</script>
