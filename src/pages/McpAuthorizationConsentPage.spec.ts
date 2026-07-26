import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import McpAuthorizationConsentPage from './McpAuthorizationConsentPage.vue';

const interaction = {
  id: 'interaction-1',
  clientId: 'desktop-agent',
  clientName: 'Agente Financeiro',
  redirectUri: 'https://agent.example/oauth/callback',
  state: 'opaque-state',
  requestedScopes: ['mcp:read', 'mcp:audit'],
  status: 'pending' as const,
  expiresAtUtc: '2099-07-26T15:00:00Z',
};

const configuration = {
  endpoint: 'https://api.finanmap.com/mcp',
  protocolRevision: '2025-06-18',
  sdkVersion: '1.0.0',
  authorization: {
    grantType: 'authorization_code' as const,
    pkceMethod: 'S256' as const,
    protectedResourceMetadataUrl: 'https://api.finanmap.com/.well-known/oauth-protected-resource',
    authorizationServerMetadataUrl: 'https://api.finanmap.com/.well-known/openid-configuration',
  },
  profiles: [],
  features: {
    endpointEnabled: true,
    writeToolsEnabled: false,
    historyEnabled: true,
  },
};

function createService() {
  return {
    obterInteracaoAutorizacao: vi.fn().mockResolvedValue(interaction),
    obterConfiguracao: vi.fn().mockResolvedValue(configuration),
    aprovarInteracaoAutorizacao: vi.fn().mockResolvedValue({
      continueUrl:
        'https://api.finanmap.com/oauth/authorize?interaction_id=interaction-1&client_id=desktop-agent',
      connection: { id: 'connection-1', status: 'active' },
    }),
    negarInteracaoAutorizacao: vi.fn().mockResolvedValue({
      continueUrl: 'https://agent.example/oauth/callback?error=access_denied&state=opaque-state',
    }),
  };
}

describe('McpAuthorizationConsentPage', () => {
  beforeEach(() => localStorage.clear());

  it('materializa cliente, resource, escopos e aviso de processamento externo', async () => {
    const service = createService();
    const wrapper = mount(McpAuthorizationConsentPage, {
      props: { interactionId: interaction.id, service },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Agente Financeiro');
    expect(wrapper.text()).toContain('desktop-agent');
    expect(wrapper.text()).toContain('https://api.finanmap.com/mcp');
    expect(wrapper.text()).toContain('Consultar seus dados financeiros');
    expect(wrapper.text()).toContain('Consultar seu histórico de atividades MCP');
    expect(wrapper.text()).toContain('provedor externo');
    expect(wrapper.text()).toContain('conta financeira individual');
    expect(wrapper.text()).not.toMatch(/access[_ ]?token|refresh[_ ]?token/i);
  });

  it('aprova os escopos exibidos e navega somente pela continuação validada', async () => {
    const service = createService();
    const onContinue = vi.fn();
    const wrapper = mount(McpAuthorizationConsentPage, {
      props: { interactionId: interaction.id, service, onContinue },
    });
    await flushPromises();

    await wrapper.get('[data-testid="mcp-consent-allow"]').trigger('click');
    await flushPromises();

    expect(service.aprovarInteracaoAutorizacao).toHaveBeenCalledWith(interaction.id, [
      'mcp:read',
      'mcp:audit',
    ]);
    expect(onContinue).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/api\.finanmap\.com\/oauth\/authorize\?/),
    );
    expect(localStorage.length).toBe(0);
  });

  it('nega, redireciona ao callback registrado e falha fechado para URL arbitrária', async () => {
    const service = createService();
    const onContinue = vi.fn();
    const wrapper = mount(McpAuthorizationConsentPage, {
      props: { interactionId: interaction.id, service, onContinue },
    });
    await flushPromises();

    await wrapper.get('[data-testid="mcp-consent-deny"]').trigger('click');
    await flushPromises();

    expect(service.negarInteracaoAutorizacao).toHaveBeenCalledWith(interaction.id);
    expect(onContinue).toHaveBeenCalledWith(
      'https://agent.example/oauth/callback?error=access_denied&state=opaque-state',
    );

    service.aprovarInteracaoAutorizacao.mockResolvedValueOnce({
      continueUrl: 'https://evil.example/oauth/authorize?interaction_id=interaction-1',
    });
    onContinue.mockClear();
    await wrapper.get('[data-testid="mcp-consent-allow"]').trigger('click');
    await flushPromises();

    expect(onContinue).not.toHaveBeenCalled();
    expect(wrapper.get('[role="alert"]').text()).toContain('continuação segura');
  });
});
