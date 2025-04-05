<template>
  <q-layout view="hHh lpR fFf" class="rounded-borders">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar class="GNL__toolbar" style="height: 65px">
        <q-toolbar-title v-if="$q.screen.gt.xs" shrink class="row items-center no-wrap">
          <q-avatar>
            <img src="/favicon.ico" />
          </q-avatar>
          <span class="text-white text-h6 q-ml-sm">FinanMap</span>
        </q-toolbar-title>
        <q-item to="/" class="menu-title" clickable v-ripple active-class="text-white">
          <q-item-section avatar>
            <q-avatar icon="edit_calendar" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Mês a Mês</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/Graficos" class="menu-title" clickable v-ripple active-class="text-white">
          <q-item-section avatar>
            <q-avatar icon="equalizer" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="menu-title">Graficos</q-item-label>
          </q-item-section>
        </q-item>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- <q-btn round dense flat icon="notifications">
            <q-badge color="red" text-color="white" floating> 2 </q-badge>
            <q-tooltip>Notificações</q-tooltip>
          </q-btn> -->
          <q-btn round flat @click="() => (abrirModalConfig = !abrirModalConfig)">
            <q-icon name="settings" size="25px" />
            <q-tooltip>Configurações</q-tooltip>
          </q-btn>
          <q-btn round flat>
            <q-icon name="person" size="26px" />
            <q-tooltip>Conta</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container class="q-pa-xs">
      <router-view />
    </q-page-container>

    <ModalConfiguracoes v-model:model-value="abrirModalConfig" />
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ModalConfiguracoes from 'src/components/Configuracoes/ModalConfiguracoes.vue';

import logo from 'src/assets/logo-sem-fundo-menor.png';
import { ref } from 'vue';
const router = useRouter();
const abrirModalConfig = ref(false);

defineOptions({
  name: 'MainLayout',
});
</script>

<style scoped>
.menu-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #808290;
}
</style>
<style lang="sass" scoped>
.menu-list .q-item
  border-radius: 0 32px 32px 0
</style>
