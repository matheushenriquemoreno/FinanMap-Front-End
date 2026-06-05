<template>
  <div class="contexto-selector-wrapper row no-wrap items-center q-gutter-sm">
    <!-- Seletor de Contexto -->
    <q-btn
      flat
      no-caps
      :loading="loading"
      :disable="loading"
      class="contexto-selector row no-wrap items-center rounded-borders cursor-pointer q-py-xs q-pl-md q-pr-xs transition-hover relative-position"
      :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-white text-grey-9'"
    >
      <div class="row no-wrap items-center">
        <q-icon :name="contextoIcon" size="20px" class="q-mr-sm" />
        <span class="contexto-label text-subtitle2 text-weight-medium ellipsis">{{
          contextoLabel
        }}</span>
      </div>

      <div class="contexto-divider q-mx-sm"></div>

      <q-icon name="arrow_drop_down" size="24px" />

      <q-menu
        fit
        anchor="bottom right"
        self="top right"
        :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
      >
        <q-list style="min-width: 220px">
          <q-item-label header class="text-grey-7">Selecionar Contexto</q-item-label>

          <q-item
            v-for="opcao in opcoesContexto"
            :key="opcao.value"
            clickable
            v-close-popup
            @click="trocarContexto(opcao.value)"
            :active="contextoSelecionado === opcao.value"
            :active-class="$q.dark.isActive ? 'bg-grey-9 text-blue-4' : 'bg-blue-1 text-primary'"
          >
            <q-item-section avatar>
              <q-icon :name="opcao.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ opcao.label }}</q-item-label>
              <q-item-label caption v-if="opcao.value !== ''">Compartilhado</q-item-label>
            </q-item-section>
            <q-item-section side v-if="contextoSelecionado === opcao.value">
              <q-icon name="check" color="green" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <!-- Botão de Compartilhamento -->
    <q-btn
      round
      flat
      icon="share"
      :style="$q.dark.isActive ? '' : 'background-color: #ffffff'"
      :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'text-grey-9'"
      @click="abrirModalCompartilhamento"
    >
      <q-badge
        v-if="compartilhamentoStore.convitesPendentes.length > 0"
        color="orange"
        :label="compartilhamentoStore.convitesPendentes.length"
        floating
        rounded
      />
      <q-tooltip>Compartilhar</q-tooltip>
    </q-btn>

    <!-- Modal de Compartilhamento -->
    <compartilhamento-modal v-model="showCompartilhamentoModal" titulo-contexto="Meus Dados" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { useQuasar } from 'quasar';
import CompartilhamentoModal from './CompartilhamentoModal.vue';

const compartilhamentoStore = useCompartilhamentoStore();
const $q = useQuasar();

const loading = ref(false);
const contextSelecionadoInternal = ref<string | null>(null);
const showCompartilhamentoModal = ref(false);

const contextoSelecionado = computed({
  get: () => contextSelecionadoInternal.value,
  set: (val) => {
    contextSelecionadoInternal.value = val;
  },
});

const opcoesContexto = computed(() => {
  const opcoes = [
    {
      label: 'Meus Dados',
      value: '',
      icon: 'person',
    },
  ];

  // Adicionar compartilhamentos aceitos
  compartilhamentoStore.compartilhamentosAceitos.forEach((comp) => {
    opcoes.push({
      label: `Dados de ${comp.proprietarioNome}`,
      value: comp.proprietarioId,
      icon: 'share',
    });
  });

  return opcoes;
});

const contextoLabel = computed(() => {
  const selected = opcoesContexto.value.find((o) => o.value === contextoSelecionado.value);
  // Se o selecionado for "Meus Dados" (valor vazio), podemos exibir "Minha Conta" ou manter "Meus Dados".
  // Mas para imitar o layout "Compartilhar" do exemplo, talvez devêssemos usar "Compartilhar" como título fixo?
  // O usuário pediu layout do botão. Vou manter o label dinâmico para usabilidade, mas com o ícone.
  // Se for um contexto compartilhado, mostramos o nome.
  if (selected) {
    return selected.value === '' ? 'Meus Dados' : selected.label;
  }
  return 'Selecione';
});

const contextoIcon = computed(() => {
  const selected = opcoesContexto.value.find((o) => o.value === contextoSelecionado.value);
  if (selected && selected.value === '') return 'person';
  return 'share';
});

function abrirModalCompartilhamento() {
  showCompartilhamentoModal.value = true;
}

function trocarContexto(proprietarioId: string | null) {
  // Se já estiver selecionado, não faz nada
  if (proprietarioId === contextoSelecionado.value) return;

  loading.value = true;
  try {
    if (proprietarioId === null || proprietarioId === '') {
      // Voltar para os próprios dados
      compartilhamentoStore.desativarContexto();
    } else {
      // Ativar contexto compartilhado
      const compartilhamento = compartilhamentoStore.compartilhamentosAceitos.find(
        (c) => c.proprietarioId === proprietarioId,
      );
      if (compartilhamento) {
        compartilhamentoStore.ativarContexto(compartilhamento);
      }
    }

    // Atualiza valor local
    contextoSelecionado.value = proprietarioId || '';
    loading.value = false;
  } catch (error) {
    console.error('Erro ao trocar contexto:', error);
    $q.notify({
      type: 'negative',
      message: 'Erro ao trocar visualização. Tente novamente.',
    });
    loading.value = false;
  }
}

onMounted(() => {
  // Definir o contexto atual
  if (compartilhamentoStore.contextoAtivo) {
    contextoSelecionado.value = compartilhamentoStore.contextoAtivo.proprietarioId;
  } else {
    contextoSelecionado.value = '';
  }
});
</script>

<style scoped>
.contexto-label {
  max-width: 150px;
}

.contexto-divider {
  width: 1px;
  height: 24px;
  background-color: currentColor;
  opacity: 0.12;
}

.transition-hover {
  transition:
    filter 0.2s ease,
    box-shadow 0.2s ease;
}

.transition-hover:hover {
  filter: brightness(0.95);
}

@media (max-width: 599px) {
  .contexto-selector-wrapper {
    gap: 4px;
  }

  .contexto-selector {
    padding-left: 8px;
  }

  .contexto-label {
    max-width: 82px;
  }

  .contexto-divider {
    margin-left: 4px;
    margin-right: 2px;
  }
}
</style>
