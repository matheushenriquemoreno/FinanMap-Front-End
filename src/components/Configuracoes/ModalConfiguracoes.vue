<template>
  <q-dialog v-model="localModelValue" full-height>
    <q-card
      class="row no-wrap overflow-hidden"
      style="width: 1200px; max-width: 90vw; border-radius: 15px"
    >
      <!-- Sidebar -->
      <div
        class="column"
        :class="[
          $q.dark.isActive ? 'bg-dark' : 'bg-grey-2',
          isMobile ? 'col-12' : 'col-auto sidebar-container',
        ]"
        v-show="!isMobile || showMobileMenu"
      >
        <div class="q-pa-md">
          <div
            class="text-h6 text-weight-bold"
            :class="[$q.dark.isActive ? 'text-white' : 'text-grey-9', isMobile ? 'q-mb-xs' : 'q-mb-md']"
          >
            Configurações
          </div>
          <div v-if="isMobile" class="text-caption text-grey-7 q-mb-md">
            Selecione uma opção abaixo para visualizar os detalhes
          </div>

          <q-input
            dense
            outlined
            v-model="search"
            placeholder="Pesquisar configuração"
            class="rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
            :dark="$q.dark.isActive"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-scroll-area class="col">
          <q-list padding :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
            <q-item
              v-for="item in filteredMenuItems"
              :key="item.value"
              clickable
              v-ripple
              :active="tab === item.value"
              :active-class="$q.dark.isActive ? 'active-item-dark' : 'active-item-light'"
              @click="selectTab(item.value)"
              class="q-my-xs"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>
              <q-item-section side v-if="isMobile">
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>

      <!-- Content -->
      <div
        class="column"
        :class="[$q.dark.isActive ? 'bg-dark' : 'bg-white', isMobile ? 'col-12' : 'col']"
        v-show="!isMobile || !showMobileMenu"
      >
        <!-- Header Content -->
        <div
          class="row items-center q-pa-md border-bottom"
          :class="$q.dark.isActive ? 'border-color-dark' : 'border-color-light'"
        >
          <q-btn
            v-if="isMobile"
            icon="arrow_back"
            flat
            round
            dense
            class="q-mr-sm"
            @click="showMobileMenu = true"
            :color="$q.dark.isActive ? 'white' : 'grey-8'"
          />
          <div
            class="text-h6 text-weight-bold"
            :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
          >
            {{ currentTabLabel }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
        </div>

        <!-- Body Content -->
        <q-scroll-area class="col q-pa-lg">
          <div class="content-wrapper">
            <InformacoesConta v-if="tab === 'conta'" />
            <CategoriaConfig v-else-if="tab === 'categoria'" />
          </div>
        </q-scroll-area>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import CategoriaConfig from './CategoriaConfig.vue';
import InformacoesConta from './InformacoesConta.vue';

// props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

// Emits do componente
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const $q = useQuasar();

// Variaveis
const localModelValue = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
});

const tab = ref('categoria');
const search = ref('');
const showMobileMenu = ref(true);

const isMobile = computed(() => $q.screen.lt.md);

const menuItems = [
  { label: 'Categorias', value: 'categoria', icon: 'category' },
  { label: 'Conta', value: 'conta', icon: 'person' },
];

const filteredMenuItems = computed(() => {
  if (!search.value) return menuItems;
  const term = search.value.toLowerCase();
  return menuItems.filter((item) => item.label.toLowerCase().includes(term));
});

const currentTabLabel = computed(() => {
  const item = menuItems.find((i) => i.value === tab.value);
  if (item) {
    return item.value === 'conta' ? 'Detalhes da conta' : item.label;
  }
  return '';
});

watch(localModelValue, (val) => {
  if (val) {
    showMobileMenu.value = true;
    search.value = ''; // Reset search on open
  }
});

function selectTab(newTab: string) {
  tab.value = newTab;
  if (isMobile.value) {
    showMobileMenu.value = false;
  }
}
</script>

<style scoped>
.sidebar-container {
  width: 300px;
  border-right: 1px solid;
  border-color: v-bind('$q.dark.isActive ? "#424242" : "#e0e0e0"');
}

.active-item-light {
  background-color: #e5e5e5;
  color: #000;
  font-weight: 600;
  position: relative;
}

.active-item-dark {
  background-color: #424242;
  color: #fff;
  font-weight: 600;
  position: relative;
}

.active-item-light::before,
.active-item-dark::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 4px;
  background-color: var(--q-primary);
  border-radius: 0 4px 4px 0;
}

.border-color-light {
  border-bottom: 1px solid #e0e0e0;
}

.border-color-dark {
  border-bottom: 1px solid #424242;
}

.content-wrapper {
  max-width: 800px;
}
</style>
