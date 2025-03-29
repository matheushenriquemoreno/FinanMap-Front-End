<template>
  <!--Tabela que mostra os despesas-->
  <div class="row justify-center q-pa-sm q-mb-lg">
    <q-table
      title="Despesas"
      class="tabela-transacao"
      :rows="despesas"
      :columns="despesasColumns"
      row-key="descricao"
      color="primary"
      flat
      bordered
      table-class="text-dark text-center"
      :rows-per-page-options="[$q.screen.gt.xs ? 10 : 5, 15, 20, 25, 0]"
      :loading="useGerenciamentoMensal.loading"
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
            color="primary"
            icon="add"
            @click="() => abriModalAdicionar()"
            :loading="useGerenciamentoMensal.loading"
          />
        </section>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="categoriaNome" :props="props" class="no-pointer-events">
            <q-icon name="arrow_upward" color="green" size="xs" />
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
                @click="abriModalEditarDespesa(props.row)"
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
                  <q-item clickable v-ripple @click="abriModalEditarDespesa(props.row)">
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

  <!--Modal Adicionar/Editar Rendimento-->
  <TransacaoBaseModal
    v-model:model-value="abriModal"
    :transacao="despesaEdit"
    :eh-edicao="ehEdicao"
    titulo-add="Adicionar Rendimento"
    titulo-edit="Editar Rendimento"
    @on-submit-add="adicionar"
    @on-submit-edit="editar"
    :tipo-categoria-transacao="TipoCategoria.Despesa"
    :loading="useGerenciamentoMensal.loading"
  />
</template>

<script setup lang="ts">
import ValorPadraoBR from 'src/components/ValorPadraoBR.vue';
import TransacaoBaseModal from 'src/components/Transacao/TransacaoBaseModal.vue';

import type { DespesaCreate, DespesaResult } from 'src/Model/Transacao';
import { TipoCategoria } from 'src/Model/Categoria';

import { obterAcumuladoMensalReport } from 'src/services/AcumuladoMensalService';
import { useGerenciamentoMensalStore } from 'src/stores/GerenciamentoMensal-store';
import { onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import getDespesaService from 'src/services/transacao/DespesaService';

// services
const despesaservice = getDespesaService();
const $q = useQuasar();

// Variaveis
const filter = ref('');
const abriModal = ref(false);
const ehEdicao = ref(false);
const despesaEdit = ref<DespesaCreate>({} as DespesaCreate);
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
      TipoCategoria.Despesa,
    );
    useGerenciamentoMensal.setAcumuladoMensal(report);
    despesas.value = report.despesas ?? [];
  } catch (error) {
    console.log(error);
  }
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
  console.log(despesa);
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
  despesaEdit.value.categoriaId = despesa.categoriaId;
  despesaEdit.value.categoriaNome = despesa.categoriaNome;
  despesaEdit.value.id = despesa.id;
  despesaEdit.value.descricao = despesa.descricao;
  despesaEdit.value.valor = despesa.valor;
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
  despesaEdit.value = {} as DespesaCreate;
}
</script>
