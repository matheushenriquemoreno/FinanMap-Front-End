<template>
  <div class="container-login">
    <img :src="logo" class="logo" />

    <div class="card-login">
      <div class="q-pa-md text-center">
        <div class="text-h4 text-weight-bolder q-mb-md">Criar nova conta</div>

        <q-form @submit="handleRegister" class="q-gutter-xs">
          <q-input
            filled
            v-model.trim="name"
            placeholder="Digite seu nome"
            lazy-rules
            dense
            :rules="[(val) => (val && val.length > 0) || 'Nome obrigatório']"
          />

          <q-input
            filled
            v-model.trim="email"
            type="text"
            placeholder="Digite seu e-mail"
            lazy-rules
            dense
            :rules="[(val) => (val && val.length > 0) || 'E-mail obrigatório']"
          />

          <div class="q-gutter-xs q-mt-sm">
            <q-btn
              :loading="authService.loading.value"
              class="rou"
              color="primary"
              type="submit"
              size="md"
              style="width: 280px; border-radius: 10px; font-size: medium"
            >
              Cadastrar
              <template v-slot:loading>
                <q-spinner class="on-left" :thickness="5" />
              </template>
            </q-btn>
          </div>
          <div class="q-gutter-xs q-mt-md">
            <q-btn flat color="primary" to="/login" dense no-caps>
              Já tem uma conta? Entre aqui
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
const name = ref('');
const userStore = useEmailStore();
const authService = obterAuthService();

const handleRegister = async () => {
  try {
    await authService.register(email.value, name.value);
    userStore.setEmail(email.value);
    await router.push('/verify');
  } catch (error) {
    console.error('Erro durante o cadastro:', error);
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center; /* Centraliza horizontalmente */
  align-items: center; /* Centraliza verticalmente */
  height: 100vh; /* Faz o container ocupar toda a altura da tela */
}
</style>
