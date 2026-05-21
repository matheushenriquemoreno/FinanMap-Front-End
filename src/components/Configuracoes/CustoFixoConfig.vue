<template>
  <div class="custo-fixo-config column">
    <div class="q-mb-md">
      <p class="descricao q-mt-sm q-mb-none text-grey-7">
        Configure suas preferências globais para a gestão de custos fixos. 
        Estas configurações são pessoais e aplicadas à sua conta.
      </p>
    </div>

    <!-- Se estiver em modo compartilhado (como convidado) -->
    <q-banner v-if="emModoCompartilhado" class="bg-amber-1 text-amber-9 q-mb-md rounded-borders" rounded dense style="border-radius: 8px;">
      <q-icon name="warning" class="q-mr-xs" size="18px" />
      Você está acessando os dados compartilhados de <strong>{{ proprietarioNome }}</strong>. 
      As preferências de notificação por e-mail estão disponíveis apenas na sua conta pessoal.
    </q-banner>

    <div v-if="carregando" class="q-pa-md row justify-center">
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import getCustoFixoService from 'src/services/CustoFixoService';

const $q = useQuasar();
const service = getCustoFixoService();
const compartilhamentoStore = useCompartilhamentoStore();

const carregando = ref(false);
const receberNotificacoes = ref(true);

const emModoCompartilhado = computed(() => compartilhamentoStore.emModoCompartilhado);
const proprietarioNome = computed(() => compartilhamentoStore.contextoAtivo?.proprietarioNome || '');

onMounted(async () => {
  if (!emModoCompartilhado.value) {
    await carregarConfiguracao();
  }
});

async function carregarConfiguracao() {
  carregando.value = true;
  try {
    const res = await service.obterConfiguracoes();
    receberNotificacoes.value = res.receberNotificacoes;
  } catch (error) {
    console.error('Erro ao obter configurações de custos fixos:', error);
  } finally {
    carregando.value = false;
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
.descricao {
  font-size: 14px;
}
.config-card {
  transition: box-shadow 0.3s;
}
.config-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>
