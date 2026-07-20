import { computed, ref, type ComputedRef } from 'vue';
import { useQuasar } from 'quasar';
import { NivelPermissao, StatusConvite } from 'src/models/Compartilhamento';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';
import { useEmailStore } from 'src/stores/UserEmail-Store';

interface CompartilhamentoModalProps {
  modelValue: boolean;
  tituloContexto?: string;
}

export function useCompartilhamentoModal(
  props: CompartilhamentoModalProps,
  updateModelValue: (value: boolean) => void,
) {
  const $q = useQuasar();
  const compartilhamentoStore = useCompartilhamentoStore();
  const userStore = useEmailStore();
  const showDialog: ComputedRef<boolean> = computed({
    get: () => props.modelValue,
    set: updateModelValue,
  });
  const novoEmail = ref('');
  const novaPermissao = ref<NivelPermissao>(NivelPermissao.Visualizar);
  const loadingConvite = ref(false);
  const loadingResposta = ref<string | null>(null);
  const opcoesPermissao = [
    { label: 'Visualização', value: NivelPermissao.Visualizar },
    { label: 'Edição', value: NivelPermissao.Editar },
  ];
  const nomeUsuario = computed(() => userStore.getName() || 'Usuário');
  const emailUsuario = computed(() => userStore.getEmail() || '');
  const compartilhamentosAtivos = computed(() => compartilhamentoStore.meusCompartilhamentos);
  const convitesPendentes = computed(() => compartilhamentoStore.convitesPendentes);

  const permissaoTexto = (permissao: NivelPermissao) =>
    permissao === NivelPermissao.Editar ? 'Edição' : 'Visualização';

  function statusTexto(status: StatusConvite) {
    if (status === StatusConvite.Pendente) return 'Convite pendente';
    if (status === StatusConvite.Aceito) return 'Acesso confirmado';
    if (status === StatusConvite.Recusado) return 'Convite recusado';
    return '';
  }

  function corStatus(status: StatusConvite) {
    if (status === StatusConvite.Pendente) return 'warning';
    if (status === StatusConvite.Aceito) return 'positive';
    if (status === StatusConvite.Recusado) return 'negative';
    return 'grey';
  }

  const iconePermissao = (permissao: NivelPermissao) =>
    permissao === NivelPermissao.Editar ? 'edit' : 'visibility';

  async function enviarConvite() {
    const email = novoEmail.value.trim();
    if (!email) return;
    loadingConvite.value = true;
    try {
      await compartilhamentoStore.convidar(email, novaPermissao.value);
      $q.notify({ type: 'positive', message: 'Convite enviado com sucesso!', position: 'top' });
      novoEmail.value = '';
      novaPermissao.value = NivelPermissao.Visualizar;
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao enviar convite', position: 'top' });
    } finally {
      loadingConvite.value = false;
    }
  }

  async function atualizarPermissao(id: string, permissao: NivelPermissao) {
    try {
      await compartilhamentoStore.atualizarPermissao(id, permissao);
      $q.notify({
        type: 'positive',
        message: 'Permissão atualizada com sucesso!',
        position: 'top',
      });
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao atualizar permissão', position: 'top' });
    }
  }

  function confirmarRevogacao(id: string) {
    $q.dialog({
      title: 'Remover acesso',
      message: 'Tem certeza que deseja remover o acesso desta pessoa?',
      cancel: { label: 'Cancelar', flat: true, color: 'grey' },
      ok: { label: 'Remover', flat: true, color: 'negative' },
      persistent: true,
    }).onOk(() => {
      void compartilhamentoStore
        .revogar(id)
        .then(() =>
          $q.notify({ type: 'positive', message: 'Acesso removido com sucesso!', position: 'top' }),
        )
        .catch(() =>
          $q.notify({ type: 'negative', message: 'Erro ao remover acesso', position: 'top' }),
        );
    });
  }

  async function responderConviteModal(id: string, aceitar: boolean) {
    loadingResposta.value = id;
    try {
      await compartilhamentoStore.responderConvite(id, aceitar);
      $q.notify({
        type: 'positive',
        message: aceitar ? 'Convite aceito com sucesso!' : 'Convite recusado.',
        position: 'top',
      });
    } catch {
      $q.notify({ type: 'negative', message: 'Erro ao responder convite', position: 'top' });
    } finally {
      loadingResposta.value = null;
    }
  }

  function onHide() {
    novoEmail.value = '';
    novaPermissao.value = NivelPermissao.Visualizar;
  }

  return {
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
  };
}
