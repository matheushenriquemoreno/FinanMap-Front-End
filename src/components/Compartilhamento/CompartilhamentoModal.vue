<template>
  <q-dialog v-model="showDialog" @hide="onHide" backdrop-filter="brightness(60%)">
    <q-card
      class="compartilhamento-modal column no-wrap"
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
    >
      <q-card-section class="row no-wrap items-start q-pa-lg q-pb-md">
        <q-avatar color="primary" text-color="white" icon="share" size="48px" class="q-mr-md" />
        <div class="col">
          <div class="text-h6 text-weight-bold">Compartilhar {{ tituloContexto }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Convide pessoas e defina como elas podem acessar seus dados financeiros.
          </div>
        </div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          color="grey-7"
          v-close-popup
          aria-label="Fechar compartilhamento"
        >
          <q-tooltip>Fechar</q-tooltip>
        </q-btn>
      </q-card-section>

      <q-separator />

      <q-card-section class="col scroll q-pa-lg">
        <div
          class="convite-panel q-pa-md q-mb-lg"
          :class="$q.dark.isActive ? 'convite-panel--dark' : 'convite-panel--light'"
        >
          <div class="row items-center q-mb-md">
            <q-icon name="person_add" color="primary" size="22px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle1 text-weight-bold">Convidar uma pessoa</div>
              <div class="text-caption text-grey-7">
                O convite será enviado para o e-mail informado.
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-sm items-start">
            <div class="col-12 col-sm">
              <q-input
                v-model="novoEmail"
                type="email"
                outlined
                dense
                label="E-mail"
                placeholder="nome@exemplo.com"
                hide-bottom-space
                :dark="$q.dark.isActive"
                @keyup.enter="enviarConvite"
              >
                <template v-slot:prepend>
                  <q-icon name="mail_outline" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-auto permissao-convite">
              <q-select
                v-model="novaPermissao"
                :options="opcoesPermissao"
                outlined
                dense
                label="Permissão"
                hide-bottom-space
                emit-value
                map-options
                :dark="$q.dark.isActive"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                color="primary"
                label="Enviar convite"
                icon="send"
                :loading="loadingConvite"
                :disable="!novoEmail.trim()"
                @click="enviarConvite"
                unelevated
                no-caps
                class="invite-button full-width"
              />
            </div>
          </div>
        </div>

        <div class="row items-center q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">Pessoas com acesso a minha conta</div>
          <q-space />
          <q-badge
            outline
            color="primary"
            :label="`${compartilhamentosAtivos.length + 1} ${compartilhamentosAtivos.length === 0 ? 'pessoa' : 'pessoas'}`"
            class="q-px-sm q-py-xs"
          />
        </div>
        <q-list bordered separator class="access-list">
          <q-item class="q-py-md">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" icon="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium"
                >{{ nomeUsuario }} <span class="text-grey-7">(você)</span></q-item-label
              >
              <q-item-label caption>{{ emailUsuario }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge outline color="primary" label="Proprietário" class="q-px-sm q-py-xs" />
            </q-item-section>
          </q-item>

          <q-item v-for="comp in compartilhamentosAtivos" :key="comp.id" class="q-py-md">
            <q-item-section avatar>
              <q-avatar
                :color="$q.dark.isActive ? 'grey-9' : 'blue-1'"
                text-color="primary"
                icon="person"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ comp.convidadoEmail }}</q-item-label>
              <q-item-label caption class="q-mt-xs">
                <q-badge
                  :color="corStatus(comp.status)"
                  rounded
                  :label="statusTexto(comp.status)"
                  class="q-px-sm q-py-xs"
                />
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row no-wrap items-center q-gutter-xs">
                <q-select
                  v-if="comp.status === StatusConvite.Aceito"
                  :model-value="comp.permissao"
                  :options="opcoesPermissao"
                  :aria-label="`Permissão de ${comp.convidadoEmail}`"
                  outlined
                  dense
                  emit-value
                  map-options
                  class="permission-select"
                  :dark="$q.dark.isActive"
                  @update:model-value="(val) => atualizarPermissao(comp.id, val)"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="delete_outline"
                  color="negative"
                  @click="confirmarRevogacao(comp.id)"
                >
                  <q-tooltip>Remover acesso</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="convitesPendentes.length > 0" class="q-mt-lg">
          <div class="row items-center q-mb-xs">
            <div class="text-subtitle1 text-weight-bold">Convites recebidos</div>
            <q-space />
            <q-badge color="orange" :label="convitesPendentes.length" />
          </div>
          <div class="text-caption text-grey-7 q-mb-md">
            Pessoas que convidaram você para acessar os dados delas.
          </div>

          <q-list bordered separator class="access-list">
            <q-item v-for="convite in convitesPendentes" :key="convite.id" class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="orange-2" text-color="orange-10" icon="mail" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  convite.proprietarioNome
                }}</q-item-label>
                <q-item-label caption>{{ convite.proprietarioEmail }}</q-item-label>
                <q-item-label caption class="q-mt-xs">
                  <q-badge outline color="info" class="q-px-sm q-py-xs">
                    <q-icon :name="iconePermissao(convite.permissao)" size="xs" class="q-mr-xs" />
                    {{ permissaoTexto(convite.permissao) }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    rounded
                    label="Aceitar"
                    color="positive"
                    no-caps
                    :loading="loadingResposta === convite.id"
                    @click="responderConviteModal(convite.id, true)"
                  />
                  <q-btn
                    flat
                    dense
                    rounded
                    label="Recusar"
                    color="negative"
                    no-caps
                    :loading="loadingResposta === convite.id"
                    @click="responderConviteModal(convite.id, false)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          unelevated
          color="primary"
          label="Concluído"
          no-caps
          class="done-button"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useCompartilhamentoModal } from 'src/composables/useCompartilhamentoModal';
import { StatusConvite } from 'src/models/Compartilhamento';

interface Props {
  modelValue: boolean;
  tituloContexto?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tituloContexto: 'Lista de tarefas',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const {
  showDialog,
  novoEmail,
  novaPermissao,
  loadingConvite,
  loadingResposta,
  opcoesPermissao,
  nomeUsuario,
  emailUsuario,
  compartilhamentosAtivos,
  convitesPendentes,
  permissaoTexto,
  statusTexto,
  corStatus,
  iconePermissao,
  enviarConvite,
  atualizarPermissao,
  confirmarRevogacao,
  responderConviteModal,
  onHide,
} = useCompartilhamentoModal(props, (value) => emit('update:modelValue', value));
</script>

<style scoped src="./CompartilhamentoModal.styles.css"></style>
