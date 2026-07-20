import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { refreshTokenManager } from 'src/services/RefreshTokenManager';
import { sessionService } from 'src/services/SessionService';
import { apiClient } from 'src/services/api/AxiosHelper';

function jwtValido(id: string) {
  const payload = window.btoa(JSON.stringify({ exp: 4_102_444_800, id })).replaceAll('=', '');
  return `header.${payload}.signature`;
}

describe('apiClient', () => {
  beforeEach(() => {
    sessionService.clear();
    localStorage.clear();
  });
  afterEach(() => vi.restoreAllMocks());

  it('força um único refresh após 401 e repete a requisição com o token rotacionado', async () => {
    const tokenAnterior = jwtValido('anterior');
    sessionService.start({ token: tokenAnterior, refreshToken: 'refresh-1' });
    const tokenRotacionado = jwtValido('rotacionado');
    vi.spyOn(refreshTokenManager, 'refreshIfNeeded').mockResolvedValue(null);
    const refresh = vi.spyOn(refreshTokenManager, 'refresh').mockImplementation(async () => {
      const result = {
        token: tokenRotacionado,
        refreshToken: 'refresh-2',
        nomeUsuario: 'Ana',
      };
      sessionService.updateTokens(result);
      return result;
    });

    const autorizacoes: Array<string | undefined> = [];
    let chamadas = 0;
    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
      chamadas += 1;
      autorizacoes.push(config.headers.Authorization?.toString());
      if (chamadas === 1) {
        throw new AxiosError('Não autorizado', 'ERR_BAD_REQUEST', config, undefined, {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        });
      }
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
    };

    await expect(apiClient.get('probe', { adapter })).resolves.toMatchObject({
      data: { ok: true },
    });
    expect(refresh).toHaveBeenCalledOnce();
    expect(chamadas).toBe(2);
    expect(autorizacoes).toEqual([`Bearer ${tokenAnterior}`, `Bearer ${tokenRotacionado}`]);
  });

  it('não consulta nem envia a sessão em endpoints públicos', async () => {
    sessionService.start({ token: jwtValido('privado'), refreshToken: 'refresh-1' });
    localStorage.setItem('proprietarioIdAtivo', 'owner-123');
    const refreshIfNeeded = vi.spyOn(refreshTokenManager, 'refreshIfNeeded');
    let authorization: string | undefined;
    let ownerId: string | undefined;
    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
      authorization = config.headers.Authorization?.toString();
      ownerId = config.headers['X-Proprietario-Id']?.toString();
      return { data: {}, status: 204, statusText: 'No Content', headers: {}, config };
    };

    await apiClient.post('login', {}, { adapter, skipSession: true });

    expect(refreshIfNeeded).not.toHaveBeenCalled();
    expect(authorization).toBeUndefined();
    expect(ownerId).toBeUndefined();
  });
});
