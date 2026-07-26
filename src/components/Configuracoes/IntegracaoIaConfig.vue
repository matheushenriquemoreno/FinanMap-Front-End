<template>
  <section aria-labelledby="integracao-ia-title">
    <div class="q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <q-icon name="smart_toy" color="primary" size="sm" />
        <h2 id="integracao-ia-title" class="text-h5 text-weight-bold q-my-none">
          Integração com IA
        </h2>
      </div>
      <p class="text-body2 text-grey-7 q-mb-none q-mt-sm">
        Conecte um agente compatível com MCP à sua conta individual.
      </p>
    </div>

    <div
      v-if="loading"
      data-testid="mcp-loading"
      class="column items-center q-gutter-sm q-py-xl"
      role="status"
      aria-live="polite"
    >
      <q-spinner color="primary" size="32px" />
      <span>Carregando integração com IA...</span>
    </div>

    <q-banner
      v-else-if="loadError"
      data-testid="mcp-error"
      class="bg-red-1 text-negative rounded-borders"
    >
      <div class="row items-center justify-between q-gutter-sm">
        <span>Não foi possível carregar a integração com IA.</span>
        <q-btn
          data-testid="retry-load"
          flat
          no-caps
          color="negative"
          label="Tentar novamente"
          @click="loadIntegration"
        />
      </div>
    </q-banner>

    <template v-else>
      <q-banner
        v-if="configuration && !configuration.features.endpointEnabled"
        class="bg-orange-1 text-grey-9 rounded-borders q-mb-md"
        role="status"
      >
        A integração com IA está temporariamente indisponível.
      </q-banner>

      <q-banner
        v-if="configuration && !configuration.features.writeToolsEnabled"
        data-testid="mcp-write-disabled"
        class="bg-orange-1 text-grey-9 rounded-borders q-mb-md"
        role="status"
      >
        As ferramentas de escrita estão indisponíveis no momento. Use o perfil
        <strong>Somente leitura</strong>.
      </q-banner>

      <q-card v-if="configuration" flat bordered class="rounded-borders q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">Como conectar</div>
          <ol class="text-body2 q-pl-lg q-mb-md">
            <li>Abra as configurações de MCP no agente compatível de sua preferência.</li>
            <li>Informe o endpoint abaixo e inicie a conexão.</li>
            <li>Conclua a autorização no navegador com sua conta FinanMap.</li>
          </ol>

          <div class="text-caption text-grey-7 q-mb-xs">Endpoint MCP</div>
          <div class="row items-center no-wrap q-gutter-sm">
            <code data-testid="mcp-endpoint" class="mcp-endpoint col rounded-borders q-pa-sm">{{
              configuration.endpoint
            }}</code>
            <q-btn
              data-testid="copy-mcp-endpoint"
              round
              flat
              color="primary"
              icon="content_copy"
              aria-label="Copiar endpoint MCP"
              @click="copyEndpoint"
            />
          </div>
          <div
            data-testid="copy-feedback"
            class="text-caption text-positive q-mt-xs"
            role="status"
            aria-live="polite"
          >
            {{ copyFeedback }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 text-weight-bold q-mb-sm">Perfis disponíveis</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="profile in configuration.profiles"
              :key="profile.id"
              class="col-12 col-sm-6"
            >
              <div class="profile-option rounded-borders q-pa-sm">
                <div class="text-weight-medium">
                  {{ profile.id === 'read_only' ? 'Somente leitura' : 'Gestão completa' }}
                </div>
                <div class="text-caption text-grey-7">
                  {{
                    profile.id === 'read_only'
                      ? 'Consultas e histórico.'
                      : 'Consultas, alterações e importações, sempre com confirmação.'
                  }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="configuration"
        class="bg-blue-1 text-grey-9 rounded-borders q-mb-md"
        role="note"
      >
        Ao autorizar, o fornecedor externo processará os dados retornados conforme os termos e a
        política de privacidade do agente escolhido.
      </q-banner>

      <McpQueryGuides
        v-if="configuration"
        :write-tools-enabled="configuration.features.writeToolsEnabled"
      />

      <McpWriteGuides v-if="configuration?.features.writeToolsEnabled" />

      <q-card
        v-if="connections.length === 0"
        data-testid="mcp-empty"
        flat
        bordered
        class="rounded-borders q-pa-lg q-mt-md text-center"
      >
        <q-icon name="link_off" size="40px" color="grey-6" />
        <div class="text-subtitle1 text-weight-medium q-mt-sm">Nenhum agente conectado</div>
        <p class="text-body2 text-grey-7 q-mb-none">
          A conexão será criada quando você autorizar sua conta no fluxo seguro do agente.
        </p>
      </q-card>

      <div v-else class="column q-gutter-md">
        <q-card
          v-for="connection in connections"
          :key="connection.id"
          flat
          bordered
          class="rounded-borders"
        >
          <q-card-section>
            <div class="row items-start justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">{{ connection.clientName }}</div>
                <div class="text-caption text-grey-7">
                  {{ profileLabel(connection.scopes) }}
                </div>
              </div>
              <q-badge
                :color="statusPresentation(connection.status).color"
                :label="statusPresentation(connection.status).label"
              >
                {{ statusPresentation(connection.status).label }}
              </q-badge>
            </div>

            <div class="row q-col-gutter-md q-mt-sm text-caption text-grey-7">
              <div class="col-12 col-sm-6">Criada em {{ formatDate(connection.createdAtUtc) }}</div>
              <div v-if="connection.lastUsedAtUtc" class="col-12 col-sm-6">
                Último uso em {{ formatDate(connection.lastUsedAtUtc) }}
              </div>
            </div>
          </q-card-section>

          <q-card-actions v-if="connection.status === 'active'" align="right">
            <q-btn
              :data-testid="`revoke-${connection.id}`"
              flat
              no-caps
              color="negative"
              label="Revogar conexão"
              @click="connectionPendingRevocation = connection"
            />
          </q-card-actions>
        </q-card>
      </div>

      <q-banner
        v-if="connectionPendingRevocation"
        data-testid="revoke-confirmation"
        class="bg-orange-1 text-grey-9 rounded-borders q-mt-md"
      >
        Revogar o acesso de <strong>{{ connectionPendingRevocation.clientName }}</strong
        >? Novas chamadas serão bloqueadas imediatamente.
        <div class="row justify-end q-gutter-sm q-mt-sm">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="revoking"
            @click="connectionPendingRevocation = null"
          />
          <q-btn
            data-testid="confirm-revoke"
            unelevated
            no-caps
            color="negative"
            label="Confirmar revogação"
            :loading="revoking"
            @click="revokeConnection"
          />
        </div>
      </q-banner>

      <q-banner
        v-if="revocationError"
        class="bg-red-1 text-negative rounded-borders q-mt-md"
        role="alert"
      >
        Não foi possível revogar a conexão. Tente novamente.
      </q-banner>

      <McpAuditHistory v-if="configuration?.features.historyEnabled" />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { McpConfiguration, McpConnectionStatus, McpConnectionSummary } from 'src/models/Mcp';
import McpService from 'src/services/McpService';
import { onMounted, ref } from 'vue';
import McpAuditHistory from './McpAuditHistory.vue';
import McpQueryGuides from './McpQueryGuides.vue';
import McpWriteGuides from './McpWriteGuides.vue';

const loading = ref(true);
const loadError = ref(false);
const configuration = ref<McpConfiguration | null>(null);
const connections = ref<McpConnectionSummary[]>([]);
const connectionPendingRevocation = ref<McpConnectionSummary | null>(null);
const revoking = ref(false);
const revocationError = ref(false);
const copyFeedback = ref('');

async function loadIntegration() {
  loading.value = true;
  loadError.value = false;
  try {
    const [configurationResponse, connectionResponse] = await Promise.all([
      McpService.obterConfiguracao(),
      McpService.listarConexoes(),
    ]);
    configuration.value = configurationResponse;
    connections.value = connectionResponse.items;
  } catch {
    loadError.value = true;
    configuration.value = null;
    connections.value = [];
  } finally {
    loading.value = false;
  }
}

async function revokeConnection() {
  if (!connectionPendingRevocation.value) return;

  revoking.value = true;
  revocationError.value = false;
  try {
    const revokedConnection = await McpService.revogarConexao(connectionPendingRevocation.value.id);
    connections.value = connections.value.map((connection) =>
      connection.id === revokedConnection.id ? revokedConnection : connection,
    );
    connectionPendingRevocation.value = null;
  } catch {
    revocationError.value = true;
  } finally {
    revoking.value = false;
  }
}

async function copyEndpoint() {
  if (!configuration.value) return;

  copyFeedback.value = '';
  try {
    await navigator.clipboard.writeText(configuration.value.endpoint);
    copyFeedback.value = 'Endpoint copiado.';
  } catch {
    copyFeedback.value = 'Não foi possível copiar. Selecione o endpoint manualmente.';
  }
}

function profileLabel(scopes: string[]): string {
  return scopes.includes('mcp:write') || scopes.includes('mcp:import')
    ? 'Gestão completa'
    : 'Somente leitura';
}

function statusPresentation(status: McpConnectionStatus): { label: string; color: string } {
  const presentation: Record<McpConnectionStatus, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'warning' },
    active: { label: 'Ativa', color: 'positive' },
    invalid: { label: 'Inválida', color: 'negative' },
    revoked: { label: 'Revogada', color: 'grey-7' },
  };
  return presentation[status];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

onMounted(loadIntegration);
</script>

<style scoped>
.mcp-endpoint {
  display: block;
  min-width: 0;
  overflow-wrap: anywhere;
  background: rgba(127, 127, 127, 0.12);
}

.profile-option {
  height: 100%;
  border: 1px solid rgba(127, 127, 127, 0.25);
}
</style>
