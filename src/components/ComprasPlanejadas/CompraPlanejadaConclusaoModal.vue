<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="compra-conclusao-modal">
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6 text-bold">Confirmar compra</div>
          <div class="text-caption text-grey-6 q-mt-xs">{{ compra?.nome }}</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense aria-label="Fechar" v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form ref="formRef" class="q-gutter-md" @submit.prevent="submeter">
          <MoneyInputBR
            v-model="form.valorReal"
            label="Quanto você pagou?"
            placeholder="0,00"
            :rules="[validarValorReal]"
            autofocus
          />

          <q-input
            v-model="form.dataCompra"
            outlined
            rounded
            type="date"
            label="Data da compra"
            :max="dataHoje"
            :rules="[validarDataCompra]"
          />

          <q-toggle
            v-model="form.criarDespesa"
            color="primary"
            label="Registrar também no Mês a Mês"
          />

          <div v-if="form.criarDespesa" class="despesa-fields q-gutter-md">
            <p class="text-caption text-grey-6 q-mb-none">
              O valor real acima será usado na despesa e não será alterado por este formulário.
            </p>
            <q-select
              v-model="form.categoriaId"
              :options="categorias"
              option-label="nome"
              option-value="id"
              emit-value
              map-options
              outlined
              rounded
              label="Categoria da despesa"
              :loading="carregandoCategorias"
              :rules="[validarCategoria]"
            />
            <div class="row q-col-gutter-sm">
              <q-input
                v-model.number="form.mes"
                class="col"
                outlined
                rounded
                type="number"
                min="1"
                max="12"
                label="Mês"
                :rules="[validarMes]"
              />
              <q-input
                v-model.number="form.ano"
                class="col"
                outlined
                rounded
                type="number"
                :min="anoMinimo"
                :max="anoAtual"
                label="Ano"
                :rules="[validarAno]"
              />
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              label="Confirmar compra"
              color="primary"
              rounded
              unelevated
              :loading="loading"
              :disable="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import MoneyInputBR from 'src/components/Inputs/MoneyInputBR.vue';
import obterCategoriaService from 'src/services/CategoriaService';
import { TipoCategoriaETransacao, type CategoriaResult } from 'src/Model/Categoria';
import type { CompraPlanejadaConcluir, CompraPlanejadaResult } from 'src/Model/CompraPlanejada';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  compra?: CompraPlanejadaResult | null;
  loading?: boolean;
}>(), {
  compra: null,
  loading: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'confirmar', dto: CompraPlanejadaConcluir): void;
}>();

const categoriaService = obterCategoriaService();
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const categorias = ref<CategoriaResult[]>([]);
const carregandoCategorias = ref(false);
const agora = new Date();
const anoAtual = agora.getFullYear();
const anoMinimo = anoAtual - 5;
const dataHoje = `${anoAtual}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

const form = ref({
  valorReal: null as number | null,
  dataCompra: dataHoje,
  criarDespesa: false,
  mes: agora.getMonth() + 1,
  ano: anoAtual,
  categoriaId: null as string | null,
});

const validarValorReal = (valor: number | null) => valor !== null && valor > 0 || 'Informe um valor maior que zero.';
const validarDataCompra = (data: string) => !!data && data <= dataHoje || 'Informe uma data válida até hoje.';
const validarCategoria = (categoria: string | null) => !!categoria || 'Escolha uma categoria.';
const validarMes = (mes: number) => mes >= 1 && mes <= 12 || 'Informe um mês entre 1 e 12.';
const validarAno = (ano: number) => ano >= anoMinimo && ano <= anoAtual || 'Informe um ano válido.';

function resetarForm() {
  form.value = {
    valorReal: props.compra?.valorEstimado ?? null,
    dataCompra: dataHoje,
    criarDespesa: false,
    mes: agora.getMonth() + 1,
    ano: anoAtual,
    categoriaId: null,
  };
}

async function carregarCategorias() {
  carregandoCategorias.value = true;
  try {
    categorias.value = await categoriaService.obterCategoria(TipoCategoriaETransacao.Despesa);
  } catch (error) {
    console.error('Erro ao carregar categorias de despesa:', error);
    categorias.value = [];
  } finally {
    carregandoCategorias.value = false;
  }
}

watch(() => props.modelValue, (aberto) => {
  if (!aberto) return;
  resetarForm();
  void carregarCategorias();
});

async function submeter() {
  if (props.loading || !(await formRef.value?.validate())) return;

  emit('confirmar', {
    valorReal: form.value.valorReal as number,
    dataCompra: form.value.dataCompra,
    criarDespesa: form.value.criarDespesa,
    mes: form.value.mes,
    ano: form.value.ano,
    ...(form.value.categoriaId ? { categoriaId: form.value.categoriaId } : {}),
  });
}
</script>

<style lang="scss" scoped>
.compra-conclusao-modal {
  width: min(560px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  border-radius: 18px;
}

.despesa-fields {
  padding: 16px;
  background: rgba(29, 22, 156, 0.045);
  border: 1px solid rgba(29, 22, 156, 0.1);
  border-radius: 14px;
}
</style>
