
import { defineStore } from 'pinia'
import type { AcumuladoMensal, MesAno } from 'src/Model/Transacao'
import { ref } from 'vue'

export const useGerenciamentoMensalStore = defineStore('GerenciamentoMensalStore ', () => {
  // Sessao acumulado mensal
  const AcumuladoMensal = ref<AcumuladoMensal>({
    valorDespesas: 0,
    valorFinal: 0,
    valorInvestimentos: 0,
    valorRendimento: 0,
  });

  function setAcumuladoMensal(acumulado: AcumuladoMensal | null) {
    if (acumulado == null)
      return;
    AcumuladoMensal.value = acumulado;
  }

  function clearAcumuladoMensal() {
    AcumuladoMensal.value = {
      valorDespesas: 0,
      valorFinal: 0,
      valorInvestimentos: 0,
      valorRendimento: 0,
    };
  }

  const getAcumuladoMensal = () => AcumuladoMensal.value;

  // Seesão Mes

  const mesAtual = ref<MesAno>(getMesAnoAtual());

  function getMesAnoAtual() {
    const DataAtual = new Date();
    return {
      ano: DataAtual.getFullYear(),
      mes: DataAtual.getMonth() + 1,
    } as MesAno;
  }

  function setMesAno(ano: number, mes: number) {
    mesAtual.value.ano = ano;
    mesAtual.value.mes = mes;
  }

  function atualizaParaDataAtual() {
    mesAtual.value = getMesAnoAtual();
  }

  const getMes = () => mesAtual.value;

  // Sessão Loading
  const loading = ref(false);

  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    mesAtual,
    setMesAno,
    atualizaParaDataAtual,
    getMes,
    AcumuladoMensal,
    setAcumuladoMensal,
    clearAcumuladoMensal,
    getAcumuladoMensal,
    loading,
    setLoading
  };
})
