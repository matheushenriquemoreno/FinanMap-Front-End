<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="compra-form-modal">
      <q-card-section class="compra-form-modal__header row items-center q-pb-none">
        <div>
          <div class="text-h6 text-bold">Nova compra planejada</div>
          <div class="text-caption text-grey-6 q-mt-xs">Anote o plano enquanto ele ainda é uma possibilidade.</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense aria-label="Fechar" v-close-popup />
      </q-card-section>

      <q-card-section class="compra-form-modal__body">
        <q-form ref="formRef" class="q-gutter-md" @submit.prevent="submeter">
          <q-input
            v-model="form.nome"
            outlined
            rounded
            label="O que você quer comprar?"
            placeholder="Ex.: notebook para trabalho"
            maxlength="120"
            counter
            :rules="[validarNomeCompra]"
            autofocus
          />

          <MoneyInputBR
            v-model="form.valorEstimado"
            label="Valor estimado"
            placeholder="0,00"
            :rules="[validarValorCompra]"
          />

          <q-select
            v-model="form.prioridade"
            :options="prioridadesCompraPlanejada"
            outlined
            rounded
            emit-value
            map-options
            label="Prioridade"
            :rules="[validarPrioridadeCompra]"
          >
            <template #prepend>
              <q-icon name="flag" color="primary" />
            </template>
          </q-select>

          <q-input
            v-model="form.descricao"
            outlined
            rounded
            type="textarea"
            autogrow
            label="Observação (opcional)"
            placeholder="Por que essa compra importa?"
            maxlength="500"
            counter
          />

          <section class="links-section" aria-labelledby="links-title">
            <div class="row items-center justify-between q-mb-sm">
              <div>
                <div id="links-title" class="text-subtitle2 text-bold">Lojas para pesquisar</div>
                <div class="text-caption text-grey-6">Opcional. Você pode adicionar mais de uma.</div>
              </div>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="add"
                label="Adicionar loja"
                @click="adicionarLink"
              />
            </div>

            <div v-if="form.linksLojas.length === 0" class="links-section__empty text-caption text-grey-6">
              Nenhum link adicionado ainda.
            </div>

            <div v-for="(link, index) in form.linksLojas" :key="link.id" class="link-row q-mb-sm">
              <q-input
                v-model="link.nomeLoja"
                class="link-row__store"
                outlined
                rounded
                dense
                label="Loja"
                placeholder="Ex.: Loja A"
                :rules="[validarNomeLoja]"
              />
              <q-input
                v-model="link.url"
                class="link-row__url"
                outlined
                rounded
                dense
                label="URL"
                placeholder="https://..."
                type="url"
                :rules="[validarUrlLoja]"
              />
              <q-btn
                flat
                round
                dense
                icon="remove_circle_outline"
                color="negative"
                :aria-label="`Remover link ${index + 1}`"
                @click="removerLink(index)"
              />
            </div>
          </section>

          <div class="compra-form-modal__actions row justify-end q-gutter-sm q-mt-lg">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
            <q-btn
              type="submit"
              label="Salvar plano"
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
import { ref, watch } from 'vue';
import MoneyInputBR from 'src/components/Inputs/MoneyInputBR.vue';
import {
  prioridadesCompraPlanejada,
  type CompraPlanejadaCreate,
  type CompraPlanejadaLinkInput,
  type PrioridadeCompraPlanejada,
} from 'src/Model/CompraPlanejada';
import {
  validarNomeCompra,
  validarValorCompra,
  validarPrioridadeCompra,
  validarNomeLoja,
  validarUrlLoja,
} from 'src/helpers/CompraPlanejadaValidation.mjs';

defineOptions({ name: 'CompraPlanejadaFormModal' });

const props = withDefaults(defineProps<{ modelValue: boolean; loading?: boolean }>(), {
  loading: false,
});
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'salvar', dto: CompraPlanejadaCreate): void;
}>();

interface LinkForm extends CompraPlanejadaLinkInput {
  id: number;
}

interface FormState {
  nome: string;
  valorEstimado: number | null;
  prioridade: PrioridadeCompraPlanejada | null;
  descricao: string;
  linksLojas: LinkForm[];
}

const formRef = ref<{ validate: () => Promise<boolean> } | null>(null);
const form = ref<FormState>(novoForm());
let nextLinkId = 0;

function novoForm(): FormState {
  return {
    nome: '',
    valorEstimado: null,
    prioridade: null,
    descricao: '',
    linksLojas: [],
  };
}

function novoLink(): LinkForm {
  nextLinkId += 1;
  return { id: nextLinkId, nomeLoja: '', url: '' };
}

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) form.value = novoForm();
  },
);

function adicionarLink() {
  form.value.linksLojas.push(novoLink());
}

function removerLink(index: number) {
  form.value.linksLojas.splice(index, 1);
}

async function submeter() {
  if (props.loading) return;
  if (!(await formRef.value?.validate())) return;

  const dto: CompraPlanejadaCreate = {
    nome: form.value.nome.trim(),
    valorEstimado: form.value.valorEstimado as number,
    prioridade: form.value.prioridade as PrioridadeCompraPlanejada,
    linksLojas: form.value.linksLojas.map(({ nomeLoja, url }) => ({
      nomeLoja: nomeLoja.trim(),
      url: url.trim(),
    })),
  };
  const descricao = form.value.descricao.trim();
  if (descricao) dto.descricao = descricao;

  emit('salvar', dto);
}
</script>

<style lang="scss" scoped>
.compra-form-modal {
  width: min(680px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  border-radius: 18px;

  &__header,
  &__body {
    @media (max-width: 520px) {
      padding-left: 16px;
      padding-right: 16px;
    }
  }

  &__actions {
    @media (max-width: 520px) {
      flex-direction: column-reverse;
      align-items: stretch;

      :deep(.q-btn) {
        width: 100%;
        margin-left: 0;
      }
    }
  }
}

.links-section {
  margin-top: 8px;
  padding: 16px;
  background: rgba(29, 22, 156, 0.045);
  border: 1px solid rgba(29, 22, 156, 0.1);
  border-radius: 14px;

  &__empty {
    padding: 10px 0 2px;
  }
}

.link-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &__store {
    width: 145px;
    flex: 0 0 145px;
  }

  &__url {
    min-width: 0;
    flex: 1;
  }
}

@media (max-width: 520px) {
  .links-section {
    padding: 12px;
  }

  .link-row {
    display: grid;
    grid-template-columns: 1fr auto;

    &__store,
    &__url {
      width: auto;
      grid-column: 1;
    }

    .q-btn {
      grid-column: 2;
      grid-row: 1 / span 2;
      align-self: center;
    }
  }
}
</style>
