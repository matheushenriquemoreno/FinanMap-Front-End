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
            v-model="email"
            type="text"
            placeholder="E-mail"
            lazy-rules
            dense
            :rules="[(val) => (val && val.length > 0) || 'E-mail obrigatório']"
          />

          <div class="">
            <q-btn :loading="loading" class="button-entrar" color="primary" type="submit">
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
import axios, { AxiosError } from 'axios';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const email = ref('');
const loading = ref(false);
const userStore = useEmailStore();

const handleLogin = async () => {
  try {
    loading.value = true;
    console.log(process.env.URL_API);

    const options = {
      method: 'POST',
      url: process.env.URL_API + 'login',
      data: {
        email: email.value,
      },
      headers: { 'Content-Type': 'application/json' },
    };

    const result = await axios.request(options);

    console.log(result);

    userStore.setEmail(email.value);
    await router.push('/verify');
  } catch (error) {
    if (error instanceof AxiosError) {
      let mensage = 'Ocorreu um erro inesperado, tente novamente mais tarde!';
      if (error.response?.status === 400 || error.response?.status === 404) {
        mensage = 'Certifique-se de que o email está correto, ou o cadastro esteja realizado!';
      }
      $q.notify({
        message: mensage,
        type: 'my-notif',
        position: 'top',
        color: 'white',
        textColor: 'black',
        iconColor: 'red',
        progress: true,
        icon: 'info',
      });
    }
  } finally {
    loading.value = false;
  }
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
