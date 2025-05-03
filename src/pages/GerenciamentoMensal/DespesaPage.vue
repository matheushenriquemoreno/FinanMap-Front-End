<template>
  <!--Tabela que mostra os despesas-->
  <div class="row justify-center q-pa-sm q-mb-lg">
    <q-table
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

      <template v-slot:body="props">
        <q-tr
          :props="props"
          :key="props.row.id!"
          v-if="!props.row?.idDespesaAgrupadora || props.row?.idDespesaAgrupadora === null"
        >
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

        <tr
          v-show="props.expand"
          v-for="despesa in bucarDespesasDaAgrupadora(props.row.id, props.expand)"
          :key="despesa.id!"
          class="bg-grey-4"
        >
          <DespesaTableRow
            :key="despesa.id!"
            v-bind:props="getPropsRow(props, despesa)"
            :show-selected="false"
            @editar="abriModalEditarDespesa"
            @excluir="excluir"
            @alterarValor="alterarValor"
          />
        </tr>
      </template>
    </q-table>
  </div>

  <!--Modal Adicionar/Editar -->
  <TransacaoBaseModalDespesa
    v-model:model-value="abriModal"
    :transacao="despesaEdit"
    :eh-edicao="ehEdicao"
    titulo-add="Adicionar Despesa"
    titulo-edit="Editar Despesa"
    @on-submit-add="adicionar"
    @on-submit-edit="editar"
    :tipo-categoria-transacao="TipoCategoriaETransacao.Despesa"
    :loading="useGerenciamentoMensal.loading"
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
import TransacaoBaseModalDespesa from 'src/components/Transacao/TransacaoBaseModalDespesa.vue';
import CriarRegistroProximoMesModal from 'src/components/Transacao/CriarRegistroProximoMesModal.vue';
import DespesaTableRow from 'src/components/Despesa/DespesaTableRow.vue';
import type { DespesaCreate, DespesaResult } from 'src/Model/Transacao';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

import { obterAcumuladoMensalReport } from 'src/services/AcumuladoMensalService';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import getDespesaService from 'src/services/transacao/DespesaService';

// services
const despesaservice = getDespesaService();
const $q = useQuasar();

// Variaveis
const filter = ref('');
const abriModal = ref(false);
const ehEdicao = ref(false);
const despesaEdit = ref<DespesaResult>({} as DespesaResult);
const despesasColumns: any[] = [
  {
    name: 'categoriaNome',
    field: 'categoriaNome',
    label: 'Categoria',
    align: 'center',
  },
  {
    name: 'Descricao',
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
    despesas.value = report.despesas ?? [];
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

async function alterarValor(id: string, valor: number) {
  try {
    const result = await despesaservice.updateValor(id, valor);
    useGerenciamentoMensal.setAcumuladoMensal(result.reportAcumulado);
  } catch {
    await getReportAcumulado();
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

async function buscarDespesasAgrupadas(id: string, expandir: boolean) {
  if (expandir) {
    useGerenciamentoMensal.setLoading(true);

    let despesasDaAgrupada = await despesaservice.getDespesasAgrupadas(id);

    despesasDaAgrupada = despesasDaAgrupada.map((des) => {
      return {
        ...des,
        idDespesaAgrupadora: id,
      };
    });

    despesas.value = [...despesasDaAgrupada, ...despesas.value];

    useGerenciamentoMensal.setLoading(false);
  } else {
    await getReportAcumulado();
  }
}

function bucarDespesasDaAgrupadora(id: string, expandir: boolean) {
  if (expandir) {
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
