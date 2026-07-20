<template>
  <div class="categoria-principal column full-height">
    <!-- Cabeçalho Padronizado -->
    <div class="q-mb-md flex items-center q-gutter-x-sm">
      <q-avatar color="primary" text-color="white" icon="category" size="48px" font-size="24px" />
      <div>
        <div class="text-h5 text-weight-bold">Categorias</div>
        <div class="text-caption text-grey-7">
          Gerencie as categorias de rendimentos, despesas e investimentos para classificar seu
          orçamento.
        </div>
      </div>
    </div>

    <!-- Banner Modo Compartilhado -->
    <BannerModoCompartilhado class="q-mb-md" />

    <!-- Card de Conteúdo -->
    <q-card flat bordered class="rounded-borders-xl shadow-1 col column overflow-hidden">
      <q-card-section class="q-pa-md">
        <!-- Controls Toolbar -->
        <div class="row items-center justify-between wrap q-gutter-y-sm">
          <!-- Tabs for Category Type -->
          <q-tabs
            v-model="tipoCategoriaSelecionada"
            dense
            class="categoria-tabs"
            active-color="primary"
            indicator-color="primary"
            align="left"
            narrow-indicator
            @update:model-value="() => obterCategorias()"
          >
            <q-tab
              v-for="opt in options"
              :key="opt.value"
              :name="opt.value"
              :label="opt.label"
              class="text-weight-bold"
              no-caps
            />
          </q-tabs>

          <!-- Actions -->
          <div class="row q-gutter-sm items-center">
            <q-input
              v-model="filter"
              label="Pesquisar categorias"
              dense
              outlined
              placeholder="Pesquisar"
              class="rounded-borders"
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
              :dark="$q.dark.isActive"
              style="min-width: 200px"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="xs" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              label="Criar Nova"
              no-caps
              icon="add"
              unelevated
              @click="openModalCriarCategoria"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Table Section -->
      <div class="col overflow-auto">
        <q-table
          flat
          :rows="categorias || []"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 7 }"
          :filter="filter"
          no-data-label="Nenhuma categoria encontrada"
          class="sticky-header-table no-border"
          :card-class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props" auto-width>
              <q-icon
                :name="obterIconeCategoria(props.value).icone"
                :color="obterIconeCategoria(props.value).cor"
                size="24px"
              />
              <span class="q-ml-sm">{{ obterIconeCategoria(props.value).descricao }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" auto-width>
              <div class="text-grey-8 q-gutter-xs">
                <q-btn
                  size="12px"
                  flat
                  dense
                  round
                  icon="edit"
                  :color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
                  @click="() => modalEditarCategoria(props.row)"
                />
                <q-btn
                  size="12px"
                  flat
                  dense
                  round
                  icon="delete"
                  :color="$q.dark.isActive ? 'grey-4' : 'grey-8'"
                  @click="() => excluirCategoria(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card>
  </div>

  <!-- Modal de cadastro e edição de categoria -->
  <q-dialog v-model="openModalCategoria" @hide="resetarFormularioCategoria">
    <q-card class="categoria-modal">
      <q-card-section class="row items-center q-pb-none">
        <div>
          <div class="text-h6 text-bold">
            {{ modalEdicao ? 'Editar categoria' : 'Criar nova categoria' }}
          </div>
          <div class="text-caption text-grey-7">
            {{
              modalEdicao
                ? 'Altere o nome da categoria selecionada.'
                : 'Adicione uma categoria para organizar seus lançamentos.'
            }}
          </div>
        </div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" aria-label="Fechar modal" />
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit="salvarCategoria">
          <div>
            <label for="categoria-nome" class="text-subtitle2 text-bold q-mb-xs block"
              >Nome da categoria</label
            >
            <q-input
              for="categoria-nome"
              v-model="categoriaForm.nome"
              outlined
              rounded
              dense
              autofocus
              maxlength="60"
              placeholder="Ex: Salário, Mercado, Reserva"
              :rules="[(val: string) => !!val?.trim() || 'Informe o nome da categoria']"
            >
              <template #prepend>
                <q-icon name="label_outline" size="20px" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="row items-center justify-between q-mb-sm">
              <div id="categoria-tipo-label" class="text-subtitle2 text-bold">
                Tipo da categoria
              </div>
              <span v-if="modalEdicao" class="text-caption text-grey-7">Não pode ser alterado</span>
            </div>

            <div
              class="categoria-type-grid"
              role="radiogroup"
              aria-labelledby="categoria-tipo-label"
            >
              <div
                v-for="option in categoryOptions"
                :key="option.value"
                class="categoria-type-option"
                :class="{
                  'categoria-type-option--selected': categoriaForm.tipo === option.value,
                  'categoria-type-option--disabled': modalEdicao,
                }"
                role="radio"
                tabindex="0"
                :aria-checked="categoriaForm.tipo === option.value"
                :aria-disabled="modalEdicao"
                @click="selecionarTipoCategoria(option.value)"
                @keydown.enter="selecionarTipoCategoria(option.value)"
                @keydown.space.prevent="selecionarTipoCategoria(option.value)"
              >
                <q-icon :name="option.icone" :color="option.cor" size="24px" />
                <span class="text-caption text-weight-medium">{{ option.label }}</span>
                <span
                  v-if="categoriaForm.tipo === option.value"
                  class="categoria-type-option__check"
                >
                  <q-icon name="check" color="white" size="13px" />
                </span>
              </div>
            </div>
          </div>

          <div class="categoria-modal__actions row justify-end q-gutter-sm q-mt-lg">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="grey-7" />
            <q-btn
              unelevated
              rounded
              no-caps
              type="submit"
              color="primary"
              :icon="modalEdicao ? 'save' : 'add'"
              :label="modalEdicao ? 'Salvar' : 'Criar categoria'"
              :loading="modalLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import BannerModoCompartilhado from 'src/components/Compartilhamento/BannerModoCompartilhado.vue';
import { useCategoriaConfig } from 'src/composables/useCategoriaConfig';

const {
  $q,
  categorias,
  openModalCategoria,
  loading,
  modalLoading,
  tipoCategoriaSelecionada,
  categoriaForm,
  filter,
  categoryOptions,
  options,
  modalEdicao,
  columns,
  obterCategorias,
  salvarCategoria,
  excluirCategoria,
  obterIconeCategoria,
  selecionarTipoCategoria,
  modalEditarCategoria,
  openModalCriarCategoria,
  resetarFormularioCategoria,
} = useCategoriaConfig();
</script>

<style scoped src="./CategoriaConfig.styles.css"></style>
