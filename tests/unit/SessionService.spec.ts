import { beforeEach, describe, expect, it } from 'vitest';
import { sessionService } from 'src/services/SessionService';

describe('SessionService', () => {
  beforeEach(() => sessionService.clear());

  it('mantém credenciais apenas durante a sessão em memória e permite rotação', () => {
    sessionService.start(
      { token: 'access-1', refreshToken: 'refresh-1' },
      { userName: 'Ana', userEmail: 'ana@example.com' },
    );

    expect(sessionService.hasSession()).toBe(true);
    expect(sessionService.getAccessToken()).toBe('access-1');
    expect(sessionService.getIdentity()).toEqual({
      userName: 'Ana',
      userEmail: 'ana@example.com',
    });

    sessionService.updateTokens({ token: 'access-2', refreshToken: 'refresh-2' });
    expect(sessionService.getAccessToken()).toBe('access-2');
    expect(sessionService.getRefreshToken()).toBe('refresh-2');

    sessionService.clear();
    expect(sessionService.hasSession()).toBe(false);
    expect(sessionService.getIdentity()).toEqual({});
  });
});
