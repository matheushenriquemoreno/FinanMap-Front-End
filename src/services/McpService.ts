import type { AxiosInstance } from 'axios';
import type {
  McpAuditEvent,
  McpAuditFilters,
  McpAuditPage,
  McpAuthorizationDecision,
  McpAuthorizationInteraction,
  McpConfiguration,
  McpConnectionDetail,
  McpConnectionListResponse,
  RevokeMcpConnectionRequest,
} from 'src/models/Mcp';
import { CreateIntanceAxios } from 'src/services/api/AxiosHelper';

type McpAxiosClient = Pick<AxiosInstance, 'get' | 'post'>;

function getMcpApiUrl(): string {
  const apiRoot = process.env.URL_API ?? '/api/';
  return `${apiRoot.replace(/\/?$/, '/')}mcp`;
}

export class McpService {
  private readonly baseUrl = getMcpApiUrl();

  constructor(
    private readonly axios: McpAxiosClient = CreateIntanceAxios({
      includeSharedContext: false,
    }),
  ) {}

  async obterConfiguracao(): Promise<McpConfiguration> {
    const response = await this.axios.get<McpConfiguration>(`${this.baseUrl}/configuration`);
    return response.data;
  }

  async listarConexoes(): Promise<McpConnectionListResponse> {
    const response = await this.axios.get<McpConnectionListResponse>(`${this.baseUrl}/connections`);
    return response.data;
  }

  async obterConexao(id: string): Promise<McpConnectionDetail> {
    const response = await this.axios.get<McpConnectionDetail>(
      `${this.baseUrl}/connections/${encodeURIComponent(id)}`,
    );
    return response.data;
  }

  async revogarConexao(
    id: string,
    request?: RevokeMcpConnectionRequest,
  ): Promise<McpConnectionDetail> {
    const response = await this.axios.post<McpConnectionDetail>(
      `${this.baseUrl}/connections/${encodeURIComponent(id)}/revoke`,
      request,
    );
    return response.data;
  }

  async listarHistorico(filters: McpAuditFilters = {}): Promise<McpAuditPage> {
    const response = await this.axios.get<McpAuditPage>(`${this.baseUrl}/audit-events`, {
      params: filters,
    });
    return response.data;
  }

  async obterEventoHistorico(id: string): Promise<McpAuditEvent> {
    const response = await this.axios.get<McpAuditEvent>(
      `${this.baseUrl}/audit-events/${encodeURIComponent(id)}`,
    );
    return response.data;
  }

  async obterInteracaoAutorizacao(id: string): Promise<McpAuthorizationInteraction> {
    const response = await this.axios.get<McpAuthorizationInteraction>(
      `${this.baseUrl}/authorization-interactions/${encodeURIComponent(id)}`,
    );
    return response.data;
  }

  async aprovarInteracaoAutorizacao(
    id: string,
    scopes: string[],
  ): Promise<McpAuthorizationDecision> {
    const response = await this.axios.post<McpConnectionDetail>(
      `${this.baseUrl}/authorization-interactions/${encodeURIComponent(id)}/approve`,
      { scopes },
    );
    return {
      connection: response.data,
      continueUrl: response.headers['x-mcp-authorization-continue'] as string | undefined,
    };
  }

  async negarInteracaoAutorizacao(id: string): Promise<McpAuthorizationDecision> {
    const response = await this.axios.post(
      `${this.baseUrl}/authorization-interactions/${encodeURIComponent(id)}/deny`,
    );
    return {
      continueUrl: response.headers['x-mcp-authorization-continue'] as string | undefined,
    };
  }
}

export default new McpService();
