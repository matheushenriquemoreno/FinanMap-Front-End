<template>
  <q-card data-testid="mcp-history" flat bordered class="rounded-borders q-mt-md">
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">Atividade recente</div>
      <div class="text-caption text-grey-7">Últimas operações realizadas via MCP.</div>
    </q-card-section>

    <q-separator />

    <q-card-section
      v-if="loading"
      data-testid="mcp-history-loading"
      class="row items-center q-gutter-sm text-grey-7"
      role="status"
      aria-live="polite"
    >
      <q-spinner color="primary" size="24px" />
      <span>Carregando histórico...</span>
    </q-card-section>

    <q-card-section
      v-else-if="loadError"
      data-testid="mcp-history-error"
      class="text-negative"
      role="alert"
    >
      Não foi possível carregar o histórico recente.
      <q-btn flat no-caps color="negative" label="Tentar novamente" @click="loadHistory" />
    </q-card-section>

    <q-card-section
      v-else-if="history.length === 0"
      data-testid="mcp-history-empty"
      class="text-grey-7"
    >
      Nenhuma atividade registrada.
    </q-card-section>

    <q-list v-else separator>
      <div v-for="event in history" :key="event.id" class="audit-event">
        <q-item :data-testid="`history-event-${event.id}`" class="audit-event__summary">
          <q-item-section>
            <q-item-label :id="`event-title-${event.id}`" class="text-weight-medium">
              {{ eventActionLabel(event) }}
            </q-item-label>
            <q-item-label caption>{{ event.toolName }}</q-item-label>
            <q-item-label caption>{{ auditSummary(event) }}</q-item-label>
          </q-item-section>

          <q-item-section side top class="audit-event__side">
            <q-badge
              :data-testid="`event-state-${event.id}`"
              :color="auditStatePresentation(event.state).color"
              :label="auditStatePresentation(event.state).label"
            >
              {{ auditStatePresentation(event.state).label }}
            </q-badge>
            <span class="text-caption text-grey-7 q-mt-xs">
              {{ formatDate(event.startedAtUtc) }}
            </span>
            <q-btn
              :data-testid="`open-event-${event.id}`"
              flat
              no-caps
              color="primary"
              :label="expandedEventId === event.id ? 'Ocultar detalhes' : 'Ver detalhes'"
              :aria-expanded="expandedEventId === event.id"
              :aria-controls="`event-detail-container-${event.id}`"
              @click="toggleDetails(event.id)"
            />
          </q-item-section>
        </q-item>

        <div
          v-if="expandedEventId === event.id"
          :id="`event-detail-container-${event.id}`"
          class="audit-detail q-pa-md"
        >
          <div
            v-if="detailLoading[event.id]"
            :data-testid="`event-detail-loading-${event.id}`"
            class="row items-center q-gutter-sm text-grey-7"
            role="status"
            aria-live="polite"
          >
            <q-spinner color="primary" size="22px" />
            <span>Carregando detalhes da operação...</span>
          </div>

          <q-banner
            v-else-if="detailErrors[event.id]"
            :data-testid="`event-detail-error-${event.id}`"
            class="bg-red-1 text-negative rounded-borders"
            role="alert"
          >
            Não foi possível carregar os detalhes desta operação.
            <q-btn
              :data-testid="`retry-event-${event.id}`"
              flat
              no-caps
              color="negative"
              label="Tentar novamente"
              @click="loadDetails(event.id)"
            />
          </q-banner>

          <section
            v-else-if="details[event.id]"
            :data-testid="`event-detail-${event.id}`"
            :aria-labelledby="`event-title-${event.id}`"
            role="region"
          >
            <div class="detail-grid">
              <div>
                <div class="detail-label">Ação</div>
                <div :data-testid="`event-action-${event.id}`">
                  {{ actionPresentation(details[event.id]?.action).label }}
                </div>
              </div>
              <div>
                <div class="detail-label">Status</div>
                <div>{{ auditStatePresentation(details[event.id]!.state).label }}</div>
              </div>
              <div>
                <div class="detail-label">Data</div>
                <div>{{ formatDate(details[event.id]!.startedAtUtc) }}</div>
              </div>
            </div>

            <div v-if="safeResultSummary(details[event.id]!)" class="detail-block">
              <h3 class="detail-title">Resumo</h3>
              <p class="q-mb-none">{{ safeResultSummary(details[event.id]!) }}</p>
            </div>

            <div v-if="details[event.id]?.preview" class="detail-block">
              <h3 class="detail-title">Prévia segura</h3>
              <div class="detail-grid">
                <div>
                  <div class="detail-label">Tipo</div>
                  <div>{{ details[event.id]!.preview!.resourceType }}</div>
                </div>
                <div>
                  <div class="detail-label">Registro</div>
                  <div>{{ details[event.id]!.preview!.recordReference }}</div>
                </div>
                <div>
                  <div class="detail-label">Decisão necessária</div>
                  <div>
                    {{ decisionPresentation(details[event.id]!.preview!.requiredDecision) }}
                  </div>
                </div>
                <div>
                  <div class="detail-label">Expira em</div>
                  <div>{{ formatDate(details[event.id]!.preview!.expiresAtUtc) }}</div>
                </div>
              </div>

              <q-banner
                v-if="details[event.id]!.preview!.irreversible"
                class="bg-red-1 text-negative rounded-borders q-mt-md"
                role="note"
              >
                <strong>Exclusão definitiva.</strong> Esta exclusão é irreversível.
              </q-banner>

              <div
                v-for="change in details[event.id]!.preview!.changes"
                :key="change.field"
                class="preview-change q-mt-sm"
              >
                <div class="text-weight-medium">{{ change.label }}</div>
                <div class="change-grid text-body2">
                  <div v-if="hasValue(change.currentValue)">
                    <span class="detail-label">Valor atual</span>
                    <span>{{ displaySafeValue(change.currentValue) }}</span>
                  </div>
                  <div v-if="hasValue(change.proposedValue)">
                    <span class="detail-label">Valor proposto</span>
                    <span>{{ displaySafeValue(change.proposedValue) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="details[event.id]?.confirmation" class="detail-block">
              <h3 class="detail-title">Confirmação</h3>
              <div class="detail-grid">
                <div>
                  <div class="detail-label">Decisão</div>
                  <div>
                    {{ decisionPresentation(details[event.id]!.confirmation!.decision) }}
                  </div>
                </div>
                <div>
                  <div class="detail-label">Confirmado por</div>
                  <div>
                    {{ confirmerPresentation(details[event.id]!.confirmation!.confirmedBy) }}
                  </div>
                </div>
                <div>
                  <div class="detail-label">Confirmado em</div>
                  <div>{{ formatDate(details[event.id]!.confirmation!.confirmedAtUtc) }}</div>
                </div>
              </div>
            </div>

            <div v-if="details[event.id]?.reconciliation" class="detail-block">
              <h3 class="detail-title">Reconciliação</h3>
              <p>{{ details[event.id]!.reconciliation!.summary }}</p>
              <div class="detail-grid">
                <div>
                  <div class="detail-label">Estado</div>
                  <div
                    :data-testid="`event-reconciliation-status-${event.id}`"
                    role="status"
                    aria-live="polite"
                  >
                    {{ reconciliationPresentation(details[event.id]!.reconciliation!.status) }}
                  </div>
                </div>
                <div>
                  <div class="detail-label">Tentativas de verificação</div>
                  <div>{{ details[event.id]!.reconciliation!.attempts }}</div>
                </div>
                <div v-if="details[event.id]!.reconciliation!.lastCheckedAtUtc">
                  <div class="detail-label">Última verificação</div>
                  <div>
                    {{ formatDate(details[event.id]!.reconciliation!.lastCheckedAtUtc!) }}
                  </div>
                </div>
              </div>
              <p v-if="details[event.id]!.reconciliation!.guidance" class="guidance q-mb-none">
                {{ details[event.id]!.reconciliation!.guidance }}
              </p>
            </div>

            <div v-if="details[event.id]?.result" class="detail-block">
              <h3 class="detail-title">Resultado da escrita</h3>
              <p>{{ details[event.id]!.result!.summary }}</p>
              <ul v-if="details[event.id]!.result!.items.length" class="result-list">
                <li
                  v-for="item in details[event.id]!.result!.items"
                  :key="`${item.reference}-${item.status}`"
                  class="q-mb-sm"
                >
                  <div class="text-weight-medium">{{ item.reference }}</div>
                  <div>{{ resultStatePresentation(item.status) }} — {{ item.summary }}</div>
                  <div v-if="safeErrorCode(item.errorCode)" class="text-negative">
                    Código: {{ safeErrorCode(item.errorCode) }}
                  </div>
                  <div v-if="item.guidance" class="guidance">{{ item.guidance }}</div>
                </li>
              </ul>
            </div>

            <section
              v-if="details[event.id]?.importBatch"
              :data-testid="`import-batch-${event.id}`"
              class="detail-block"
              aria-label="Resumo seguro do lote de importação"
            >
              <h3 class="detail-title">Resumo do lote de importação</h3>
              <div class="detail-grid">
                <div>
                  <div class="detail-label">Estado do lote</div>
                  <div :data-testid="`import-batch-state-${event.id}`" role="status">
                    {{ importBatchStatePresentation(details[event.id]!.importBatch!.state) }}
                  </div>
                </div>
                <div>
                  <div class="detail-label">Itens no lote</div>
                  <div>{{ formatCount(details[event.id]!.importBatch!.itemCount) }}</div>
                </div>
              </div>

              <div class="import-summary-grid q-mt-md">
                <div>
                  <h4 class="detail-subtitle">Contagens por estado</h4>
                  <ul class="result-list">
                    <li
                      v-for="entry in importStateCounts(details[event.id]!.importBatch!)"
                      :key="entry.key"
                    >
                      {{ entry.label }}: {{ formatCount(entry.count) }}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 class="detail-subtitle">Contagens por tipo</h4>
                  <ul class="result-list">
                    <li
                      v-for="entry in importTypeCounts(details[event.id]!.importBatch!)"
                      :key="entry.key"
                    >
                      {{ entry.label }}: {{ formatCount(entry.count) }}
                    </li>
                  </ul>
                </div>
              </div>

              <div v-if="details[event.id]!.importBatch!.totals.length" class="q-mt-md">
                <h4 class="detail-subtitle">Totais financeiros por tipo</h4>
                <ul class="result-list">
                  <li v-for="total in details[event.id]!.importBatch!.totals" :key="total.type">
                    {{ importTypePresentation(total.type) }}:
                    {{ formatImportAmount(total.amount, total.currency) }}
                  </li>
                </ul>
              </div>

              <div v-if="details[event.id]!.importBatch!.failures.length" class="q-mt-md">
                <h4 class="detail-subtitle">Itens que precisam de correção</h4>
                <ul class="import-detail-list">
                  <li
                    v-for="failure in details[event.id]!.importBatch!.failures"
                    :key="failure.clientItemId"
                    class="import-detail-item"
                  >
                    <div class="text-weight-medium">
                      {{ failure.sourceRef || failure.clientItemId }}
                    </div>
                    <div v-if="failure.field">Campo: {{ failure.field }}</div>
                    <div v-if="safeErrorCode(failure.code)" class="text-negative">
                      Código: {{ safeErrorCode(failure.code) }}
                    </div>
                    <div>{{ failure.message }}</div>
                    <div class="guidance">{{ failure.guidance }}</div>
                  </li>
                </ul>
              </div>

              <div v-if="details[event.id]!.importBatch!.items.length" class="q-mt-md">
                <h4 class="detail-subtitle">Operações por item</h4>
                <ul class="import-detail-list">
                  <li
                    v-for="item in details[event.id]!.importBatch!.items"
                    :key="item.clientItemId"
                    class="import-detail-item"
                  >
                    <div class="text-weight-medium">
                      {{ item.sourceRef || item.clientItemId }} ·
                      {{ importTypePresentation(item.type) }}
                    </div>
                    <div>Operação: {{ item.operationId }}</div>
                    <div>Resultado: {{ importItemResultPresentation(item.result) }}</div>
                  </li>
                </ul>
              </div>
            </section>

            <q-banner
              v-if="details[event.id]?.failure"
              class="bg-orange-1 text-grey-9 rounded-borders detail-block"
              role="note"
            >
              <div class="text-weight-medium">
                {{ safeErrorCode(details[event.id]!.failure!.code) }}
              </div>
              <div>{{ details[event.id]!.failure!.message }}</div>
              <div class="guidance q-mt-xs">{{ details[event.id]!.failure!.guidance }}</div>
            </q-banner>

            <div class="support-reference q-mt-md">
              <div class="detail-label">Código de correlação para suporte</div>
              <code>{{ details[event.id]!.correlationId }}</code>
            </div>
          </section>
        </div>
      </div>
    </q-list>

    <q-card-actions v-if="nextCursor && !loading && !loadError" align="center">
      <q-btn
        data-testid="mcp-history-load-more"
        flat
        no-caps
        color="primary"
        label="Carregar mais atividades"
        :loading="loadingMore"
        @click="loadMore"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type {
  McpAuditEvent,
  McpAuditEventDetail,
  McpAuditImportBatch,
  McpAuditResultState,
  McpAuditSafeValue,
  McpAuditState,
  McpConfirmationActor,
  McpImportBatchState,
  McpImportItemState,
  McpImportItemType,
  McpReconciliationStatus,
  McpRequiredDecision,
  McpWriteAction,
} from 'src/models/Mcp';
import McpService from 'src/services/McpService';
import { onMounted, reactive, ref } from 'vue';

const loading = ref(true);
const loadingMore = ref(false);
const loadError = ref(false);
const history = ref<McpAuditEvent[]>([]);
const nextCursor = ref<string | null>(null);
const expandedEventId = ref<string | null>(null);
const details = reactive<Record<string, McpAuditEventDetail | undefined>>({});
const detailLoading = reactive<Record<string, boolean>>({});
const detailErrors = reactive<Record<string, boolean>>({});

async function loadHistory() {
  loading.value = true;
  loadError.value = false;

  try {
    const response = await McpService.listarHistorico({ limit: 10 });
    history.value = response.items;
    nextCursor.value = response.nextCursor;
  } catch {
    history.value = [];
    nextCursor.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (!nextCursor.value || loadingMore.value) return;

  loadingMore.value = true;
  try {
    const response = await McpService.listarHistorico({
      limit: 10,
      cursor: nextCursor.value,
    });
    history.value = [...history.value, ...response.items];
    nextCursor.value = response.nextCursor;
  } catch {
    loadError.value = true;
  } finally {
    loadingMore.value = false;
  }
}

async function toggleDetails(eventId: string) {
  if (expandedEventId.value === eventId) {
    expandedEventId.value = null;
    return;
  }

  expandedEventId.value = eventId;
  if (!details[eventId]) await loadDetails(eventId);
}

async function loadDetails(eventId: string) {
  detailLoading[eventId] = true;
  detailErrors[eventId] = false;
  try {
    details[eventId] = await McpService.obterEventoHistorico(eventId);
  } catch {
    detailErrors[eventId] = true;
  } finally {
    detailLoading[eventId] = false;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function auditSummary(event: McpAuditEvent): string {
  const { summary, message, description } = event.resultSummary;
  const safeSummary = summary ?? message ?? description;
  return typeof safeSummary === 'string' && safeSummary.trim()
    ? safeSummary
    : 'Operação registrada.';
}

function safeResultSummary(event: McpAuditEvent): string {
  return auditSummary(event) === 'Operação registrada.' ? '' : auditSummary(event);
}

function auditStatePresentation(state: McpAuditState): { label: string; color: string } {
  const presentation: Record<McpAuditState, { label: string; color: string }> = {
    received: { label: 'Recebida', color: 'blue-grey' },
    executing: { label: 'Em execução', color: 'info' },
    reconciling: { label: 'Em reconciliação', color: 'warning' },
    completed: { label: 'Concluída', color: 'positive' },
    partiallyCompleted: { label: 'Parcial', color: 'warning' },
    failed: { label: 'Falhou', color: 'negative' },
    rejected: { label: 'Rejeitada', color: 'negative' },
    unknown: { label: 'Resultado desconhecido', color: 'warning' },
    expired: { label: 'Expirada', color: 'grey-7' },
  };
  return presentation[state];
}

function actionPresentation(action?: string | null): { label: string } {
  const presentation: Record<McpWriteAction, { label: string }> = {
    create: { label: 'Criação' },
    update: { label: 'Alteração' },
    delete: { label: 'Exclusão definitiva' },
    cancel: { label: 'Cancelamento de prévia' },
    status: { label: 'Consulta de status' },
  };
  const knownPresentation = action
    ? (presentation as Partial<Record<string, { label: string }>>)[action]
    : undefined;
  return knownPresentation ?? { label: 'Operação MCP' };
}

function eventActionLabel(event: McpAuditEvent): string {
  if (event.action) return actionPresentation(event.action).label;

  const operationLabels: Record<McpAuditEvent['operationClass'], string> = {
    read: 'Consulta',
    preview: 'Preparação de prévia',
    confirm: 'Confirmação de escrita',
    import: 'Importação',
    auth: 'Autorização',
    revoke: 'Revogação',
  };
  return operationLabels[event.operationClass];
}

function decisionPresentation(decision: McpRequiredDecision): string {
  const presentation: Record<McpRequiredDecision, string> = {
    APPLY_CHANGES: 'Aplicar alterações',
    DELETE_PERMANENTLY: 'Excluir permanentemente',
    IMPORT_VALID_ITEMS: 'Importar itens válidos',
  };
  return presentation[decision];
}

function confirmerPresentation(actor: McpConfirmationActor): string {
  return actor === 'resource_owner' ? 'Titular da conta' : 'Confirmador não identificado';
}

function reconciliationPresentation(status: string): string {
  const presentation: Record<McpReconciliationStatus, string> = {
    not_required: 'Não necessária',
    completed: 'Concluída',
    rejected: 'Rejeitada',
    unknown: 'Resultado desconhecido',
    pending: 'Pendente',
    checking: 'Verificando efeito',
    confirmed: 'Efeito confirmado',
    not_applied: 'Efeito não aplicado',
    inconclusive: 'Resultado inconclusivo',
  };
  return (presentation as Partial<Record<string, string>>)[status] ?? 'Estado não reconhecido';
}

function resultStatePresentation(status: McpAuditResultState): string {
  const presentation: Record<McpAuditResultState, string> = {
    completed: 'Concluído',
    failed: 'Falhou',
    rejected: 'Rejeitado',
    processing: 'Em verificação',
    unknown: 'Resultado desconhecido',
  };
  return presentation[status];
}

const importTypeLabels: Record<McpImportItemType, string> = {
  category: 'Categoria',
  income: 'Receita',
  expense: 'Despesa',
  investment: 'Investimento',
  fixed_cost: 'Custo fixo',
};

const importStateLabels: Record<McpImportItemState, string> = {
  valid: 'Válidos',
  invalid: 'Inválidos',
  pending: 'Pendentes',
  possible_duplicate: 'Possíveis duplicidades',
  skipped: 'Ignorados',
  already_applied: 'Já aplicados',
  completed: 'Concluídos',
  failed: 'Falhos',
  unknown: 'Resultado desconhecido',
};

function importTypePresentation(type: McpImportItemType): string {
  return importTypeLabels[type];
}

function importBatchStatePresentation(state: McpImportBatchState): string {
  const presentation: Record<McpImportBatchState, string> = {
    partial: 'Parcial',
    completed: 'Concluído',
    failed: 'Falhou',
    unknown: 'Resultado desconhecido',
  };
  return presentation[state];
}

function importItemResultPresentation(result: 'completed' | 'failed' | 'unknown'): string {
  const presentation = {
    completed: 'Concluído',
    failed: 'Falhou',
    unknown: 'Resultado desconhecido',
  } as const;
  return presentation[result];
}

function importStateCounts(
  batch: McpAuditImportBatch,
): Array<{ key: McpImportItemState; label: string; count: number }> {
  return (Object.keys(importStateLabels) as McpImportItemState[])
    .map((key) => ({
      key,
      label: importStateLabels[key],
      count: batch.countsByState[key],
    }))
    .filter(
      (entry): entry is { key: McpImportItemState; label: string; count: number } =>
        typeof entry.count === 'number' && Number.isFinite(entry.count) && entry.count >= 0,
    );
}

function importTypeCounts(
  batch: McpAuditImportBatch,
): Array<{ key: McpImportItemType; label: string; count: number }> {
  return (Object.keys(importTypeLabels) as McpImportItemType[])
    .map((key) => ({
      key,
      label: importTypeLabels[key],
      count: batch.countsByType[key],
    }))
    .filter(
      (entry): entry is { key: McpImportItemType; label: string; count: number } =>
        typeof entry.count === 'number' && Number.isFinite(entry.count) && entry.count >= 0,
    );
}

function formatCount(value: number): string {
  return Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)
    : 'Indisponível';
}

function formatImportAmount(value: number, currency: 'BRL'): string {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
    : 'Total indisponível';
}

function hasValue(value: McpAuditSafeValue | undefined): boolean {
  return value !== undefined;
}

function displaySafeValue(value: McpAuditSafeValue | undefined): string {
  if (value === null) return 'Sem valor';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return String(value ?? '');
}

function safeErrorCode(code?: string | null): string {
  return code && /^[A-Z0-9_]{1,64}$/.test(code) ? code : '';
}

onMounted(loadHistory);
</script>

<style scoped>
.audit-event__summary {
  align-items: flex-start;
  gap: 1rem;
}

.audit-event__side {
  align-items: flex-end;
  min-width: 10rem;
}

.audit-detail {
  border-top: 1px solid rgba(127, 127, 127, 0.2);
  background: rgba(127, 127, 127, 0.05);
}

.detail-grid,
.change-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
}

.detail-block {
  margin-top: 1rem;
}

.detail-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.detail-subtitle {
  margin: 0 0 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.detail-label {
  display: block;
  margin-bottom: 0.125rem;
  color: var(--q-grey-7, #616161);
  font-size: 0.75rem;
}

.preview-change {
  padding: 0.75rem;
  border: 1px solid rgba(127, 127, 127, 0.25);
  border-radius: 0.5rem;
}

.change-grid > div {
  min-width: 0;
  overflow-wrap: anywhere;
}

.guidance {
  font-weight: 500;
}

.result-list {
  margin: 0;
  padding-left: 1.25rem;
}

.import-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
}

.import-detail-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.import-detail-item {
  min-width: 0;
  padding: 0.75rem;
  overflow-wrap: anywhere;
  border: 1px solid rgba(127, 127, 127, 0.25);
  border-radius: 0.5rem;
}

.support-reference code {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
}

:deep(.q-btn) {
  min-height: 44px;
}

@media (max-width: 599px) {
  .audit-event__summary {
    flex-direction: column;
  }

  .audit-event__side {
    width: 100%;
    min-width: 0;
    align-items: flex-start;
  }

  .detail-grid,
  .change-grid,
  .import-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
