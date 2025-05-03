import type { DespesaCreate, DespesaResult } from "src/Model/Transacao";
import TransacaoServiceBase from "../base/TransacaoBaseService";

class DespesaService extends TransacaoServiceBase<DespesaCreate, DespesaResult> {
  constructor() {
    super("Despesas")
  }

  async getDespesasAgrupadas(id: string) {
    return this.requestWithLoading(async () => {
      const response = await this.axios.get<DespesaResult[]>(`${this.baseUrl}/agrupada/${id}`);
      return response.data;
    });
  }

}

export default function getDespesaService() {
  return new DespesaService();
}
