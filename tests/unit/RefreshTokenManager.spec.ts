import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService, type LoginResult } from 'src/services/AuthService';
import { refreshTokenManager } from 'src/services/RefreshTokenManager';
import { sessionService } from 'src/services/SessionService';

function jwtComExpiracao(exp: number) {
  const payload = window.btoa(JSON.stringify({ exp })).replaceAll('=', '');
  return `header.${payload}.signature`;
}

describe('RefreshTokenManager', () => {
  beforeEach(() => sessionService.clear());
  afterEach(() => vi.restoreAllMocks());

  it('deduplica refresh concorrente e publica os tokens rotacionados', async () => {
    sessionService.start({ token: jwtComExpiracao(1), refreshToken: 'refresh-antigo' });
    let concluirRefresh: ((result: LoginResult) => void) | undefined;
    const resposta = new Promise<LoginResult>((resolve) => {
      concluirRefresh = resolve;
    });
    const refresh = vi.spyOn(AuthService.prototype, 'refreshToken').mockReturnValue(resposta);

    const primeiraChamada = refreshTokenManager.refreshIfNeeded();
    const segundaChamada = refreshTokenManager.refreshIfNeeded();

    expect(refresh).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledWith('refresh-antigo');

    const resultado = {
      token: jwtComExpiracao(4_102_444_800),
      refreshToken: 'refresh-novo',
      nomeUsuario: 'Ana',
    };
    concluirRefresh?.(resultado);

    await expect(primeiraChamada).resolves.toEqual(resultado);
    await expect(segundaChamada).resolves.toEqual(resultado);
    expect(sessionService.getAccessToken()).toBe(resultado.token);
    expect(sessionService.getRefreshToken()).toBe('refresh-novo');
  });

  it('limpa sessão em erros de autenticação, mas preserva em falhas temporárias', () => {
    const erro401 = new AxiosError('Não autorizado');
    Object.assign(erro401, { response: { status: 401 } });
    const erro500 = new AxiosError('Servidor indisponível');
    Object.assign(erro500, { response: { status: 500 } });
    const erroRede = new AxiosError('Falha de rede');

    expect(refreshTokenManager.shouldClearTokenOnRefreshError(erro401)).toBe(true);
    expect(refreshTokenManager.shouldClearTokenOnRefreshError(erro500)).toBe(false);
    expect(refreshTokenManager.shouldClearTokenOnRefreshError(erroRede)).toBe(false);
    expect(refreshTokenManager.shouldClearTokenOnRefreshError(new Error('Contrato inválido'))).toBe(
      true,
    );
  });
});
