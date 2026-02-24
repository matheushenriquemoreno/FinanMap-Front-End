<template>
  <div class="compartilhamento-config q-pa-sm">
    <!-- Cabeçalho -->
    <div class="q-mb-lg flex items-center q-gutter-x-sm">
      <q-avatar color="primary" text-color="white" icon="share" font-size="24px" size="48px" />
      <div>
        <div class="text-h5 text-weight-bold">Compartilhamento de Dados</div>
        <div class="text-caption text-grey-7">
          Gerencie quem tem acesso aos seus dados financeiros com segurança.
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12">
        <!-- Formulário de Convite -->
        <q-card flat bordered class="rounded-borders-xl shadow-1">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm">
              <q-icon name="person_add" size="sm" color="primary" />
              <span>Convidar Novo Usuário</span>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md items-center">
              <div class="col-12 col-md-5">
                <q-input
                  v-model="novoConvite.email"
                  label="E-mail do usuário"
                  type="email"
                  outlined
                  dense
                  hide-bottom-space
                  :dark="$q.dark.isActive"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="mail" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="novoConvite.permissao"
                  :options="opcoesPermissao"
                  label="Permissão"
                  outlined
                  dense
                  emit-value
                  map-options
                  hide-bottom-space
                  :dark="$q.dark.isActive"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="vpn_key" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-3">
                <q-btn
                  color="primary"
                  icon="send"
                  unelevated
                  @click="enviarConvite"
                  :loading="loadingConvite"
                  :disable="!novoConvite.email"
                  class="full-width"
                  style="border-radius: 8px; height: 40px"
                >
                  <q-tooltip>Enviar Convite</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Lado Esquerdo: Meus Compartilhamentos -->
      <div class="col-12">
        <!-- Meus Compartilhamentos -->
        <q-card flat bordered class="rounded-borders-xl shadow-1 full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm q-mb-md">
              <q-icon name="manage_accounts" size="sm" color="primary" />
              <span>Pessoas com Acesso</span>
            </div>

            <q-list separator v-if="compartilhamentoStore.meusCompartilhamentos.length > 0">
              <q-item v-for="comp in compartilhamentoStore.meusCompartilhamentos" :key="comp.id" class="q-py-sm">
                <q-item-section avatar>
                  <q-avatar color="blue-1" text-color="primary" icon="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-body1">{{ comp.convidadoEmail }}</q-item-label>
                  <q-item-label caption class="q-mt-xs flex items-center q-gutter-x-sm">
                    <q-badge :color="corStatus(comp.status)" rounded class="q-px-sm q-py-xs text-weight-medium">
                      {{ statusTexto(comp.status) }}
                    </q-badge>
                    <q-badge outline :color="comp.permissao === NivelPermissao.Editar ? 'purple' : 'info'" class="q-px-sm q-py-xs">
                      <q-icon :name="comp.permissao === NivelPermissao.Editar ? 'edit' : 'visibility'" size="xs" class="q-mr-xs" />
                      {{ permissaoTexto(comp.permissao) }}
                    </q-badge>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-sm">
                    <q-btn
                      v-if="comp.status === StatusConvite.Aceito"
                      flat
                      dense
                      round
                      icon="edit"
                      color="grey-7"
                      @click="editarPermissao(comp)"
                    >
                      <q-tooltip>Alterar permissão</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete_outline"
                      color="negative"
                      @click="confirmarRevogacao(comp.id)"
                    >
                      <q-tooltip>Revogar acesso</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            
            <!-- Empty State -->
            <div v-else class="column items-center justify-center q-py-xl text-grey-6">
              <q-icon name="folder_shared" size="64px" class="q-mb-sm opacity-50" color="grey-4" />
              <div class="text-h6 text-weight-regular">Nenhum acesso concedido</div>
              <div class="text-caption">Você ainda não compartilhou seus dados com ninguém.</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Lado Direito: Convites Recebidos -->
      <div class="col-12">
        <q-card flat bordered class="rounded-borders-xl shadow-1 full-height">
          <q-card-section class="bg-orange-1 text-orange-9" :class="{ 'bg-grey-9 text-orange-4': $q.dark.isActive }">
            <div class="text-subtitle1 text-weight-bold flex items-center justify-between q-gutter-x-sm">
              <div class="flex items-center q-gutter-x-sm">
                <q-icon name="mark_email_unread" size="sm" />
                <span>Convites Recebidos</span>
              </div>
              <q-badge color="orange" v-if="compartilhamentoStore.convitesPendentes.length > 0">
                {{ compartilhamentoStore.convitesPendentes.length }}
              </q-badge>
            </div>
          </q-card-section>
          
          <q-separator />

          <q-card-section class="q-pa-none">
            <q-list separator v-if="compartilhamentoStore.convitesPendentes.length > 0">
              <q-item v-for="convite in compartilhamentoStore.convitesPendentes" :key="convite.id" class="q-py-md">
                <q-item-section avatar top class="q-mt-sm">
                  <q-avatar color="orange-2" text-color="orange-10" icon="mail" />
                </q-item-section>
                
                <q-item-section>
                  <q-item-label class="text-weight-bold text-body1">{{ convite.proprietarioNome }}</q-item-label>
                  <q-item-label caption lines="1" class="text-grey-7">{{ convite.proprietarioEmail }}</q-item-label>
                  <div class="q-mt-sm">
                    <q-badge outline color="orange-8" class="q-px-sm q-py-xs">
                       Acesso de {{ permissaoTexto(convite.permissao) }}
                    </q-badge>
                  </div>
                  
                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      unelevated
                      dense
                      label="Aceitar"
                      color="positive"
                      icon="check"
                      class="col q-py-xs"
                      @click="responderConvite(convite.id, true)"
                    />
                    <q-btn
                      outline
                      dense
                      label="Recusar"
                      color="negative"
                      class="col q-py-xs"
                      @click="responderConvite(convite.id, false)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Empty State -->
            <div v-else class="column items-center justify-center q-py-xl text-grey-6">
              <q-icon name="drafts" size="64px" class="q-mb-sm opacity-50" color="grey-4" />
              <div class="text-subtitle1 text-weight-regular">Caixa de entrada vazia</div>
              <div class="text-caption">Não há convites pendentes no momento.</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialog para editar permissão -->
    <q-dialog v-model="dialogEditarPermissao">
      <q-card style="min-width: 350px" class="rounded-borders-xl shadow-2">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Alterar Permissão</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-select
            v-model="permissaoEditando"
            :options="opcoesPermissao"
            label="Nova Permissão"
            outlined
            emit-value
            map-options
            :dark="$q.dark.isActive"
            color="primary"
          >
            <template v-slot:prepend>
              <q-icon name="admin_panel_settings" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Salvar Alterações"
            color="primary"
            @click="salvarPermissao"
            :loading="loadingEditarPermissao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { NivelPermissao, StatusConvite, type Compartilhamento } from 'src/models/Compartilhamento';
import { useQuasar } from 'quasar';

const compartilhamentoStore = useCompartilhamentoStore();
const $q = useQuasar();

const novoConvite = ref({
  email: '',
  permissao: NivelPermissao.Visualizar
});

const loadingConvite = ref(false);
const dialogEditarPermissao = ref(false);
const compartilhamentoEditando = ref<Compartilhamento | null>(null);
const permissaoEditando = ref<NivelPermissao>(NivelPermissao.Visualizar);
const loadingEditarPermissao = ref(false);

const opcoesPermissao = [
  { label: 'Visualização', value: NivelPermissao.Visualizar },
  { label: 'Edição', value: NivelPermissao.Editar }
];

function statusTexto(status: StatusConvite): string {
  switch (status) {
    case StatusConvite.Pendente:
      return 'Pendente';
    case StatusConvite.Aceito:
      return 'Aceito';
    case StatusConvite.Recusado:
      return 'Recusado';
    default:
      return 'Desconhecido';
  }
}

function corStatus(status: StatusConvite): string {
  switch (status) {
    case StatusConvite.Pendente:
      return 'warning';
    case StatusConvite.Aceito:
      return 'positive';
    case StatusConvite.Recusado:
      return 'negative';
    default:
      return 'grey';
  }
}

function permissaoTexto(permissao: NivelPermissao): string {
  return permissao === NivelPermissao.Editar ? 'Edição' : 'Visualização';
}

async function enviarConvite() {
  loadingConvite.value = true;
  try {
    await compartilhamentoStore.convidar(novoConvite.value.email, novoConvite.value.permissao);
    $q.notify({
      type: 'positive',
      message: 'Convite enviado com sucesso!'
    });
    novoConvite.value.email = '';
    novoConvite.value.permissao = NivelPermissao.Visualizar;
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.errors?.[0] || 'Erro ao enviar convite'
    });
  } finally {
    loadingConvite.value = false;
  }
}

async function responderConvite(conviteId: string, aceitar: boolean) {
  try {
    await compartilhamentoStore.responderConvite(conviteId, aceitar);
    $q.notify({
      type: 'positive',
      message: aceitar ? 'Convite aceito!' : 'Convite recusado'
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao responder convite'
    });
  }
}

function editarPermissao(comp: Compartilhamento) {
  compartilhamentoEditando.value = comp;
  permissaoEditando.value = comp.permissao;
  dialogEditarPermissao.value = true;
}

async function salvarPermissao() {
  if (!compartilhamentoEditando.value) return;

  loadingEditarPermissao.value = true;
  try {
    await compartilhamentoStore.atualizarPermissao(
      compartilhamentoEditando.value.id,
      permissaoEditando.value
    );
    $q.notify({
      type: 'positive',
      message: 'Permissão atualizada com sucesso!'
    });
    dialogEditarPermissao.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar permissão'
    });
  } finally {
    loadingEditarPermissao.value = false;
  }
}

function confirmarRevogacao(compartilhamentoId: string) {
  $q.dialog({
    title: 'Confirmar Revogação',
    message: 'Tem certeza que deseja revogar este compartilhamento?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    compartilhamentoStore.revogar(compartilhamentoId)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Compartilhamento revogado com sucesso!'
        });
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Erro ao revogar compartilhamento'
        });
      });
  });
}
</script>

<style scoped>
.compartilhamento-config {
  max-width: 100%;
}
.rounded-borders-xl {
  border-radius: 16px;
}
.opacity-50 {
  opacity: 0.5;
}
</style>
