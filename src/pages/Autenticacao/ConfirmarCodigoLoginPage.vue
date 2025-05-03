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
              :loading="authService.loading.value"
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { obterAuthService } from 'src/services/AuthService';

const authService = obterAuthService();
const router = useRouter();
const code = ref('');
const message = ref('Digite o código enviado para seu email');
const userStore = useEmailStore();

onMounted(() => {
  const email = userStore.getEmail();
  if (!email) {
    router.push({ name: 'LoginPage' });
  }
});

const handleVerify = async () => {
  const email = userStore.getEmail();
  if (email === null) return;
  const result = await authService.verifyCode(email, code.value);
  localStorage.setItem('token', result.token);
  localStorage.setItem('userName', result.nomeUsuario);
  message.value = 'Email verificado com sucesso!';
  router.push('/');
};
</script>
