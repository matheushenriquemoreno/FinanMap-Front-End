import axios from 'axios';
import { isTokenExpired } from '../helpers/JwtHelper';
import { obterAuthService, type LoginResult } from './AuthService';
import { sessionService } from './SessionService';

class RefreshTokenManager {
  private static instance: RefreshTokenManager | null = null;
  private ongoingRefresh: Promise<LoginResult> | null = null;

  private constructor() {}

  public static getInstance(): RefreshTokenManager {
    RefreshTokenManager.instance ??= new RefreshTokenManager();
    return RefreshTokenManager.instance;
  }

  public async refreshIfNeeded(): Promise<LoginResult | null> {
    const token = sessionService.getAccessToken();
    if (!token || !sessionService.getRefreshToken() || !isTokenExpired(token)) return null;
    return this.refresh();
  }

  public async refresh(): Promise<LoginResult> {
    const refreshToken = sessionService.getRefreshToken();
    if (!refreshToken) throw new Error('Sessão sem refresh token.');
    if (this.ongoingRefresh) return this.ongoingRefresh;

    this.ongoingRefresh = this.executeRefresh(refreshToken);

    try {
      return await this.ongoingRefresh;
    } finally {
      this.ongoingRefresh = null;
    }
  }

  private async executeRefresh(refreshToken: string): Promise<LoginResult> {
    const result = await obterAuthService().refreshToken(refreshToken);
    sessionService.updateTokens(result);
    return result;
  }

  public clearTokens(): void {
    sessionService.clear();
  }

  public shouldClearTokenOnRefreshError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return true;

    const status = error.response?.status;
    if (!error.response || (status !== undefined && status >= 500)) return false;
    return status !== undefined && status >= 400 && status < 500;
  }
}

export const refreshTokenManager = RefreshTokenManager.getInstance();
