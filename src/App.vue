<template>
  <AppLoadingScreen :visible="isAuthenticating" />
  <router-view v-if="!isAuthenticating" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { isTokenExpired } from './helpers/JwtHelper';
import { refreshTokenManager } from './services/RefreshTokenManager';
import AppLoadingScreen from './components/AppLoadingScreen.vue';

const userStore = useEmailStore();
const compartilhamentoStore = useCompartilhamentoStore();
const isAuthenticating = ref(false);

onMounted(async () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const userName = localStorage.getItem('userName');

  // Se há token e ele está expirado, mostra o loading enquanto renova
  if (token && refreshToken && isTokenExpired(token)) {
    isAuthenticating.value = true;

    try {
      await refreshTokenManager.refreshIfNeeded();
    } catch (error) {
      console.error('[App] Falha ao renovar token na inicialização:', error);
    } finally {
      // Garante um tempo mínimo de exibição para evitar flash
      await new Promise(resolve => setTimeout(resolve, 400));
      isAuthenticating.value = false;
    }
  }

  // Restaurar dados do usuário do localStorage
  const currentToken = localStorage.getItem('token');
  if (currentToken) {
    if (userName) {
      userStore.setName(userName);
    }

    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      userStore.setEmail(userEmail);
    }

    // Restaurar contexto de compartilhamento
    compartilhamentoStore.restaurarContextoDoLocalStorage();
  }
});
</script>
