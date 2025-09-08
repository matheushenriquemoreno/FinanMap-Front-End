<template>
  <q-select
    ref="campoSeleted"
    v-model="localModelValue"
    :options="optionsLocal"
    options-selected-class="text-green"
    :option-value="configuracoes?.valueObjeto ?? 'value'"
    :option-label="configuracoes?.labelObjeto ?? 'label'"
    filled
    clearable
    rounded
    use-input
    :emit-value="configuracoes?.emitirSomenteValor ?? true"
    map-options
    :label="label"
    :multiple="configuracoes?.multiselect ?? false"
    @filter="filtrarPesquisa"
    :rules="rules"
    :disable="disable"
    options-cover
    transition-show="scale"
    transition-hide="scale"
    behavior="menu"
    :loading="loading"
  >
    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
      <q-item v-if="configuracoes?.multiselect ?? false" v-bind="itemProps">
        <q-item-section>
          <q-item-label>{{ opt[configuracoes?.labelObjeto ?? 'label'] }} </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
        </q-item-section>
      </q-item>

      <q-item v-else v-bind="itemProps">
        <q-item-section avatar>
          <q-icon
            color="primary"
            :name="selected ? 'check' : opt.ehSusgestao ? 'bubble_chart' : 'chevron_right'"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt[configuracoes?.labelObjeto ?? 'label'] }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:no-option>
      <q-item>
        <q-item-section v-if="loading" class="text-grey">
          Nenhum resultado foi encontrado com base no filtro realizado.
        </q-item-section>
        <q-item-section v-else class="text-grey"> Realizando a busca... </q-item-section>
      </q-item>
    </template>

    <template v-slot:after>
      <q-btn
        v-if="
          nomeItemPrincipalCadastro &&
          nomeItemPrincipalCadastro.length >= 3 &&
          EhParaRealizarbuscaDeSusgestoes == false
        "
        round
        dense
        flat
        icon="psychology"
        @click="setarObterSusgestoces"
      >
        <q-tooltip
          v-if="EhParaRealizarbuscaDeSusgestoes == false"
          class="bg-dark"
          style="font-size: 14px"
          >Ao clicar o sistema ira abrir uma seleção de surgestoes de categorias para sua escolha
          com base na descrição do item a ser cadastrado.</q-tooltip
        >
      </q-btn>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { ref, computed } from 'vue';
import type { ValidationRule } from 'quasar';
import type { PropsSelectServerComSusgestao } from './types';
import ObterSusgestaoCategorias from 'src/services/ObterSusgentaoCategorias';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';

const campoSeleted = ref<any>(null);

// Define props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  nomeItemPrincipalCadastro: {
    type: String,
    required: true,
  },
  configuracoes: {
    type: Object as PropType<PropsSelectServerComSusgestao>,
    required: false,
  },
  modelValue: {
    type: Object as PropType<any>,
    required: true,
  },
  rules: {
    type: Array as PropType<ValidationRule[]>,
    required: false,
    default: () => [],
  },
  disable: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const EhParaRealizarbuscaDeSusgestoes = ref(false);
const BuscaRealizada = ref(false);
const loading = ref(false);

// Define emits
const emit = defineEmits(['update:modelValue', 'modelAlterado']);

// Estado
const opcoes = ref<Array<any>>([]);

// Métodos
const preencherdados = async (filtro?: string) => {
  const dados = (await props.configuracoes?.obterDados(filtro ?? '')) ?? [];
  opcoes.value = dados;
};

const setarObterSusgestoces = () => {
  loading.value = true;
  opcoes.value = [];
  EhParaRealizarbuscaDeSusgestoes.value = true;
  campoSeleted.value.showPopup();
  loading.value = false;
};

const obterSurgestoes = async () => {
  const result = await ObterSusgestaoCategorias(
    TipoCategoriaETransacao.Despesa,
    props.nomeItemPrincipalCadastro,
  );

  if (result?.length === 0) return;

  opcoes.value = result.map((item: any) => {
    return {
      [props.configuracoes?.labelObjeto ?? 'label']: item,
      [props.configuracoes?.valueObjeto ?? 'value']: item,
      ehSusgestao: true,
    };
  });

  BuscaRealizada.value = true;
};

const filtrarPesquisa = (val: string, update: any, abort: any) => {
  update(async () => {
    try {
      if (EhParaRealizarbuscaDeSusgestoes.value && BuscaRealizada.value == false) {
        await obterSurgestoes();
        return;
      }

      loading.value = true;
      if (val === '') {
        await preencherdados();
      } else {
        const pesquisa = val.toLowerCase();
        await preencherdados(pesquisa);
      }
    } finally {
      loading.value = false;
    }
  });
};

// Computed properties
const optionsLocal = computed(() => {
  return [...opcoes.value, ...(props.configuracoes?.defaultOptions ?? [])];
});

const localModelValue = computed({
  get: () => props.modelValue,
  set: (newValue: any) => {
    emit('update:modelValue', newValue);
    emit('modelAlterado', newValue);
  },
});

defineExpose({
  preencherdados,
  filtrarPesquisa,
});
</script>
