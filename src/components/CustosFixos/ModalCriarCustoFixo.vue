<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 420px; border-radius: 16px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">Criar Custo Fixo</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submeter" class="q-gutter-md">
          <!-- Nome -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs block">Nome do Custo Fixo</label>
            <q-input
              v-model="form.nome"
              outlined
              rounded
              dense
              placeholder="Ex: Aluguel, Netflix, Academia"
              :rules="[val => !!val || 'Nome é obrigatório']"
            />
          </div>

          <!-- Dia do Vencimento -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs block">Dia do Vencimento</label>
            <q-select
              v-model="form.diaVencimento"
              :options="opcoesDias"
              outlined
              rounded
              dense
              emit-value
              map-options
              placeholder="Selecione o dia"
              :rules="[val => !!val || 'Dia do vencimento é obrigatório']"
            />
          </div>

          <!-- Categoria (Opcional) -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs block">Categoria (Opcional)</label>
            <CampoSelect
              :configuracoes="{
                labelObjeto: 'nome',
                valueObjeto: 'id',
                emitirSomenteValor: false,
                obterDados: buscarCategorias,
              }"
              v-model="categoriaSelecionada"
              label="Selecione a categoria"
              @model-alterado="alterarCategoria"
            />
          </div>

          <!-- Botões -->
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" color="grey" v-close-popup />
            <q-btn type="submit" label="Salvar 🎯" color="primary" rounded unelevated />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CampoSelect from 'src/components/CampoSelect/CampoSelectServer.vue';
import obterCategoriaService from 'src/services/CategoriaService';
import { TipoCategoriaETransacao } from 'src/Model/Categoria';
import type { CustoFixoCreate } from 'src/Model/CustoFixo';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'criar', dto: CustoFixoCreate): void;
}>();

const categoriaService = obterCategoriaService();

const form = ref({
  nome: '',
  diaVencimento: null as number | null,
  categoriaId: null as string | null,
});

const categoriaSelecionada = ref<any>(null);

const opcoesDias = Array.from({ length: 31 }, (_, i) => i + 1);

// Limpar formulário ao abrir
watch(() => props.modelValue, (aberto) => {
  if (aberto) {
    form.value = {
      nome: '',
      diaVencimento: null,
      categoriaId: null,
    };
    categoriaSelecionada.value = null;
  }
});

async function buscarCategorias(filtro: string) {
  try {
    return await categoriaService.obterCategoria(TipoCategoriaETransacao.Despesa, filtro);
  } catch (error) {
    console.error(error);
    return [];
  }
}

function alterarCategoria(val: any) {
  form.value.categoriaId = val ? val.id : null;
}

function submeter() {
  const dto: CustoFixoCreate = {
    nome: form.value.nome,
    diaVencimento: Number(form.value.diaVencimento),
  };
  if (form.value.categoriaId) {
    dto.categoriaId = form.value.categoriaId;
  }
  emit('criar', dto);
}
</script>

<style lang="scss" scoped>
.block {
  display: block;
}
</style>
