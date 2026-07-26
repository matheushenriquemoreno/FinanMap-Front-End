type RouteQuery = Record<string, unknown>;
type Navigate = (target: string) => void;

const AUTHORIZATION_PATH = '/oauth/authorize';
const RETURN_QUERY_KEY = 'returnTo';
const SENSITIVE_QUERY_KEYS = ['access_token', 'id_token', 'token', 'code'];
const DENIAL_FORBIDDEN_QUERY_KEYS = [
  ...SENSITIVE_QUERY_KEYS,
  'code_challenge',
  'code_challenge_method',
];

function safeInternalPath(value: unknown): string | null {
  const hasControlCharacter =
    typeof value === 'string' &&
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    });

  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    hasControlCharacter
  ) {
    return null;
  }

  try {
    const base = new URL('https://finanmap.invalid');
    const candidate = new URL(value, base);
    return candidate.origin === base.origin
      ? `${candidate.pathname}${candidate.search}${candidate.hash}`
      : null;
  } catch {
    return null;
  }
}

function parseUrl(value: string | undefined): URL | null {
  if (!value) return null;

  try {
    const parsed = new URL(value);
    return parsed.username || parsed.password ? null : parsed;
  } catch {
    return null;
  }
}

function containsSensitiveCredential(url: URL): boolean {
  return SENSITIVE_QUERY_KEYS.some((key) => url.searchParams.has(key));
}

function preservesRegisteredQuery(candidate: URL, registered: URL): boolean {
  return Array.from(new Set(registered.searchParams.keys())).every((key) => {
    const expectedValues = registered.searchParams.getAll(key);
    const actualValues = candidate.searchParams.getAll(key);
    return (
      expectedValues.length === actualValues.length &&
      expectedValues.every((value, index) => value === actualValues[index])
    );
  });
}

export function authReturnQuery(returnTo: string): Record<string, string> {
  const safeReturnTo = safeInternalPath(returnTo);
  return safeReturnTo ? { [RETURN_QUERY_KEY]: safeReturnTo } : {};
}

export function preserveAuthReturnQuery(query: RouteQuery): Record<string, string> {
  const safeReturnTo = safeInternalPath(query[RETURN_QUERY_KEY]);
  return safeReturnTo ? { [RETURN_QUERY_KEY]: safeReturnTo } : {};
}

export function resolvePostAuthenticationLocation(query: RouteQuery): string {
  return safeInternalPath(query[RETURN_QUERY_KEY]) ?? '/';
}

export function validateMcpApprovalContinuation(
  continuation: string | undefined,
  authorizationServerMetadataUrl: string,
  interactionId: string,
): string | null {
  const candidate = parseUrl(continuation);
  const metadata = parseUrl(authorizationServerMetadataUrl);

  if (
    !candidate ||
    !metadata ||
    candidate.origin !== metadata.origin ||
    candidate.pathname !== AUTHORIZATION_PATH ||
    candidate.searchParams.get('interaction_id') !== interactionId ||
    containsSensitiveCredential(candidate)
  ) {
    return null;
  }

  return candidate.href;
}

export function validateMcpDenialContinuation(
  continuation: string | undefined,
  redirectUri: string,
  expectedState: string,
): string | null {
  const candidate = parseUrl(continuation);
  const registered = parseUrl(redirectUri);

  if (
    !expectedState.trim() ||
    !candidate ||
    !registered ||
    candidate.protocol !== registered.protocol ||
    candidate.hostname !== registered.hostname ||
    candidate.port !== registered.port ||
    candidate.pathname !== registered.pathname ||
    !preservesRegisteredQuery(candidate, registered) ||
    candidate.searchParams.get('error') !== 'access_denied' ||
    candidate.searchParams.getAll('error').length !== 1 ||
    candidate.searchParams.get('state') !== expectedState ||
    candidate.searchParams.getAll('state').length !== 1 ||
    DENIAL_FORBIDDEN_QUERY_KEYS.some((key) => candidate.searchParams.has(key))
  ) {
    return null;
  }

  return candidate.href;
}

export function navigateToMcpContinuation(
  validatedUrl: string,
  navigate: Navigate = (target) => window.location.assign(target),
): void {
  navigate(validatedUrl);
}
