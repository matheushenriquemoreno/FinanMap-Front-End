<template>
  <q-avatar :size="size" class="user-avatar">
    <img :src="avatarSrc" :alt="avatarAlt" />
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { normalizarAvatarId, obterCaminhoAvatar } from 'src/models/Usuario';

const props = withDefaults(
  defineProps<{
    avatarId?: string | null;
    size?: string;
    alt?: string;
  }>(),
  {
    size: '40px',
    alt: 'Avatar do usuário',
  },
);

const avatarSrc = computed(() => obterCaminhoAvatar(normalizarAvatarId(props.avatarId)));
const avatarAlt = computed(() => props.alt ?? 'Avatar do usuário');
</script>

<style scoped>
.user-avatar {
  overflow: hidden;
}

.user-avatar img {
  object-fit: contain;
  padding: 0;
  margin: 0;
}
</style>
