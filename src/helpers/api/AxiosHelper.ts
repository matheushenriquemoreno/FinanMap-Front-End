import type { AxiosError } from "axios";
import axios from "axios";
import { notificarErro, notificarInfo } from "../Notificacao";

interface ApiResultError {
  errors: string[]
}

interface MultiStatusResponse extends ApiResultError {
  quantidadeSucesso: number;
  quantidadeErros: number;
}

const TIMEOUT_MS = 30000;
const ERROR_MESSAGES = {
  network: 'Atualmente o servidor está indisponível. Tente novamente mais tarde.',
  timeout: 'O tempo limite da requisição foi excedido. Verifique sua conexão com a internet e tente novamente.',
  unauthorized: 'Por favor realizar o login novamente!',
  server: 'Ocorreu um erro inesperado, tente novamente mais tarde!',
  ssl: 'Ocorreu um erro de segurança na conexão. Tente novamente mais tarde.',
  tooManyRequests: 'Muitas requisições simultâneas. Aguarde um momento e tente novamente.'
};

export function CreateIntanceAxios() {
  const AxiosInstance = axios.create({
    headers: { 'Content-Type': 'application/json' },
    timeout: TIMEOUT_MS, // Tempo limite de 30 segundos para a requisição
  });

  AxiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  AxiosInstance.interceptors.response.use(
    (response) => response, // Se a resposta for bem-sucedida, retorna normalmente
    (error: AxiosError) => {

      // Tratamento específico para erros de rede
      if (isNetworkError(error)) {
        const message = getNetworkErrorMessage(error);
        notificarInfo(message);
        return Promise.reject(error);
      }

      // Tratamento baseado em status HTTP
      return handleHttpStatusError(error);
    }
  );

  return AxiosInstance;
}

/**
 * Verifica se o erro é um erro de rede
 * @param {AxiosError} error Erro do Axios
 * @returns {boolean} Verdadeiro se for erro de rede
 */
function isNetworkError(error: AxiosError): boolean {
  // Verifica se não há resposta (indicando erro de rede)
  if (error.response === undefined) {
    return true;
  }

  // Lista de códigos de erro de rede
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

  return networkErrorCodes.includes(error.code as string);
}

/**
 * Determina a mensagem apropriada para o erro de rede
 * @param {AxiosError} error Erro do Axios
 * @returns {string} Mensagem de erro apropriada
 */
function getNetworkErrorMessage(error: AxiosError): string {
  const { code, message } = error;

  // Erros de timeout
  if (code === 'ETIMEDOUT' || code === 'ECONNABORTED' ||
    code === 'ERR_CONNECTION_TIMED_OUT' || message?.includes('timeout')) {
    return ERROR_MESSAGES.timeout;
  }

  // Erros de SSL/TLS
  if (code?.includes('SSL') || code?.includes('CERT') || code?.includes('TLS')) {
    return ERROR_MESSAGES.ssl;
  }

  // Erros de DNS e todos os outros erros de rede usam a mensagem genérica
  return ERROR_MESSAGES.network;
}

/**
 * Trata erros baseados em código de status HTTP
 * @param {AxiosError} error Erro do Axios
 * @returns {Promise<never>} Uma Promise rejeitada
 */
function handleHttpStatusError(error: AxiosError): Promise<never> {
  const statusCode = error.response?.status;

  if (statusCode === undefined || statusCode === null) {
    return Promise.reject(error);
  }

  // Erros de autenticação/autorização
  if (statusCode === 401 || statusCode === 403) {
    notificarInfo(ERROR_MESSAGES.unauthorized);
    localStorage.removeItem("token");
    window.location.href = process.env.LOGIN_URL ?? '/login';
  }
  // Erros do lado do servidor
  else if (statusCode >= 500) {
    notificarErro(ERROR_MESSAGES.server);
  }
  // Erros específicos do cliente podem ser adicionados aqui (4xx)
  else if (statusCode === 429) {
    notificarInfo(ERROR_MESSAGES.tooManyRequests);
  }

  return Promise.reject(error);
}



export function handleErrorAxios(error: unknown): void {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status ?? null;

    // Tratamento específico para erros de rede
    if (isNetworkError(error)) {
      const message = getNetworkErrorMessage(error);
      notificarInfo(message);
      return;
    }

    if (statusCode === 400 || statusCode === 422 || statusCode === 404) {
      const result = error.response?.data as ApiResultError;

      notificarInfo(result.errors.join('\n'))
    }
    else if (statusCode === 207) {

      const result = error.response?.data as MultiStatusResponse;

      notificarInfo(`Solicitação com sucesso parcial, houve ${result.quantidadeSucesso} sucessos e ${result.quantidadeErros} erros.`)
      notificarErro(result.errors.join('\n'))
    }

    return;
  }
}

