<template>
  <q-layout view="hHh lpR fFf" class="rounded-borders">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar class="GNL__toolbar" style="height: 65px">
        <q-btn flat dense round @click="toggleLeftDrawer" aria-label="Menu" icon="menu" />

        <q-toolbar-title v-if="$q.screen.gt.xs" shrink class="row items-center no-wrap">
          <q-avatar>
            <img src="/favicon.ico" />
          </q-avatar>
          <span class="text-white text-h6 q-ml-sm">FinanMap</span>
        </q-toolbar-title>
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            round
            dense
            flat
            color="grey-4"
            @click="() => (abrirModalConfig = !abrirModalConfig)"
          >
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

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :breakpoint="1100"
      class="bg-grey-1"
      :width="$q.screen.gt.xs ? 300 : 260"
    >
      <q-scroll-area
        style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd"
      >
        <q-list padding>
          <q-item to="/" class="menu-title" clickable v-ripple active-class="text-dark">
            <q-item-section avatar>
              <q-avatar icon="edit_calendar" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Mês a Mês</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/dashbord" class="menu-title" clickable v-ripple active-class="text-dark">
            <q-item-section avatar>
              <q-avatar icon="equalizer" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashbord</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div class="absolute-top q-pa-md bg-dark" style="height: 150px">
        <div class="text-white text-center">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="/avatar.svg" />
          </q-avatar>
          <div>Seja bem vindo,</div>
          <div class="text-weight-bold">{{ username }}</div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="q-pa-xs">
      <router-view />
    </q-page-container>

    <ModalConfiguracoes v-model:model-value="abrirModalConfig" />
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ModalConfiguracoes from 'src/components/Configuracoes/ModalConfiguracoes.vue';

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
const leftDrawerOpen = ref(false);

import { ref } from 'vue';
const router = useRouter();
const abrirModalConfig = ref(false);
const username = localStorage.getItem('userName')?.split(' ', 2).join(' ');

defineOptions({
  name: 'MainLayout',
});
</script>

<style scoped>
.menu-title {
  font-weight: 600;
  font-size: 1.1rem;
  color: #646464;
}
</style>
<style lang="sass" scoped>
.menu-list .q-item
  border-radius: 0 32px 32px 0
</style>
