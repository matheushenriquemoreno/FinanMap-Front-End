<template>
  <q-dialog v-model="localModelValue" @before-hide="closeModal" @hide="closeModal" position="top">
    <q-card style="width: 700px; max-width: 90vw; margin-top: 40px; border-radius: 15px">
      <q-card-section class="row items-center q-pb-md">
        <div class="text-h6">{{ ehEdicao ? tituloEdit : tituloAdd }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>
          <q-form @submit.prevent="submitFormulario" class="q-gutter-xs">
            <q-input
              rounded
              filled
              v-model="dadosFormulario.descricao"
              label="Descricao"
              lazy-rules
              hint=""
            />
            <q-input
              rounded
              filled
              type="number"
              min="0"
              step="0.01"
              v-model="dadosFormulario.valor"
              label="Valor"
              lazy-rules
              prefix="R$ "
              :rules="[(val) => Boolean(val) || 'Campo obrigatorio']"
            />
            <div>
              <CampoSelectServer
                :configuracoes="{
                  labelObjeto: 'nome',
                  valueObjeto: 'id',
                  emitirSomenteValor: false,
                  obterDados: buscarCategorias,
                }"
                v-model="categoriaSelecionada"
                label="Selecione a categoria"
                @model-alterado="(val) => (dadosFormulario.categoriaId = val.id)"
                :rules="[(val) => Boolean(val) || 'Campo obrigatorio']"
              />
            </div>

            <div>
              <CampoSelectServer
                :configuracoes="{
                  labelObjeto: 'descricaoECategoria',
                  valueObjeto: 'id',
                  emitirSomenteValor: false,
                  obterDados: buscarDespesas,
                }"
                :disable="props.ehEdicao && (props.transacao?.ehDespesaAgrupadora ?? false)"
                v-model="despesaAgrupadora"
                label="Selecione a despesa agrupadora"
              />
            </div>

            <q-card-actions class="text-primary" align="between">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                flat
                :loading="loading"
                :label="ehEdicao ? 'Editar' : 'Adicionar'"
                :icon-right="ehEdicao ? 'edit' : 'add'"
                type="submit"
              />
            </q-card-actions>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import CampoSelectServer from 'src/components/CampoSelect/CampoSelectServer.vue';
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { Categoria } from 'src/Model/Categoria';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { CreateIntanceAxios } from 'src/helpers/api/AxiosHelper';
import type { DespesaCreate, DespesaResult } from 'src/Model/Transacao';

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

const dadosFormulario = ref(props.transacao as DespesaCreate);

watch(localModelValue, (valor) => {
  if (valor === true && props.ehEdicao && isEmpty(props.transacao) == false) {
    dadosFormulario.value = props.transacao as DespesaCreate;

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
  dadosFormulario.value.idDespesaAgrupadora = despesaAgrupadora.value?.id ?? '';
  if (props.ehEdicao) {
    emit('onSubmitEdit', dadosFormulario.value as DespesaCreate);
  } else {
    emit('onSubmitAdd', dadosFormulario.value as DespesaCreate);
  }
};

const closeModal = () => {
  dadosFormulario.value = {} as DespesaCreate;
  categoriaSelecionada.value = null;
  despesaAgrupadora.value = null;
  emit('closeModal');
};
</script>
