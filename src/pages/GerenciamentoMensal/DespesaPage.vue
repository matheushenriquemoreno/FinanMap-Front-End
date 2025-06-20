<template>
  <!--Tabela que mostra os despesas-->
  <div class="row justify-center q-pa-sm q-mb-lg">
    <q-table
      :key="useGerenciamentoMensal.mesAtual.ano + useGerenciamentoMensal.mesAtual.mes"
      title="Despesas"
      class="tabela-transacao"
      :rows="despesas"
      :columns="despesasColumns"
      row-key="id"
      color="primary"
      flat
      bordered
      table-class="text-dark text-center"
      :rows-per-page-options="[$q.screen.gt.xs ? 7 : 5, 9, 12, 15, 18, 21]"
      :loading="useGerenciamentoMensal.loading"
      selection="multiple"
      v-model:selected="registrosSelecionados"
    >
      <template v-slot:top-left>
        <q-input dense debounce="300" label="Descrição" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:top-right>
        <section class="q-gutter-sm">
          <q-btn
            v-if="existeRegistroSelecionados"
            color="primary"
            icon="date_range"
            @click="() => enviarRegistrosSelecionadosParaProximoMes()"
          />
          <q-btn
            v-if="existeRegistroSelecionados"
            color="primary"
            icon="delete_forever"
            @click="() => excluirRegistrosSelecionados()"
          />
          <q-btn
            v-if="existeRegistroSelecionados === false"
            color="primary"
            icon="add"
            @click="() => abriModalAdicionar()"
            :loading="useGerenciamentoMensal.loading"
          />
        </section>
      </template>

      <template v-slot:header-cell-descricao="props">
        <q-th :props="props" style="width: 350px">
          {{ props.col.label }}
        </q-th>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" :key="props.row.id" v-if="!props.row?.idDespesaAgrupadora">
          <DespesaTableRow
            :key="props.row.id"
            v-bind:props="props"
            :show-selected="true"
            @editar="abriModalEditarDespesa"
            @excluir="excluir"
            @alterarValor="alterarValor"
            @expandir="buscarDespesasAgrupadas"
          />
        </q-tr>
        <!-- região que vai abrir uma nova linha com toda a listagem de despesa da despesa agrupadora -->
        <tr
          v-show="despesasExpandidas.has(props.row.id)"
          v-for="despesa in props.row.despesasFilhas"
          :key="despesa.id!"
          class="bg-grey-4"
        >
          <DespesaTableRow
            :key="despesa.id!"
            :props="getPropsRow(props, despesa)"
            :show-selected="false"
            @editar="abriModalEditarDespesa"
            @excluir="excluir"
            @alterarValor="(id, valor) => alterarValor(id, valor, true)"
          />
        </tr>
      </template>
    </q-table>
  </div>

  <!--Modal Adicionar/Editar -->
  <ModalDespesa
    v-model:model-value="abriModal"
    :transacao="despesaEdit"
    :eh-edicao="ehEdicao"
    titulo-add="Adicionar Despesa"
    titulo-edit="Editar Despesa"
    @on-submit-add="adicionar"
    @on-submit-edit="editar"
    :tipo-categoria-transacao="TipoCategoriaETransacao.Despesa"
    :loading="despesaservice.loading.value"
    :ano="useGerenciamentoMensal.mesAtual.ano"
    :mes="useGerenciamentoMensal.mesAtual.mes"
  />

  <CriarRegistroProximoMesModal
    v-model:model-value="abriModalCriarRegistroProximoMes"
    :ids-transacao="obterIdsRegistrosSelecionados"
    :tipo-categoria-transacao="TipoCategoriaETransacao.Despesa"
  />
</template>

<script setup lang="ts">
import ModalDespesa from 'src/components/Despesa/ModalCreateUpdateDespesa.vue';
import CriarRegistroProximoMesModal from 'src/components/Transacao/CriarRegistroProximoMesModal.vue';
import DespesaTableRow from 'src/components/Despesa/DespesaTableRow.vue';
import type { DespesaCreate, DespesaResult } from 'src/Model/Transacao';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { obterAcumuladoMensalReport } from 'src/services/AcumuladoMensalService';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import getDespesaService from 'src/services/transacao/DespesaService';
import GerenciamentoMensalPageIndex from './GerenciamentoMensalPageIndex.vue';

// services
const despesaservice = getDespesaService();
const $q = useQuasar();

// Variaveis
const filter = ref('');
const abriModal = ref(false);
const ehEdicao = ref(false);
const despesaEdit = ref<DespesaResult>({} as DespesaResult);

// Controle manual do estado de expansão
const despesasExpandidas = ref<Set<string>>(new Set());

const despesasColumns: any[] = [
  {
    name: 'categoriaNome',
    field: 'categoriaNome',
    label: 'Categoria',
    align: 'center',
  },
  {
    name: 'descricao',
    field: 'descricao',
    label: 'Descrição',
    format: (val: string) => `${val.trim()}`,
    align: 'center',
  },
  {
    name: 'valor',
    label: 'Valor',
    field: 'valor',
    align: 'center',
    format: (val: number) =>
      val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
    sortable: true,
    sort: (a: any, b: any) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'acoes',
    field: 'acoes',
    label: 'Ações',
    align: 'center',
  },
];

const despesas = ref<DespesaResult[]>([]);

// stores
const useGerenciamentoMensal = useGerenciamentoMensalStore();

// Methods Lifecycle
onMounted(async () => {
  await getReportAcumulado();
});

watch(
  useGerenciamentoMensal.mesAtual,
  () => {
    // Limpa as categorias expandidas ao mudar de mês
    despesasExpandidas.value = new Set();
    getReportAcumulado();
  },
  { deep: true },
);

async function getReportAcumulado() {
  useGerenciamentoMensal.setLoading(true);

  try {
    const report = await obterAcumuladoMensalReport(
      useGerenciamentoMensal.mesAtual.ano,
      useGerenciamentoMensal.mesAtual.mes,
      TipoCategoriaETransacao.Despesa,
    );

    useGerenciamentoMensal.setAcumuladoMensal(report);

    const resultDespesas = report.despesas ?? [];

    const idsExpandidos = Array.from(despesasExpandidas.value);

    for (const despesaId of idsExpandidos) {
      // Verificar se a despesa agrupadora ainda existe
      const despesaAgrupada = resultDespesas.find(
        (d) => d.id === despesaId && d.ehDespesaAgrupadora,
      );
      if (despesaAgrupada) {
        const despesasDaAgrupada = await despesaservice.getDespesasAgrupadas(despesaId);
        despesaAgrupada.despesasFilhas = despesasDaAgrupada;
      } else {
        // Remove do conjunto se não existe mais
        despesasExpandidas.value.delete(despesaId);
      }
    }

    // realizo a atribuição da despesa somente no final para ja mostrar a tela pronta, com as despesas agrupadas
    // que foram carregadas anteriormente com todos os dados carregados.
    despesas.value = resultDespesas;
  } catch (error) {
    console.log(error);
  }

  registrosSelecionados.value = [];
  useGerenciamentoMensal.setLoading(false);
}

async function adicionar(despesa: DespesaCreate) {
  despesa.ano = useGerenciamentoMensal.mesAtual.ano;
  despesa.mes = useGerenciamentoMensal.mesAtual.mes;

  await despesaservice.create(despesa);
  abriModal.value = false;
  getReportAcumulado();
}

async function editar(despesa: DespesaCreate) {
  await despesaservice.update(despesa);
  fecharModal();
  getReportAcumulado();
}

function excluir(id: string) {
  $q.dialog({
    message: 'Deseja realmente excluir essa despesa?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    despesaservice.delete(id).then(() => {
      getReportAcumulado();
    });
  });
}

function abriModalEditarDespesa(despesa: DespesaResult) {
  despesaEdit.value = despesa;
  abriModalAdicionar(true);
}

async function alterarValor(id: string, valor: number, despesaAgrupada = false) {
  try {
    useGerenciamentoMensal.setLoading(true);

    const result = await despesaservice.updateValor(id, valor);

    if (despesaAgrupada) {
      const indexAgrupadora = despesas.value.findIndex(
        (x) => x.despesasFilhas && x.despesasFilhas.some((x) => x.id === id),
      );

      const agrupadora = despesas.value[indexAgrupadora]!;
      agrupadora.valor = result.agrupadora?.valor ?? agrupadora.valor;

      const despesaFilha = agrupadora.despesasFilhas?.find((x) => x.id === id);
      if (despesaFilha) despesaFilha.valor = result.valor;
      return;
    }

    const indexDespesa = despesas.value.findIndex((x) => x.id === id);

    const despesa = despesas.value[indexDespesa]!;

    despesa.valor = result.valor;

    useGerenciamentoMensal.setAcumuladoMensal(result.reportAcumulado);
  } catch {
    await getReportAcumulado();
  } finally {
    useGerenciamentoMensal.setLoading(false);
  }
}

function abriModalAdicionar(isEdit = false) {
  abriModal.value = true;
  ehEdicao.value = isEdit;
}

function fecharModal() {
  abriModal.value = false;
  ehEdicao.value = false;
  despesaEdit.value = {} as DespesaResult;
}

async function buscarDespesasAgrupadas(id: string, expandir = true) {
  useGerenciamentoMensal.setLoading(true);

  despesas.value = despesas.value.filter((x) => x.idDespesaAgrupadora !== id);

  if (expandir) {
    const despesasDaAgrupada = await despesaservice.getDespesasAgrupadas(id);

    const indexAgrupadora = despesas.value.findIndex((x) => x.id === id);
    const agrupadora = despesas.value[indexAgrupadora]!;
    agrupadora.despesasFilhas = despesasDaAgrupada;

    // Adicionar ao conjunto de expandidas
    despesasExpandidas.value.add(id);
  } else {
    // Remover do conjunto de expandidas
    despesasExpandidas.value.delete(id);
  }

  useGerenciamentoMensal.setLoading(false);
}

function filtrarDespesasDaAgrupadora(id: string) {
  if (despesasExpandidas.value.has(id)) {
    return despesas.value.filter((x) => x.idDespesaAgrupadora === id);
  }
  return [];
}

function getPropsRow(props: any, despesa: DespesaResult) {
  const newProps = { ...props };
  newProps.row = despesa;
  newProps.key = despesa.id;
  return newProps;
}

// Ações de seleção de registros
const registrosSelecionados = ref<DespesaResult[]>([]);
const abriModalCriarRegistroProximoMes = ref(false);

function excluirRegistrosSelecionados() {
  const registros = registrosSelecionados.value.length;
  const mensagemRegistros =
    registros === 1
      ? `Deseja realmente excluir o registro selecionado?`
      : `Deseja realmente excluir os ${registros} registros selecionados?`;
  $q.dialog({
    message: mensagemRegistros,
    cancel: true,
    persistent: false,
  }).onOk(() => {
    const ids = obterIdsRegistrosSelecionados.value;
    despesaservice.deleteMany(ids).then(() => {
      getReportAcumulado();
    });
    registrosSelecionados.value = [];
  });
}

function enviarRegistrosSelecionadosParaProximoMes() {
  abriModalCriarRegistroProximoMes.value = true;
}

const obterIdsRegistrosSelecionados = computed(() => {
  const ids = registrosSelecionados.value?.map((x) => x.id!) ?? [];
  return ids;
});

const existeRegistroSelecionados = computed(() => {
  return registrosSelecionados.value.length >= 1;
});
</script>
