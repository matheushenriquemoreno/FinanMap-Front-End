import type { InvestimentoCreate, InvestimentoResult } from "src/Model/Transacao";
import TransacaoServiceBase from "../base/TransacaoBaseService";

class InvestimentoService extends TransacaoServiceBase<InvestimentoCreate, InvestimentoResult> {
  constructor() {
    super("Investimentos")
  }
}

export default function getInvestimentoService() {
  return new InvestimentoService();
}
