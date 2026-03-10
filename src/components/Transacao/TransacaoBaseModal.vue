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
            <MoneyInputBR v-model="valorNumerico" filled rounded :dense="false" :outlined="false" label="Valor"
              lazy-rules :rules="[(val) => Boolean(val) || 'Campo obrigatorio']" />
            <div>
              <CampoSelectServer :configuracoes="{
                labelObjeto: 'nome',
                valueObjeto: 'id',
                emitirSomenteValor: false,
                obterDados: buscarCategorias,
              }" v-model="categoriaSelecionada" label="Selecione a categoria"
                @model-alterado="(val) => (dadosFormulario.categoriaId = val.id)"
                :rules="[(val) => Boolean(val) || 'Campo obrigatorio']" />
            </div>

            <div
              v-if="props.tipoCategoriaTransacao === TipoCategoriaETransacao.Investimento && compartilhamentoStore.podeEditar"
              class="q-mt-sm">
              <q-select v-model="(dadosFormulario as any).metaFinanceiraId" :options="metasDisponiveis"
                option-label="nome" option-value="id" outlined rounded dense label="Vincular a uma Meta (opcional)"
                clearable emit-value map-options :loading="loadingMetas">
                <template v-slot:option="{ opt, itemProps }">
                  <q-item v-bind="itemProps">
                    <q-item-section avatar>
                      <q-icon
                        :name="CATEGORIA_META_CONFIG[opt.categoria as keyof typeof CATEGORIA_META_CONFIG]?.icon || 'emoji_events'"
                        color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ opt.nome }}</q-item-label>
                      <q-item-label caption>
                        R$ {{ Number(opt.valorAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }} / R$
                        {{ Number(opt.valorAlvo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

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
import CampoSelectServer from 'src/components/CampoSelect/CampoSelectServer.vue';
import MoneyInputBR from 'src/components/Inputs/MoneyInputBR.vue';
import { computed, ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import type { Categoria } from 'src/Model/Categoria';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import { CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import type { TransacaoCreate } from 'src/Model/Transacao';
import getMetaFinanceiraService from 'src/services/MetaFinanceiraService';
import { CATEGORIA_META_CONFIG } from 'src/Model/MetaFinanceira';
import type { MetaFinanceiraResult } from 'src/Model/MetaFinanceira';
import { useCompartilhamentoStore } from 'src/stores/compartilhamento-store';

const compartilhamentoStore = useCompartilhamentoStore();

function isEmpty(obj: object | null) {
  if (obj === null || obj === undefined) return true;

  return Object.keys(obj).length === 0;
}

// Props do componente
interface Props {
  modelValue: boolean;
  tituloAdd: string;
  tituloEdit: string;
  transacao?: TransacaoCreate;
  tipoCategoriaTransacao: TipoCategoriaETransacao;
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

// Computed bidirecional para converter o valor entre number (MoneyInputBR) e o formulário
const valorNumerico = computed({
  get: () => {
    const v = dadosFormulario.value.valor;
    if (v === undefined || v === null) return null;
    return Number(v);
  },
  set: (val: number | null) => {
    dadosFormulario.value.valor = val as any;
  },
});

watch(localModelValue, (valor) => {
  if (valor === true) {
    if (props.ehEdicao && isEmpty(props.transacao) == false) {
      dadosFormulario.value = { ...props.transacao } as TransacaoCreate;

      categoriaSelecionada.value = {
        id: props.transacao.categoriaId,
        nome: props.transacao.categoriaNome,
      } as Categoria;
    } else {
      dadosFormulario.value = {} as TransacaoCreate;
    }

    if (props.tipoCategoriaTransacao === TipoCategoriaETransacao.Investimento && metasDisponiveis.value.length === 0) {
      carregarMetas();
    }
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
const metaService = getMetaFinanceiraService();
const metasDisponiveis = ref<MetaFinanceiraResult[]>([]);
const loadingMetas = ref(false);

async function carregarMetas() {
  loadingMetas.value = true;
  try {
    const res = await metaService.obterTodas();
    // Filtra apenas metas não concluídas
    metasDisponiveis.value = (res || []).filter(m => !m.concluida);
  } catch (error) {
    console.error('Erro ao buscar metas', error);
  } finally {
    loadingMetas.value = false;
  }
}

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
