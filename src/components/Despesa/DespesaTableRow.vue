<template>
  <q-td key="categoriaNome">
    <q-checkbox v-if="showSelected" v-model="propsLocal.selected" />
  </q-td>

  <q-td key="categoriaNome">
    <div class="coluna-nome-categoria">
      <q-btn
        v-if="propsLocal.row.ehDespesaAgrupadora"
        size="sm"
        color="primary"
        round
        @click="onExpandClick"
        :icon="propsLocal.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
      >
        <q-tooltip
          v-if="!propsLocal.expand"
          style="font-size: 13px"
          class="bg-dark"
          anchor="top middle"
          self="bottom middle"
          :offset="[10, 10]"
          >Buscar Despesas Agrupadas</q-tooltip
        >
      </q-btn>

      <div>
        <q-icon name="arrow_downward" color="red" size="xs" />
        {{ propsLocal.row.categoriaNome }}
      </div>
    </div>
  </q-td>

  <q-td key="descricao" class="no-pointer-events coluna-descricao">
    {{ propsLocal.row.descricao }}
  </q-td>

  <!-- Editar Valor -->
  <q-td key="valor" class="cursor-pointer">
    <ValorPadraoBR :valor="propsLocal.row.valor" />
    <q-popup-edit
      v-model.number="propsLocal.row.valor"
      buttons
      label-set="Alterar"
      label-cancel="Fechar"
      @save="(value) => alterarValor(propsLocal.row.id, value)"
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
  <q-td key="acoes" class="text-center">
    <section class="q-gutter-sm" v-if="$q.screen.gt.xs">
      <q-btn
        style="font-size: 11px"
        round
        size="sm"
        color="primary"
        icon="edit_note"
        @click="editarDespesa"
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
        @click="excluirDespesa"
      >
        <q-tooltip transition-show="scale" transition-hide="scale" class="bg-red"
          >Excluir</q-tooltip
        >
      </q-btn>
    </section>
    <section class="q-gutter-sm" v-else>
      <q-btn-dropdown round dense color="primary">
        <q-list bordered separator>
          <q-item clickable v-ripple @click="editarDespesa">
            <q-item-section class="text-weight-medium">Editar</q-item-section>
            <q-item-section avatar>
              <q-icon size="md" color="primary" name="edit_note" />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="excluirDespesa">
            <q-item-section class="text-weight-medium">Excluir</q-item-section>
            <q-item-section avatar>
              <q-icon size="md" color="red" name="delete_forever" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </section>
  </q-td>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import ValorPadraoBR from 'src/components/ValorPadraoBR.vue';
import type { DespesaResult } from 'src/Model/Transacao';
import type { NamedColor } from 'quasar';
import { computed } from 'vue';

const $q = useQuasar();

// Interface para os dados da linha
interface RowProps {
  key: any;
  row: any;
  rowIndex: number;
  pageIndex: number;
  cols: any;
  colsMap: any;
  selected: boolean;
  expand: boolean; // Este agora vem do controle manual
  color: NamedColor;
  dark?: boolean | null;
  dense: boolean;
  __trClass: string;
  __trStyle?: string;
}

// Props
const props = defineProps<{
  props: RowProps;
  showSelected: boolean;
}>();

const propsLocal = computed({
  get() {
    return props.props;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

// Emits
const emit = defineEmits<{
  (e: 'editar', despesa: DespesaResult): void;
  (e: 'excluir', id: string): void;
  (e: 'alterarValor', id: string, valor: number): void;
  (e: 'expandir', id: string, expand: boolean): void;
  (e: 'update:modelValue', value: any): void;
}>();

function alterarValor(id: string, valor: number) {
  emit('alterarValor', id, valor);
}

function editarDespesa() {
  emit('editar', props.props.row);
}

function excluirDespesa() {
  emit('excluir', props.props.row.id);
}

function onExpandClick() {
  propsLocal.value.expand = !propsLocal.value.expand;
  emit('expandir', props.props.row.id, propsLocal.value.expand);
}
</script>

<style scoped>
.coluna-nome-categoria {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  column-gap: 6px;
  justify-content: center;
}

.coluna-descricao {
  white-space: normal;
  word-wrap: break-word; /* Para compatibilidade antiga */
  overflow-wrap: break-word; /* Recomendado atualmente */
  max-width: 350px;
  min-width: 160px;
}
</style>
