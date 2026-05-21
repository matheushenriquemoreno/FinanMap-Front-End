import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import { ref } from 'vue';
import type {
  CustoFixoCreate,
  CustoFixoResult,
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

  async excluir(id: string): Promise<void> {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`);
    });
  }
}

export default function getCustoFixoService() {
  return new CustoFixoService();
}
