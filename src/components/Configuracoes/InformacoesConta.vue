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
    </div>
  </div>
</template>

<script setup lang="ts">
import { CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import { useThemeStore } from 'src/stores/theme-store';
import { computed, onMounted, ref } from 'vue';

interface UsuarioSistema {
  nome: string;
  email: string;
}

const usuario = ref<UsuarioSistema>({} as UsuarioSistema);
const loading = ref(false);
const themeStore = useThemeStore();

const isDark = computed({
  get: () => themeStore.isDark,
  set: (val: boolean) => themeStore.setTheme(val),
});

onMounted(async () => {
  await buscarUsuario();
});

async function buscarUsuario() {
  loading.value = true;
  const axios = CreateIntanceAxios();
  const result = await axios.get<UsuarioSistema>(process.env.URL_API + 'user/');
  usuario.value = result.data;
  loading.value = false;
}
</script>
