import axios, { AxiosError } from 'axios';
import { ref } from 'vue';
import { Notify } from 'quasar'


export interface LoginResult {
  token: string,
  refreshToken: string,
  nomeUsuario: string
}

export class AuthService {
  public loading = ref(false);
  private baseUrl: string;
  constructor() {
    this.baseUrl = process.env.URL_API || '';
  }

  // Login - solicita código de verificação
  async login(email: string): Promise<void> {
    try {
      this.loading.value = true;

      const options = {
        method: 'POST',
        url: this.baseUrl + 'login',
        data: { email },
        headers: { 'Content-Type': 'application/json' },
      };

      await axios.request(options);
    } catch (error) {
      this.handleLoginError(error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  // Registro de novo usuário
  async register(email: string, nome: string): Promise<void> {
    try {
      this.loading.value = true;

      const options = {
        method: 'POST',
        url: this.baseUrl + 'login/Create',
        data: { email, nome },
        headers: { 'Content-Type': 'application/json' },
      };

      await axios.request(options);
    } catch (error) {
      this.showNotification('Erro ao fazer cadastro. Tente novamente.');
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  // Verificação do código recebido por email
  async verifyCode(email: string, codigo: string): Promise<LoginResult> {
    try {
      this.loading.value = true;

      const options = {
        method: 'POST',
        url: this.baseUrl + 'login/validate-code',
        data: { email, codigo },
        headers: { 'Content-Type': 'application/json' },
      };

      const result = await axios.request<LoginResult>(options);
      return result.data;
    } catch (error) {
      this.handleVerifyError(error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  // Renovação do token usando refresh token
  async refreshToken(refreshToken: string): Promise<LoginResult> {
    const options = {
      method: 'POST',
      url: this.baseUrl + 'login/refresh',
      data: { refreshToken },
      headers: { 'Content-Type': 'application/json' },
    };

    // Importante: garantir que não envie header de Authorization se o axios global estiver configurado
    // Aqui estamos usando axios.request direto, que por padrão não envia headers globais a menos que configurado
    // Mas como CreateIntanceAxios configura interceptors em uma *instância*, o axios global deve estar limpo.
    // Confirmaremos no teste.

    const result = await axios.request<LoginResult>(options);
    return result.data;
  }

  // Tratamento de erros específicos do login
  private handleLoginError(error: unknown): void {
    if (error instanceof AxiosError) {
      let message = 'Ocorreu um erro inesperado, tente novamente mais tarde!';
      if (error.response?.status === 400 || error.response?.status === 404) {
        message = 'Certifique-se de que o email está correto, ou o cadastro esteja realizado!';
      }
      this.showNotification(message);
    }
  }

  // Tratamento de erros específicos da verificação de código
  private handleVerifyError(error: unknown): void {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        const message = error.response?.data.errors ?? 'Codigo informado invalido, ou expirado.';
        this.showNotification(message);
      }
    }
  }

  // Método centralizado para exibir notificações
  private showNotification(message: string): void {
    Notify.create({
      message,
      type: 'my-notif',
      position: 'top',
      color: 'white',
      textColor: 'black',
      iconColor: 'red',
      progress: true,
      icon: 'info',
    });
  }
}

export function obterAuthService() {
  return new AuthService();
}
