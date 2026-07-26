import { describe, expect, it, vi } from 'vitest';
import {
  authReturnQuery,
  navigateToMcpContinuation,
  resolvePostAuthenticationLocation,
  validateMcpApprovalContinuation,
  validateMcpDenialContinuation,
} from './McpAuthorizationFlow';

describe('retorno de autenticação MCP', () => {
  it('preserva somente um caminho interno durante login, cadastro e verificação', () => {
    const returnTo = '/mcp/authorize?mcpAuthorizationInteraction=interaction-signed-and-opaque';

    expect(authReturnQuery(returnTo)).toEqual({ returnTo });
    expect(resolvePostAuthenticationLocation({ returnTo })).toBe(returnTo);
    expect(resolvePostAuthenticationLocation({ returnTo: 'https://evil.example' })).toBe('/');
    expect(resolvePostAuthenticationLocation({ returnTo: '//evil.example/callback' })).toBe('/');
    expect(resolvePostAuthenticationLocation({ returnTo: ['/', '/admin'] })).toBe('/');
  });
});

describe('continuação OAuth MCP', () => {
  it('aceita aprovação apenas no endpoint OAuth da mesma origem do servidor FinanMap', () => {
    const continuation =
      'https://api.finanmap.com/oauth/authorize?interaction_id=interaction-1&client_id=agent';

    expect(
      validateMcpApprovalContinuation(
        continuation,
        'https://api.finanmap.com/.well-known/openid-configuration',
        'interaction-1',
      ),
    ).toBe(continuation);
    expect(
      validateMcpApprovalContinuation(
        'https://evil.example/oauth/authorize?interaction_id=interaction-1',
        'https://api.finanmap.com/.well-known/openid-configuration',
        'interaction-1',
      ),
    ).toBeNull();
    expect(
      validateMcpApprovalContinuation(
        'https://api.finanmap.com/oauth/token?interaction_id=interaction-1',
        'https://api.finanmap.com/.well-known/openid-configuration',
        'interaction-1',
      ),
    ).toBeNull();
    expect(
      validateMcpApprovalContinuation(
        'https://api.finanmap.com/oauth/authorize?interaction_id=other',
        'https://api.finanmap.com/.well-known/openid-configuration',
        'interaction-1',
      ),
    ).toBeNull();
  });

  it('aceita negativa somente no callback registrado e sem credenciais', () => {
    const redirectUri = 'https://agent.example/oauth/callback';
    const continuation =
      'https://agent.example/oauth/callback?error=access_denied&state=opaque-state';

    expect(validateMcpDenialContinuation(continuation, redirectUri, 'opaque-state')).toBe(
      continuation,
    );
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/other?error=access_denied',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://evil.example/oauth/callback?error=access_denied',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/oauth/callback?code=secret&error=access_denied',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/oauth/callback?tenant=other&error=access_denied',
        'https://agent.example/oauth/callback?tenant=registered',
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/oauth/callback?error=access_denied',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/oauth/callback?error=access_denied&state=other',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/oauth/callback?error=access_denied&state=opaque-state&code_challenge=secret',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation(
        'https://agent.example/oauth/callback?error=access_denied&state=opaque-state&code_challenge_method=S256',
        redirectUri,
        'opaque-state',
      ),
    ).toBeNull();
    expect(
      validateMcpDenialContinuation('javascript:alert(1)', redirectUri, 'opaque-state'),
    ).toBeNull();
  });

  it('navega apenas com uma URL já validada e não persiste token', () => {
    const navigate = vi.fn();

    navigateToMcpContinuation('https://agent.example/callback?error=access_denied', navigate);

    expect(navigate).toHaveBeenCalledWith('https://agent.example/callback?error=access_denied');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
