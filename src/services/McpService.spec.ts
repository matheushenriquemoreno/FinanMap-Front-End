import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { McpService } from './McpService';

function createAxiosMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
  } as unknown as Pick<AxiosInstance, 'get' | 'post'>;
}

describe('McpService', () => {
  it('consome somente os contratos REST autenticados definidos para o frontend', async () => {
    const axios = createAxiosMock();
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: { enabled: true } })
      .mockResolvedValueOnce({ data: { items: [] } })
      .mockResolvedValueOnce({ data: { id: 'connection-1' } })
      .mockResolvedValueOnce({ data: { items: [], nextCursor: null } })
      .mockResolvedValueOnce({ data: { id: 'event-1' } });
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { id: 'connection-1', status: 'revoked' },
    });
    const service = new McpService(axios);

    await service.obterConfiguracao();
    await service.listarConexoes();
    await service.obterConexao('connection-1');
    await service.revogarConexao('connection-1');
    await service.listarHistorico({ status: 'completed', cursor: 'next' });
    await service.obterEventoHistorico('event-1');

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/mcp\/configuration$/),
    );
    expect(axios.get).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/api\/mcp\/connections$/));
    expect(axios.get).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/\/api\/mcp\/connections\/connection-1$/),
    );
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/mcp\/connections\/connection-1\/revoke$/),
      undefined,
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      4,
      expect.stringMatching(/\/api\/mcp\/audit-events$/),
      { params: { status: 'completed', cursor: 'next' } },
    );
    expect(axios.get).toHaveBeenNthCalledWith(
      5,
      expect.stringMatching(/\/api\/mcp\/audit-events\/event-1$/),
    );
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('consome o fluxo de consentimento e devolve somente a URL de continuação do header', async () => {
    const axios = createAxiosMock();
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        id: 'interaction/1',
        clientId: 'desktop-agent',
        clientName: 'Agente Financeiro',
        redirectUri: 'https://agent.example/callback',
        state: 'opaque',
        requestedScopes: ['mcp:read', 'mcp:audit'],
        status: 'pending',
        expiresAtUtc: '2026-07-26T15:00:00Z',
      },
    });
    vi.mocked(axios.post)
      .mockResolvedValueOnce({
        data: { id: 'connection-1', status: 'active' },
        headers: {
          'x-mcp-authorization-continue':
            'https://api.finanmap.com/oauth/authorize?interaction_id=interaction%2F1',
        },
      })
      .mockResolvedValueOnce({
        data: undefined,
        headers: {
          'x-mcp-authorization-continue':
            'https://agent.example/callback?error=access_denied&state=opaque',
        },
      });
    const service = new McpService(axios);

    const interaction = await service.obterInteracaoAutorizacao('interaction/1');
    const approved = await service.aprovarInteracaoAutorizacao('interaction/1', [
      'mcp:read',
      'mcp:audit',
    ]);
    const denied = await service.negarInteracaoAutorizacao('interaction/1');

    expect(interaction.redirectUri).toBe('https://agent.example/callback');
    expect(interaction.state).toBe('opaque');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/mcp\/authorization-interactions\/interaction%2F1$/),
    );
    expect(axios.post).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/api\/mcp\/authorization-interactions\/interaction%2F1\/approve$/),
      { scopes: ['mcp:read', 'mcp:audit'] },
    );
    expect(axios.post).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/mcp\/authorization-interactions\/interaction%2F1\/deny$/),
    );
    expect(approved.continueUrl).toContain('/oauth/authorize');
    expect(denied.continueUrl).toContain('error=access_denied');
    expect(JSON.stringify(approved)).not.toMatch(/accessToken|refreshToken/i);
    expect(JSON.stringify(denied)).not.toMatch(/accessToken|refreshToken/i);
  });
});
