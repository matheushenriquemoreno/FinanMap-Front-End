<template>
    <q-input :model-value="textoFormatado" @keydown="onKeydown" @paste="onPaste" v-bind="inputProps" inputmode="numeric"
        prefix="R$ ">
        <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps ?? {}" />
        </template>
    </q-input>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        modelValue: number | null;
        label?: string;
        outlined?: boolean;
        filled?: boolean;
        rounded?: boolean;
        dense?: boolean;
        autofocus?: boolean;
        readonly?: boolean;
        rules?: ((val: any) => boolean | string)[];
        hint?: string;
        placeholder?: string;
        lazyRules?: boolean | 'ondemand';
    }>(),
    {
        label: '',
        outlined: true,
        filled: false,
        rounded: true,
        dense: true,
        autofocus: false,
        readonly: false,
        lazyRules: false,
    }
);

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
}>();

/**
 * Buffer interno de dígitos — os últimos 2 dígitos representam centavos.
 * Ex: "123050" → R$ 1.230,50 (valor = 1230.50)
 */
const digitBuffer = ref('');

/**
 * Sincroniza o buffer quando o modelValue muda externamente
 * (ex: abrir modal com valor pré-preenchido).
 */
watch(() => props.modelValue, (val) => {
    if (val === null || val === undefined || val <= 0) {
        digitBuffer.value = '';
        return;
    }
    // Converte número para string de centavos sem trailing zeros falsos
    const centavos = Math.round(val * 100);
    const expected = centavos.toString();
    if (digitBuffer.value !== expected) {
        digitBuffer.value = expected;
    }
}, { immediate: true });

/**
 * Formata o buffer de centavos para exibição no padrão BR.
 * Ex: buffer "123050" → "1.230,50"
 */
const textoFormatado = computed(() => {
    if (!digitBuffer.value) return '';
    const centavos = parseInt(digitBuffer.value, 10);
    const reais = (centavos / 100).toFixed(2);
    const partes = reais.split('.');
    const parteInteira = (partes[0] ?? '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const parteDecimal = partes[1] ?? '00';
    return `${parteInteira},${parteDecimal}`;
});

/** Valor numérico derivado do buffer */
function bufferParaNumero(): number | null {
    if (!digitBuffer.value) return null;
    return parseInt(digitBuffer.value, 10) / 100;
}

/**
 * Intercepta teclas para gerenciar o buffer diretamente.
 * Dígitos são adicionados, Backspace/Delete removem.
 */
function onKeydown(event: KeyboardEvent) {
    if (props.readonly) return;

    const navegacao = ['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'];
    if (navegacao.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return;

    event.preventDefault();

    if (/^\d$/.test(event.key)) {
        if (digitBuffer.value.length >= 12) return;
        digitBuffer.value += event.key;
        emit('update:modelValue', bufferParaNumero());
    } else if (event.key === 'Backspace') {
        digitBuffer.value = digitBuffer.value.slice(0, -1);
        emit('update:modelValue', bufferParaNumero());
    } else if (event.key === 'Delete') {
        digitBuffer.value = '';
        emit('update:modelValue', null);
    }
}

/**
 * Intercepta colagem (Ctrl+V) — extrai apenas dígitos do texto colado.
 */
function onPaste(event: ClipboardEvent) {
    event.preventDefault();
    if (props.readonly) return;

    const textoPasted = event.clipboardData?.getData('text') ?? '';
    const apenasDigitos = textoPasted.replace(/\D/g, '');
    if (!apenasDigitos) return;

    const novoBuffer = (digitBuffer.value + apenasDigitos).slice(0, 12);
    digitBuffer.value = novoBuffer;
    emit('update:modelValue', bufferParaNumero());
}

/**
 * Props repassadas ao q-input.
 */
const inputProps = computed(() => ({
    label: props.label,
    outlined: props.outlined,
    filled: props.filled,
    rounded: props.rounded,
    dense: props.dense,
    autofocus: props.autofocus,
    readonly: props.readonly,
    rules: props.rules
        ? props.rules.map(rule => () => rule(props.modelValue))
        : undefined,
    hint: props.hint,
    placeholder: props.placeholder,
    lazyRules: props.lazyRules,
}));
</script>
