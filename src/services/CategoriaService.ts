import { handleErrorAxios, CreateIntanceAxios } from 'src/helpers/api/AxiosHelper';
import type { CategoriaResult, CreateCategoriaDTO, TipoCategoriaETransacao, UpdateCategoriaDTO } from 'src/Model/Categoria';
import { ref } from 'vue';

export class CategoriaService {
  private baseUrl: string;
  public loading = ref(false);
  private axios = CreateIntanceAxios();

  constructor() {
    this.baseUrl = process.env.URL_API + 'Categorias';
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

  async obterPeloID(id: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<CategoriaResult>(`${this.baseUrl}/${id}`);
      return response.data;
    });
  }

  async obterCategoria(tipoCategoria: TipoCategoriaETransacao, nome?: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<CategoriaResult[]>(`${this.baseUrl}/GetUserCategorias`, {
        params: {
          tipoCategoria: tipoCategoria,
          nome: nome ?? '',
        },
      });
      return response.data;
    });
  }

  async adicionar(categoria: CreateCategoriaDTO) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<CategoriaResult>(this.baseUrl, categoria, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    });
  }

  async atualizar(categoria: UpdateCategoriaDTO) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.put<CategoriaResult>(`${this.baseUrl}`, categoria, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    });
  }

  async excluir(id: string) {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`);
    });
  }
}


export default function obterCategoriaService() {
  return new CategoriaService();
}

