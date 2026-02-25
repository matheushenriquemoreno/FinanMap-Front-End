<template>
  <q-dialog v-model="localModelValue" @before-hide="closeModal" @hide="closeModal" position="top"
    backdrop-filter="brightness(60%)">
    <q-card style="width: 700px; max-width: 90vw; margin-top: 40px; border-radius: 15px">
      <q-card-section class="row items-center q-pb-md">
        <div class="text-h6">{{ ehEdicao ? tituloEdit : tituloAdd }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>
          <q-form @submit.prevent="submitFormulario" class="q-gutter-xs">
            <q-input rounded filled v-model="dadosFormulario.descricao" label="Descricao" lazy-rules hint="" />
            <q-input rounded filled type="number" min="0" step="0.01" v-model="dadosFormulario.valor" label="Valor"
              lazy-rules prefix="R$ " :rules="[(val: any) => Boolean(val) || 'Campo obrigatorio']" />
            <div>
              <CampoSelect :configuracoes="{
                labelObjeto: 'nome',
                valueObjeto: 'id',
                emitirSomenteValor: false,
                obterDados: buscarCategorias,
              }" v-model="categoriaSelecionada" label="Selecione a categoria"
                @model-alterado="(val: any) => (dadosFormulario.categoriaId = val.id)"
                :rules="[(val: any) => Boolean(val) || 'Campo obrigatorio']" />
            </div>

            <CampoSelect :configuracoes="{
              labelObjeto: 'descricaoECategoria',
              valueObjeto: 'id',
              emitirSomenteValor: false,
              obterDados: buscarDespesas,
            }" v-model="despesaAgrupadora" label="Selecione a despesa agrupadora" />

            <div v-if="!ehEdicao" class="q-py-sm">
              <q-toggle v-model="modoLote" label="Lançamento em Lote (Recorrência/Parcelamento)" color="primary" />
            </div>

            <template v-if="modoLote && !ehEdicao">
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12 col-sm-6">
                  <q-select filled rounded v-model="tipoLote" :options="opcoesTipoLote" label="Tipo de Lote" emit-value
                    map-options />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input filled rounded type="number" min="2" max="24" v-model.number="quantidadeMeses"
                    label="Quantidade de Meses" :rules="[
                      (val: any) => val >= 2 || 'Mínimo de 2 meses',
                      (val: any) => val <= 24 || 'Máximo de 24 meses'
                    ]" />
                </div>
              </div>

              <q-banner v-if="tipoLote && Boolean(dadosFormulario.valor)" class="bg-grey-2 q-mb-md rounded-borders">
                <template v-slot:avatar>
                  <q-icon name="info" color="primary" />
                </template>
                <div class="text-caption">
                  {{ resumoLote }}
                </div>
              </q-banner>

              <q-banner v-if="modoLote && despesaAgrupadora" class="bg-blue-1 q-mb-md rounded-borders">
                <template v-slot:avatar>
                  <q-icon name="account_tree" color="blue" />
                </template>
                <div class="text-caption">
                  As {{ quantidadeMeses }} despesas serão automaticamente vinculadas a
                  <strong>"{{ despesaAgrupadora.descricao }}"</strong> em cada mês.
                  Nos meses onde a agrupadora ainda não existir, ela será criada automaticamente.
                </div>
              </q-banner>
            </template>




            <q-card-actions class="text-primary" align="between">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn flat :loading="loading" :label="ehEdicao ? 'Editar' : 'Adicionar'"
                :icon-right="ehEdicao ? 'edit' : 'add'" type="submit" />
            </q-card-actions>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import CampoSelectComSusgestao from 'src/components/Transacao/CampoSelect/CampoSelectComSusgestao.vue';
import CampoSelect from 'src/components/CampoSelect/CampoSelectServer.vue';
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { Categoria } from 'src/Model/Categoria';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import type { DespesaCreate, DespesaResult, LancarDespesaLoteDTO } from 'src/Model/Transacao';

function isEmpty(obj: object | null | undefined) {
  if (obj === null || obj === undefined) return true;

  return Object.keys(obj).length === 0;
}

// Props do componente
interface Props {
  modelValue: boolean;
  tituloAdd: string;
  tituloEdit: string;
  transacao?: DespesaResult;
  loading: boolean;
  ehEdicao: boolean;
  ano: number;
  mes: number;
}

// Definição das props com validação
const props = withDefaults(defineProps<Props>(), {
  ehEdicao: false,
});

// services
const $q = useQuasar();

// Variaveis
const localModelValue = computed({
  get: () => props.modelValue,
  set: (valor) => emit('update:modelValue', valor),
});

const categoriaSelecionada = ref<Categoria | null>(null);
const despesaAgrupadora = ref<DespesaResult | null>(null);

const dadosFormulario = ref({} as DespesaCreate);

const modoLote = ref(false);
const tipoLote = ref<'parcelado' | 'recorrente'>('parcelado');
const quantidadeMeses = ref<number>(2);

const opcoesTipoLote = [
  { label: 'Parcelamento', value: 'parcelado' },
  { label: 'Recorrência Fixa', value: 'recorrente' },
];

const resumoLote = computed(() => {
  if (!dadosFormulario.value.valor || !quantidadeMeses.value) return '';

  if (tipoLote.value === 'parcelado') {
    const valorParcela = (dadosFormulario.value.valor / quantidadeMeses.value).toFixed(2);
    return `Serão criadas ${quantidadeMeses.value} despesas de R$ ${valorParcela}. O valor total da compra é R$ ${dadosFormulario.value.valor}.`;
  } else {
    return `A despesa de R$ ${dadosFormulario.value.valor} será repetida nos próximos ${quantidadeMeses.value} meses.`;
  }
});

watch(localModelValue, (valor) => {
  if (valor === true && props.ehEdicao && isEmpty(props.transacao) == false) {
    dadosFormulario.value = { ...props.transacao } as DespesaCreate;

    categoriaSelecionada.value = {
      id: props.transacao?.categoriaId,
      nome: props.transacao?.categoriaNome,
    } as Categoria;

    despesaAgrupadora.value = props.transacao?.agrupadora ?? null;
  }
});

// Emits do componente
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:transacao', value: DespesaCreate): void;
  (e: 'onSubmitEdit', dados: DespesaCreate): void;
  (e: 'onSubmitAdd', dados: DespesaCreate): void;
  (e: 'onSubmitAddLote', dados: LancarDespesaLoteDTO): void;
  (e: 'closeModal'): void;
}>();

// metodos
async function buscarCategorias(value?: string) {
  const axios = CreateIntanceAxios();
  const result = await axios.get<Categoria[]>(
    process.env.URL_API + 'categorias/GetUserCategorias',
    {
      params: {
        tipoCategoria: TipoCategoriaETransacao.Despesa,
        nome: value ?? '',
      },
    },
  );
  return result.data;
}

async function buscarDespesas(value?: string) {
  const axios = CreateIntanceAxios();
  const result = await axios.get<DespesaResult[]>(process.env.URL_API + 'despesas', {
    params: {
      ano: props.ano,
      mes: props.mes,
      descricao: value ?? '',
    },
  });

  return result.data;
}

// Submeter formulário
const submitFormulario = () => {
  if (props.ehEdicao) {
    dadosFormulario.value.idDespesaAgrupadora = despesaAgrupadora.value?.id ?? '';
    emit('onSubmitEdit', dadosFormulario.value as DespesaCreate);
  } else {
    if (modoLote.value) {
      const dtoLote: LancarDespesaLoteDTO = {
        descricao: dadosFormulario.value.descricao,
        valorTotal: Number(dadosFormulario.value.valor),
        categoriaId: categoriaSelecionada.value?.id ?? '',
        anoInicial: props.ano,
        mesInicial: props.mes,
        isParcelado: tipoLote.value === 'parcelado',
        quantidadeMeses: Number(quantidadeMeses.value),
        isRecorrenteFixa: tipoLote.value === 'recorrente',
      };

      if (despesaAgrupadora.value?.id) {
        dtoLote.idDespesaAgrupadora = despesaAgrupadora.value.id;
      }

      emit('onSubmitAddLote', dtoLote);
    } else {
      dadosFormulario.value.idDespesaAgrupadora = despesaAgrupadora.value?.id ?? '';
      emit('onSubmitAdd', dadosFormulario.value as DespesaCreate);
    }
  }
};

const closeModal = () => {
  dadosFormulario.value = {} as DespesaCreate;
  categoriaSelecionada.value = null;
  despesaAgrupadora.value = null;
  modoLote.value = false;
  tipoLote.value = 'parcelado';
  quantidadeMeses.value = 2;
  emit('closeModal');
};
</script>
