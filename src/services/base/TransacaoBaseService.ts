import { handleErrorAxios, CreateIntanceAxios } from 'src/helpers/api/AxiosHelper';
import { notificar } from 'src/helpers/Notificacao';
import { ref } from 'vue';

export default class TransacaoServiceBase<CreateType, ReturnType> {
  private baseUrl: string;
  public loading = ref(false);
  private axios = CreateIntanceAxios();

  constructor(path: string) {
    this.baseUrl = process.env.URL_API + path;
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

  async getByMesAndAno(ano: number, mes: number) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<ReturnType[]>(this.baseUrl, {
        params: {
          ano: ano,
          mes: mes,
        },
      });
      return response.data;
    });
  }

  async getById(id: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<ReturnType>(`${this.baseUrl}/${id}`);
      return response.data;
    });
  }

  async create(transacao: CreateType) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.post<ReturnType>(this.baseUrl, transacao, {
        headers: { 'Content-Type': 'application/json' },
      });
      notificar('Registro criado com sucesso!');
      return response.data;
    });
  }

  async update(transacao: CreateType) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.put<ReturnType>(`${this.baseUrl}`, transacao, {
        headers: { 'Content-Type': 'application/json' },
      });
      notificar('Registro atualizado com sucesso!');
      return response.data;
    });
  }

  async updateValor(id: string, valor: number) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.patch<ReturnType>(`${this.baseUrl}/UpdateValor`, {
        id: id,
        valor: valor
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    });
  }

  async delete(id: string) {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}`);
      notificar('Registro excluído com sucesso!');
    });
  }

  async deleteMany(id: string[]) {
    return this.requestWithLoading(async () => {
      await this.axios.post(`${this.baseUrl}/DeleteMany`, {
        idTransacoes: id
      });
      notificar('Registro(s) excluído(s) com sucesso!');
    });
  }
}
