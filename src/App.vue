<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const userStore = useEmailStore();
const compartilhamentoStore = useCompartilhamentoStore();

onMounted(() => {
  // Restaurar dados do usuário do localStorage
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  
  if (token) {
    // Tentar decodificar email do token ou usar valor salvo se existisse (mas backend retorna no login)
    // Por simplicidade, vamos assumir que o fluxo de login já seta, mas em refresh precisamos restaurar.
    // Como não temos o email no localStorage explicitamente (só token), 
    // idealmente o AuthService deveria ter um método getUserInfo() ou decodificar o token.
    // Mas vamos usar o que temos. Se o userName está lá, usamos.
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
