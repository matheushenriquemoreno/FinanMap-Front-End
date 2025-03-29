import type { DespesaCreate, DespesaResult } from "src/Model/Transacao";
import TransacaoServiceBase from "../base/TransacaoBaseService";

class DespesaService extends TransacaoServiceBase<DespesaCreate, DespesaResult> {
  constructor() {
    super("Despesas")
  }
}

export default function getDespesaService() {
  return new DespesaService();
}
