import type { AxiosError } from "axios";
import axios from "axios";
import { Notify } from 'quasar'


export function CreateIntanceAxios() {
  const AxiosInstance = axios.create({
    headers: { "Content-Type": "application/json" },
  });

  // Interceptor para adicionar o token JWT nos headers
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
      const statusCode = error.response?.status ?? null;

      if (statusCode === null)
        return Promise.reject(error);

      if (statusCode === 401 || statusCode === 403) {
        Notify.create({
          message: 'Por favor realizar o login novamente!',
          type: 'negative',
          position: 'top',
          timeout: 10000,
        });
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (statusCode >= 500) {
        Notify.create({
          message: 'Ocorreu um erro inesperado, tente novamente mais tarde!',
          type: 'negative',
          position: 'top',
          timeout: 5000,
        });
      }

      return Promise.reject(error);
    }
  );

  return AxiosInstance;
}

export function handleErrorAxios(error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.log(`Erro na requisição: ${error.message}`);
  }
  throw new Error('Erro desconhecido na requisição.');
}

// export async function requestWithLoading<T>(loading: boolean, requestFn: () => Promise<T>): Promise<T> {
//   loading = true;
//   try {
//     return await requestFn();
//   } catch (error) {
//     handleErrorAxios(error);
//   } finally {
//     loading = false;
//   }
// }
