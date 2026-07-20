const configuredApiUrl = process.env.URL_API?.trim();

export function getApiBaseUrl(): string {
  if (!configuredApiUrl) {
    throw new Error('URL_API não configurada. Defina a variável no ambiente de build.');
  }

  return configuredApiUrl.endsWith('/') ? configuredApiUrl : `${configuredApiUrl}/`;
}
