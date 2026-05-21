import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import { ref } from 'vue';
import type {
  CustoFixoCreate,
  CustoFixoResult,
  UpdateCustoFixoDTO,
  CustoFixoConfiguracao,
} from 'src/Model/CustoFixo';

class CustoFixoService {
  private baseUrl: string;
  public loading = ref(false);
  private axios = CreateIntanceAxios();

  constructor() {
    this.baseUrl = process.env.URL_API + 'custos-fixos';
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

  async obterTodos(): Promise<CustoFixoResult[]> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<CustoFixoResult[]>(this.baseUrl);
      return response.data;
    });
  }

  async criar(dto: CustoFixoCreate): Promise<CustoFixoResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<CustoFixoResult>(this.baseUrl, dto);
      return response.data;
    });
  }

  async atualizar(dto: UpdateCustoFixoDTO): Promise<CustoFixoResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.put<CustoFixoResult>(`${this.baseUrl}/${dto.id}`, dto);
      return response.data;
    });
  }

  async alterarStatus(id: string, ativo: boolean, custoCompleto: CustoFixoResult): Promise<CustoFixoResult> {
    const dto: UpdateCustoFixoDTO = {
      id,
      nome: custoCompleto.nome,
      diaVencimento: custoCompleto.diaVencimento,
      ativo,
    };
    if (custoCompleto.categoriaId) {
      dto.categoriaId = custoCompleto.categoriaId;
    }
    return this.atualizar(dto);
  }

  async excluir(id: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`);
    });
  }

  async obterConfiguracoes(): Promise<CustoFixoConfiguracao> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<CustoFixoConfiguracao>('/api/usuarios/configuracoes/custos-fixos');
      return response.data;
    });
  }

  async atualizarOptOut(receberNotificacoes: boolean): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.put('/api/usuarios/configuracoes/custos-fixos', { receberNotificacoes });
    });
  }
}

export default function getCustoFixoService() {
  return new CustoFixoService();
}

