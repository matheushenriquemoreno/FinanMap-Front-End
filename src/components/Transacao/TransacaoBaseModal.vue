<template>
  <!--Modal Adicionar/Editar Rendimento-->
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
import type { Categoria, TipoCategoria } from 'src/Model/Categoria';
import { CreateIntanceAxios } from 'src/helpers/api/AxiosHelper';
import type { TransacaoCreate } from 'src/Model/Transacao';

function isEmpty(obj: object | null) {
  if (obj === null || obj === undefined) return false;

  return Object.keys(obj).length === 0;
}

// Props do componente
interface Props {
  modelValue: boolean;
  tituloAdd: string;
  tituloEdit: string;
  transacao?: TransacaoCreate;
  tipoCategoriaTransacao: TipoCategoria;
  loading: boolean;
  ehEdicao: boolean;
}

// Definição das props com validação
const props = withDefaults(defineProps<Props>(), {
  transacao: () => ({}) as TransacaoCreate,
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

const dadosFormulario = ref(props.transacao);

watch(localModelValue, (valor) => {
  if (valor === true && props.ehEdicao) {
    if (isEmpty(props.transacao)) return;
    console.log(props.transacao);
    dadosFormulario.value = props.transacao;
    categoriaSelecionada.value = {
      id: props.transacao.categoriaId,
      nome: props.transacao.categoriaNome,
    } as Categoria;
  }
});

// Emits do componente
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:transacao', value: TransacaoCreate): void;
  (e: 'onSubmitEdit', dados: TransacaoCreate): void;
  (e: 'onSubmitAdd', dados: TransacaoCreate): void;
  (e: 'closeModal'): void;
}>();

// metodos
async function buscarCategorias(value?: string) {
  const axios = CreateIntanceAxios();
  const result = await axios.get<Categoria[]>(
    process.env.URL_API + 'categorias/GetUserCategorias',
    {
      params: {
        tipoCategoria: props.tipoCategoriaTransacao,
        nome: value ?? '',
      },
    },
  );
  console.log(result.data.map((x) => x.id));
  return result.data;
}

// Submeter formulário
const submitFormulario = () => {
  if (props.ehEdicao) {
    emit('onSubmitEdit', dadosFormulario.value);
  } else {
    emit('onSubmitAdd', dadosFormulario.value);
  }
};

const closeModal = () => {
  dadosFormulario.value = {} as TransacaoCreate;
  categoriaSelecionada.value = null;
  emit('closeModal');
};
</script>
