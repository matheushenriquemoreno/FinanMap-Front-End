import { refreshTokenManager } from './RefreshTokenManager';

const CHECK_INTERVAL_MS = 60000; // Verifica a cada 1 minuto

/**
 * Serviço singleton para renovação automática de token em background
 */
class TokenRenewalService {
  private static instance: TokenRenewalService | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  private constructor() {
    // Construtor privado para padrão Singleton
  }

  /**
   * Trata o evento de mudança de visibilidade da aba.
   * Útil para dispositivos móveis (como iOS) que suspendem a execução
   * de timers quando o navegador vai para background.
   */
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.isRunning) {
      console.log('[TokenRenewalService] Aba voltou a ficar visível. Verificando token...');
      void this.checkAndRenewToken();
    }
  };

  /**
   * Obtém a instância única do serviço
   */
  public static getInstance(): TokenRenewalService {
    if (!TokenRenewalService.instance) {
      TokenRenewalService.instance = new TokenRenewalService();
    }
    return TokenRenewalService.instance;
  }

  /**
   * Inicia o serviço de renovação automática
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    this.isRunning = true;
    this.checkAndRenewToken();

    this.intervalId = setInterval(() => {
      this.checkAndRenewToken();
    }, CHECK_INTERVAL_MS);

    // Adiciona listener para garantir a renovação quando o usuário volta para o app (especialmente no iOS)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Para o serviço de renovação automática
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.isRunning = false;
  }

  /**
   * Verifica se o token precisa ser renovado e renova se necessário
   */
  private async checkAndRenewToken(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token || !refreshToken) {
        this.stop();
        return;
      }

      // Delega a renovação ao RefreshTokenManager
      // que garante que apenas uma operação ocorra por vez
      await refreshTokenManager.refreshIfNeeded();
    } catch (error) {
      console.error('[TokenRenewalService] Erro ao verificar token:', error);
      
      if (refreshTokenManager.shouldClearTokenOnRefreshError(error)) {
        this.stop();
        this.handleRenewalFailure();
      } else {
        console.warn('[TokenRenewalService] Falha temporária (rede/servidor). Mantendo serviço ativo.');
      }
    }
  }

  /**
   * Trata falha na renovação - limpa dados e redireciona
   */
  private handleRenewalFailure(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');

    window.location.href = process.env.LOGIN_URL ?? '/login';
  }
}

// Exporta a instância única
export const tokenRenewalService = TokenRenewalService.getInstance();
