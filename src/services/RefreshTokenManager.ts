import { obterAuthService, type LoginResult } from './AuthService';
import { isTokenExpired } from '../helpers/JwtHelper';

/**
 * Gerenciador centralizado de refresh de tokens.
 * Garante que apenas uma operação de refresh ocorra por vez,
 * evitando condições de corrida entre múltiplos serviços.
 */
class RefreshTokenManager {
    private static instance: RefreshTokenManager | null = null;
    private ongoingRefresh: Promise<LoginResult> | null = null;

    private constructor() {
        // Construtor privado para padrão Singleton
    }

    /**
     * Obtém a instância única do gerenciador
     */
    public static getInstance(): RefreshTokenManager {
        if (!RefreshTokenManager.instance) {
            RefreshTokenManager.instance = new RefreshTokenManager();
        }
        return RefreshTokenManager.instance;
    }

    /**
     * Verifica se o token precisa ser renovado e renova se necessário.
     * Se já houver uma renovação em andamento, retorna a Promise existente.
     * 
     * @returns Promise com o resultado do refresh (ou null se não foi necessário)
     * @throws Error se o refresh falhar
     */
    public async refreshIfNeeded(): Promise<LoginResult | null> {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        // Se não há tokens, não há nada a fazer
        if (!token || !refreshToken) {
            console.log('[RefreshTokenManager] Tokens não encontrados');
            return null;
        }

        // Se o token ainda é válido, não precisa renovar
        if (!isTokenExpired(token)) {
            console.log('[RefreshTokenManager] Token ainda válido');
            return null;
        }

        // Se já existe uma renovação em andamento, retorna a Promise existente
        if (this.ongoingRefresh) {
            console.log('[RefreshTokenManager] Aguardando refresh em andamento...');
            return this.ongoingRefresh;
        }

        // Inicia nova renovação
        console.log('[RefreshTokenManager] Iniciando refresh de token...');
        this.ongoingRefresh = this.executeRefresh(refreshToken);

        try {
            const result = await this.ongoingRefresh;
            return result;
        } finally {
            // Limpa o cache independente de sucesso ou falha
            this.ongoingRefresh = null;
        }
    }

    /**
     * Executa a renovação do token e atualiza o localStorage
     * 
     * @param refreshToken Token de refresh atual
     * @returns Promise com o resultado do refresh
     * @throws Error se o refresh falhar
     */
    private async executeRefresh(refreshToken: string): Promise<LoginResult> {
        try {
            const authService = obterAuthService();
            const result = await authService.refreshToken(refreshToken);

            // Atualiza os tokens no localStorage
            localStorage.setItem('token', result.token);
            localStorage.setItem('refreshToken', result.refreshToken);
            if (result.nomeUsuario) {
                localStorage.setItem('userName', result.nomeUsuario);
            }

            console.log('[RefreshTokenManager] Token renovado com sucesso');
            return result;
        } catch (error) {
            console.error('[RefreshTokenManager] Falha ao renovar token:', error);
            throw error;
        }
    }

    /**
     * Limpa os tokens do localStorage (usado em caso de falha de autenticação)
     */
    public clearTokens(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        console.log('[RefreshTokenManager] Tokens limpos do localStorage');
    }
}

// Exporta a instância única
export const refreshTokenManager = RefreshTokenManager.getInstance();
