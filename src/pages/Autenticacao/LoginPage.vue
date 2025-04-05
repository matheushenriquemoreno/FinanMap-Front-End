<template>
  <div class="container-login">
    <img :src="logo" class="logo" />

    <div class="card-login">
      <div class="q-pa-md text-center">
        <div class="text-h5 text-weight-bolder q-mb-md">Seja bem vindo!</div>
        <div class="text-body1 text-weight-regular q-mb-lg">Para login digite seu e-mail</div>
        <q-form @submit="handleLogin">
          <q-input
            filled
            v-model.trim="email"
            type="text"
            placeholder="E-mail"
            lazy-rules
            dense
            :rules="[(val) => (val && val.length > 0) || 'E-mail obrigatório']"
          />

          <div class="">
            <q-btn
              :loading="authService.loading.value"
              class="button-entrar"
              color="primary"
              type="submit"
            >
              Entrar
              <template v-slot:loading>
                <q-spinner class="on-left" :thickness="5" />
              </template>
            </q-btn>
          </div>
          <div class="q-gutter-xs q-mt-md">
            <q-btn flat color="primary" to="/register" dense no-caps style="cursor: pointer">
              Não tem uma conta? Cadastre-se
            </q-btn>
          </div>
        </q-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import logo from 'src/assets/logo-sem-fundo-menor.png';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { obterAuthService } from 'src/services/AuthService';

const router = useRouter();
const email = ref('');
const userStore = useEmailStore();
const authService = obterAuthService();

const handleLogin = async () => {
  await authService.login(email.value);
  userStore.setEmail(email.value);
  await router.push('/verify');
};
</script>

<style scoped>
/*Criar media query para telas menores */

.button-entrar {
  width: 90%;
  border-radius: 10px;
  font-size: medium;
}
</style>
