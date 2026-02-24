import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import type { ResumoFinanceiroModel, EvolucaoPeriodoModel, CategoriaDashboardModel } from 'src/models/Dashboard';
import { ref } from 'vue';

export class DashboardService {
  private baseUrl: string;
  public loading = ref(false);
  private axios = CreateIntanceAxios();

  constructor() {
    this.baseUrl = process.env.URL_API + 'dashboard';
  }

  private async requestWithLoading<T>(requestFn: () => Promise<T>) {
    try {
      this.loading.value = true;
      return await requestFn();
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  async obterResumo(dataInicial: string, dataFinal: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<ResumoFinanceiroModel>(
        `${this.baseUrl}/resumo`,
        {
          params: { dataInicial, dataFinal },
        }
      );
      return response.data;
    });
  }

  async obterEvolucao(dataInicial: string, dataFinal: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<EvolucaoPeriodoModel[]>(
        `${this.baseUrl}/evolucao`,
        {
          params: { dataInicial, dataFinal },
        }
      );
      return response.data;
    });
  }

  async obterCategorias(dataInicial: string, dataFinal: string, tipo?: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<CategoriaDashboardModel[]>(
        `${this.baseUrl}/categorias`,
        {
          params: { dataInicial, dataFinal, tipo },
        }
      );
      return response.data;
    });
  }
}

export default function obterDashboardService() {
  return new DashboardService();
}
