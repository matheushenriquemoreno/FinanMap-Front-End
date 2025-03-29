<template>
  {{
    valor.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    })
  }}
</template>

<script setup lang="ts">
const props = defineProps({
  valor: {
    type: Number,
    required: true,
  },
});
</script>
