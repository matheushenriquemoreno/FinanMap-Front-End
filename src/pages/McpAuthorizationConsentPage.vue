<template>
  <main class="consent-page">
    <section class="consent-card" aria-labelledby="consent-title">
      <header class="consent-header">
        <span class="eyebrow">Integração com IA</span>
        <h1 id="consent-title">Autorizar acesso ao FinanMap</h1>
        <p>Revise o aplicativo e os acessos solicitados antes de decidir.</p>
      </header>

      <p v-if="loading" class="status-message" role="status">Carregando solicitação de acesso…</p>

      <p v-else-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>

      <template v-else-if="interaction && configuration">
        <dl class="request-summary">
          <div>
            <dt>Cliente</dt>
            <dd>
              <strong>{{ interaction.clientName }}</strong>
              <span>{{ interaction.clientId }}</span>
            </dd>
          </div>
          <div>
            <dt>Recurso MCP</dt>
            <dd class="resource">{{ configuration.endpoint }}</dd>
          </div>
          <div>
            <dt>Conta</dt>
            <dd>Sua conta financeira individual no FinanMap</dd>
          </div>
        </dl>

        <section aria-labelledby="scope-title" class="scope-section">
          <h2 id="scope-title">Este cliente solicita permissão para:</h2>
          <ul>
            <li v-for="scope in interaction.requestedScopes" :key="scope">
              {{ scopeDescription(scope) }}
            </li>
          </ul>
        </section>

        <aside class="privacy-notice">
          <strong>Antes de continuar</strong>
          <p>
            O conteúdo consultado poderá ser processado por um provedor externo de IA. O FinanMap
            não envia senha nem tokens de acesso ao cliente.
          </p>
          <p v-if="requestsWriteAccess">
            Alterações e importações exigem prévia e confirmação explícita antes de serem aplicadas.
          </p>
        </aside>

        <p v-if="interaction.status !== 'pending'" class="error-message" role="alert">
          Esta solicitação não está mais pendente.
        </p>

        <div class="actions">
          <button
            type="button"
            class="deny-button"
            data-testid="mcp-consent-deny"
            :disabled="submitting || interaction.status !== 'pending'"
            @click="deny"
          >
            Negar
          </button>
          <button
            type="button"
            class="allow-button"
            data-testid="mcp-consent-allow"
            :disabled="submitting || interaction.status !== 'pending'"
            @click="approve"
          >
            {{ submitting ? 'Processando…' : 'Permitir acesso' }}
          </button>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  navigateToMcpContinuation,
  validateMcpApprovalContinuation,
  validateMcpDenialContinuation,
} from 'src/helpers/McpAuthorizationFlow';
import type { McpAuthorizationInteraction, McpConfiguration } from 'src/models/Mcp';
import mcpService, { type McpService } from 'src/services/McpService';

type ConsentService = Pick<
  McpService,
  | 'obterInteracaoAutorizacao'
  | 'obterConfiguracao'
  | 'aprovarInteracaoAutorizacao'
  | 'negarInteracaoAutorizacao'
>;

const props = withDefaults(
  defineProps<{
    interactionId?: string;
    service?: ConsentService;
    onContinue?: (target: string) => void;
  }>(),
  {
    interactionId: '',
    service: () => mcpService,
  },
);

const interaction = ref<McpAuthorizationInteraction>();
const configuration = ref<McpConfiguration>();
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');

const scopeDescriptions: Record<string, string> = {
  'mcp:read': 'Consultar seus dados financeiros',
  'mcp:audit': 'Consultar seu histórico de atividades MCP',
  'mcp:write': 'Preparar e confirmar alterações nos seus dados financeiros',
  'mcp:import': 'Preparar e importar dados financeiros estruturados',
};

const requestsWriteAccess = computed(
  () =>
    interaction.value?.requestedScopes.some((scope) =>
      ['mcp:write', 'mcp:import'].includes(scope),
    ) ?? false,
);

function scopeDescription(scope: string): string {
  return scopeDescriptions[scope] ?? `Acesso solicitado: ${scope}`;
}

function continueAuthorization(validatedUrl: string): void {
  if (props.onContinue) {
    props.onContinue(validatedUrl);
    return;
  }
  navigateToMcpContinuation(validatedUrl);
}

function failClosed(): void {
  errorMessage.value =
    'Não foi possível validar uma continuação segura. Nenhum acesso foi redirecionado.';
}

async function approve(): Promise<void> {
  if (!interaction.value || !configuration.value) return;

  submitting.value = true;
  errorMessage.value = '';
  try {
    const decision = await props.service.aprovarInteracaoAutorizacao(
      interaction.value.id,
      interaction.value.requestedScopes,
    );
    const validatedUrl = validateMcpApprovalContinuation(
      decision.continueUrl,
      configuration.value.authorization.authorizationServerMetadataUrl,
      interaction.value.id,
    );
    if (!validatedUrl) {
      failClosed();
      return;
    }
    continueAuthorization(validatedUrl);
  } catch {
    errorMessage.value = 'Não foi possível autorizar este cliente. Tente novamente.';
  } finally {
    submitting.value = false;
  }
}

async function deny(): Promise<void> {
  if (!interaction.value) return;

  submitting.value = true;
  errorMessage.value = '';
  try {
    const decision = await props.service.negarInteracaoAutorizacao(interaction.value.id);
    const validatedUrl = validateMcpDenialContinuation(
      decision.continueUrl,
      interaction.value.redirectUri,
      interaction.value.state,
    );
    if (!validatedUrl) {
      failClosed();
      return;
    }
    continueAuthorization(validatedUrl);
  } catch {
    errorMessage.value = 'Não foi possível registrar a negativa. Tente novamente.';
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  if (!props.interactionId.trim()) {
    errorMessage.value = 'Solicitação de autorização ausente ou inválida.';
    loading.value = false;
    return;
  }

  try {
    [interaction.value, configuration.value] = await Promise.all([
      props.service.obterInteracaoAutorizacao(props.interactionId),
      props.service.obterConfiguracao(),
    ]);
  } catch {
    errorMessage.value = 'Não foi possível carregar esta solicitação. Ela pode ter expirado.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.consent-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background: radial-gradient(circle at top left, rgb(74 144 226 / 14%), transparent 36%), #f6f8fb;
  color: #16243a;
}

.consent-card {
  width: min(100%, 680px);
  padding: clamp(24px, 5vw, 44px);
  border: 1px solid #dbe3ee;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 24px 70px rgb(25 54 93 / 12%);
}

.consent-header h1 {
  margin: 8px 0;
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  line-height: 1.15;
}

.consent-header p,
.privacy-notice p {
  margin: 0;
  color: #53647b;
  line-height: 1.6;
}

.eyebrow {
  color: #2367c9;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.request-summary {
  display: grid;
  gap: 14px;
  margin: 28px 0;
}

.request-summary div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 16px;
}

.request-summary dt {
  color: #697991;
  font-size: 0.85rem;
  font-weight: 700;
}

.request-summary dd {
  display: grid;
  gap: 2px;
  margin: 0;
}

.request-summary dd span {
  color: #697991;
  font-size: 0.85rem;
}

.resource {
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.9rem;
}

.scope-section {
  padding: 20px;
  border-radius: 16px;
  background: #f5f8fc;
}

.scope-section h2 {
  margin: 0 0 12px;
  font-size: 1rem;
}

.scope-section ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 22px;
}

.privacy-notice {
  margin-top: 18px;
  padding: 16px 18px;
  border-left: 4px solid #d59a24;
  border-radius: 8px;
  background: #fff9ea;
}

.privacy-notice p + p {
  margin-top: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.actions button {
  min-height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.actions button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.allow-button {
  border: 1px solid #2367c9;
  background: #2367c9;
  color: #fff;
}

.deny-button {
  border: 1px solid #aeb9c8;
  background: #fff;
  color: #28394f;
}

.actions button:focus-visible {
  outline: 3px solid rgb(35 103 201 / 35%);
  outline-offset: 3px;
}

.status-message,
.error-message {
  margin: 24px 0 0;
  padding: 14px 16px;
  border-radius: 10px;
}

.status-message {
  background: #f1f5fa;
}

.error-message {
  background: #fff0f0;
  color: #9a2727;
}

@media (max-width: 540px) {
  .request-summary div {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions button {
    width: 100%;
  }
}
</style>
