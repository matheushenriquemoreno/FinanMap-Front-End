<template>
  <q-dialog v-model="showDialog" @hide="onHide">
    <q-card style="min-width: 500px; max-width: 600px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6">Compartilhar "{{ tituloContexto }}"</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-md">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-8">
            <q-input
              v-model="novoEmail"
              outlined
              dense
              placeholder="Adicionar participantes, grupos, espaços e eventos da agenda"
              :dark="$q.dark.isActive"
              @keyup.enter="enviarConvite"
            >
              <template v-slot:prepend>
                <q-icon name="person_add" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-4">
            <q-select
              v-model="novaPermissao"
              :options="opcoesPermissao"
              outlined
              dense
              emit-value
              map-options
              :dark="$q.dark.isActive"
            />
          </div>
        </div>
        <div class="row q-mt-sm">
          <q-btn
            color="primary"
            label="Enviar Convite"
            icon="send"
            :loading="loadingConvite"
            :disable="!novoEmail"
            @click="enviarConvite"
            unelevated
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm text-weight-medium">Pessoas com acesso (convites enviados)</div>
        
        <q-item class="q-px-none">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ nomeUsuario }} (you)</q-item-label>
            <q-item-label caption>{{ emailUsuario }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-grey">Proprietário</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-for="comp in compartilhamentosAtivos"
          :key="comp.id"
          class="q-px-none"
        >
          <q-item-section avatar>
            <q-avatar color="blue-4" text-color="white">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ comp.convidadoEmail }}</q-item-label>
            <q-item-label caption>{{ statusTexto(comp.status) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center q-gutter-sm">
              <q-select
                v-if="comp.status === StatusConvite.Aceito"
                :model-value="comp.permissao"
                :options="opcoesPermissao"
                outlined
                dense
                emit-value
                map-options
                style="min-width: 120px"
                :dark="$q.dark.isActive"
                @update:model-value="(val) => atualizarPermissao(comp.id, val)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="grey"
                @click="confirmarRevogacao(comp.id)"
              >
                <q-tooltip>Remover acesso</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-card-section>

      <!-- Seção: Convites Pendentes para Aprovação -->
      <template v-if="convitesPendentes.length > 0">
        <q-separator />

        <q-card-section>
          <div class="row items-center q-mb-sm">
            <div class="text-subtitle2 text-weight-medium">Convites Pendentes</div>
            <q-space />
            <q-badge color="orange" :label="convitesPendentes.length" />
          </div>
          <div class="text-caption text-grey q-mb-sm">Você recebeu convites para acessar dados de outras pessoas.</div>

          <q-item
            v-for="convite in convitesPendentes"
            :key="convite.id"
            class="q-px-none"
          >
            <q-item-section avatar>
              <q-avatar color="orange" text-color="white">
                <q-icon name="mail" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ convite.proprietarioNome }}</q-item-label>
              <q-item-label caption>{{ convite.proprietarioEmail }} • {{ permissaoTexto(convite.permissao) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-xs">
                <q-btn
                  flat
                  dense
                  rounded
                  label="Aceitar"
                  color="positive"
                  :loading="loadingResposta === convite.id"
                  @click="responderConviteModal(convite.id, true)"
                />
                <q-btn
                  flat
                  dense
                  rounded
                  label="Recusar"
                  color="negative"
                  :loading="loadingResposta === convite.id"
                  @click="responderConviteModal(convite.id, false)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-card-section>
      </template>

      <q-card-actions align="right" class="q-px-md q-py-md">
        <q-btn
          unelevated
          color="primary"
          label="Concluído"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { NivelPermissao, StatusConvite } from 'src/models/Compartilhamento';
import { useQuasar } from 'quasar';
import { useEmailStore } from 'src/stores/UserEmail-Store';

interface Props {
  modelValue: boolean;
  tituloContexto?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tituloContexto: 'Lista de tarefas'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const compartilhamentoStore = useCompartilhamentoStore();
const userStore = useEmailStore();
const $q = useQuasar();

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const novoEmail = ref('');
const novaPermissao = ref<NivelPermissao>(NivelPermissao.Visualizar);
const loadingConvite = ref(false);
const loadingResposta = ref<string | null>(null);

const opcoesPermissao = [
  { label: 'Visualização', value: NivelPermissao.Visualizar },
  { label: 'Edição', value: NivelPermissao.Editar }
];

const nomeUsuario = computed(() => userStore.getName() || 'Usuário');
const emailUsuario = computed(() => userStore.getEmail() || '');

const compartilhamentosAtivos = computed(() =>
  compartilhamentoStore.meusCompartilhamentos
);

const convitesPendentes = computed(() =>
  compartilhamentoStore.convitesPendentes
);

function permissaoTexto(permissao: NivelPermissao): string {
  return permissao === NivelPermissao.Editar ? 'Edição' : 'Visualização';
}

function statusTexto(status: StatusConvite): string {
  switch (status) {
    case StatusConvite.Pendente:
      return 'Convite pendente';
    case StatusConvite.Aceito:
      return 'Acesso confirmado';
    case StatusConvite.Recusado:
      return 'Convite recusado';
    default:
      return '';
  }
}

async function enviarConvite() {
  if (!novoEmail.value) return;

  loadingConvite.value = true;
  try {
    await compartilhamentoStore.convidar(novoEmail.value, novaPermissao.value);
    $q.notify({
      type: 'positive',
      message: 'Convite enviado com sucesso!',
      position: 'top'
    });
    novoEmail.value = '';
    novaPermissao.value = NivelPermissao.Visualizar;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.errors?.[0] || 'Erro ao enviar convite',
      position: 'top'
    });
  } finally {
    loadingConvite.value = false;
  }
}

async function atualizarPermissao(compartilhamentoId: string, novaPermissao: NivelPermissao) {
  try {
    await compartilhamentoStore.atualizarPermissao(compartilhamentoId, novaPermissao);
    $q.notify({
      type: 'positive',
      message: 'Permissão atualizada com sucesso!',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar permissão',
      position: 'top'
    });
  }
}

function confirmarRevogacao(compartilhamentoId: string) {
  $q.dialog({
    title: 'Remover acesso',
    message: 'Tem certeza que deseja remover o acesso desta pessoa?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey'
    },
    ok: {
      label: 'Remover',
      flat: true,
      color: 'negative'
    },
    persistent: true
  }).onOk(() => {
    void (async () => {
      try {
        await compartilhamentoStore.revogar(compartilhamentoId);
        $q.notify({
          type: 'positive',
          message: 'Acesso removido com sucesso!',
          position: 'top'
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao remover acesso',
          position: 'top'
        });
      }
    })();
  });
}

async function responderConviteModal(conviteId: string, aceitar: boolean) {
  loadingResposta.value = conviteId;
  try {
    await compartilhamentoStore.responderConvite(conviteId, aceitar);
    $q.notify({
      type: 'positive',
      message: aceitar ? 'Convite aceito com sucesso!' : 'Convite recusado.',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao responder convite',
      position: 'top'
    });
  } finally {
    loadingResposta.value = null;
  }
}

function onHide() {
  novoEmail.value = '';
  novaPermissao.value = NivelPermissao.Visualizar;
}
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
