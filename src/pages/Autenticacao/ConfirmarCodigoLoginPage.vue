<template>
  <div class="container-login">
    <img
      :src="logo"
      class="logo"
      alt="FinanMap"
      width="360"
      height="299"
      fetchpriority="high"
      decoding="async"
    />

    <div class="card-login">
      <div class="q-pa-md text-center">
        <h1 class="text-h4 text-weight-bolder q-mb-sm">Confirmação de Login</h1>
        <div class="text-body1 text-weight-regular q-mb-lg">{{ message }}</div>
        <q-form @submit="handleVerify" class="q-gutter-xs">
          <q-input
            filled
            v-model="code"
            type="text"
            label="Código de verificação"
            placeholder="Digite o código de verificação"
            autocomplete="one-time-code"
            lazy-rules
            dense
            @update:model-value="
              (value) => {
                if (value && typeof value === 'string') {
                  code = value.toUpperCase().trim();
                }
              }
            "
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
import logo from 'src/assets/logo-auth.webp';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { obterAuthService } from 'src/services/AuthService';
import { notificar } from 'src/helpers/Notificacao';
import { sessionService } from 'src/services/SessionService';
import { tokenRenewalService } from 'src/services/TokenRenewalService';

const authService = obterAuthService();
const router = useRouter();
const code = ref('');
const message = ref('Digite o código enviado para seu email');
const userStore = useEmailStore();

onMounted(() => {
  const email = userStore.getEmail();
  if (!email) {
    void router.push({ name: 'LoginPage' });
  }
});

const handleVerify = async () => {
  const email = userStore.getEmail();
  if (email === null) return;
  const result = await authService.verifyCode(email, code.value);
  notificar('Login realizado com sucesso!');
  sessionService.start(result, { userName: result.nomeUsuario, userEmail: email });
  userStore.setName(result.nomeUsuario);
  tokenRenewalService.start();
  message.value = 'Email verificado com sucesso!';
  void router.push('/');
};
</script>
