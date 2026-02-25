import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Compartilhamento, ContextoCompartilhado } from 'src/models/Compartilhamento';
import { NivelPermissao, StatusConvite } from 'src/models/Compartilhamento';
import CompartilhamentoService from 'src/services/CompartilhamentoService';

const STORAGE_KEY = 'proprietarioIdAtivo';

export const useCompartilhamentoStore = defineStore('compartilhamento', () => {
  // State
  const meusCompartilhamentos = ref<Compartilhamento[]>([]);
  const convitesRecebidos = ref<Compartilhamento[]>([]);
  const contextoAtivo = ref<ContextoCompartilhado | null>(null);
  const loading = ref(false);

  // Computed
  const emModoCompartilhado = computed(() => contextoAtivo.value !== null);

  const podeEditar = computed(() => {
    if (!emModoCompartilhado.value) return true; // Próprios dados = sempre pode editar
    return contextoAtivo.value?.permissao === NivelPermissao.Editar;
  });

  const compartilhamentosAceitos = computed(() =>
    convitesRecebidos.value.filter(c => c.status === StatusConvite.Aceito) // StatusConvite.Aceito
  );

  const convitesPendentes = computed(() =>
    convitesRecebidos.value.filter(c => c.status === StatusConvite.Pendente) // StatusConvite.Pendente
  );

  // Actions
  async function carregarCompartilhamentos() {
    try {
      loading.value = true;
      const [meus, convites] = await Promise.all([
        CompartilhamentoService.obterMeusCompartilhamentos(),
        CompartilhamentoService.obterConvitesRecebidos()
      ]);
      meusCompartilhamentos.value = Array.isArray(meus) ? meus : [];
      convitesRecebidos.value = Array.isArray(convites) ? convites : [];
    } catch (error) {
      console.error('Erro ao carregar compartilhamentos:', error);
    } finally {
      loading.value = false;
    }
  }

  function ativarContexto(compartilhamento: Compartilhamento) {
    contextoAtivo.value = {
      proprietarioId: compartilhamento.proprietarioId,
      proprietarioNome: compartilhamento.proprietarioNome,
      permissao: compartilhamento.permissao
    };
    // Salvar no localStorage para o interceptor do Axios
    localStorage.setItem(STORAGE_KEY, compartilhamento.proprietarioId);
  }

  function desativarContexto() {
    contextoAtivo.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function restaurarContextoDoLocalStorage() {
    const proprietarioId = localStorage.getItem(STORAGE_KEY);
    if (proprietarioId) {
      // Buscar o compartilhamento correspondente
      const compartilhamento = convitesRecebidos.value.find(
        c => c.proprietarioId === proprietarioId && c.status === StatusConvite.Aceito
      );
      if (compartilhamento) {
        contextoAtivo.value = {
          proprietarioId: compartilhamento.proprietarioId,
          proprietarioNome: compartilhamento.proprietarioNome,
          permissao: compartilhamento.permissao
        };
      } else {
        // Se não encontrou o compartilhamento correspondente, limpar contexto
        localStorage.removeItem(STORAGE_KEY);
        contextoAtivo.value = null;
      }
    }
  }

  async function convidar(email: string, permissao: NivelPermissao) {
    const novoCompartilhamento = await CompartilhamentoService.convidar({
      convidadoEmail: email,
      permissao
    });
    meusCompartilhamentos.value.push(novoCompartilhamento);
    return novoCompartilhamento;
  }

  async function responderConvite(compartilhamentoId: string, aceitar: boolean) {
    await CompartilhamentoService.responderConvite({
      compartilhamentoId,
      aceitar
    });
    // Atualizar o status localmente
    const convite = convitesRecebidos.value.find(c => c.id === compartilhamentoId);
    if (convite) {
      convite.status = aceitar ? StatusConvite.Aceito : StatusConvite.Recusado; // Aceito : Recusado
    }
  }

  async function atualizarPermissao(compartilhamentoId: string, novaPermissao: NivelPermissao) {
    await CompartilhamentoService.atualizarPermissao({
      compartilhamentoId,
      novaPermissao
    });
    // Atualizar localmente
    const compartilhamento = meusCompartilhamentos.value.find(c => c.id === compartilhamentoId);
    if (compartilhamento) {
      compartilhamento.permissao = novaPermissao;
    }
  }

  async function revogar(compartilhamentoId: string) {
    await CompartilhamentoService.revogar(compartilhamentoId);
    // Remover localmente
    meusCompartilhamentos.value = meusCompartilhamentos.value.filter(
      c => c.id !== compartilhamentoId
    );
  }

  return {
    // State
    meusCompartilhamentos,
    convitesRecebidos,
    contextoAtivo,
    loading,
    // Computed
    emModoCompartilhado,
    podeEditar,
    compartilhamentosAceitos,
    convitesPendentes,
    // Actions
    carregarCompartilhamentos,
    ativarContexto,
    desativarContexto,
    restaurarContextoDoLocalStorage,
    convidar,
    responderConvite,
    atualizarPermissao,
    revogar
  };
});
