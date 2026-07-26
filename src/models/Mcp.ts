export type McpConnectionStatus = 'pending' | 'active' | 'invalid' | 'revoked';
export type McpProfileId = 'read_only' | 'full_management';

export interface McpAuthorizationConfiguration {
  grantType: 'authorization_code';
  pkceMethod: 'S256';
  protectedResourceMetadataUrl: string;
  authorizationServerMetadataUrl: string;
}

export interface McpProfile {
  id: McpProfileId;
  scopes: string[];
}

export interface McpFeatureAvailability {
  endpointEnabled: boolean;
  writeToolsEnabled: boolean;
  historyEnabled: boolean;
}

export interface McpConfiguration {
  endpoint: string;
  protocolRevision: string;
  sdkVersion: string;
  authorization: McpAuthorizationConfiguration;
  profiles: McpProfile[];
  features: McpFeatureAvailability;
}

export interface McpConnectionSummary {
  id: string;
  clientId: string;
  clientName: string;
  scopes: string[];
  status: McpConnectionStatus;
  createdAtUtc: string;
  lastUsedAtUtc?: string | null;
  revokedAtUtc?: string | null;
  revocationReasonCode?: string | null;
}

export type McpConnectionDetail = McpConnectionSummary;

export interface McpConnectionListResponse {
  items: McpConnectionSummary[];
}

export type McpAuditState =
  | 'received'
  | 'executing'
  | 'reconciling'
  | 'completed'
  | 'partiallyCompleted'
  | 'failed'
  | 'rejected'
  | 'unknown';

export type McpOperationClass = 'read' | 'preview' | 'confirm' | 'import' | 'auth' | 'revoke';

export interface McpAuditEvent {
  id: string;
  correlationId: string;
  connectionId: string;
  toolName: string;
  operationClass: McpOperationClass;
  state: McpAuditState;
  startedAtUtc: string;
  finishedAtUtc?: string | null;
  resultSummary: Record<string, unknown>;
  errorCodes: string[];
}

export interface McpAuditPage {
  items: McpAuditEvent[];
  nextCursor: string | null;
}

export interface McpAuditFilters {
  fromUtc?: string;
  toUtc?: string;
  operationClass?: McpOperationClass;
  status?: McpAuditState;
  cursor?: string;
  limit?: number;
}

export interface RevokeMcpConnectionRequest {
  reasonCode?: string;
}

export type McpAuthorizationInteractionStatus = 'pending' | 'approved' | 'denied' | 'expired';

export interface McpAuthorizationInteraction {
  id: string;
  clientId: string;
  clientName: string;
  redirectUri: string;
  state: string;
  requestedScopes: string[];
  status: McpAuthorizationInteractionStatus;
  expiresAtUtc: string;
}

export interface McpAuthorizationDecision {
  continueUrl: string | undefined;
  connection?: McpConnectionDetail;
}
