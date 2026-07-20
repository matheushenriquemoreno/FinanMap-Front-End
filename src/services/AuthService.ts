import { AxiosError } from 'axios';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { apiClient } from './api/AxiosHelper';

export interface LoginResult {
  token: string;
  refreshToken: string;
  nomeUsuario: string;
}

export class AuthService {
  public loading = ref(false);

  // Login - solicita código de verificação
  async login(email: string): Promise<void> {
    try {
      this.loading.value = true;

      await apiClient.post('login', { email }, { skipSession: true });
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

      await apiClient.post('login/Create', { email, nome }, { skipSession: true });
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

      const result = await apiClient.post<LoginResult>(
        'login/validate-code',
        { email, codigo },
        { skipSession: true },
      );
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
    const result = await apiClient.post<LoginResult>(
      'login/refresh',
      { refreshToken },
      { skipSession: true },
    );
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
