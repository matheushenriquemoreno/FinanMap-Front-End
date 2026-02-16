// src/helpers/JwtHelper.ts

const TOKEN_REFRESH_THRESHOLD_SECONDS = 300; // 5 minutos antes de expirar
const MILLISECONDS_TO_SECONDS = 1000;

/**
 * Decodifica um token JWT
 * @param token Token JWT a ser decodificado
 * @returns Objeto com os dados do payload ou null se inválido
 */
export function parseJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    
    let base64Url = parts[1] ?? '';
    const padding = base64Url.length % 4;
    if (padding) {
      base64Url += '='.repeat(4 - padding);
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Verifica se o token está expirado ou expirando em breve
 * @param token Token JWT a ser verificado
 * @param thresholdSeconds Segundos antes da expiração para considerar como "expirando" (padrão: 300 = 5 minutos)
 * @returns true se o token está expirado ou expirando em breve
 */
export function isTokenExpired(token: string, thresholdSeconds: number = TOKEN_REFRESH_THRESHOLD_SECONDS): boolean {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return true; // Se não conseguir decodificar, considera expirado
  }

  const currentTime = Date.now() / MILLISECONDS_TO_SECONDS;
  return decoded.exp < currentTime + thresholdSeconds;
}

/**
 * Obtém o tempo em segundos até o token expirar
 * @param token Token JWT
 * @returns Segundos até expiração ou null se inválido
 */
export function getTimeUntilExpiration(token: string): number | null {
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const currentTime = Date.now() / MILLISECONDS_TO_SECONDS;
  const timeUntilExpiration = decoded.exp - currentTime;
  
  return timeUntilExpiration > 0 ? timeUntilExpiration : 0;
}
