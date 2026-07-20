export interface SessionTokens {
  token: string;
  refreshToken: string;
}

export interface SessionIdentity {
  userName?: string;
  userEmail?: string;
}

class SessionService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private identity: SessionIdentity = {};

  start(tokens: SessionTokens, identity: SessionIdentity = {}): void {
    this.accessToken = tokens.token;
    this.refreshToken = tokens.refreshToken;
    this.identity = { ...identity };
  }

  updateTokens(tokens: SessionTokens): void {
    this.accessToken = tokens.token;
    this.refreshToken = tokens.refreshToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getIdentity(): Readonly<SessionIdentity> {
    return { ...this.identity };
  }

  hasSession(): boolean {
    return this.accessToken !== null && this.refreshToken !== null;
  }

  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.identity = {};
  }
}

export const sessionService = new SessionService();
