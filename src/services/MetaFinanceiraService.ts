import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import { ref } from 'vue';
import type {
  CreateMetaFinanceiraDTO,
  UpdateMetaFinanceiraDTO,
  ContribuicaoDTO,
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

  async obterTodas(): Promise<MetaFinanceiraResult[]> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<MetaFinanceiraResult[]>(this.baseUrl);
      return response.data;
    });
  }

  async obterResumo(): Promise<ResumoMetasDTO> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<ResumoMetasDTO>(`${this.baseUrl}/resumo`);
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
}

export default function getMetaFinanceiraService() {
  return new MetaFinanceiraService();
}
