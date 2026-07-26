import { describe, expect, it } from 'vitest';
import type { RouteLocationNormalized } from 'vue-router';
import routes from './routes';

describe('rota de consentimento MCP', () => {
  it('materializa a interação opaca recebida no query param sem tratar token', () => {
    const route = routes.find((candidate) => candidate.name === 'McpAuthorizationConsent');

    expect(route?.path).toBe('/mcp/authorize');
    expect(typeof route?.props).toBe('function');

    const mapProps = route?.props as (route: RouteLocationNormalized) => {
      interactionId: string;
    };
    const props = mapProps({
      query: { mcpAuthorizationInteraction: 'signed-interaction' },
    } as unknown as RouteLocationNormalized);

    expect(props).toEqual({ interactionId: 'signed-interaction' });
    expect(JSON.stringify(props)).not.toMatch(/accessToken|refreshToken/i);
  });
});
