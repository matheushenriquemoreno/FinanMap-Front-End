import type { DespesaCreate, DespesaResult, LancarDespesaLoteDTO, AtualizarLoteDespesaDTO } from "src/Model/Transacao";
import type { ModificadorLote } from "src/Model/Transacao";
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

  async criarEmLote(dto: LancarDespesaLoteDTO) {
    return this.requestWithLoading(async () => {
      await this.axios.post(`${this.baseUrl}/lote`, dto);
    });
  }

  async atualizarLote(id: string, dto: AtualizarLoteDespesaDTO) {
    return this.requestWithLoading(async () => {
      await this.axios.put(`${this.baseUrl}/${id}/lote`, dto);
    });
  }

  async excluirLote(id: string, modificador: ModificadorLote) {
    return this.requestWithLoading(async () => {
      await this.axios.delete(`${this.baseUrl}/${id}/lote/${modificador}`);
    });
  }

}

export default function getDespesaService() {
  return new DespesaService();
}
