<template>
  <q-card flat>
    <q-form>
      <q-card-section>
        <div class="text-h6 text-weight-bold">Informações da Conta</div>
        <q-separator class="q-mb-sm" />
        <div v-if="loading" class="q-pa-md"><q-spinner color="primary" /> Carregando...</div>
        <div class="row" v-else>
          <div class="col-sm-6 col-12 q-pa-sm">
            <q-input v-model="usuario.nome" label="Nome" readonly />
          </div>
          <div class="col-sm-6 col-12 q-pa-sm">
            <q-input v-model="usuario.email" label="E-mail" readonly />
          </div>
        </div>
      </q-card-section>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { CreateIntanceAxios } from 'src/helpers/api/AxiosHelper';
import { onMounted, ref } from 'vue';

interface UsuarioSistema {
  nome: string;
  email: string;
}

const usuario = ref<UsuarioSistema>({} as UsuarioSistema);
const loading = ref(false);
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
