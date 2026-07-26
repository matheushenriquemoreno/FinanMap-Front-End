/* eslint-disable @typescript-eslint/unbound-method */
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpConfiguration, McpConnectionSummary } from 'src/models/Mcp';
import McpService from 'src/services/McpService';
import IntegracaoIaConfig from './IntegracaoIaConfig.vue';

vi.mock('src/services/McpService', () => ({
  default: {
    obterConfiguracao: vi.fn(),
    listarConexoes: vi.fn(),
    listarHistorico: vi.fn(),
    revogarConexao: vi.fn(),
  },
}));

const configuration: McpConfiguration = {
  endpoint: 'https://api.finanmap.test/mcp',
  protocolRevision: '2025-11-25',
  sdkVersion: '1.4.1',
  authorization: {
    grantType: 'authorization_code',
    pkceMethod: 'S256',
    protectedResourceMetadataUrl: 'https://api.finanmap.test/.well-known/oauth-protected-resource',
    authorizationServerMetadataUrl:
      'https://api.finanmap.test/.well-known/oauth-authorization-server',
  },
  profiles: [
    { id: 'read_only', scopes: ['mcp:read', 'mcp:audit'] },
    {
      id: 'full_management',
      scopes: ['mcp:read', 'mcp:write', 'mcp:import', 'mcp:audit'],
    },
  ],
  features: {
    endpointEnabled: true,
    writeToolsEnabled: true,
    historyEnabled: true,
  },
};

const activeConnection: McpConnectionSummary = {
  id: 'connection-active',
  clientId: 'client-1',
  clientName: 'Agente de orçamento',
  scopes: ['mcp:read', 'mcp:audit'],
  status: 'active',
  createdAtUtc: '2026-07-25T20:00:00Z',
  lastUsedAtUtc: '2026-07-25T21:00:00Z',
};

const revokedConnection: McpConnectionSummary = {
  ...activeConnection,
  id: 'connection-revoked',
  clientId: 'client-2',
  clientName: 'Agente antigo',
  status: 'revoked',
  revokedAtUtc: '2026-07-25T22:00:00Z',
};

const invalidConnection: McpConnectionSummary = {
  ...activeConnection,
  id: 'connection-invalid',
  clientId: 'client-3',
  clientName: 'Agente com autorização inválida',
  status: 'invalid',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

function mountComponent() {
  return mount(IntegracaoIaConfig);
}

describe('IntegracaoIaConfig', () => {
  beforeEach(() => {
    vi.mocked(McpService.obterConfiguracao).mockResolvedValue(configuration);
    vi.mocked(McpService.listarConexoes).mockResolvedValue({ items: [] });
    vi.mocked(McpService.listarHistorico).mockResolvedValue({ items: [], nextCursor: null });
  });

  it('transita do carregamento para o estado desconectado sem sugerir credencial manual', async () => {
    const configurationRequest = deferred<typeof configuration>();
    const connectionsRequest = deferred<{ items: [] }>();
    vi.mocked(McpService.obterConfiguracao).mockReturnValue(configurationRequest.promise);
    vi.mocked(McpService.listarConexoes).mockReturnValue(connectionsRequest.promise);

    const wrapper = mountComponent();

    expect(wrapper.get('[data-testid="mcp-loading"]').text()).toContain('Carregando');

    configurationRequest.resolve(configuration);
    connectionsRequest.resolve({ items: [] });
    await flushPromises();

    expect(wrapper.get('[data-testid="mcp-empty"]').text()).toContain('Nenhum agente conectado');
    expect(wrapper.text()).not.toContain('token');
    expect(wrapper.text()).not.toContain('chave de API');
  });

  it('exibe status, escopos e exige confirmação antes de revogar uma conexão ativa', async () => {
    vi.mocked(McpService.listarConexoes).mockResolvedValue({
      items: [activeConnection, revokedConnection, invalidConnection],
    });
    vi.mocked(McpService.revogarConexao).mockResolvedValue({
      ...activeConnection,
      status: 'revoked',
      revokedAtUtc: '2026-07-25T23:00:00Z',
    });

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain('Agente de orçamento');
    expect(wrapper.text()).toContain('Ativa');
    expect(wrapper.text()).toContain('Somente leitura');
    expect(wrapper.text()).toContain('Agente antigo');
    expect(wrapper.text()).toContain('Revogada');
    expect(wrapper.text()).toContain('Agente com autorização inválida');
    expect(wrapper.text()).toContain('Inválida');

    await wrapper.get('[data-testid="revoke-connection-active"]').trigger('click');
    expect(wrapper.get('[data-testid="revoke-confirmation"]').text()).toContain(
      'Agente de orçamento',
    );
    expect(McpService.revogarConexao).not.toHaveBeenCalled();

    await wrapper.get('[data-testid="confirm-revoke"]').trigger('click');
    await flushPromises();

    expect(McpService.revogarConexao).toHaveBeenCalledWith('connection-active');
    expect(wrapper.find('[data-testid="revoke-connection-active"]').exists()).toBe(false);
  });

  it('apresenta falha recuperável e permite tentar carregar novamente', async () => {
    vi.mocked(McpService.obterConfiguracao).mockRejectedValueOnce(new Error('offline'));

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.get('[data-testid="mcp-error"]').text()).toContain('Não foi possível carregar');

    await wrapper.get('[data-testid="retry-load"]').trigger('click');
    await flushPromises();

    expect(McpService.obterConfiguracao).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-testid="mcp-empty"]').exists()).toBe(true);
  });

  it('apresenta endpoint, instrução neutra, consentimento externo e feedback de cópia', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.get('[data-testid="mcp-endpoint"]').text()).toContain(configuration.endpoint);
    expect(wrapper.text()).toContain('agente compatível com MCP');
    expect(wrapper.text()).toContain('Somente leitura');
    expect(wrapper.text()).toContain('Gestão completa');
    expect(wrapper.text()).toContain('fornecedor externo processará');

    await wrapper.get('[data-testid="copy-mcp-endpoint"]').trigger('click');
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(configuration.endpoint);
    expect(wrapper.get('[data-testid="copy-feedback"]').text()).toContain('Endpoint copiado');
  });

  it('mostra no histórico a ação, data, status e resumo seguro da chamada MCP', async () => {
    vi.mocked(McpService.listarHistorico).mockResolvedValue({
      items: [
        {
          id: 'event-1',
          correlationId: 'correlation-safe',
          connectionId: 'connection-active',
          toolName: 'financas.listar_categorias',
          operationClass: 'read',
          state: 'completed',
          startedAtUtc: '2026-07-25T21:30:00Z',
          finishedAtUtc: '2026-07-25T21:30:01Z',
          resultSummary: { summary: '3 categorias consultadas' },
          errorCodes: [],
        },
      ],
      nextCursor: null,
    });

    const wrapper = mountComponent();
    await flushPromises();

    expect(McpService.listarHistorico).toHaveBeenCalledWith({ limit: 10 });
    expect(wrapper.get('[data-testid="mcp-history"]').text()).toContain(
      'financas.listar_categorias',
    );
    expect(wrapper.get('[data-testid="mcp-history"]').text()).toContain('Concluída');
    expect(wrapper.get('[data-testid="mcp-history"]').text()).toContain('3 categorias consultadas');
    expect(wrapper.get('[data-testid="mcp-history"]').text()).toContain('25/07/2026');
  });

  it('informa quando as ferramentas de escrita estão indisponíveis', async () => {
    vi.mocked(McpService.obterConfiguracao).mockResolvedValue({
      ...configuration,
      features: {
        ...configuration.features,
        writeToolsEnabled: false,
      },
    });

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.get('[data-testid="mcp-write-disabled"]').text()).toContain('Somente leitura');
    expect(wrapper.get('[data-testid="mcp-write-disabled"]').text()).toContain('indisponíveis');
  });
});
