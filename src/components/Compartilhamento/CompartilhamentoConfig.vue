<template>
  <div class="compartilhamento-config">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Compartilhamento de Dados</div>
        <div class="text-caption text-grey">
          Gerencie quem tem acesso aos seus dados financeiros
        </div>
      </q-card-section>

      <q-separator />

      <!-- Seção: Convidar novo usuário -->
      <q-card-section>
        <div class="text-subtitle2 q-mb-md">Convidar Usuário</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="novoConvite.email"
              label="E-mail do usuário"
              type="email"
              outlined
              dense
              :dark="$q.dark.isActive"
            />
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
              :dark="$q.dark.isActive"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              color="primary"
              label="Convidar"
              icon="send"
              @click="enviarConvite"
              :loading="loadingConvite"
              :disable="!novoConvite.email"
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Seção: Meus Compartilhamentos (onde sou o dono) -->
      <q-card-section>
        <div class="text-subtitle2 q-mb-md">Meus Compartilhamentos</div>
        <q-list bordered separator v-if="compartilhamentoStore.meusCompartilhamentos.length > 0">
          <q-item v-for="comp in compartilhamentoStore.meusCompartilhamentos" :key="comp.id">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ comp.convidadoEmail }}</q-item-label>
              <q-item-label caption>
                {{ statusTexto(comp.status) }} • {{ permissaoTexto(comp.permissao) }}
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
                  @click="editarPermissao(comp)"
                >
                  <q-tooltip>Alterar permissão</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  @click="confirmarRevogacao(comp.id)"
                >
                  <q-tooltip>Revogar acesso</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-center text-grey q-pa-md">
          Nenhum compartilhamento criado ainda
        </div>
      </q-card-section>

      <q-separator />

      <!-- Seção: Convites Recebidos -->
      <q-card-section>
        <div class="text-subtitle2 q-mb-md">Convites Recebidos</div>
        <q-list bordered separator v-if="compartilhamentoStore.convitesPendentes.length > 0">
          <q-item v-for="convite in compartilhamentoStore.convitesPendentes" :key="convite.id">
            <q-item-section avatar>
              <q-avatar color="orange" text-color="white" icon="mail" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ convite.proprietarioNome }}</q-item-label>
              <q-item-label caption>
                {{ convite.proprietarioEmail }} • {{ permissaoTexto(convite.permissao) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  dense
                  label="Aceitar"
                  color="positive"
                  @click="responderConvite(convite.id, true)"
                />
                <q-btn
                  flat
                  dense
                  label="Recusar"
                  color="negative"
                  @click="responderConvite(convite.id, false)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-center text-grey q-pa-md">
          Nenhum convite pendente
        </div>
      </q-card-section>
    </q-card>

    <!-- Dialog para editar permissão -->
    <q-dialog v-model="dialogEditarPermissao">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Alterar Permissão</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="permissaoEditando"
            :options="opcoesPermissao"
            label="Nova Permissão"
            outlined
            emit-value
            map-options
            :dark="$q.dark.isActive"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Salvar"
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
</style>
