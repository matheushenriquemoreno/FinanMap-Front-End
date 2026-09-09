import { ref } from 'vue';
import { handleErrorAxios, CreateIntanceAxios } from 'src/services/api/AxiosHelper';
import type {
  CompraPlanejadaCreate,
  CompraPlanejadaResult,
  ListaComprasPlanejadasResult,
} from 'src/Model/CompraPlanejada';

class CompraPlanejadaService {
  private readonly baseUrl: string;
  public loading = ref(false);
  public saving = ref(false);
  private readonly axios = CreateIntanceAxios();

  constructor() {
    this.baseUrl = process.env.URL_API + 'compras-planejadas';
  }

  private async requestWithLoading<T>(request: () => Promise<T>): Promise<T> {
    try {
      this.loading.value = true;
      return await request();
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    } finally {
      this.loading.value = false;
    }
  }

  private async requestWithSaving<T>(request: () => Promise<T>): Promise<T> {
    try {
      this.saving.value = true;
      return await request();
    } catch (error) {
      handleErrorAxios(error);
      throw error;
    } finally {
      this.saving.value = false;
    }
  }

  async obterPendentes(): Promise<ListaComprasPlanejadasResult> {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<ListaComprasPlanejadasResult>(this.baseUrl);
      return response.data;
    });
  }

  async criar(dto: CompraPlanejadaCreate): Promise<CompraPlanejadaResult> {
    return this.requestWithSaving(async () => {
      const response = await this.axios.post<CompraPlanejadaResult>(this.baseUrl, dto);
      return response.data;
    });
  }
}

export default function getCompraPlanejadaService() {
  return new CompraPlanejadaService();
}
