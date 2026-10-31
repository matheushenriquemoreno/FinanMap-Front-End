import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import { ref } from 'vue';
import type {
  CreateMetaFinanceiraDTO,
  UpdateMetaFinanceiraDTO,
  ContribuicaoDTO,
  UpdateContribuicaoDTO,
  MetaFinanceiraResult,
  ResumoMetasDTO,
  ResultContribuicaoResponse,
} from 'src/Model/MetaFinanceira';

class MetaFinanceiraService {
  private baseUrl: string;
  public loading = ref(false);
  private axios = CreateIntanceAxios();

  constructor() {
    this.baseUrl = process.env.URL_API + 'MetasFinanceiras';
  }

  private async requestWithLoading<T>(fn: () => Promise<T>): Promise<T> {
    try {
      this.loading.value = true;
      return await fn();
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  /**
   * Composição do parâmetro de filtro por arquivadas na query string.
   * Sem parâmetro = todas; `true` = só arquivadas; `false` = só ativas.
   */
  private construirParamsArquivadas(arquivadas?: boolean): Record<string, string> | undefined {
    if (arquivadas === undefined) return undefined;
    return { arquivadas: arquivadas ? 'true' : 'false' };
  }

  async obterTodas(arquivadas?: boolean): Promise<MetaFinanceiraResult[]> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<MetaFinanceiraResult[]>(this.baseUrl, {
        params: this.construirParamsArquivadas(arquivadas),
      });
      return response.data;
    });
  }

  async obterResumo(arquivadas?: boolean): Promise<ResumoMetasDTO> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<ResumoMetasDTO>(`${this.baseUrl}/resumo`, {
        params: this.construirParamsArquivadas(arquivadas),
      });
      return response.data;
    });
  }

  async obterPorId(id: string): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<MetaFinanceiraResult>(`${this.baseUrl}/${id}`);
      return response.data;
    });
  }

  async criar(dto: CreateMetaFinanceiraDTO): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<MetaFinanceiraResult>(this.baseUrl, dto);
      return response.data;
    });
  }

  async atualizar(dto: UpdateMetaFinanceiraDTO): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.put<MetaFinanceiraResult>(this.baseUrl, dto);
      return response.data;
    });
  }

  async excluir(id: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`);
    });
  }

  /** Arquiva a meta, removendo-a do fluxo ativo preservando todo o histórico. */
  async arquivar(id: string): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<MetaFinanceiraResult>(
        `${this.baseUrl}/${id}/arquivar`
      );
      return response.data;
    });
  }

  /** Desarquiva a meta, retornando-a ao fluxo ativo. */
  async desarquivar(id: string): Promise<MetaFinanceiraResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<MetaFinanceiraResult>(
        `${this.baseUrl}/${id}/desarquivar`
      );
      return response.data;
    });
  }

  async adicionarContribuicao(
    metaId: string,
    dto: ContribuicaoDTO
  ): Promise<ResultContribuicaoResponse> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<ResultContribuicaoResponse>(
        `${this.baseUrl}/${metaId}/contribuicoes`,
        dto
      );
      return response.data;
    });
  }

  async removerContribuicao(metaId: string, contribuicaoId: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${metaId}/contribuicoes/${contribuicaoId}`);
    });
  }

  async editarContribuicao(
    metaId: string,
    dto: UpdateContribuicaoDTO
  ): Promise<ResultContribuicaoResponse> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.put<ResultContribuicaoResponse>(
        `${this.baseUrl}/${metaId}/contribuicoes`,
        dto
      );
      return response.data;
    });
  }
}

export default function getMetaFinanceiraService() {
  return new MetaFinanceiraService();
}
