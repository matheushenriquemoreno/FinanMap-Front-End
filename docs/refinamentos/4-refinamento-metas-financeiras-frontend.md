# 📋 Refinamento — Metas e Objetivos Financeiros (Front-End)

> **Objetivo**: Implementar a interface de Metas Financeiras no Vue.js/Quasar, incluindo página dedicada, painel de resumo (3 cards), listagem com progresso visual, modal de criação, contribuição e notificações de incentivo. Baseado no protótipo visual fornecido.

---

## 📖 Referência Visual (Protótipo)

O protótipo define os seguintes elementos:

1. **Header**: Ícone + título "Metas Financeiras" + subtítulo "Transforme seus sonhos em conquistas" + botão "+ Nova Meta"
2. **Painel de Resumo** (3 cards horizontais):
   - 🎯 Total das Metas (soma dos valores alvo)
   - 📈 Total Investido (soma das contribuições + percentual do total)
   - ✅ Metas Concluídas (X de Y)
3. **Cards de Meta**: Cada meta exibe ícone da categoria, nome, categoria, valor atual/valor alvo, barra de progresso com percentual, dias restantes, valor faltante e botão "+ Contribuir"
4. **Modal "Criar Nova Meta"**: Nome, Valor Alvo (R$), Data Limite, Categoria (seleção visual com ícones: Viagem, Emergência, Educação, Veículo, Moradia, Investimento, Outro)

---

## 🌐 1. Novos Models TypeScript

### 1.1 Interface `MetaFinanceira`
**Arquivo:** `src/Model/MetaFinanceira.ts`

```typescript
// ========== Enums ==========

export enum CategoriaIconeMeta {
  Viagem = 0,
  Emergencia = 1,
  Educacao = 2,
  Veiculo = 3,
  Moradia = 4,
  Investimento = 5,
  Outro = 6,
}

export enum TipoNotificacaoMeta {
  MetadeCaminho = 'MetadeCaminho',
  QuaseLa = 'QuaseLa',
  MetaAlcancada = 'MetaAlcancada',
}

// ========== DTOs de Criação/Atualização ==========

export interface CreateMetaFinanceiraDTO {
  nome: string;
  valorAlvo: number;
  dataLimite: string; // ISO date string
  categoria: CategoriaIconeMeta;
}

export interface UpdateMetaFinanceiraDTO {
  id: string;
  nome: string;
  valorAlvo: number;
  dataLimite: string;
  categoria: CategoriaIconeMeta;
}

export interface ContribuicaoDTO {
  valor: number;
  data: string; // ISO date string
}

// ========== DTOs de Resultado ==========

export interface ContribuicaoResult {
  id: string;
  valor: number;
  data: string;
}

export interface MetaFinanceiraResult {
  id: string;
  nome: string;
  valorAlvo: number;
  dataLimite: string;
  categoria: CategoriaIconeMeta;
  valorAtual: number;
  percentualProgresso: number;
  concluida: boolean;
  diasRestantes: number;
  valorFaltante: number;
  contribuicoes: ContribuicaoResult[];
  dataCriacao: string;
}

export interface ResumoMetasDTO {
  totalMetas: number;
  totalInvestido: number;
  percentualGeral: number;
  metasConcluidas: number;
  totalDeMetasAtivas: number;
}

export interface ResultContribuicaoResponse {
  metaAtualizada: MetaFinanceiraResult;
  notificacao: NotificacaoMetaDTO | null;
}

export interface NotificacaoMetaDTO {
  tipo: TipoNotificacaoMeta;
  mensagem: string;
}

// ========== Utilitários de UI ==========

/** Mapeia CategoriaIconeMeta para ícone Material Icons e cor */
export const CATEGORIA_META_CONFIG: Record<CategoriaIconeMeta, { icon: string; label: string; color: string }> = {
  [CategoriaIconeMeta.Viagem]: { icon: 'flight', label: 'Viagem', color: '#4A90D9' },
  [CategoriaIconeMeta.Emergencia]: { icon: 'shield', label: 'Emergência', color: '#E67E22' },
  [CategoriaIconeMeta.Educacao]: { icon: 'school', label: 'Educação', color: '#27AE60' },
  [CategoriaIconeMeta.Veiculo]: { icon: 'directions_car', label: 'Veículo', color: '#E74C3C' },
  [CategoriaIconeMeta.Moradia]: { icon: 'home', label: 'Moradia', color: '#F39C12' },
  [CategoriaIconeMeta.Investimento]: { icon: 'trending_up', label: 'Investimento', color: '#2ECC71' },
  [CategoriaIconeMeta.Outro]: { icon: 'emoji_events', label: 'Outro', color: '#9B59B6' },
};
```

---

## 🌐 2. Novo Service

### 2.1 `MetaFinanceiraService.ts`
**Arquivo:** `src/services/MetaFinanceiraService.ts`

Segue o padrão de `TransacaoBaseService` para `requestWithLoading`, mas **não estende** `TransacaoServiceBase` pois `MetaFinanceira` não é uma transação.

```typescript
import { api } from './api/api';
import { ref } from 'vue';
import type {
  CreateMetaFinanceiraDTO,
  UpdateMetaFinanceiraDTO,
  ContribuicaoDTO,
  MetaFinanceiraResult,
  ResumoMetasDTO,
  ResultContribuicaoResponse,
} from 'src/Model/MetaFinanceira';

class MetaFinanceiraService {
  private baseUrl = '/api/MetasFinanceiras';
  public loading = ref(false);

  private async requestWithLoading<T>(fn: () => Promise<T>): Promise<T> {
    this.loading.value = true;
    try {
      return await fn();
    } finally {
      this.loading.value = false;
    }
  }

  async obterTodas(): Promise<MetaFinanceiraResult[]> {
    return this.requestWithLoading(async () => {
      const response = await api.get<MetaFinanceiraResult[]>(this.baseUrl);
      return response.data;
    });
  }

  async obterResumo(): Promise<ResumoMetasDTO> {
    return this.requestWithLoading(async () => {
      const response = await api.get<ResumoMetasDTO>(`${this.baseUrl}/resumo`);
      return response.data;
    });
  }

  async obterPorId(id: string): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await api.get<MetaFinanceiraResult>(`${this.baseUrl}/${id}`);
      return response.data;
    });
  }

  async criar(dto: CreateMetaFinanceiraDTO): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await api.post<MetaFinanceiraResult>(this.baseUrl, dto);
      return response.data;
    });
  }

  async atualizar(dto: UpdateMetaFinanceiraDTO): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await api.put<MetaFinanceiraResult>(this.baseUrl, dto);
      return response.data;
    });
  }

  async excluir(id: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await api.delete(`${this.baseUrl}/${id}`);
    });
  }

  async adicionarContribuicao(metaId: string, dto: ContribuicaoDTO): Promise<ResultContribuicaoResponse> {
    return this.requestWithLoading(async () => {
      const response = await api.post<ResultContribuicaoResponse>(
        `${this.baseUrl}/${metaId}/contribuicoes`, dto
      );
      return response.data;
    });
  }

  async removerContribuicao(metaId: string, contribuicaoId: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await api.delete(`${this.baseUrl}/${metaId}/contribuicoes/${contribuicaoId}`);
    });
  }
}

export default function getMetaFinanceiraService() {
  return new MetaFinanceiraService();
}
```

---

## 🌐 3. Nova Rota

### 3.1 Adicionar rota em `routes.ts`
**Arquivo:** `src/router/routes.ts`

Adicionar como filho do layout principal (`MainLayout.vue`):

```typescript
{
  path: '/metas',
  name: 'MetasFinanceirasPage',
  component: () => import('src/pages/MetasFinanceiras/MetasFinanceirasPage.vue'),
},
```

---

## 🌐 4. Nova Página — `MetasFinanceirasPage.vue`

**Arquivo:** `src/pages/MetasFinanceiras/MetasFinanceirasPage.vue`

### 4.1 Estrutura e Responsabilidades

A página é o **orquestrador** de toda a feature. Ela gerencia:
- Carregamento de dados (metas + resumo)
- Estado dos modais (criar meta, contribuir)
- Chamadas ao service
- Exibição de notificações de incentivo

### 4.2 Layout da Página (Template)

```html
<template>
  <q-page class="metas-page q-pa-lg">
    <!-- ===== HEADER ===== -->
    <div class="metas-header q-mb-lg">
      <div class="metas-header__info">
        <q-icon name="emoji_events" size="40px" color="white" />
        <div>
          <h4 class="text-h4 text-bold text-white q-mb-none">Metas Financeiras</h4>
          <span class="text-subtitle1 text-white-70">Transforme seus sonhos em conquistas</span>
        </div>
      </div>
      <q-btn
        color="white"
        text-color="primary"
        icon="add"
        label="Nova Meta"
        rounded
        unelevated
        @click="abrirModalCriar"
      />
    </div>

    <!-- ===== PAINEL DE RESUMO (3 Cards) ===== -->
    <PainelResumoMetas :resumo="resumo" :loading="loadingResumo" />

    <!-- ===== LISTAGEM DE METAS ===== -->
    <div class="metas-grid q-mt-lg">
      <MetaCard
        v-for="meta in metas"
        :key="meta.id"
        :meta="meta"
        @contribuir="abrirModalContribuir(meta)"
        @excluir="excluirMeta(meta.id)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="!loading && metas.length === 0" class="metas-empty text-center q-pa-xl">
      <q-icon name="flag" size="80px" color="grey-4" />
      <p class="text-h6 text-grey-6 q-mt-md">Nenhuma meta criada ainda</p>
      <p class="text-body2 text-grey-5">Clique em "Nova Meta" para começar a planejar seus objetivos!</p>
    </div>

    <!-- ===== MODAIS ===== -->
    <ModalCriarMeta
      v-model="modalCriarAberto"
      @criar="criarMeta"
    />

    <ModalContribuir
      v-model="modalContribuirAberto"
      :meta="metaSelecionada"
      @contribuir="contribuir"
    />
  </q-page>
</template>
```

### 4.3 Script Setup

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import getMetaFinanceiraService from 'src/services/MetaFinanceiraService';
import type {
  MetaFinanceiraResult,
  ResumoMetasDTO,
  CreateMetaFinanceiraDTO,
  ContribuicaoDTO,
} from 'src/Model/MetaFinanceira';
import PainelResumoMetas from 'src/components/MetasFinanceiras/PainelResumoMetas.vue';
import MetaCard from 'src/components/MetasFinanceiras/MetaCard.vue';
import ModalCriarMeta from 'src/components/MetasFinanceiras/ModalCriarMeta.vue';
import ModalContribuir from 'src/components/MetasFinanceiras/ModalContribuir.vue';

const $q = useQuasar();
const service = getMetaFinanceiraService();

const metas = ref<MetaFinanceiraResult[]>([]);
const resumo = ref<ResumoMetasDTO>({
  totalMetas: 0, totalInvestido: 0, percentualGeral: 0,
  metasConcluidas: 0, totalDeMetasAtivas: 0,
});
const loading = ref(false);
const loadingResumo = ref(false);

const modalCriarAberto = ref(false);
const modalContribuirAberto = ref(false);
const metaSelecionada = ref<MetaFinanceiraResult | null>(null);

onMounted(() => {
  carregarDados();
});

async function carregarDados() {
  loading.value = true;
  try {
    const [metasRes, resumoRes] = await Promise.all([
      service.obterTodas(),
      service.obterResumo(),
    ]);
    metas.value = metasRes;
    resumo.value = resumoRes;
  } finally {
    loading.value = false;
  }
}

function abrirModalCriar() {
  modalCriarAberto.value = true;
}

function abrirModalContribuir(meta: MetaFinanceiraResult) {
  metaSelecionada.value = meta;
  modalContribuirAberto.value = true;
}

async function criarMeta(dto: CreateMetaFinanceiraDTO) {
  await service.criar(dto);
  modalCriarAberto.value = false;
  $q.notify({ type: 'positive', message: 'Meta criada com sucesso! 🎯' });
  carregarDados();
}

async function contribuir(dto: ContribuicaoDTO) {
  if (!metaSelecionada.value) return;

  const resultado = await service.adicionarContribuicao(metaSelecionada.value.id, dto);
  modalContribuirAberto.value = false;

  // Exibir notificação de incentivo se houve marco
  if (resultado.notificacao) {
    $q.notify({
      type: 'positive',
      message: resultado.notificacao.mensagem,
      timeout: 5000,
      position: 'top',
    });
  } else {
    $q.notify({ type: 'positive', message: 'Contribuição registrada!' });
  }

  carregarDados();
}

async function excluirMeta(id: string) {
  $q.dialog({
    title: 'Excluir Meta',
    message: 'Deseja realmente excluir esta meta e todas as suas contribuições?',
    cancel: true,
    persistent: false,
  }).onOk(async () => {
    await service.excluir(id);
    $q.notify({ type: 'positive', message: 'Meta excluída.' });
    carregarDados();
  });
}
</script>
```

### 4.4 Estilo da Página

```scss
<style lang="scss" scoped>
.metas-page {
  max-width: 1200px;
  margin: 0 auto;
}

.metas-header {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  border-radius: 16px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.metas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.metas-empty {
  margin-top: 80px;
}
</style>
```

---

## 🌐 5. Componentes

### 5.1 `PainelResumoMetas.vue`
**Arquivo:** `src/components/MetasFinanceiras/PainelResumoMetas.vue`

Renderiza os 3 cards de resumo no topo da página.

**Props:**
```typescript
interface Props {
  resumo: ResumoMetasDTO;
  loading: boolean;
}
```

**Template:**
```html
<template>
  <div class="resumo-grid">
    <!-- Card: Total das Metas -->
    <q-card flat bordered class="resumo-card">
      <q-card-section horizontal class="items-center q-pa-md">
        <q-avatar size="48px" color="blue-1" text-color="blue" icon="gps_fixed" />
        <div class="q-ml-md">
          <div class="text-caption text-grey-6">Total das Metas</div>
          <div class="text-h6 text-bold">R$ {{ formatarValor(resumo.totalMetas) }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Card: Total Investido -->
    <q-card flat bordered class="resumo-card">
      <q-card-section horizontal class="items-center q-pa-md">
        <q-avatar size="48px" color="green-1" text-color="green" icon="trending_up" />
        <div class="q-ml-md">
          <div class="text-caption text-grey-6">Total Investido</div>
          <div class="text-h6 text-bold">R$ {{ formatarValor(resumo.totalInvestido) }}</div>
          <div class="text-caption text-grey-5">{{ resumo.percentualGeral.toFixed(0) }}% do total</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Card: Metas Concluídas -->
    <q-card flat bordered class="resumo-card">
      <q-card-section horizontal class="items-center q-pa-md">
        <q-avatar size="48px" color="amber-1" text-color="amber-9" icon="check_circle" />
        <div class="q-ml-md">
          <div class="text-caption text-grey-6">Metas Concluídas</div>
          <div class="text-h6 text-bold">{{ resumo.metasConcluidas }} de {{ resumo.totalDeMetasAtivas }}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
```

**Estilo:**
```scss
<style lang="scss" scoped>
.resumo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.resumo-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}
</style>
```

---

### 5.2 `MetaCard.vue`
**Arquivo:** `src/components/MetasFinanceiras/MetaCard.vue`

Card individual de cada meta financeira.

**Props e Emits:**
```typescript
interface Props {
  meta: MetaFinanceiraResult;
}

const emit = defineEmits<{
  (e: 'contribuir'): void;
  (e: 'excluir'): void;
}>();
```

**Template:**
```html
<template>
  <q-card flat bordered class="meta-card">
    <!-- Botão de excluir (hover) -->
    <q-btn
      class="meta-card__delete-btn"
      flat round dense
      icon="delete_outline"
      color="red-4"
      @click.stop="emit('excluir')"
    >
      <q-tooltip>Excluir meta</q-tooltip>
    </q-btn>

    <q-card-section>
      <!-- Header do card: ícone + nome + categoria -->
      <div class="meta-card__header">
        <q-avatar
          size="42px"
          :style="{ backgroundColor: categoriaConfig.color + '20' }"
        >
          <q-icon :name="categoriaConfig.icon" :color="categoriaConfig.color" />
        </q-avatar>
        <div class="q-ml-md">
          <div class="text-subtitle1 text-bold">{{ meta.nome }}</div>
          <div class="text-caption" :style="{ color: categoriaConfig.color }">
            {{ categoriaConfig.label }}
          </div>
        </div>
      </div>

      <!-- Valores -->
      <div class="meta-card__valores q-mt-md">
        <span class="text-body2 text-bold">R$ {{ formatarValor(meta.valorAtual) }}</span>
        <span class="text-body2 text-grey-5">R$ {{ formatarValor(meta.valorAlvo) }}</span>
      </div>

      <!-- Barra de progresso -->
      <q-linear-progress
        :value="meta.percentualProgresso / 100"
        :color="corProgresso"
        track-color="grey-3"
        rounded
        size="10px"
        class="q-mt-sm"
      />

      <!-- Percentual + Dias restantes -->
      <div class="meta-card__info q-mt-xs">
        <span class="text-caption text-grey-6">{{ meta.percentualProgresso }}%</span>
        <span class="text-caption text-grey-6">
          <q-icon name="calendar_today" size="12px" class="q-mr-xs" />
          {{ meta.diasRestantes }} dias restantes
        </span>
      </div>

      <!-- Valor faltante -->
      <q-banner v-if="!meta.concluida" class="bg-amber-1 text-amber-9 q-mt-md" rounded dense>
        Faltam <strong>R$ {{ formatarValor(meta.valorFaltante) }}</strong> para atingir sua meta
      </q-banner>

      <q-banner v-else class="bg-green-1 text-green-9 q-mt-md" rounded dense>
        <q-icon name="celebration" class="q-mr-xs" /> Meta alcançada! 🎉
      </q-banner>
    </q-card-section>

    <!-- Botão contribuir -->
    <q-separator />
    <q-card-actions align="center">
      <q-btn
        flat
        no-caps
        icon="add"
        label="Contribuir"
        color="primary"
        :disable="meta.concluida"
        @click="emit('contribuir')"
      />
    </q-card-actions>
  </q-card>
</template>
```

**Script:**
```typescript
<script setup lang="ts">
import { computed } from 'vue';
import type { MetaFinanceiraResult } from 'src/Model/MetaFinanceira';
import { CATEGORIA_META_CONFIG } from 'src/Model/MetaFinanceira';

const props = defineProps<{ meta: MetaFinanceiraResult }>();
const emit = defineEmits<{
  (e: 'contribuir'): void;
  (e: 'excluir'): void;
}>();

const categoriaConfig = computed(() => CATEGORIA_META_CONFIG[props.meta.categoria]);

const corProgresso = computed(() => {
  if (props.meta.percentualProgresso >= 100) return 'green';
  if (props.meta.percentualProgresso >= 80) return 'orange';
  if (props.meta.percentualProgresso >= 50) return 'blue';
  return 'light-blue';
});

function formatarValor(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>
```

**Estilo:**
```scss
<style lang="scss" scoped>
.meta-card {
  border-radius: 16px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }

  &:hover &__delete-btn {
    opacity: 1;
  }

  &__delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 1;
  }

  &__header {
    display: flex;
    align-items: center;
  }

  &__valores {
    display: flex;
    justify-content: space-between;
  }

  &__info {
    display: flex;
    justify-content: space-between;
  }
}
</style>
```

---

### 5.3 `ModalCriarMeta.vue`
**Arquivo:** `src/components/MetasFinanceiras/ModalCriarMeta.vue`

Modal de criação de meta, conforme protótipo (seleção de categoria por ícones visuais).

**Props e Emits:**
```typescript
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'criar', dto: CreateMetaFinanceiraDTO): void;
}>();
```

**Template:**
```html
<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 420px; border-radius: 16px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">Criar Nova Meta</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submeter" class="q-gutter-md">
          <!-- Nome da Meta -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs">Nome da Meta</label>
            <q-input
              v-model="form.nome"
              outlined rounded dense
              placeholder='Ex: "Viagem para Europa"'
              :rules="[val => !!val || 'Nome é obrigatório']"
            />
          </div>

          <!-- Valor Alvo -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs">Valor Alvo (R$)</label>
            <q-input
              v-model.number="form.valorAlvo"
              outlined rounded dense
              type="number"
              placeholder="10.000,00"
              :rules="[val => val > 0 || 'Valor deve ser positivo']"
            />
          </div>

          <!-- Data Limite -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-xs">Data Limite</label>
            <q-input
              v-model="form.dataLimite"
              outlined rounded dense
              type="date"
              :rules="[val => !!val || 'Data é obrigatória']"
            />
          </div>

          <!-- Categoria (seleção visual com ícones) -->
          <div>
            <label class="text-subtitle2 text-bold q-mb-sm">Categoria</label>
            <div class="categoria-grid">
              <div
                v-for="(config, key) in CATEGORIA_META_CONFIG"
                :key="key"
                class="categoria-item"
                :class="{ 'categoria-item--selecionada': form.categoria === Number(key) }"
                @click="form.categoria = Number(key)"
              >
                <q-icon :name="config.icon" size="28px" :color="config.color" />
                <span class="text-caption">{{ config.label }}</span>
              </div>
            </div>
          </div>

          <!-- Botão Criar -->
          <q-btn
            type="submit"
            label="Criar Meta 🎯"
            color="primary"
            rounded unelevated
            class="full-width q-mt-md"
            size="lg"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
```

**Script:**
```typescript
<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  CategoriaIconeMeta,
  CATEGORIA_META_CONFIG,
  type CreateMetaFinanceiraDTO,
} from 'src/Model/MetaFinanceira';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'criar', dto: CreateMetaFinanceiraDTO): void;
}>();

const form = ref({
  nome: '',
  valorAlvo: 0,
  dataLimite: '',
  categoria: CategoriaIconeMeta.Outro,
});

// Reset ao abrir
watch(() => props.modelValue, (aberto) => {
  if (aberto) {
    form.value = {
      nome: '',
      valorAlvo: 0,
      dataLimite: '',
      categoria: CategoriaIconeMeta.Outro,
    };
  }
});

function submeter() {
  emit('criar', {
    nome: form.value.nome,
    valorAlvo: form.value.valorAlvo,
    dataLimite: form.value.dataLimite,
    categoria: form.value.categoria,
  });
}
</script>
```

**Estilo (seleção de categoria visual):**
```scss
<style lang="scss" scoped>
.categoria-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.categoria-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &--selecionada {
    border-color: #2ECC71;
    background: rgba(46, 204, 113, 0.06);
  }
}
</style>
```

---

### 5.4 `ModalContribuir.vue`
**Arquivo:** `src/components/MetasFinanceiras/ModalContribuir.vue`

Modal simples para registrar uma contribuição.

```html
<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 380px; border-radius: 16px;">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-bold">Contribuir</div>
        <div class="text-caption text-grey-6" v-if="meta">{{ meta.nome }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="submeter" class="q-gutter-md">
          <q-input
            v-model.number="valor"
            outlined rounded dense
            type="number"
            label="Valor da Contribuição (R$)"
            :rules="[val => val > 0 || 'Valor deve ser positivo']"
            autofocus
          />

          <q-input
            v-model="data"
            outlined rounded dense
            type="date"
            label="Data"
          />

          <!-- Resumo visual -->
          <q-banner v-if="meta && valor > 0" class="bg-blue-1 text-blue-9" rounded dense>
            Após esta contribuição, você terá
            <strong>R$ {{ formatarValor((meta.valorAtual + valor)) }}</strong>
            de R$ {{ formatarValor(meta.valorAlvo) }}
            ({{ novoPercentual }}%)
          </q-banner>

          <q-btn
            type="submit"
            label="Confirmar Contribuição"
            color="primary"
            rounded unelevated
            class="full-width"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { MetaFinanceiraResult, ContribuicaoDTO } from 'src/Model/MetaFinanceira';

const props = defineProps<{
  modelValue: boolean;
  meta: MetaFinanceiraResult | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'contribuir', dto: ContribuicaoDTO): void;
}>();

const valor = ref(0);
const data = ref(new Date().toISOString().slice(0, 10));

watch(() => props.modelValue, (aberto) => {
  if (aberto) {
    valor.value = 0;
    data.value = new Date().toISOString().slice(0, 10);
  }
});

const novoPercentual = computed(() => {
  if (!props.meta || props.meta.valorAlvo <= 0) return 0;
  return Math.min(100, Math.round(((props.meta.valorAtual + valor.value) / props.meta.valorAlvo) * 100));
});

function formatarValor(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function submeter() {
  emit('contribuir', {
    valor: valor.value,
    data: data.value,
  });
}
</script>
```

---

## 🌐 6. Navegação — Atualização do Menu

### 6.1 Adicionar link no `MainLayout.vue`

Adicionar um novo item no menu lateral para navegar até a página de Metas Financeiras:

```typescript
// Dentro da lista de itens do menu
{
  icon: 'emoji_events',
  label: 'Metas Financeiras',
  to: '/metas',
}
```

---

## 🔀 7. Fluxo de Integração

### Fluxo 1 — Criar Meta
1. Usuário clica em **"+ Nova Meta"** no header
2. Modal `ModalCriarMeta` abre com campos: Nome, Valor Alvo, Data Limite, Categoria (ícones)
3. Usuário preenche e clica em **"Criar Meta 🎯"**
4. Front dispara `POST /api/MetasFinanceiras` com `CreateMetaFinanceiraDTO`
5. Back-end valida, persiste no MongoDB, retorna `ResultMetaFinanceiraDTO`
6. Front atualiza a lista de metas e o resumo

### Fluxo 2 — Contribuir
1. Usuário clica em **"+ Contribuir"** no card de uma meta
2. Modal `ModalContribuir` abre mostrando meta selecionada
3. Usuário insere valor e data, vê o banner de resumo preditivo
4. Front dispara `POST /api/MetasFinanceiras/{id}/contribuicoes` com `ContribuicaoDTO`
5. Back-end registra contribuição, verifica marcos (50%, 80%, 100%), retorna `ResultContribuicaoResponse`
6. Se houve marco → Front exibe `q-notify` com a mensagem de incentivo (ex: "Metade do caminho! 💪")
7. Front recarrega dados

### Fluxo 3 — Excluir Meta
1. Usuário passa o mouse sobre o card → aparece ícone de lixeira
2. Clica na lixeira → `q-dialog` de confirmação
3. Front dispara `DELETE /api/MetasFinanceiras/{id}`
4. Back-end remove meta e todas as contribuições (embedded)
5. Front recarrega dados

---

## 🚀 Checklist de Execução — Front-End

### Fase 1 — Model e Service

- [ ] **1.1** Criar `src/Model/MetaFinanceira.ts` com todas as interfaces, enums e mapa de configuração de categorias
- [ ] **1.2** Criar `src/services/MetaFinanceiraService.ts` com todos os métodos (CRUD + contribuição + resumo)

### Fase 2 — Rota e Navegação

- [ ] **2.1** Adicionar rota `/metas` em `src/router/routes.ts` apontando para `MetasFinanceirasPage.vue`
- [ ] **2.2** Adicionar item no menu lateral em `MainLayout.vue`

### Fase 3 — Componentes

- [ ] **3.1** Criar `src/components/MetasFinanceiras/PainelResumoMetas.vue` (3 cards de resumo)
- [ ] **3.2** Criar `src/components/MetasFinanceiras/MetaCard.vue` (card individual com progresso)
- [ ] **3.3** Criar `src/components/MetasFinanceiras/ModalCriarMeta.vue` (formulário de criação com seleção visual de categoria)
- [ ] **3.4** Criar `src/components/MetasFinanceiras/ModalContribuir.vue` (formulário de contribuição)

### Fase 4 — Página

- [ ] **4.1** Criar `src/pages/MetasFinanceiras/MetasFinanceirasPage.vue` (orquestrador principal)

### Fase 5 — Polimento

- [ ] **5.1** Testar fluxo completo: criar meta → contribuir → verificar notificações → excluir
- [ ] **5.2** Validar responsividade (desktop + mobile)
- [ ] **5.3** Verificar integração com modo compartilhado (permissões)
- [ ] **5.4** Ajustar temas (dark mode compatibilidade)
