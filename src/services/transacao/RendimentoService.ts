import type { RendimentosCreate, RendimentosResult } from "src/Model/Transacao";
import TransacaoServiceBase from "../base/TransacaoBaseService";

class RendimentoService extends TransacaoServiceBase<RendimentosCreate, RendimentosResult> {
  constructor() {
    super("rendimentos")
  }
}

export default function getRendimentoService() {
  return new RendimentoService();
}
