<template>
  <div class="q-pa-none">
    <div v-if="loading" class="q-pa-md"><q-spinner color="primary" /> Carregando...</div>
    <div class="column q-gutter-md" v-else>
      <div class="row items-center q-gutter-md">
        <q-avatar size="70px" font-size="40px" color="primary" text-color="white">
          {{ usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'U' }}
        </q-avatar>
        <div>
          <div class="text-h6 text-weight-bold">{{ usuario.nome }}</div>
          <div class="text-subtitle2" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
            {{ usuario.email }}
          </div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Aparência</div>
        <div class="text-caption text-grey-7 q-mb-md">
          Escolha como o FinanMap se apresenta para você.
        </div>
        
        <q-btn-toggle
          v-model="isDark"
          spread
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="grey-3"
          text-color="grey-9"
          :options="[
            { label: 'Claro', value: false, icon: 'light_mode' },
            { label: 'Escuro', value: true, icon: 'dark_mode' }
          ]"
        />
      </div>

      <q-separator class="q-my-md" />

      <div>
        <div class="text-subtitle1 text-weight-bold q-mb-sm">Notificações</div>
        <div class="text-caption text-grey-7 q-mb-md">
          Gerencie as preferências de notificações enviadas pelo FinanMap.
        </div>

        <!-- Se estiver em modo compartilhado (como convidado) -->
        <q-banner v-if="emModoCompartilhado" class="bg-amber-1 text-amber-9 q-mb-md rounded-borders" rounded dense style="border-radius: 8px;">
          <q-icon name="warning" class="q-mr-xs" size="18px" />
          Você está acessando os dados compartilhados de <strong>{{ proprietarioNome }}</strong>. 
          As preferências de notificação por e-mail estão disponíveis apenas na sua conta pessoal.
        </q-banner>

        <div v-if="loadingConfig" class="q-pa-md row justify-center">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <q-card v-else flat bordered class="config-card q-pa-md" style="border-radius: 12px;">
          <div class="row items-center justify-between no-wrap">
            <div class="q-pr-md">
              <div class="text-subtitle1 text-bold">Lembretes por E-mail</div>
              <div class="text-caption text-grey-6 q-mt-xs">
                Receba lembretes automáticos por e-mail com antecedência sobre seus custos fixos que estão com o vencimento próximo.
              </div>
            </div>
            <q-toggle
              v-model="receberNotificacoes"
              color="primary"
              :disable="emModoCompartilhado"
              @update:model-value="salvarConfiguracao"
            />
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import { useThemeStore } from 'src/stores/theme-store';
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import getCustoFixoService from 'src/services/CustoFixoService';

interface UsuarioSistema {
  nome: string;
  email: string;
}

const usuario = ref<UsuarioSistema>({} as UsuarioSistema);
const loading = ref(false);
const themeStore = useThemeStore();

const $q = useQuasar();
const service = getCustoFixoService();
const compartilhamentoStore = useCompartilhamentoStore();

const loadingConfig = ref(false);
const receberNotificacoes = ref(true);

const emModoCompartilhado = computed(() => compartilhamentoStore.emModoCompartilhado);
const proprietarioNome = computed(() => compartilhamentoStore.contextoAtivo?.proprietarioNome || '');

const isDark = computed({
  get: () => themeStore.isDark,
  set: (val: boolean) => themeStore.setTheme(val),
});

onMounted(async () => {
  await buscarUsuario();
  if (!emModoCompartilhado.value) {
    await carregarConfiguracao();
  }
});

async function buscarUsuario() {
  loading.value = true;
  const axios = CreateIntanceAxios();
  const result = await axios.get<UsuarioSistema>(process.env.URL_API + 'user/');
  usuario.value = result.data;
  loading.value = false;
}

async function carregarConfiguracao() {
  loadingConfig.value = true;
  try {
    const res = await service.obterConfiguracoes();
    receberNotificacoes.value = res.receberNotificacoes;
  } catch (error) {
    console.error('Erro ao obter configurações de custos fixos:', error);
  } finally {
    loadingConfig.value = false;
  }
}

async function salvarConfiguracao(novoValor: boolean) {
  try {
    await service.atualizarOptOut(novoValor);
    $q.notify({
      type: 'positive',
      message: `Preferência de lembretes atualizada com sucesso! 🎯`,
    });
  } catch (error) {
    // Reverter localmente em caso de falha (handleErrorAxios já notifica)
    receberNotificacoes.value = !novoValor;
  }
}
</script>

<style scoped>
.config-card {
  transition: box-shadow 0.3s;
}
.config-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>
