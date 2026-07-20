import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { notificarErro, notificarInfo } from '../../helpers/Notificacao';
import { refreshTokenManager } from '../RefreshTokenManager';
import { sessionService } from '../SessionService';
import { getApiBaseUrl } from './ApiConfig';

interface ApiResultError {
  errors: string[];
}

interface MultiStatusResponse extends ApiResultError {
  quantidadeSucesso: number;
  quantidadeErros: number;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

declare module 'axios' {
  interface AxiosRequestConfig {
    skipSession?: boolean;
  }

  interface InternalAxiosRequestConfig {
    skipSession?: boolean;
  }
}

const TIMEOUT_MS = 30000;
const ERROR_MESSAGES = {
  network: 'Atualmente o servidor está indisponível. Tente novamente mais tarde.',
  timeout:
    'O tempo limite da requisição foi excedido. Verifique sua conexão com a internet e tente novamente.',
  unauthorized: 'Por favor realizar o login novamente!',
  server: 'Ocorreu um erro inesperado, tente novamente mais tarde!',
  ssl: 'Ocorreu um erro de segurança na conexão. Tente novamente mais tarde.',
  tooManyRequests: 'Muitas requisições simultâneas. Aguarde um momento e tente novamente.',
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT_MS,
});

apiClient.interceptors.request.use(
  async (config) => {
    if (!config.skipSession) {
      try {
        await refreshTokenManager.refreshIfNeeded();
      } catch (error) {
        if (refreshTokenManager.shouldClearTokenOnRefreshError(error)) {
          refreshTokenManager.clearTokens();
          window.location.href = process.env.LOGIN_URL ?? '/#/login';
          return Promise.reject(error instanceof Error ? error : new Error(String(error)));
        }
      }

      const token = sessionService.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;

      const proprietarioIdAtivo = localStorage.getItem('proprietarioIdAtivo');
      if (proprietarioIdAtivo) config.headers['X-Proprietario-Id'] = proprietarioIdAtivo;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (isNetworkError(error)) {
      notificarInfo(getNetworkErrorMessage(error));
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (originalRequest?.skipSession) return Promise.reject(error);

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const result = await refreshTokenManager.refresh();
        const token = result.token;

        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        if (!refreshTokenManager.shouldClearTokenOnRefreshError(refreshError)) {
          return Promise.reject(
            refreshError instanceof Error ? refreshError : new Error(String(refreshError)),
          );
        }
      }
    }

    return handleHttpStatusError(error);
  },
);

export function CreateIntanceAxios(): AxiosInstance {
  return apiClient;
}

function isNetworkError(error: AxiosError): boolean {
  if (error.response === undefined) return true;

  const networkErrorCodes = [
    'ERR_CONNECTION_CLOSED',
    'ERR_NETWORK',
    'ECONNABORTED',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ERR_CONNECTION_TIMED_OUT',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'ERR_SSL_PROTOCOL_ERROR',
    'ERR_BAD_SSL_CLIENT_AUTH_CERT',
    'CERT_HAS_EXPIRED',
    'ERR_TLS_CERT_ALTNAME_INVALID',
    'ERR_NAME_NOT_RESOLVED',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_CERT_AUTHORITY_INVALID',
  ];

  return networkErrorCodes.includes(error.code ?? '');
}

function getNetworkErrorMessage(error: AxiosError): string {
  const { code, message } = error;

  if (
    code === 'ETIMEDOUT' ||
    code === 'ECONNABORTED' ||
    code === 'ERR_CONNECTION_TIMED_OUT' ||
    message?.includes('timeout')
  ) {
    return ERROR_MESSAGES.timeout;
  }

  if (code?.includes('SSL') || code?.includes('CERT') || code?.includes('TLS')) {
    return ERROR_MESSAGES.ssl;
  }

  return ERROR_MESSAGES.network;
}

function handleHttpStatusError(error: AxiosError): Promise<never> {
  const statusCode = error.response?.status;

  if (statusCode === undefined) return Promise.reject(error);

  if (statusCode === 401) {
    notificarInfo(ERROR_MESSAGES.unauthorized);
    sessionService.clear();
    window.location.href = process.env.LOGIN_URL ?? '/#/login';
  } else if (statusCode === 403) {
    notificarErro('Você não tem permissão para realizar esta ação.');
  } else if (statusCode >= 500) {
    notificarErro(ERROR_MESSAGES.server);
  } else if (statusCode === 429) {
    notificarInfo(ERROR_MESSAGES.tooManyRequests);
  }

  handleErrorStatusCode(error, statusCode);
  return Promise.reject(error);
}

export function handleErrorAxios(error: unknown): void {
  if (!axios.isAxiosError(error)) return;

  if (isNetworkError(error)) {
    notificarInfo(getNetworkErrorMessage(error));
    return;
  }

  handleErrorStatusCode(error, error.response?.status ?? null);
}

function handleErrorStatusCode(error: AxiosError, statusCode: number | null): void {
  if (statusCode === 400 || statusCode === 422 || statusCode === 404) {
    const result = error.response?.data as ApiResultError;
    notificarErro(result.errors.join('\n'));
  } else if (statusCode === 207) {
    const result = error.response?.data as MultiStatusResponse;
    notificarInfo(
      `Solicitação com sucesso parcial, houve ${result.quantidadeSucesso} sucessos e ${result.quantidadeErros} erros.`,
    );
    notificarErro(result.errors.join('\n'));
  }
}
