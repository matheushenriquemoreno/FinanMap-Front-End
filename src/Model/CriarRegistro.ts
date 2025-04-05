import type { TipoCategoriaETransacao } from "./Categoria";

export interface ReplicarTransacoesPeriodo {
  periodoInicial: Date;
  periodoFinal: Date;
  tipoTransacao: TipoCategoriaETransacao;
  idRegistros: string[];
}
