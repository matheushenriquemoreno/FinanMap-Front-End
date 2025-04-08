<template>
  <!--Tabela que mostra os investimentos-->
  <div class="row justify-center q-pa-sm q-mb-lg">
    <q-table
      title="Investimentos"
      class="tabela-transacao"
      :rows="investimentos"
      :columns="investimentosColumns"
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
        <section class="q-gutter-md">
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
        <q-tr :props="props">
          <q-td key="categoriaNome" :props="props">
            <q-checkbox v-model="props.selected" />
          </q-td>

          <q-td key="categoriaNome" :props="props" class="no-pointer-events">
            <q-icon :name="IconesGerenciamentoMensal.ICONE_INVESTIMENTO" color="green" size="xs" />
            {{ props.row.categoriaNome }}
          </q-td>
          <q-td
            class="no-pointer-events"
            v-for="col in props.cols.filter(
              (x: any) => x.name != 'acoes' && x.name != 'categoriaNome' && x.name != 'valor',
            )"
            :key="col.name"
            :props="props"
          >
            {{ col.value }}
          </q-td>

          <!-- Editar Valor -->
          <q-td key="valor" :props="props" class="cursor-pointer">
            <ValorPadraoBR :valor="props.row.valor" />
            <q-popup-edit
              v-model.number="props.row.valor"
              buttons
              label-set="Alterar"
              label-cancel="Fechar"
              @save="(value) => alterarValor(props.row.id, value)"
              :validate="(val) => val !== ''"
              v-slot="scope"
            >
              <q-input
                type="number"
                v-model.number="scope.value"
                min="0"
                step="0.01"
                dense
                autofocus
                label="Valor"
                lazy-rules
                prefix="R$ "
                :rules="[(val) => scope.validate(val) || 'Dite um valor valido!']"
                @keyup.enter="scope.set"
              />
            </q-popup-edit>
          </q-td>
          <!-- Ações -->
          <q-td class="text-center" :props="props" key="acoes">
            <section class="q-gutter-sm" v-if="$q.screen.gt.xs">
              <q-btn
                style="font-size: 11px"
                round
                size="sm"
                color="primary"
                icon="edit_note"
                @click="abriModalEditarInvestimento(props.row)"
              >
                <q-tooltip transition-show="scale" transition-hide="scale" class="bg-primary"
                  >Editar</q-tooltip
                >
              </q-btn>
              <q-btn
                round
                style="font-size: 11px"
                color="red"
                icon="delete_forever"
                @click="excluir(props.row.id)"
              >
                <q-tooltip transition-show="scale" transition-hide="scale" class="bg-red"
                  >Excluir</q-tooltip
                >
              </q-btn>
            </section>
            <section class="q-gutter-sm" v-else>
              <q-btn-dropdown round dense color="primary">
                <q-list bordered separator>
                  <q-item clickable v-ripple @click="abriModalEditarInvestimento(props.row)">
                    <q-item-section class="text-weight-medium">Editar</q-item-section>
                    <q-item-section avatar>
                      <q-icon size="md" color="primary" name="edit_note" />
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="excluir(props.row.id)">
                    <q-item-section class="text-weight-medium">Excluir</q-item-section>
                    <q-item-section avatar>
                      <q-icon size="md" color="red" name="delete_forever" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </section>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>

  <TransacaoBaseModal
    v-model:model-value="abriModal"
    :transacao="investimentoEdit"
    :eh-edicao="ehEdicao"
    titulo-add="Adicionar Investimento"
    titulo-edit="Editar Investimento"
    @on-submit-add="adicionar"
    @on-submit-edit="editar"
    :tipo-categoria-transacao="TipoCategoriaETransacao.Investimento"
    :loading="useGerenciamentoMensal.loading"
  />

  <CriarRegistroProximoMesModal
    v-model:model-value="abriModalCriarRegistroProximoMes"
    :ids-transacao="obterIdsRegistrosSelecionados"
    :tipo-categoria-transacao="TipoCategoriaETransacao.Investimento"
  />
</template>

<script setup lang="ts">
import ValorPadraoBR from 'src/components/ValorPadraoBR.vue';
import TransacaoBaseModal from 'src/components/Transacao/TransacaoBaseModal.vue';
import CriarRegistroProximoMesModal from 'src/components/Transacao/CriarRegistroProximoMesModal.vue';

import type { InvestimentoCreate, InvestimentoResult } from 'src/Model/Transacao';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

import { obterAcumuladoMensalReport } from 'src/services/AcumuladoMensalService';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import getInvestimentoService from 'src/services/transacao/InvestimentoService';
import IconesGerenciamentoMensal from 'src/helpers/IconesGerenciamentoMensal';

// services
const investimentoservice = getInvestimentoService();
const $q = useQuasar();

// Variaveis
const filter = ref('');
const abriModal = ref(false);
const ehEdicao = ref(false);
const investimentoEdit = ref<InvestimentoCreate>({} as InvestimentoCreate);
const investimentosColumns: any[] = [
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
const investimentos = ref<InvestimentoResult[]>([]);

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
      TipoCategoriaETransacao.Investimento,
    );
    useGerenciamentoMensal.setAcumuladoMensal(report);
    investimentos.value = report.investimentos ?? [];
  } catch (error) {
    console.log(error);
  }
  useGerenciamentoMensal.setLoading(false);
}

async function adicionar(investimento: InvestimentoCreate) {
  investimento.ano = useGerenciamentoMensal.mesAtual.ano;
  investimento.mes = useGerenciamentoMensal.mesAtual.mes;

  await investimentoservice.create(investimento);
  abriModal.value = false;
  getReportAcumulado();
}

async function editar(investimento: InvestimentoCreate) {
  await investimentoservice.update(investimento);
  fecharModal();
  getReportAcumulado();
}

function excluir(id: string) {
  $q.dialog({
    message: 'Deseja realmente excluir esse investimento?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    investimentoservice.delete(id).then(() => {
      getReportAcumulado();
    });
  });
}

function abriModalEditarInvestimento(investimento: InvestimentoResult) {
  investimentoEdit.value.categoriaId = investimento.categoriaId;
  investimentoEdit.value.categoriaNome = investimento.categoriaNome;
  investimentoEdit.value.id = investimento.id;
  investimentoEdit.value.descricao = investimento.descricao;
  investimentoEdit.value.valor = investimento.valor;
  abriModalAdicionar(true);
}

async function alterarValor(id: string, valor: number) {
  try {
    const result = await investimentoservice.updateValor(id, valor);
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
  investimentoEdit.value = {} as InvestimentoCreate;
}

// Ações de seleção de registros

const registrosSelecionados = ref<InvestimentoResult[]>([]);
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
    investimentoservice.deleteMany(ids).then(() => {
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
