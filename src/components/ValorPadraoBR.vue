<template>
  {{
    valor.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    })
  }}
</template>

<script setup lang="ts">
defineProps({
  valor: {
    type: Number,
    required: true,
  },
});
</script>
