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
  | 'unknown'
  | 'expired';

export type McpOperationClass = 'read' | 'preview' | 'confirm' | 'import' | 'auth' | 'revoke';
export type McpWriteAction = 'create' | 'update' | 'delete' | 'cancel' | 'status';
export type McpRequiredDecision = 'APPLY_CHANGES' | 'DELETE_PERMANENTLY' | 'IMPORT_VALID_ITEMS';
export type McpConfirmationActor = 'resource_owner';
export type McpReconciliationStatus =
  | 'not_required'
  | 'completed'
  | 'rejected'
  | 'unknown'
  | 'pending'
  | 'checking'
  | 'confirmed'
  | 'not_applied'
  | 'inconclusive';
export type McpAuditResultState = 'completed' | 'failed' | 'rejected' | 'processing' | 'unknown';
export type McpAuditSafeValue = string | number | boolean | null;

export interface McpAuditPreviewChange {
  field: string;
  label: string;
  currentValue?: McpAuditSafeValue;
  proposedValue?: McpAuditSafeValue;
}

export interface McpAuditPreview {
  resourceType: string;
  recordReference: string;
  changes: McpAuditPreviewChange[];
  irreversible: boolean;
  expiresAtUtc: string;
  requiredDecision: McpRequiredDecision;
}

export interface McpAuditConfirmation {
  decision: McpRequiredDecision;
  confirmedBy: McpConfirmationActor;
  confirmedAtUtc: string;
}

export interface McpAuditReconciliation {
  status: McpReconciliationStatus;
  attempts: number;
  lastCheckedAtUtc?: string | null;
  summary: string;
  guidance?: string | null;
}

export interface McpAuditResultItem {
  reference: string;
  status: McpAuditResultState;
  summary: string;
  errorCode?: string | null;
  guidance?: string | null;
}

export interface McpAuditWriteResult {
  summary: string;
  items: McpAuditResultItem[];
}

export interface McpAuditFailure {
  code: string;
  message: string;
  guidance: string;
}

export type McpImportItemType = 'category' | 'income' | 'expense' | 'investment' | 'fixed_cost';
export type McpImportBatchState = 'partial' | 'completed' | 'failed' | 'unknown';
export type McpImportItemState =
  | 'valid'
  | 'invalid'
  | 'pending'
  | 'possible_duplicate'
  | 'skipped'
  | 'already_applied'
  | 'completed'
  | 'failed'
  | 'unknown';

export interface McpAuditImportTotal {
  type: McpImportItemType;
  amount: number;
  currency: 'BRL';
}

export interface McpAuditImportFailure {
  clientItemId: string;
  sourceRef?: string | null;
  field?: string | null;
  code: string;
  message: string;
  guidance: string;
}

export interface McpAuditImportItem {
  clientItemId: string;
  sourceRef?: string | null;
  type: McpImportItemType;
  operationId: string;
  result: 'completed' | 'failed' | 'unknown';
}

export interface McpAuditImportBatch {
  state: McpImportBatchState;
  itemCount: number;
  countsByState: Partial<Record<McpImportItemState, number>>;
  countsByType: Partial<Record<McpImportItemType, number>>;
  totals: McpAuditImportTotal[];
  failures: McpAuditImportFailure[];
  items: McpAuditImportItem[];
}

export interface McpAuditEvent {
  id: string;
  correlationId: string;
  connectionId: string;
  toolName: string;
  operationClass: McpOperationClass;
  state: McpAuditState;
  action?: McpWriteAction | null;
  startedAtUtc: string;
  finishedAtUtc?: string | null;
  resultSummary: Record<string, unknown>;
  errorCodes: string[];
}

export interface McpAuditEventDetail extends McpAuditEvent {
  preview?: McpAuditPreview | null;
  confirmation?: McpAuditConfirmation | null;
  reconciliation?: McpAuditReconciliation | null;
  result?: McpAuditWriteResult | null;
  failure?: McpAuditFailure | null;
  importBatch?: McpAuditImportBatch | null;
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
