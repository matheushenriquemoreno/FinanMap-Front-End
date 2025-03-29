<template>
  <div class="container-login">
    <img :src="logo" class="logo" />

    <div class="card-login">
      <div class="q-pa-md text-center">
        <div class="text-h4 text-weight-bolder q-mb-sm">Confirmação de Login</div>
        <div class="text-body1 text-weight-regular q-mb-lg">{{ message }}</div>
        <q-form @submit="handleVerify" class="q-gutter-xs">
          <q-input
            filled
            v-model.trim="code"
            type="text"
            placeholder="Digite o código de verificação"
            lazy-rules
            dense
            :rules="[(val) => (val && val.length > 0) || 'código de verificação obrigatório']"
          />

          <div class="q-gutter-xs q-mt-sm">
            <q-btn
              :loading="loading"
              color="primary"
              type="submit"
              size="md"
              no-caps
              style="width: 280px; border-radius: 10px; font-size: medium"
            >
              Verificar
              <template v-slot:loading>
                <q-spinner class="on-left" :thickness="5" />
              </template>
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
const code = ref('');
const message = ref('Digite o código enviado para seu email');
const errorMessage = ref('');
const loading = ref(false);
const userStore = useEmailStore();

const handleVerify = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';

    const options = {
      method: 'POST',
      url: process.env.URL_API + 'login/validate-code',
      data: {
        email: userStore.getEmail(),
        codigo: code.value,
      },
      headers: { 'Content-Type': 'application/json' },
    };

    const result = await axios.request(options);
    localStorage.setItem('token', result.data.token);
    message.value = 'Email verificado com sucesso!';
    setTimeout(() => {
      loading.value = false;
      router.push('/');
    }, 1500);
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        $q.notify({
          message: error.response?.data.errors ?? 'Codigo informado invalido, ou expirado.',
          type: 'my-notif',
          position: 'top',
          color: 'white',
          textColor: 'black',
          iconColor: 'red',
          progress: true,
          icon: 'info',
        });
      }
    }
  } finally {
    loading.value = false;
  }
};
</script>
