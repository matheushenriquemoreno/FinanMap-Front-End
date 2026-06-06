<template>
  <div class="q-pa-none">
    <div v-if="loading" class="q-pa-md"><q-spinner color="primary" /> Carregando...</div>
    <div class="column q-gutter-y-md" v-else>
      <!-- Cabeçalho Padronizado -->
      <div class="q-mb-md flex items-center q-gutter-x-sm">
        <UserAvatar :avatar-id="avatarSelecionado" size="48px" alt="Avatar do usuário" />
        <div>
          <div class="text-h5 text-weight-bold">{{ usuario.nome }}</div>
          <div class="text-caption text-grey-7">
            {{ usuario.email }}
          </div>
        </div>
      </div>

      <q-card flat bordered class="rounded-borders-xl shadow-1">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm">
            <q-icon name="face" size="sm" color="primary" />
            <span>Avatar</span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Escolha a imagem exibida no seu perfil.
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row items-center q-col-gutter-md">
            <!-- Pré-visualização do Avatar -->
            <div class="col-auto">
              <div class="avatar-preview-wrapper">
                <UserAvatar :avatar-id="avatarSelecionado" size="64px" />
              </div>
            </div>

            <!-- Ações -->
            <div class="col">
              <div class="row q-gutter-sm items-center">
                <q-btn
                  outline
                  color="primary"
                  no-caps
                  label="Alterar avatar"
                  icon="edit"
                  @click="abrirSeletorAvatar"
                />
                
                <q-btn
                  v-if="avatarSelecionado !== usuario.avatarId"
                  color="primary"
                  no-caps
                  label="Salvar"
                  :loading="salvandoAvatar"
                  @click="salvarAvatar"
                />
                
                <q-btn
                  v-if="avatarSelecionado !== usuario.avatarId"
                  flat
                  color="grey"
                  no-caps
                  label="Descartar"
                  :disable="salvandoAvatar"
                  @click="descartarAlteracao"
                />
              </div>
              <div v-if="avatarSelecionado !== usuario.avatarId" class="text-caption text-amber-8 q-mt-xs flex items-center q-gutter-x-xs">
                <q-icon name="warning" size="16px" />
                <span>Você tem alterações não salvas. Clique em Salvar para aplicar.</span>
              </div>
            </div>
          </div>
          <span class="sr-only" aria-live="polite">{{ statusAvatar }}</span>
        </q-card-section>
      </q-card>

      <!-- Card Aparência -->
      <q-card flat bordered class="rounded-borders-xl shadow-1">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm">
            <q-icon name="palette" size="sm" color="primary" />
            <span>Aparência</span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Escolha como o FinanMap se apresenta para você.
          </div>
        </q-card-section>

        <q-card-section>
          <q-btn-toggle
            v-model="isDark"
            spread
            no-caps
            rounded
            unelevated
            toggle-color="primary"
            :color="$q.dark.isActive ? 'grey-9' : 'grey-3'"
            :text-color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
            :options="[
              { label: 'Claro', value: false, icon: 'light_mode' },
              { label: 'Escuro', value: true, icon: 'dark_mode' },
            ]"
          />
        </q-card-section>
      </q-card>

      <!-- Card Notificações -->
      <q-card flat bordered class="rounded-borders-xl shadow-1">
        <q-card-section class="q-pb-none">
          <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm">
            <q-icon name="notifications" size="sm" color="primary" />
            <span>Notificações</span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Gerencie as preferências de notificações enviadas pelo FinanMap.
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Se estiver em modo compartilhado (como convidado) -->
          <q-banner
            v-if="emModoCompartilhado"
            class="bg-amber-1 text-amber-9 q-mb-md"
            rounded
            dense
            style="border-radius: 8px"
            :class="{ 'bg-grey-9 text-amber-4': $q.dark.isActive }"
          >
            <q-icon name="warning" class="q-mr-xs" size="18px" />
            Você está acessando os dados compartilhados de <strong>{{ proprietarioNome }}</strong
            >. As preferências de notificação por e-mail estão disponíveis apenas na sua conta
            pessoal.
          </q-banner>

          <div v-if="loadingConfig" class="q-pa-md row justify-center">
            <q-spinner-dots color="primary" size="40px" />
          </div>

          <div v-else class="row items-center justify-between no-wrap">
            <div class="q-pr-md">
              <div class="text-subtitle1 text-bold">Lembretes por E-mail</div>
              <div class="text-caption text-grey-6 q-mt-xs">
                Receba lembretes automáticos por e-mail com antecedência sobre seus custos fixos que
                estão com o vencimento próximo.
              </div>
            </div>
            <q-toggle
              v-model="receberNotificacoes"
              color="primary"
              :disable="emModoCompartilhado"
              @update:model-value="salvarConfiguracao"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog Seletor de Avatar -->
    <q-dialog v-model="seletorAvatarAberto" @hide="aoEsconderDialog">
      <q-card style="width: 440px; max-width: 90vw;" class="rounded-borders-xl shadow-2">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold flex items-center q-gutter-x-sm">
            <q-icon name="face" size="sm" color="primary" />
            <span>Escolha seu Avatar</span>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="avatar-grid" role="radiogroup" aria-label="Escolha seu avatar">
            <q-btn
              v-for="avatar in avataresDisponiveis"
              :key="avatar.id"
              flat
              no-caps
              role="radio"
              :aria-label="avatar.nome"
              :aria-checked="avatarSelecionado === avatar.id"
              :class="{ 'avatar-selecionado': avatarSelecionado === avatar.id }"
              @click="avatarSelecionado = avatar.id"
            >
              <UserAvatar :avatar-id="avatar.id" size="56px" alt="" />
              <span class="avatar-nome text-grey-8" :class="{ 'text-primary text-weight-bold': avatarSelecionado === avatar.id }">
                {{ avatar.nome }}
              </span>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cancelar" color="grey" no-caps @click="cancelarSelecao" />
          <q-btn label="Confirmar" color="primary" no-caps @click="confirmarSelecao" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from 'src/stores/theme-store';
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import getCustoFixoService from 'src/services/CustoFixoService';
import UsuarioService from 'src/services/UsuarioService';
import { useEmailStore } from 'src/stores/UserEmail-Store';
import { avataresDisponiveis, type AvatarId } from 'src/models/Usuario';
import UserAvatar from 'src/components/UserAvatar.vue';

const themeStore = useThemeStore();
const $q = useQuasar();
const service = getCustoFixoService();
const compartilhamentoStore = useCompartilhamentoStore();
const usuarioStore = useEmailStore();

const loading = computed(() => !usuarioStore.name || !usuarioStore.email);
const usuario = computed(() => ({
  nome: usuarioStore.name ?? '',
  email: usuarioStore.email ?? '',
  avatarId: usuarioStore.avatarId,
}));
const avatarSelecionado = ref<AvatarId>(usuarioStore.avatarId);
const salvandoAvatar = ref(false);
const statusAvatar = ref('');

const seletorAvatarAberto = ref(false);
const avatarSelecionadoAnterior = ref<AvatarId>(usuarioStore.avatarId);
let confirmado = false;

function abrirSeletorAvatar() {
  avatarSelecionadoAnterior.value = avatarSelecionado.value;
  confirmado = false;
  seletorAvatarAberto.value = true;
}

function confirmarSelecao() {
  confirmado = true;
  seletorAvatarAberto.value = false;
}

function cancelarSelecao() {
  confirmado = false;
  seletorAvatarAberto.value = false;
}

function aoEsconderDialog() {
  if (!confirmado) {
    avatarSelecionado.value = avatarSelecionadoAnterior.value;
  }
}

function descartarAlteracao() {
  avatarSelecionado.value = usuario.value.avatarId;
}
const loadingConfig = ref(false);
const receberNotificacoes = ref(true);

const emModoCompartilhado = computed(() => compartilhamentoStore.emModoCompartilhado);
const proprietarioNome = computed(
  () => compartilhamentoStore.contextoAtivo?.proprietarioNome || '',
);

const isDark = computed({
  get: () => themeStore.isDark,
  set: (val: boolean) => themeStore.setTheme(val),
});

onMounted(async () => {
  avatarSelecionado.value = usuarioStore.avatarId;
  if (!emModoCompartilhado.value) {
    await carregarConfiguracao();
  }
});

async function salvarAvatar() {
  salvandoAvatar.value = true;
  statusAvatar.value = 'Salvando avatar.';
  try {
    const resultado = await UsuarioService.atualizarAvatar(avatarSelecionado.value);
    usuarioStore.setAvatarId(resultado.avatarId);
    avatarSelecionado.value = usuarioStore.avatarId;
    statusAvatar.value = 'Avatar atualizado com sucesso.';
    $q.notify({ type: 'positive', message: 'Avatar atualizado com sucesso!' });
  } catch (error) {
    avatarSelecionado.value = usuarioStore.avatarId;
    statusAvatar.value = 'Não foi possível salvar o avatar. A escolha anterior foi mantida.';
    $q.notify({
      type: 'negative',
      message: 'Não foi possível salvar o avatar. A escolha anterior foi mantida.',
    });
  } finally {
    salvandoAvatar.value = false;
  }
}

async function carregarConfiguracao() {
  loadingConfig.value = true;
  try {
    const res = await service.obterConfiguracoes();
    receberNotificacoes.value = res.receberNotificacoes;
  } catch (error) {
    console.error('Erro ao obter configurações de custos fixos:', error);
  } finally {
    loadingConfig.value = false;
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
.rounded-borders-xl {
  border-radius: 16px;
}

.shadow-1 {
  transition:
    box-shadow 0.3s ease,
    transform 0.2s ease;
}

.shadow-1:hover {
  box-shadow: 0 6px 20px v-bind('$q.dark.isActive ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)"') !important;
}

.avatar-selecionado {
  outline: 3px solid var(--q-primary);
  outline-offset: 3px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 12px;
}

.avatar-grid :deep(.q-btn) {
  min-height: 92px;
  border: 1px solid rgba(127, 127, 127, 0.25);
  border-radius: 12px;
}

.avatar-preview-wrapper {
  border: 2px solid var(--q-primary);
  border-radius: 50%;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar-grid :deep(.q-btn__content) {
  flex-direction: column;
  gap: 6px;
}

.avatar-grid :deep(.q-btn:focus-visible) {
  outline: 3px solid var(--q-primary);
  outline-offset: 3px;
}

.avatar-nome {
  font-size: 0.75rem;
  line-height: 1.2;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 360px) {
  .avatar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
